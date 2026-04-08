import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// Create payment record and simulate processing
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { bookingId, method, phoneNumber } = await req.json();

    // Get booking with gig details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        gig:gigs(id, title, price, posted_by)
      `,
      )
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.payment_status === "paid") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

  // Direct payment model (0% platform commission)
  const total = booking.gig.price;

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id: bookingId,
        user_id: user.id,
        amount: total,
        method: method,
        status: "pending",
        phone_number: phoneNumber || null,
        metadata: {
          direct_payment: true,
          seller_id: booking.gig.posted_by,
        },
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Simulate payment processing delay
    // In production, this would be a webhook or callback
    setTimeout(async () => {
      await supabase
        .from("payments")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", payment.id);

      await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", bookingId);
    }, 2000);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: "pending",
      message:
        method === "mpesa"
          ? "STK push sent to your phone. Please check your M-Pesa messages to authorize."
          : "Processing card payment...",
      total,
      breakdown: {
        serviceFee: total,
        platformFee: 0,
        total,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Payment failed" },
      { status: 400 },
    );
  }
}

// Check payment status
export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("id");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!paymentId) {
    const { data: payments, error: listError } = await supabase
      .from("payments")
      .select("id, amount, method, status, created_at, completed_at, booking_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 400 });
    }

    return NextResponse.json({ payments: payments || [] });
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .select("*, booking:bookings(gig:gigs(title))")
    .eq("id", paymentId)
    .eq("user_id", user.id)
    .single();

  if (error || !payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json({ payment });
}
