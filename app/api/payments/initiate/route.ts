// app/api/payments/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { initiateSTKPush } from "@/lib/mpesa";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, phoneNumber } = body;

    if (!bookingId || !phoneNumber) {
      return NextResponse.json(
        { error: "Booking ID and phone number are required" },
        { status: 400 },
      );
    }

    // Fetch booking details with gig info
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        gigs (
          id,
          title,
          price,
          posted_by,
          per
        )
      `,
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify the current user is the buyer (booking.user_id)
    if (booking.user_id !== user.id) {
      return NextResponse.json(
        { error: "Only the buyer can initiate payment" },
        { status: 403 },
      );
    }

    // Check if payment already exists for this booking
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", bookingId)
      .in("status", ["pending", "completed"])
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { error: "Payment already initiated or completed for this booking" },
        { status: 400 },
      );
    }

    // Initiate M-Pesa STK Push
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`;

    const stkResponse = await initiateSTKPush({
      phoneNumber,
      amount: booking.gigs.price,
      accountReference: `GIG${bookingId.slice(0, 8)}`,
      transactionDesc: `Payment for ${booking.gigs.title.slice(0, 13)}`,
      callbackUrl,
    });

    if (stkResponse.ResponseCode !== "0") {
      return NextResponse.json(
        {
          error: "Failed to initiate payment",
          details: stkResponse.ResponseDescription,
        },
        { status: 400 },
      );
    }

    // Create payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id: bookingId,
        user_id: user.id,
        amount: booking.gigs.price,
        method: "mpesa",
        status: "pending",
        phone_number: phoneNumber,
        metadata: {
          merchant_request_id: stkResponse.MerchantRequestID,
          checkout_request_id: stkResponse.CheckoutRequestID,
          gig_title: booking.gigs.title,
          seller_id: booking.gigs.posted_by,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to create payment record:", paymentError);
      // Don't fail the request since STK push was already sent
    }

    // Update booking payment status
    await supabase
      .from("bookings")
      .update({ payment_status: "pending" })
      .eq("id", bookingId);

    return NextResponse.json({
      success: true,
      message:
        "Payment prompt sent to your phone. Please enter your M-Pesa PIN.",
      checkoutRequestId: stkResponse.CheckoutRequestID,
      paymentId: payment?.id,
    });
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
