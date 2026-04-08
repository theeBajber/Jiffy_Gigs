// app/api/payments/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { querySTKStatus } from "@/lib/mpesa";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID required" },
        { status: 400 },
      );
    }

    // Fetch payment record
    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Verify ownership
    if (payment.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If still pending, query M-Pesa for status
    if (payment.status === "pending" && payment.metadata?.checkout_request_id) {
      try {
        const statusResult = await querySTKStatus(
          payment.metadata.checkout_request_id,
        );

        // If M-Pesa says success but we haven't processed callback yet
        if (statusResult.ResultCode === "0" && payment.status === "pending") {
          // Trigger manual processing or wait for callback
          // For now, just return current status
        }
      } catch (queryError) {
        console.error("Failed to query STK status:", queryError);
      }
    }

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
      transactionId: payment.transaction_id,
      createdAt: payment.created_at,
      completedAt: payment.completed_at,
    });
  } catch (error: any) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
