// app/(with-nav)/checkout/[bookingID]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PaymentModal from "@/app/ui/paymentModal";

export default function CheckoutPage() {
  const { bookingID } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingID]);

  const fetchBookingDetails = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingID}`);
      const data = await res.json();
      setBooking(data);
    } catch (error) {
      console.error("Failed to fetch booking:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Refresh booking data to show updated status
    fetchBookingDetails();
  };

  if (loading) return <div>Loading...</div>;
  if (!booking) return <div>Booking not found</div>;

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
      {booking.payment_status === "pending" && booking.status === "active" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Service completed? Complete the payment to release funds to the
            seller.
          </p>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="mt-3 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Pay Now with M-Pesa
          </button>
        </div>
      )}

      {booking.payment_status === "completed" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">✅ Payment completed successfully!</p>
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
