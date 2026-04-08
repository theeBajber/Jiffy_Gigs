"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BookingModal({
  isOpen,
  onCloseAction,
  gigId,
  title,
  price,
  cover,
}: {
  isOpen: boolean;
  onCloseAction: () => void;
  gigId: string;
  title: string;
  price: number;
  cover?: string;
}) {
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);

      if (!phoneNumber.trim()) {
        throw new Error("Enter your M-Pesa phone number");
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gigId,
          date,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (!data?.bookingId) {
        throw new Error("Booking created but payment could not be started");
      }

      const paymentRes = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: data.bookingId,
          phoneNumber,
        }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) {
        throw new Error(paymentData.error || "Failed to initiate M-Pesa");
      }

      alert("Booking successful! M-Pesa prompt sent to your phone.");
      onCloseAction();
      router.push("/bookings");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Booking failed";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const total = price; // extend later (fees etc.)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-130 rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Confirm Booking</h2>
          <button onClick={onCloseAction}>✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Service */}
          <div className="flex gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="h-20 w-20 rounded-lg overflow-hidden bg-slate-200">
              {cover && (
                <img
                  src={cover}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="text-sm text-slate-500">
                Book your session easily.
              </p>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-semibold">Preferred Date</label>
            <input
              type="date"
              className="w-full mt-2 p-2 border rounded-lg"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold">
              Special Requirements
            </label>
            <textarea
              className="w-full mt-2 p-2 border rounded-lg"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional..."
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-sm font-semibold">M-Pesa Phone Number</label>
            <input
              type="tel"
              className="w-full mt-2 p-2 border rounded-lg"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="07XX XXX XXX or 2547XX XXX XXX"
            />
            <p className="text-xs text-slate-500 mt-1">
              You&apos;ll receive an STK push to approve payment.
            </p>
          </div>

          {/* Price */}
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>KSh {total}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 border-t">
          <button
            onClick={onCloseAction}
            className="flex-1 border rounded-lg py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-primary-light text-white rounded-lg py-2"
          >
            {loading ? "Processing..." : `Book & Pay with M-Pesa`}
          </button>
        </div>
      </div>
    </div>
  );
}
