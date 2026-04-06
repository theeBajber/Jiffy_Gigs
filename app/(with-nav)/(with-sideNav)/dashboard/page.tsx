"use client";

import { poppins, inter } from "@/app/ui/fonts";
import {
  ArrowRight,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit,
  Brush,
  Terminal,
  Code,
  PenTool,
  Camera,
  Music,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardData {
  user: { name: string };
  stats: {
    totalEarnings: number;
    growth: string;
    activeGigs: number;
    completedThisMonth: number;
    pendingAsClient: number;
    totalTasks: number;
    completionRate: number;
  };
  visitorStats: number[];
  weeklyTasks: Array<{
    id: string;
    title: string;
    category: string;
    price: number;
    due: string;
    status: string;
  }>;
  recommended: Array<{
    id: string;
    title: string;
    price: number;
    per: string;
    cover?: string;
    provider: { name: string; pic?: string };
  }>;
  feed: Array<{
    type: string;
    text: string;
    name?: string;
    amount?: number;
  }>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Design: <Brush size={20} />,
  Development: <Terminal size={20} />,
  Coding: <Code size={20} />,
  Photography: <Camera size={20} />,
  Music: <Music size={20} />,
  Writing: <PenTool size={20} />,
};

const categoryColors: Record<string, string> = {
  Design: "text-brand-purple bg-brand-purple/10 border-brand-purple/20",
  Development: "text-brand-info bg-brand-info/10 border-brand-info/20",
  Coding: "text-brand-info bg-brand-info/10 border-brand-info/20",
  Photography: "text-brand-accent bg-brand-accent/10 border-brand-accent/20",
  Music: "text-brand-purple bg-brand-purple/10 border-brand-purple/20",
  Writing: "text-brand-info bg-brand-info/10 border-brand-info/20",
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  const getCoverUrl = (path?: string) => {
    if (!path) return "/gigs/design.jpg";
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/GigCovers/${path}`;
  };

  if (loading || !data) {
    return (
      <section className="flex w-full flex-col gap-4 overflow-y-scroll p-4 pl-6 text-brand-text h-[85vh] animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  const { user, stats, visitorStats, weeklyTasks, recommended, feed } = data;

  return (
    <section className="flex w-full flex-col gap-4 overflow-y-scroll p-4 pl-6 text-brand-text h-[85vh]">
      <div className="flex flex-col gap-1">
        <h1
          className={`${poppins.className} uppercase text-3xl font-extrabold tracking-tight text-brand-text`}
        >
          Gigster Dashboard
        </h1>
        <p
          className={`${inter.className} text-sm font-medium text-brand-muted`}
        >
          Welcome back, {user.name}! Keep up the great work.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Earnings */}
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-brand-border bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
          <div className="flex items-start justify-between">
            <span
              className={`${inter.className} text-sm font-semibold uppercase tracking-wider text-brand-muted`}
            >
              Total Earnings
            </span>
            <span
              className={`${inter.className} rounded-lg border border-brand-accent/20 bg-brand-accent/10 px-2.5 py-1 text-xs font-bold text-brand-accent`}
            >
              +{stats.growth}%
            </span>
          </div>
          <div className="flex items-end justify-between">
            <h3
              className={`${poppins.className} text-4xl font-black text-brand-text`}
            >
              {formatCurrency(stats.totalEarnings)}
            </h3>
          </div>
          <Link
            href="/bookings?filter=completed"
            className={`${inter.className} mt-4 flex items-center text-xs font-bold text-brand-info hover:underline w-fit`}
          >
            View full report <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>

        {/* Active Gigs */}
        <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
          <div className="flex items-start justify-between">
            <span
              className={`${inter.className} text-sm font-semibold uppercase tracking-wider text-brand-muted`}
            >
              Active Gigs
            </span>
            <span
              className={`${inter.className} text-xs font-bold text-brand-info`}
            >
              Live
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h3
              className={`${poppins.className} text-4xl font-black text-brand-text`}
            >
              {stats.activeGigs}
            </h3>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[conic-gradient(var(--color-primary-light)_${stats.completionRate}%,#F1F5F9_0)]">
              <div className="absolute inset-2 rounded-full bg-white"></div>
              <span
                className={`${inter.className} relative z-10 text-[11px] font-bold text-brand-info`}
              >
                {Math.round(stats.completionRate)}%
              </span>
            </div>
          </div>
          <p
            className={`${inter.className} text-xs font-medium text-brand-muted`}
          >
            {stats.completedThisMonth} completed this month •{" "}
            {stats.pendingAsClient} pending
          </p>
        </div>

        {/* Visitor Stats */}
        <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-brand-border bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
          <div className="flex items-start justify-between">
            <span
              className={`${inter.className} text-sm font-semibold uppercase tracking-wider text-brand-muted`}
            >
              Weekly Activity
            </span>
            <button className="text-brand-muted transition-colors hover:text-brand-text">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="flex h-20 items-end gap-1.5">
            {visitorStats.map((height, i) => (
              <div
                key={i}
                className="relative flex-1 overflow-hidden rounded-t-sm bg-primary-light"
                style={{ height: `${Math.max(height, 10)}%` }}
              >
                <div className="absolute bottom-0 left-0 right-0 h-full bg-brand-info opacity-60"></div>
              </div>
            ))}
          </div>
          <div
            className={`${inter.className} flex justify-between text-[10px] font-bold uppercase tracking-tighter text-brand-muted`}
          >
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* Weekly Task Progress */}
          <div className="flex flex-col gap-8 rounded-2xl border border-brand-border bg-white p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2
                  className={`${poppins.className} text-xl font-bold text-brand-text`}
                >
                  Weekly Task Progress
                </h2>
                <p className={`${inter.className} text-sm text-brand-muted`}>
                  You've completed {stats.completedThisMonth} out of{" "}
                  {stats.totalTasks} tasks this week
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col text-center">
                  <span
                    className={`${poppins.className} block text-2xl font-black text-primary-light`}
                  >
                    {Math.round(stats.completionRate)}%
                  </span>
                  <span
                    className={`${inter.className} text-[10px] font-bold uppercase tracking-widest text-brand-muted`}
                  >
                    Tasks
                  </span>
                </div>
                <div className="flex flex-col text-center">
                  <span
                    className={`${poppins.className} block text-2xl font-black text-accent`}
                  >
                    +{stats.growth}%
                  </span>
                  <span
                    className={`${inter.className} text-[10px] font-bold uppercase tracking-widest text-brand-muted`}
                  >
                    Growth
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {weeklyTasks.length === 0 ? (
                <p
                  className={`${inter.className} text-sm text-brand-muted col-span-2 text-center py-8`}
                >
                  No active tasks.{" "}
                  <Link
                    href="/gigs"
                    className="text-brand-info hover:underline"
                  >
                    Browse gigs
                  </Link>{" "}
                  to get started!
                </p>
              ) : (
                weeklyTasks.map((task) => {
                  const Icon = categoryIcons[task.category] || (
                    <Brush size={20} />
                  );
                  const colors =
                    categoryColors[task.category] || categoryColors["Design"];
                  const isDueSoon =
                    task.due &&
                    new Date(task.due) <
                      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

                  return (
                    <div
                      key={task.id}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-brand-border bg-gray-50 p-4 transition-colors hover:border-brand-info/50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colors}`}
                        >
                          {Icon}
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4
                            className={`${poppins.className} font-bold text-brand-text`}
                          >
                            {task.title}
                          </h4>
                          <p
                            className={`${inter.className} text-xs text-brand-muted`}
                          >
                            {task.category} •{" "}
                            {isDueSoon ? "Due soon" : "In progress"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col text-right">
                        <p
                          className={`${poppins.className} font-bold text-brand-text`}
                        >
                          ${task.price}
                        </p>
                        <span
                          className={`${inter.className} rounded border border-brand-info/20 bg-brand-info/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-info`}
                        >
                          Ongoing
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recommended Opportunities */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2
                className={`${poppins.className} text-xl font-bold text-brand-text`}
              >
                Recommended Opportunities
              </h2>
              <div className="flex gap-2">
                <button className="rounded-lg border border-brand-border bg-white p-2 text-brand-muted shadow-sm transition-colors hover:bg-gray-50 hover:text-brand-info">
                  <ChevronLeft size={14} />
                </button>
                <button className="rounded-lg border border-brand-border bg-white p-2 text-brand-muted shadow-sm transition-colors hover:bg-gray-50 hover:text-brand-info">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {recommended.length === 0 ? (
                <p
                  className={`${inter.className} text-sm text-brand-muted col-span-2 text-center py-8`}
                >
                  No recommendations right now. Check back later!
                </p>
              ) : (
                recommended.map((gig) => (
                  <div
                    key={gig.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all hover:border-brand-info/50"
                  >
                    <div className="relative h-32 overflow-hidden bg-gray-100">
                      <Image
                        alt={gig.title}
                        src={getCoverUrl(gig.cover)}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <span
                        className={`${inter.className} absolute left-3 top-3 rounded bg-brand-info px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white`}
                      >
                        {gig.per === "hour" ? "Hourly" : "Fixed"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-3 p-5">
                      <div className="flex items-center justify-between">
                        <h5
                          className={`${poppins.className} line-clamp-1 font-bold text-brand-text`}
                        >
                          {gig.title}
                        </h5>
                        <span
                          className={`${poppins.className} font-black text-brand-accent`}
                        >
                          ${gig.price}
                          {gig.per === "hour" && "/h"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-brand-border pt-4">
                        <div className="flex items-center gap-2">
                          {gig.provider.pic ? (
                            <Image
                              alt={gig.provider.name}
                              src={gig.provider.pic}
                              width={24}
                              height={24}
                              className="h-6 w-6 rounded-full"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-primary-light/20 flex items-center justify-center text-xs font-bold text-primary-light">
                              {gig.provider.name?.[0] || "?"}
                            </div>
                          )}
                          <span
                            className={`${inter.className} text-xs font-medium text-brand-muted`}
                          >
                            {gig.provider.name}
                          </span>
                        </div>
                        <Link
                          href={`/gigs/${gig.id}`}
                          className={`${inter.className} rounded-lg bg-brand-info/10 px-4 py-1.5 text-xs font-bold text-brand-info transition-all hover:bg-brand-info hover:text-white`}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Market Share - Simplified to show user stats */}
          <div className="flex flex-col gap-6 rounded-2xl border border-brand-border bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h2 className={`${poppins.className} font-bold text-brand-text`}>
                Your Stats
              </h2>
              <Link
                href="/profile"
                className={`${inter.className} text-[10px] font-bold uppercase tracking-widest text-brand-muted hover:text-brand-info`}
              >
                VIEW ALL
              </Link>
            </div>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative flex h-40 w-40 scale-110 items-center justify-center rounded-full bg-[conic-gradient(var(--color-primary-light)_${stats.completionRate}%,#F1F5F9_0)]">
                <div className="absolute inset-2 rounded-full bg-white"></div>
                <div className="relative z-10 flex flex-col text-center">
                  <span
                    className={`${poppins.className} block text-2xl font-black text-brand-text`}
                  >
                    {stats.activeGigs + stats.completedThisMonth}
                  </span>
                  <span
                    className={`${inter.className} text-[8px] font-bold uppercase text-brand-muted`}
                  >
                    Total Gigs
                  </span>
                </div>
              </div>
              <div className="mt-4 grid w-full grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-accent"></div>
                  <span
                    className={`${inter.className} text-[10px] font-bold uppercase tracking-wider text-brand-muted`}
                  >
                    Completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-info"></div>
                  <span
                    className={`${inter.className} text-[10px] font-bold uppercase tracking-wider text-brand-muted`}
                  >
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-orange-400"></div>
                  <span
                    className={`${inter.className} text-[10px] font-bold uppercase tracking-wider text-brand-muted`}
                  >
                    Pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-purple"></div>
                  <span
                    className={`${inter.className} text-[10px] font-bold uppercase tracking-wider text-brand-muted`}
                  >
                    Earnings
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Badge */}
          <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h2 className={`${poppins.className} font-bold text-brand-text`}>
                Skills Badge
              </h2>
              <Link
                href="/profile"
                className="text-brand-muted hover:text-brand-info"
              >
                <Edit size={18} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {["UI Design", "Figma", "React", "Python"].map((skill) => (
                <span
                  key={skill}
                  className={`${inter.className} rounded-lg border border-brand-border bg-gray-50 px-2.5 py-1 text-[11px] font-bold text-brand-muted`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Feed */}
          <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
            <h2 className={`${poppins.className} font-bold text-brand-text`}>
              Quick Feed
            </h2>
            <div className="flex flex-col gap-4">
              {feed.length === 0 ? (
                <p
                  className={`${inter.className} text-[13px] text-brand-muted`}
                >
                  No recent activity
                </p>
              ) : (
                feed.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-xl bg-gray-50 p-3 transition-all hover:border-brand-info/20"
                  >
                    <div
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        item.type === "payment"
                          ? "bg-brand-accent"
                          : "bg-brand-info"
                      }`}
                    ></div>
                    <p
                      className={`${inter.className} text-[13px] leading-relaxed text-brand-muted`}
                    >
                      {item.type === "payment" ? (
                        <>
                          Payment of{" "}
                          <span className="font-bold text-brand-text">
                            ${item.amount}
                          </span>{" "}
                          received
                        </>
                      ) : (
                        <>
                          {item.text} from{" "}
                          <span className="font-bold text-brand-text">
                            {item.name}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
