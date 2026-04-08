import { poppins } from "@/app/ui/fonts";

export default function PrivacyPage() {
  return (
    <main className="mx-auto mt-24 min-h-[70vh] max-w-4xl px-6 pb-16 text-primary-dark">
      <h1 className={`text-4xl font-bold ${poppins.className}`}>Privacy Policy</h1>
      <p className="mt-4 text-primary-dark/70">
        Jiffy Gigs is a campus-first platform. We only collect the minimum data
        needed to provide bookings, chat, payments, and trust features.
      </p>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">What we collect</h2>
        <ul className="list-disc pl-5 text-primary-dark/75 space-y-1">
          <li>Account details (name, campus email, institution).</li>
          <li>Gig listings, bookings, and chat content needed for coordination.</li>
          <li>Payment metadata from M-Pesa callbacks (no M-Pesa PIN stored).</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">How we use your data</h2>
        <ul className="list-disc pl-5 text-primary-dark/75 space-y-1">
          <li>Operate account authentication and campus verification.</li>
          <li>Connect buyers and sellers for service delivery.</li>
          <li>Maintain transaction integrity and fraud prevention.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-primary-dark/75">
          For privacy questions, visit the support page or contact the platform
          admins through in-app messaging.
        </p>
      </section>
    </main>
  );
}
