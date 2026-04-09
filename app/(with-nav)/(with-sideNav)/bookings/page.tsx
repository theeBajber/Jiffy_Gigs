// /app/(with-nav)/(with-sideNav)/bookings/page.tsx
"use client";

import { BookingCard } from "@/app/ui/cards";
import { poppins } from "@/app/ui/fonts";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type BookingView = "made" | "provided";
type FilterStatus = "all" | "pending" | "active" | "completed";

interface Booking {
  id: string;
  status: "pending" | "active" | "completed" | "cancelled";
  payment_status: "pending" | "paid" | "completed" | "failed";
  created_at: string;
  preferred_submission?: string;
  special_requirements?: string;
  type: "made" | "provided";
  gig: {
    id: string;
    title: string;
    price: number;
    per: string;
    cover_url?: string;
  };
  other_party: {
    name: string;
    email?: string;
  };
}

export default function Bookings() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useState<BookingView>("made");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const updateQueryParams = (
    nextView: BookingView,
    nextFilter: FilterStatus,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextView);
    params.set("filter", nextFilter);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const viewParam = searchParams.get("view");
    const filterParam = searchParams.get("filter");

    if (viewParam === "made" || viewParam === "provided") {
      setView((prev) => (prev === viewParam ? prev : viewParam));
    }

    if (
      filterParam === "all" ||
      filterParam === "pending" ||
      filterParam === "active" ||
      filterParam === "completed"
    ) {
      setFilter((prev) => (prev === filterParam ? prev : filterParam));
    }
  }, [searchParams]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBookings([
        ...(data.bookings_i_made || []),
        ...(data.gigs_i_provide || []),
      ]);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, action: "cancel" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel");

      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: (data.booking?.status as Booking["status"]) || "cancelled",
                payment_status:
                  (data.booking?.payment_status as Booking["payment_status"]) ||
                  b.payment_status,
              }
            : b,
        ),
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to cancel booking");
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, action: "accept" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept booking");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: (data.booking?.status as Booking["status"]) || "active",
                payment_status:
                  (data.booking?.payment_status as Booking["payment_status"]) ||
                  b.payment_status,
              }
            : b,
        ),
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to accept booking");
    }
  };

  const handleMarkDone = async (id: string) => {
    if (!confirm("Mark as completed?")) return;
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, action: "complete" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: (data.booking?.status as Booking["status"]) || "completed",
                payment_status:
                  (data.booking?.payment_status as Booking["payment_status"]) ||
                  "pending",
              }
            : b,
        ),
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to mark as done");
    }
  };

  const handlePay = (id: string) => {
    router.push(`/checkout/${id}`);
  };

  const handleViewChange = (nextView: BookingView) => {
    setView(nextView);
    updateQueryParams(nextView, filter);
  };

  const handleFilterChange = (nextFilter: FilterStatus) => {
    setFilter(nextFilter);
    updateQueryParams(view, nextFilter);
  };

  const filtered = bookings.filter((b) => {
    if (b.type !== view) return false;
    if (filter === "all") return true;
    return b.status === filter;
  });

  const pendingCount = bookings.filter(
    (b) => b.type === view && b.status === "pending",
  ).length;
  const activeCount = bookings.filter(
    (b) => b.type === view && b.status === "active",
  ).length;
  const completedCount = bookings.filter(
    (b) => b.type === view && b.status === "completed",
  ).length;

  return (
    <section className="flex flex-col p-6 w-full h-[85vh] ml-4">
      <div className="mb-6">
        <h1
          className={`${poppins.className} font-bold text-3xl text-primary-dark mb-1`}
        >
          My Bookings
        </h1>
        <p className="text-primary-light/80 text-sm">
          {view === "made"
            ? "Track services you've requested from other students."
            : "Manage gigs you're providing and mark them complete."}
        </p>
      </div>

      <div className="flex w-full justify-between border-b border-secondary/50 mb-4 pb-2 items-center">
        <div className="flex p-1 bg-neutral-light rounded-lg w-fit border border-secondary/30">
          <button
            onClick={() => handleViewChange("made")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === "made"
                ? "bg-white text-primary-dark shadow-sm"
                : "text-primary-light hover:text-primary-dark"
            }`}
          >
            Bookings I Made
          </button>
          <button
            onClick={() => handleViewChange("provided")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === "provided"
                ? "bg-white text-primary-dark shadow-sm"
                : "text-primary-light hover:text-primary-dark"
            }`}
          >
            Gigs I Provide
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => handleFilterChange("all")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              filter === "all"
                ? "text-primary-dark"
                : "text-primary-light/70 hover:text-primary-light"
            }`}
          >
            All
            {filter === "all" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light" />
            )}
          </button>
          <button
            onClick={() => handleFilterChange("pending")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              filter === "pending"
                ? "text-primary-dark"
                : "text-primary-light/70 hover:text-primary-light"
            }`}
          >
            Pending
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                filter === "pending"
                  ? "bg-primary text-white"
                  : "bg-secondary/50 text-primary-light"
              }`}
            >
              {pendingCount}
            </span>
            {filter === "pending" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => handleFilterChange("active")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              filter === "active"
                ? "text-primary-dark"
                : "text-primary-light/70 hover:text-primary-light"
            }`}
          >
            Active
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                filter === "active"
                  ? "bg-primary-light text-white"
                  : "bg-secondary/50 text-primary-light"
              }`}
            >
              {activeCount}
            </span>
            {filter === "active" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light" />
            )}
          </button>
          <button
            onClick={() => handleFilterChange("completed")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              filter === "completed"
                ? "text-primary-dark"
                : "text-primary-light/70 hover:text-primary-light"
            }`}
          >
            Completed
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                filter === "completed"
                  ? "bg-accent text-white"
                  : "bg-secondary/50 text-primary-light"
              }`}
            >
              {completedCount}
            </span>
            {filter === "completed" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary-light" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-light flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-primary-dark font-medium mb-1">
              No {filter !== "all" ? filter : ""} bookings
            </p>
            <p className="text-primary-light/70 text-sm">
              {view === "made"
                ? "Browse gigs and book your first service."
                : "Your incoming requests will appear here."}
            </p>
          </div>
        ) : (
          filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              clientName={booking.other_party.name}
              amount={booking.gig.price}
              title={booking.gig.title}
              id={booking.id}
              status={booking.status}
              payment_status={booking.payment_status}
              cover={booking.gig.cover_url}
              per={booking.gig.per}
              isProvider={view === "provided"}
              onAccept={() => handleAccept(booking.id)}
              onCancel={() => handleCancel(booking.id)}
              onMarkDone={() => handleMarkDone(booking.id)}
              onPay={() => handlePay(booking.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
