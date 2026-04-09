import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const one = <T,>(value: T | T[] | null | undefined): T | undefined =>
      Array.isArray(value) ? value[0] : (value ?? undefined);

    const { data: profile } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single();

    const { data: myBookings, error: myBookingsError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        user_id,
        gig_id,
        status,
        payment_status,
        created_at,
        preferred_submission,
        gig:gigs(
          id,
          title,
          price,
          per,
          cover,
          posted_by,
          category:categories(name),
          provider:users!posted_by(name, profile_pic)
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (myBookingsError) {
      throw new Error(myBookingsError.message);
    }

    const { data: providerBookings, error: providerBookingsError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        user_id,
        gig_id,
        status,
        payment_status,
        created_at,
        preferred_submission,
        gig:gigs!inner(
          id,
          title,
          price,
          per,
          cover,
          posted_by,
          category:categories(name)
        ),
        client:users!user_id(name)
      `,
      )
      .eq("gigs.posted_by", user.id)
      .order("created_at", { ascending: false });

    if (providerBookingsError) {
      throw new Error(providerBookingsError.message);
    }

    const { data: recommendedPool, error: recommendedError } = await supabase
      .from("gigs")
      .select(
        `
        id,
        title,
        price,
        per,
        cover,
        posted_by,
        provider:users!posted_by(name, profile_pic)
      `,
      )
      .neq("posted_by", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (recommendedError) {
      throw new Error(recommendedError.message);
    }

    const { data: completedPayments } = await supabase
      .from("payments")
      .select("amount, created_at, metadata, status")
      .eq("user_id", user.id)
      .in("status", ["paid", "completed"])
      .order("created_at", { ascending: false });

    const providerRows = providerBookings || [];
    const clientRows = myBookings || [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const sellerCreditPayments = (completedPayments || []).filter((payment: any) => {
      const metadata = payment?.metadata || {};
      return metadata?.direction === "seller_credit";
    });

    const hasSellerCreditPayments = sellerCreditPayments.length > 0;

    const fallbackEarningRows = providerRows
      .filter(
        (row: any) =>
          row.status === "completed" &&
          ["paid", "completed"].includes(row.payment_status),
      )
      .map((row: any) => {
        const gig = one<any>(row.gig);
        return {
          amount: Number(gig?.price || 0),
          created_at: row.created_at,
        };
      });

    const earningRows = hasSellerCreditPayments
      ? sellerCreditPayments.map((payment: any) => ({
          amount: Number(payment.amount || 0),
          created_at: payment.created_at,
        }))
      : fallbackEarningRows;

    const totalEarnings = earningRows.reduce(
      (sum: number, row: any) => sum + Number(row.amount || 0),
      0,
    );

    const currentMonthEarnings = earningRows.reduce((sum: number, row: any) => {
      const createdAt = new Date(row.created_at);
      if (createdAt >= startOfMonth) {
        return sum + Number(row.amount || 0);
      }
      return sum;
    }, 0);

    const previousMonthEarnings = earningRows.reduce((sum: number, row: any) => {
      const createdAt = new Date(row.created_at);
      if (createdAt >= startOfPreviousMonth && createdAt < startOfMonth) {
        return sum + Number(row.amount || 0);
      }
      return sum;
    }, 0);

    const growth =
      previousMonthEarnings > 0
        ? (((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100).toFixed(1)
        : currentMonthEarnings > 0
          ? "100.0"
          : "0.0";

  const pendingAsClient = clientRows.filter((row: any) => ["pending", "active"].includes(row.status)).length;

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const combinedRows = [...providerRows, ...clientRows];
    const uniqueRowsMap = new Map<string, any>();
    combinedRows.forEach((row: any) => {
      if (!uniqueRowsMap.has(row.id)) {
        uniqueRowsMap.set(row.id, row);
      }
    });
    const uniqueRows = Array.from(uniqueRowsMap.values());

    const dailyCounts = weekDays.map((day) =>
      uniqueRows.filter((row: any) => String(row.created_at || "").startsWith(day)).length,
    );
    const maxDay = Math.max(...dailyCounts, 1);
    const visitorStats = dailyCounts.map((count) => Math.round((count / maxDay) * 100));

    const weeklyTasks = uniqueRows
      .filter(
        (row: any) =>
          ["pending", "active"].includes(row.status) ||
          (row.status === "completed" && row.payment_status === "pending"),
      )
      .sort((a: any, b: any) => {
        const aDue = a.preferred_submission ? new Date(a.preferred_submission).getTime() : Number.MAX_SAFE_INTEGER;
        const bDue = b.preferred_submission ? new Date(b.preferred_submission).getTime() : Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      })
      .slice(0, 4)
      .map((row: any) => {
  const gig = one<any>(row.gig);
  const category = one<any>(gig?.category);

        return {
          id: row.id,
          title: gig?.title || "Untitled gig",
          category: category?.name || "General",
          price: Number(gig?.price || 0),
          due: row.preferred_submission,
          status: row.status,
        };
      });

    const bookedGigIds = new Set(
      clientRows.map((row: any) => row.gig_id).filter((id: string | null) => Boolean(id)),
    );

    const recommended = (recommendedPool || [])
      .filter((gig: any) => !bookedGigIds.has(gig.id))
      .slice(0, 8)
      .map((gig: any) => ({
        id: gig.id,
        title: gig.title,
        price: Number(gig.price || 0),
        per: gig.per,
        cover: gig.cover,
        provider: {
          name: one<any>(gig.provider)?.name || "Unknown provider",
          pic: one<any>(gig.provider)?.profile_pic,
        },
      }));

    const feed = uniqueRows
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((row: any) => {
        const gig = one<any>(row.gig);
        const client = one<any>(row.client)?.name;
        const provider = one<any>(gig?.provider)?.name;
        const isProviderSide = gig?.posted_by === user.id;
        const isPayment = ["paid", "completed"].includes(row.payment_status);

        return {
          type: isPayment ? "payment" : isProviderSide ? "booking_received" : "message",
          text: isPayment
            ? `Payment confirmed for ${gig?.title || "your booking"}`
            : isProviderSide
              ? `Booking request for ${gig?.title || "your gig"}`
              : `Update on ${gig?.title || "your booking"}`,
          name: isProviderSide ? client || "Buyer" : provider || "Seller",
          amount: Number(gig?.price || 0),
        };
      });

    const activeGigs = providerRows.filter((row: any) => row.status === "active").length;
    const completedThisMonth = providerRows.filter((row: any) => {
      const createdAt = new Date(row.created_at);
      return row.status === "completed" && createdAt >= startOfMonth;
    }).length;

    const totalTasks = activeGigs + completedThisMonth;
    const completionRate = totalTasks > 0 ? (completedThisMonth / totalTasks) * 100 : 0;

    return NextResponse.json({
      user: {
        name: profile?.name || "User",
      },
      stats: {
        totalEarnings,
        growth,
        activeGigs,
        completedThisMonth,
        pendingAsClient,
        totalTasks,
        completionRate,
      },
      visitorStats,
      weeklyTasks,
      recommended,
      feed,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data",
      },
      { status: 400 },
    );
  }
}
