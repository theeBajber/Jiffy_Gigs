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
    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single();

    // Total Earnings (completed & paid gigs as provider)
    const { data: earningsData } = await supabase
      .from("bookings")
      .select("gig:gigs!inner(price)")
      .eq("gigs.posted_by", user.id)
      .eq("status", "completed")
      .eq("payment_status", "paid");

    const totalEarnings =
      earningsData?.reduce((sum, b: any) => {
        return sum + (b.gig?.[0]?.price || 0);
      }, 0) || 0;

    // Calculate growth (compare to last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const { data: lastMonthEarnings } = await supabase
      .from("bookings")
      .select("gig:gigs!inner(price)")
      .eq("gigs.posted_by", user.id)
      .eq("status", "completed")
      .eq("payment_status", "paid")
      .gte("created_at", lastMonth.toISOString());

    const lastMonthTotal =
      lastMonthEarnings?.reduce((sum, b: any) => {
        return sum + (b.gig?.[0]?.price || 0);
      }, 0) || 0;

    const growth =
      lastMonthTotal > 0
        ? (((totalEarnings - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
        : "0";

    // Active Gigs (bookings as provider that are active)
    const { count: activeGigs } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("gig.posted_by", user.id)
      .eq("status", "active");

    // Completed this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const { count: completedThisMonth } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("gig.posted_by", user.id)
      .eq("status", "completed")
      .gte("created_at", startOfMonth.toISOString());

    // Pending (active bookings as client)
    const { count: pendingAsClient } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "active");

    // Weekly visitor stats (bookings created per day this week)
    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      weekDays.push(d.toISOString().split("T")[0]);
    }

    const { data: dailyBookings } = await supabase
      .from("bookings")
      .select("created_at")
      .gte("created_at", weekDays[0])
      .or(`user_id.eq.${user.id},gig.posted_by.eq.${user.id}`);

    const visitorStats = weekDays.map((date) => {
      const count =
        dailyBookings?.filter((b: any) => b.created_at.startsWith(date))
          .length || 0;
      // Scale for visual (max 100%)
      return Math.min((count / 5) * 100, 100);
    });

    // Weekly tasks (active bookings with gig details)
    const { data: weeklyTasks } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        gig:gigs(title, price, category:categories(name)),
        preferred_submission
      `,
      )
      .or(`user_id.eq.${user.id},gig.posted_by.eq.${user.id}`)
      .eq("status", "active")
      .order("preferred_submission", { ascending: true })
      .limit(4);

    // Recommended opportunities (gigs not by user, not booked by user)
    const { data: recommended } = await supabase
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
      .not(
        "id",
        "in",
        supabase.from("bookings").select("gig_id").eq("user_id", user.id),
      )
      .order("created_at", { ascending: false })
      .limit(4);

    // Quick feed (recent bookings/messages)
    const { data: recentBookings } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        payment_status,
        created_at,
        gig:gigs(title),
        client:users!user_id(name)
      `,
      )
      .or(`user_id.eq.${user.id},gig.posted_by.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(3);

    const feed =
      recentBookings?.map((b: any) => ({
        type:
          b.gig?.posted_by === user.id
            ? "booking_received"
            : b.payment_status === "paid"
              ? "payment"
              : "message",
        text:
          b.gig?.posted_by === user.id
            ? `New booking for ${b.gig?.title}`
            : b.payment_status === "paid"
              ? `Payment received for ${b.gig?.title}`
              : `Update on ${b.gig?.title}`,
        name: b.client?.[0]?.name,
        amount: b.gig?.price,
      })) || [];

    return NextResponse.json({
      user: {
        name: profile?.name || "User",
      },
      stats: {
        totalEarnings,
        growth,
        activeGigs: activeGigs || 0,
        completedThisMonth: completedThisMonth || 0,
        pendingAsClient: pendingAsClient || 0,
        totalTasks: (activeGigs || 0) + (completedThisMonth || 0),
        completionRate:
          ((completedThisMonth || 0) /
            ((activeGigs || 0) + (completedThisMonth || 0))) *
            100 || 0,
      },
      visitorStats,
      weeklyTasks:
        weeklyTasks?.map((t: any) => ({
          id: t.id,
          title: t.gig?.title,
          category: t.gig?.category?.[0]?.name || "General",
          price: t.gig?.price,
          due: t.preferred_submission,
          status: t.status,
        })) || [],
      recommended:
        recommended?.map((g: any) => ({
          id: g.id,
          title: g.title,
          price: g.price,
          per: g.per,
          cover: g.cover,
          provider: {
            name: g.provider?.[0]?.name,
            pic: g.provider?.[0]?.profile_pic,
          },
        })) || [],
      feed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 400 },
    );
  }
}
