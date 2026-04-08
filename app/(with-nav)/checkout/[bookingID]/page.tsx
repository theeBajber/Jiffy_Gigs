// app/(with-nav)/checkout/[bookingID]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PaymentModal from "@/app/ui/paymentModal";

type CheckoutBooking = {
  status: string;
  payment_status: string;
  gig: {
    title: string;
    description: string;
    price: number;
  };
};

export default function CheckoutPage() {
  const { bookingID } = useParams();
  const [booking, setBooking] = useState<CheckoutBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const fetchBookingDetails = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingID}`);
      const data = await res.json();
      setBooking(data);

      const reviewRes = await fetch(`/api/reviews?bookingId=${bookingID}`);
      const reviewData = await reviewRes.json();
      if (reviewRes.ok && reviewData.review) {
        setReviewSubmitted(true);
      }
    } catch (error) {
      console.error("Failed to fetch booking:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingID]);

  const handlePaymentSuccess = () => {
    // Refresh booking data to show updated status
    fetchBookingDetails();
  };

  if (loading) return <div>Loading...</div>;
  if (!booking) return <div>Booking not found</div>;

  const paymentComplete = ["completed", "paid"].includes(
    booking.payment_status,
  );

  const handleReviewSubmit = async () => {
    try {
      setReviewSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingID,
          rating: review.rating,
          comment: review.comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      setReviewSubmitted(true);
    } catch (error: unknown) {
      alert(
        error instanceof Error ? error.message : "Failed to submit review",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl min-h-[85vh] mt-18 mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Booking Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-2">{booking.gig.title}</h2>
        <p className="text-gray-600 mb-4">{booking.gig.description}</p>
        <div className="flex justify-between items-center border-t pt-4">
          <span className="text-gray-600">Total Amount</span>
          <span className="text-2xl font-bold text-green-600">
            KES {booking.gig.price}
          </span>
        </div>
      </div>

      {/* Payment Status */}
      {booking.payment_status === "pending" && booking.status === "completed" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            The seller marked this service complete. Complete payment to close
            this booking.
          </p>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="mt-3 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Pay Now with M-Pesa
          </button>
        </div>
      )}

      {paymentComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">✅ Payment completed successfully!</p>
        </div>
      )}

      {paymentComplete && !reviewSubmitted && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-5 mt-6">
          <h3 className="font-semibold text-pink-900">Leave a Review</h3>
          <p className="text-sm text-pink-800 mt-1">
            Help other students by rating your experience.
          </p>

          <div className="mt-4">
            <label className="text-sm font-medium text-pink-900">Rating</label>
            <select
              className="mt-1 w-full rounded-lg border border-pink-200 bg-white px-3 py-2"
              value={review.rating}
              onChange={(e) =>
                setReview((prev) => ({ ...prev, rating: Number(e.target.value) }))
              }
            >
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} Star{star > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3">
            <label className="text-sm font-medium text-pink-900">Comment</label>
            <textarea
              value={review.comment}
              onChange={(e) =>
                setReview((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder="How was the delivery and communication?"
              className="mt-1 w-full min-h-24 rounded-lg border border-pink-200 bg-white px-3 py-2"
            />
          </div>

          <button
            onClick={handleReviewSubmit}
            disabled={reviewSubmitting}
            className="mt-4 w-full rounded-lg bg-pink-600 py-2.5 font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
          >
            {reviewSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {paymentComplete && reviewSubmitted && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mt-6">
          <p className="text-pink-900">💗 Thanks! Your review has been saved.</p>
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingId={bookingID as string}
        amount={booking.gig.price}
        gigTitle={booking.gig.title}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
