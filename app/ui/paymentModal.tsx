"use client";

import { useState } from "react";
import { X, Phone, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
  gigTitle: string;
  onSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  bookingId,
  amount,
  gigTitle,
  onSuccess,
}: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "processing" | "prompt_sent" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("processing");
    setErrorMessage("");

    try {
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      setStatus("prompt_sent");

      // Start polling for status
      pollPaymentStatus(data.paymentId);
    } catch (error: unknown) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to initiate payment",
      );
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (paymentId: string) => {
    const maxAttempts = 30; // 2.5 minutes (5 second intervals)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `/api/payments/status?paymentId=${paymentId}`,
        );
        const data = await response.json();

        if (data.status === "completed") {
          setStatus("success");
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
          return;
        } else if (data.status === "failed") {
          setStatus("error");
          setErrorMessage("Payment failed. Please try again.");
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        } else {
          setStatus("error");
          setErrorMessage(
            "Payment verification timed out. Please check your M-Pesa messages.",
          );
        }
      } catch {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        }
      }
    };

    checkStatus();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Complete Payment
            </h2>
            <p className="text-sm text-gray-500 mt-1">{gigTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Amount Display */}
  <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-6 text-white">
          <p className="text-sm opacity-90">Amount to Pay</p>
          <p className="text-3xl font-bold">KES {amount.toLocaleString()}</p>
        </div>

        {/* Content based on status */}
        {status === "idle" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07XX XXX XXX or 2547XX XXX XXX"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You&apos;ll receive an STK push on this number to enter your
                M-Pesa PIN
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay with M-Pesa"
              )}
            </button>
          </form>
        )}

        {status === "processing" && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Initiating payment...</p>
          </div>
        )}

        {status === "prompt_sent" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-green-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Check Your Phone
            </h3>
            <p className="text-gray-600 mb-4">
              An M-Pesa prompt has been sent to {phoneNumber}. Please enter your
              PIN to complete the payment.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for confirmation...
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600">
              Your payment has been received and the gig is now marked as
              completed.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Failed
            </h3>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => setStatus("idle")}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Security Note */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            🔒 Secured by M-Pesa Daraja API. No commission charged - direct
            payment to seller.
          </p>
        </div>
      </div>
    </div>
  );
}
