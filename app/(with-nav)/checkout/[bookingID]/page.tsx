"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Lock,
  Calendar,
  Clock,
  ShieldCheck,
  Headphones,
  Loader2,
} from "lucide-react";

type PaymentMethod = "mpesa" | "stripe";

interface BookingDetails {
  id: string;
  status: string;
  payment_status: string;
  preferred_submission?: string;
  special_requirements?: string;
  created_at: string;
  gig: {
    id: string;
    title: string;
    description: string;
    price: number;
    per: string;
    cover?: string;
    posted_by: string;
    provider?: {
      name: string;
    };
  };
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [method, setMethod] = useState<PaymentMethod>("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [fetching, setFetching] = useState(true);

  // Calculate fees
  const serviceFee = booking?.gig.price || 0;
  const tax = Math.round(serviceFee * 0.08);
  const platformFee = 5;
  const total = serviceFee + tax + platformFee;

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBooking(data);
    } catch (err) {
      console.error("Failed to fetch booking:", err);
    } finally {
      setFetching(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          method,
          phoneNumber: method === "mpesa" ? `254${phoneNumber}` : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Simulate processing delay then redirect
      setTimeout(() => {
        router.push(`/checkout/success?payment=${data.paymentId}`);
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Payment failed");
      setLoading(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    }
    return v;
  };

  // Format expiry
  const formatExpiry = (val: string) => {
    const v = val.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)} / ${v.substring(2, 4)}`;
    }
    return v;
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-light" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <AlertCircle className="h-12 w-12 text-error" />
        <p className="text-slate-600">Booking not found</p>
        <Link href="/bookings" className="text-primary-light hover:underline">
          Back to bookings
        </Link>
      </div>
    );
  }

  // If already paid
  if (booking.payment_status === "paid") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <CheckCircle className="h-12 w-12 text-accent" />
        <p className="text-slate-600">This booking has already been paid</p>
        <Link href="/bookings" className="text-primary-light hover:underline">
          View your bookings
        </Link>
      </div>
    );
  }

  const isFormValid =
    method === "mpesa"
      ? phoneNumber.length >= 9
      : cardNumber.length >= 16 && expiry.length >= 5 && cvc.length >= 3;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-primary-dark"
          >
            <span className="text-2xl">⚡</span>
            Jiffy Gigs
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Lock size={14} />
            SECURE SSL ENCRYPTION
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Secure Checkout</h1>
          <p className="mt-1 text-slate-500">
            Please review your order and complete the payment below.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left Column - Payment Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Service Summary */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-primary-light/10 text-primary-light">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20 7h-4V4c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v3H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zM10 4h4v3h-4V4zm10 16H4V9h16v11z" />
                  </svg>
                </span>
                Service Summary
              </h2>

              <div className="flex gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {booking.gig.cover ? (
                    <Image
                      src={booking.gig.cover}
                      alt={booking.gig.title}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">
                    {booking.gig.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                    {booking.special_requirements ||
                      booking.gig.description ||
                      "Standard service package"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                    {booking.preferred_submission && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(
                          booking.preferred_submission,
                        ).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Per {booking.gig.per}
                    </span>
                  </div>
                  <Link
                    href={`/bookings/${bookingId}`}
                    className="mt-3 inline-block text-sm font-medium text-primary-light hover:underline"
                  >
                    Edit Service Details
                  </Link>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <CreditCard size={20} className="text-primary-light" />
                Payment Method
              </h2>

              {/* Method Selection */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMethod("mpesa")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    method === "mpesa"
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white font-bold text-lg">
                    M
                  </div>
                  <span
                    className={`font-bold ${method === "mpesa" ? "text-green-700" : "text-slate-700"}`}
                  >
                    M-Pesa
                  </span>
                </button>

                <button
                  onClick={() => setMethod("stripe")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    method === "stripe"
                      ? "border-primary-light bg-primary-light/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#635BFF] text-white">
                    <CreditCard size={24} />
                  </div>
                  <span
                    className={`font-bold ${method === "stripe" ? "text-primary-light" : "text-slate-700"}`}
                  >
                    Card
                  </span>
                </button>
              </div>

              {/* M-Pesa Form */}
              {method === "mpesa" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      M-Pesa Phone Number
                    </label>
                    <div className="flex">
                      <span className="flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
                        +254
                      </span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(
                            e.target.value.replace(/\D/g, "").slice(0, 9),
                          )
                        }
                        placeholder="712 345 678"
                        className="flex-1 rounded-r-lg border border-slate-300 px-4 py-3 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      You will receive an STK push on your phone to authorize
                      the payment.
                    </p>
                  </div>
                </div>
              )}

              {/* Card Form */}
              {method === "stripe" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Card Details
                    </label>
                    <div className="relative">
                      <CreditCard
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM / YY"
                      maxLength={7}
                      className="rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                    />
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) =>
                        setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))
                      }
                      placeholder="CVC"
                      maxLength={3}
                      className="rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-light focus:ring-primary-light"
                    />
                    <span className="text-sm text-slate-600">
                      Save payment information for next time
                    </span>
                  </label>
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Price Breakdown */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-slate-900">
                Price Breakdown
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Service Fee</span>
                  <span className="font-medium">
                    KSh {serviceFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (8%)</span>
                  <span className="font-medium">
                    KSh {tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee</span>
                  <span className="font-medium">
                    KSh {platformFee.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="my-4 border-t border-slate-200" />

              <div className="flex justify-between text-lg font-bold">
                <span className="text-slate-900">Total</span>
                <span className="text-primary-light">
                  KSh {total.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !isFormValid}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-light py-4 font-bold text-white shadow-lg transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    Confirm & Pay KSh {total.toLocaleString()}
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-slate-500">
                By confirming your booking, you agree to our{" "}
                <Link
                  href="/legal"
                  className="text-primary-light hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal"
                  className="text-primary-light hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Trust Badges */}
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Buyer Protection
                    </p>
                    <p className="text-xs text-slate-500">
                      100% money-back guarantee
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      24/7 Support
                    </p>
                    <p className="text-xs text-slate-500">
                      Help available at any time
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Logos */}
              <div className="mt-6 flex items-center justify-center gap-3 opacity-60 grayscale">
                <span className="text-xs font-medium">Secured by</span>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white">
                    STRIPE
                  </span>
                  <span className="rounded bg-green-600 px-2 py-1 text-[10px] font-bold text-white">
                    M-PESA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            © 2024 Jiffy Gigs Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-600">
            <Link href="/help" className="hover:text-primary-light">
              Help Center
            </Link>
            <Link href="/legal" className="hover:text-primary-light">
              Privacy
            </Link>
            <Link href="/legal" className="hover:text-primary-light">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-primary-light">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
