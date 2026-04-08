// /app/api/bookings/route.ts
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

async function createNotification(
  supabase: {
    from: (
      table: string,
    ) => {
      insert: (payload: unknown) => unknown;
    };
  },
  payload: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  },
) {
  try {
    await supabase.from("notifications").insert(payload);
  } catch {
    // Best-effort; do not fail booking flow if notifications table is absent.
  }
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { gigId, date, notes } = await req.json();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Check if booking own gig
  const { data: gig } = await supabase
    .from("gigs")
    .select("id, title, posted_by")
    .eq("id", gigId)
    .single();

  if (gig?.posted_by === user.id) {
    return NextResponse.json(
      { error: "Cannot book your own gig" },
      { status: 403 },
    );
  }

  const { data: existing } = await supabase
    .from("bookings")
    .select("id, status, payment_status")
    .eq("user_id", user.id)
    .eq("gig_id", gigId)
    .maybeSingle();

  if (existing) {
    if (["paid", "completed"].includes(existing.payment_status)) {
      return NextResponse.json(
        { error: "This gig booking is already paid" },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      existing: true,
      status: existing.status,
      bookingId: existing.id,
      gigTitle: gig?.title || "Untitled gig",
      amount: null,
    });
  }

  const { data: createdBooking, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      gig_id: gigId,
      preferred_submission: date || null,
      special_requirements: notes || null,
      status: "pending",
      payment_status: "pending",
    })
    .select("id, gig:gigs(title, price)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await createNotification(supabase, {
    user_id: gig?.posted_by,
    type: "booking_requested",
    title: "New booking request",
    message: `A student requested your gig: ${gig?.title || "Untitled gig"}`,
    metadata: { gig_id: gigId },
  });

  const gigInfo = Array.isArray(createdBooking?.gig)
    ? createdBooking?.gig[0]
    : createdBooking?.gig;

  return NextResponse.json({
    success: true,
    status: "pending",
    bookingId: createdBooking?.id,
    gigTitle: gigInfo?.title || gig?.title || "Untitled gig",
    amount: gigInfo?.price || null,
  });
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Bookings I made (as client)
  const { data: myBookings, error: myError } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      payment_status,
      created_at,
      preferred_submission,
      special_requirements,
      gig:gigs(
        id,
        title,
        price,
        cover,
        per,
        posted_by,
        provider:users!posted_by(name, email, profile_pic)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (myError) {
    return NextResponse.json({ error: myError.message }, { status: 400 });
  }

  // Gigs I provide (as provider - bookings on my gigs)
  const { data: providedGigs, error: providedError } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      payment_status,
      created_at,
      preferred_submission,
      special_requirements,
      client:users!user_id(name, email, profile_pic),
      gig:gigs!inner(
        id,
        title,
        price,
        cover,
        per,
        posted_by
      )
    `,
    )
    .eq("gigs.posted_by", user.id)
    .order("created_at", { ascending: false });

  if (providedError) {
    return NextResponse.json({ error: providedError.message }, { status: 400 });
  }

  // Process with image URLs
  const processBookings = (
    bookings: Array<{
      id: string;
      status: string;
      payment_status: string;
      created_at: string;
      preferred_submission: string | null;
      special_requirements: string | null;
      gig?:
        | {
            id?: string;
            title?: string;
            price?: number;
            cover?: string;
            per?: string;
            provider?: Array<{
              name?: string;
              email?: string;
              profile_pic?: string;
            }>;
          }
        | Array<{
            id?: string;
            title?: string;
            price?: number;
            cover?: string;
            per?: string;
            provider?: Array<{
              name?: string;
              email?: string;
              profile_pic?: string;
            }>;
          }>;
      client?: Array<{
        name?: string;
        email?: string;
        profile_pic?: string;
      }>;
    }>,
    type: "made" | "provided",
  ) => {
    return bookings.map((booking) => {
  const gig = Array.isArray(booking.gig) ? booking.gig[0] : booking.gig;
      let coverUrl = null;

      if (gig?.cover) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("GigCovers").getPublicUrl(gig.cover);
        coverUrl = publicUrl;
      }

      return {
        id: booking.id,
        status: booking.status,
        payment_status: booking.payment_status,
        created_at: booking.created_at,
        preferred_submission: booking.preferred_submission,
        special_requirements: booking.special_requirements,
        type,
        gig: {
          id: gig?.id,
          title: gig?.title,
          price: gig?.price,
          per: gig?.per,
          cover_url: coverUrl,
        },
        other_party:
          type === "made"
            ? {
                name: gig?.provider?.[0]?.name,
                email: gig?.provider?.[0]?.email,
                profile_pic: gig?.provider?.[0]?.profile_pic,
              }
            : {
                name: booking.client?.[0]?.name,
                email: booking.client?.[0]?.email,
                profile_pic: booking.client?.[0]?.profile_pic,
              },
      };
    });
  };

  const bookingsIMade = processBookings(myBookings || [], "made");
  const gigsIProvide = processBookings(providedGigs || [], "provided");

  return NextResponse.json({
    bookings_i_made: bookingsIMade,
    gigs_i_provide: gigsIProvide,
  });
}

// PATCH - Update status or payment
export async function PATCH(req: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { bookingId, status, payment_status, action } = await req.json();

  // Verify provider owns this booking's gig
  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      *,
      gig:gigs(posted_by)
    `,
    )
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const gigData = Array.isArray(booking.gig) ? booking.gig[0] : booking.gig;
  const isProvider = gigData?.posted_by === user.id;
  const isClient = booking.user_id === user.id;

  // Only provider can update status to completed or payment
  // Client can only cancel their own booking if not completed
  const updates: Record<string, string> = {};
  const normalizedAction =
    action ||
    (status === "active"
      ? "accept"
      : status === "completed"
        ? "complete"
        : status === "cancelled"
          ? "cancel"
          : null);

  if (normalizedAction === "accept") {
    if (!isProvider || booking.status !== "pending") {
      return NextResponse.json(
        { error: "Only provider can accept pending bookings" },
        { status: 403 },
      );
    }

    updates.status = "active";
  }

  if (normalizedAction === "complete") {
    if (!isProvider || booking.status !== "active") {
      return NextResponse.json(
        { error: "Only provider can complete active bookings" },
        { status: 403 },
      );
    }

    updates.status = "completed";
    updates.payment_status = "pending";
  }

  if (normalizedAction === "cancel") {
    if (isProvider && ["pending", "active"].includes(booking.status)) {
      if (["paid", "completed"].includes(booking.payment_status)) {
        return NextResponse.json(
          { error: "Cannot cancel a paid booking" },
          { status: 400 },
        );
      }

      updates.status = "cancelled";
    } else if (
      isClient &&
      ["pending", "active"].includes(booking.status) &&
      !["paid", "completed"].includes(booking.payment_status)
    ) {
      updates.status = "cancelled";
    } else {
      return NextResponse.json(
        { error: "Unauthorized action" },
        { status: 403 },
      );
    }
  }

  if (status && !normalizedAction) {
    if (isProvider && ["completed", "cancelled"].includes(status)) {
      updates.status = status;
    } else if (
      isClient &&
      status === "cancelled" &&
      booking.status !== "completed"
    ) {
      updates.status = status;
    } else {
      return NextResponse.json(
        { error: "Unauthorized action" },
        { status: 403 },
      );
    }
  }

  if (payment_status && isProvider) {
    updates.payment_status = payment_status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid update supplied" },
      { status: 400 },
    );
  }

  const { data: updated, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (normalizedAction === "accept") {
    await createNotification(supabase, {
      user_id: booking.user_id,
      type: "booking_accepted",
      title: "Booking accepted",
      message: "Your booking has been accepted by the seller.",
      metadata: { booking_id: bookingId },
    });
  }

  if (normalizedAction === "complete") {
    await createNotification(supabase, {
      user_id: booking.user_id,
      type: "payment_required",
      title: "Action required: Complete payment",
      message: "Your service is marked complete. Proceed to checkout.",
      metadata: {
        booking_id: bookingId,
        checkout_url: `/checkout/${bookingId}`,
      },
    });
  }

  return NextResponse.json({ success: true, booking: updated });
}

// DELETE - Cancel booking
export async function DELETE(req: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("id");

  if (!bookingId) {
    return NextResponse.json({ error: "Booking ID required" }, { status: 400 });
  }

  // Check if user is client or provider
  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      user_id,
      status,
      payment_status,
      gig:gigs(posted_by)
    `,
    )
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isClient = booking.user_id === user.id;
  const isProvider = booking.gig?.[0]?.posted_by === user.id;

  if (!isClient && !isProvider) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // DELETE is kept as fallback: convert to status update instead of hard delete.
  if (booking.status === "completed") {
    return NextResponse.json(
      { error: "Cannot delete completed bookings" },
      { status: 400 },
    );
  }

  if (["paid", "completed"].includes(booking.payment_status || "")) {
    return NextResponse.json(
      { error: "Cannot delete a paid booking" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
