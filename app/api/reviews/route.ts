import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type SellerReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: { name?: string; institution?: string; profile_pic?: string }[];
};

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get("sellerId");
  const bookingId = searchParams.get("bookingId");

  if (!sellerId && !bookingId) {
    return NextResponse.json(
      { error: "sellerId or bookingId is required" },
      { status: 400 },
    );
  }

  try {
    if (bookingId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("booking_id", bookingId)
        .eq("reviewer_id", user.id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ review: data || null });
    }

    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        reviewer:users!reviewer_id(name, institution, profile_pic)
      `,
      )
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const rows = (data || []) as SellerReviewRow[];
    const total = rows.length;
    const average =
      total > 0
        ? Number(
            (
              rows.reduce((sum: number, item) => sum + item.rating, 0) /
              total
            ).toFixed(1),
          )
        : 0;

    return NextResponse.json({ reviews: rows, average, total });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch reviews",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bookingId, rating, comment } = await req.json();

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "bookingId and rating (1-5) are required" },
        { status: 400 },
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, user_id, gig_id, payment_status, status, gig:gigs(posted_by)")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.user_id !== user.id) {
      return NextResponse.json(
        { error: "Only the buyer can review this booking" },
        { status: 403 },
      );
    }

    if (booking.status !== "completed") {
      return NextResponse.json(
        { error: "Booking must be completed before review" },
        { status: 400 },
      );
    }

    if (!["completed", "paid"].includes(booking.payment_status)) {
      return NextResponse.json(
        { error: "Payment must be completed before review" },
        { status: 400 },
      );
    }

    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", bookingId)
      .eq("reviewer_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You already reviewed this booking" },
        { status: 409 },
      );
    }

    const gigData = Array.isArray(booking.gig) ? booking.gig[0] : booking.gig;

    const { data: created, error: createError } = await supabase
      .from("reviews")
      .insert({
        booking_id: bookingId,
        gig_id: booking.gig_id,
        seller_id: gigData?.posted_by,
        reviewer_id: user.id,
        rating,
        comment: (comment || "").trim() || null,
      })
      .select("*")
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    try {
      await supabase.from("notifications").insert({
        user_id: gigData?.posted_by,
        type: "review_received",
        title: "New review received",
        message: `You received a ${rating}-star rating from a buyer.`,
        metadata: {
          booking_id: bookingId,
          review_id: created.id,
          rating,
        },
      });
    } catch {
      // no-op
    }

    return NextResponse.json({ success: true, review: created }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to submit review",
      },
      { status: 500 },
    );
  }
}
