"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items]);

  const markAllRead = async () => {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });

    if (res.ok) {
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    }
  };

  const openNotificationTarget = async (item: NotificationItem) => {
    if (!item.read) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: item.id }),
      });
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    }

    const checkoutUrl =
      typeof item.metadata?.checkout_url === "string"
        ? item.metadata.checkout_url
        : null;
    const bookingId =
      typeof item.metadata?.booking_id === "string"
        ? item.metadata.booking_id
        : null;

    if (checkoutUrl) {
      router.push(checkoutUrl);
      return;
    }

    if (bookingId) {
      router.push(`/checkout/${bookingId}`);
      return;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[85vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-light" />
      </div>
    );
  }

  return (
    <section className="w-full h-[85vh] ml-4 p-6 overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Notifications</h1>
          <p className="text-sm text-primary-dark/60 mt-1">
            {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          <CheckCheck size={16} />
          Mark all read
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          <Bell className="mx-auto mb-3" />
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => openNotificationTarget(item)}
              className={`w-full rounded-xl border px-5 py-4 text-left transition hover:shadow-sm ${
                item.read
                  ? "border-slate-200 bg-white"
                  : "border-primary-light/30 bg-primary-light/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary-dark">{item.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.message}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <ExternalLink size={16} className="text-slate-400 shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
