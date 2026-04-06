// /app/api/bookings/[id]/route.ts
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Await params in Next.js 15+
    const { id } = await context.params;

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        user_id,
        status,
        payment_status,
        preferred_submission,
        special_requirements,
        created_at,
        gig:gigs(
          id,
          title,
          description,
          price,
          per,
          cover,
          posted_by,
          provider:users!posted_by(name)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check authorization
    const isClient = booking.user_id === user.id;
    const gigData = Array.isArray(booking.gig) ? booking.gig[0] : booking.gig;
    const isProvider = gigData?.posted_by === user.id;

    if (!isClient && !isProvider) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get cover URL
    let coverUrl = null;
    if (gigData?.cover) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("GigCovers").getPublicUrl(gigData.cover);
      coverUrl = publicUrl;
    }

    return NextResponse.json({
      ...booking,
      gig: {
        ...gigData,
        cover: coverUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch booking" },
      { status: 400 },
    );
  }
}
