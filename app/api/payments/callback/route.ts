// app/api/payments/callback/route.ts
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const callbackData = await req.json();
    console.log(
      "M-Pesa Callback received:",
      JSON.stringify(callbackData, null, 2),
    );

    // M-Pesa sends the callback in Body.stkCallback
    const stkCallback = callbackData.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Invalid callback data" },
        { status: 400 },
      );
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // Always acknowledge receipt to M-Pesa immediately
    // Process asynchronously after responding
    const response = NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });

    // Process payment result asynchronously
    processPaymentResult({
      merchantRequestId: MerchantRequestID,
      checkoutRequestId: CheckoutRequestID,
      resultCode: ResultCode,
      resultDesc: ResultDesc,
      callbackMetadata: CallbackMetadata,
    }).catch(console.error);

    return response;
  } catch (error) {
    console.error("Callback processing error:", error);
    // Still return success to M-Pesa to prevent retries
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  }
}

/**
 * Process the payment result from M-Pesa callback
 */
async function processPaymentResult({
  merchantRequestId,
  checkoutRequestId,
  resultCode,
  resultDesc,
  callbackMetadata,
}: {
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: number;
  resultDesc: string;
  callbackMetadata?: {
    Item: Array<{ Name: string; Value: string | number }>;
  };
}) {
  const supabase = await createServerSupabaseClient();

  // Find the payment record by checkout request ID
  const { data: payment, error: findError } = await supabase
    .from("payments")
    .select("*")
    .eq("metadata->>checkout_request_id", checkoutRequestId)
    .single();

  if (findError || !payment) {
    console.error("Payment record not found for checkout:", checkoutRequestId);
    return;
  }

  if (resultCode === 0) {
    // Payment successful
    const metadata = callbackMetadata?.Item || [];
    const amount = metadata.find((item) => item.Name === "Amount")?.Value;
    const mpesaReceiptNumber = metadata.find(
      (item) => item.Name === "MpesaReceiptNumber",
    )?.Value;
    const transactionDate = metadata.find(
      (item) => item.Name === "TransactionDate",
    )?.Value;
    const phoneNumber = metadata.find(
      (item) => item.Name === "PhoneNumber",
    )?.Value;

    // Update payment record
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        transaction_id: mpesaReceiptNumber,
        completed_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_date: transactionDate,
          payer_phone: phoneNumber,
          result_code: resultCode,
          result_desc: resultDesc,
        },
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Failed to update payment:", updateError);
      return;
    }

    // Update booking status
    await supabase
      .from("bookings")
      .update({
        status: "completed",
        payment_status: "completed",
      })
      .eq("id", payment.booking_id);

    // Optional: Create notification for seller
    const sellerId = payment.metadata?.seller_id;
    if (sellerId) {
      await supabase.from("notifications").insert({
        user_id: sellerId,
        type: "payment_received",
        title: "Payment Received",
        message: `You have received KES ${amount} for a completed gig.`,
        metadata: {
          payment_id: payment.id,
          booking_id: payment.booking_id,
          amount: amount,
        },
      });
    }

    console.log(
      `Payment completed: ${mpesaReceiptNumber} for booking ${payment.booking_id}`,
    );
  } else {
    // Payment failed
    await supabase
      .from("payments")
      .update({
        status: "failed",
        metadata: {
          ...payment.metadata,
          result_code: resultCode,
          result_desc: resultDesc,
          failed_at: new Date().toISOString(),
        },
      })
      .eq("id", payment.id);

    await supabase
      .from("bookings")
      .update({ payment_status: "failed" })
      .eq("id", payment.booking_id);

    console.log(
      `Payment failed: ${resultDesc} for checkout ${checkoutRequestId}`,
    );
  }
}
