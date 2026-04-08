import { poppins } from "@/app/ui/fonts";

export default function SupportPage() {
  return (
    <main className="mx-auto mt-24 min-h-[70vh] max-w-3xl px-6 pb-16 text-primary-dark">
      <h1 className={`text-4xl font-bold ${poppins.className}`}>Support</h1>
      <p className="mt-4 text-primary-dark/70">
        Need help with bookings, payments, or account verification? Start here.
      </p>

      <div className="mt-8 grid gap-4">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Account & verification</h2>
          <p className="mt-1 text-sm text-primary-dark/70">
            Use campus emails only (.edu or .ac.ke). If you don’t receive
            confirmation, check spam and retry from login.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Booking issues</h2>
          <p className="mt-1 text-sm text-primary-dark/70">
            Booking requests start in pending state until the seller accepts.
            You can track status updates in the bookings and notifications pages.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">M-Pesa payments</h2>
          <p className="mt-1 text-sm text-primary-dark/70">
            Payments happen via STK push. If confirmation delays, wait briefly
            and refresh checkout. Failed payments can be retried from checkout.
          </p>
        </div>
      </div>
    </main>
  );
}
