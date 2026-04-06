import { poppins } from "@/app/ui/fonts";
import { CircleQuestionMark, Shield, ShieldCheck } from "lucide-react";

export default function Policy() {
  return (
    <div className="p-4">
      <Hero />
      <div className="w-full flex gap-4 p-2">
        <aside className="sticky top-6 w-1/3 h-fit max-w-72 min-w-60 flex flex-col gap-4 p-2">
          <nav className="flex flex-col [&>*]:w-full [&>*]:px-3 [&>*]:py-1">
            <h3
              className={`${poppins.className} font-bold text-primary-dark/50 mb-1`}
            >
              Legal Sections
            </h3>
            <a className="border-l-2" href="">
              Privacy Policy
            </a>
            <a className="" href="">
              Terms Of Service
            </a>
            <a className="" href="">
              Cookie Policy
            </a>
          </nav>
          <div className="bg-primary-light/10 rounded-3xl flex flex-col gap-2 w-full min-w-55 p-4">
            <h3
              className={`font-bold flex items-center gap-2 ${poppins.className}`}
            >
              <CircleQuestionMark className="text-primary-light" />
              Have questions?
            </h3>
            <p className="text-sm text-primary-dark/80">
              Our legal team is here to help you understand our policies.
            </p>
            <a
              href=""
              className="text-primary-light hover:border-b border-primary-light w-fit text-sm font-bold"
            >
              Contact Legal Support
            </a>
          </div>
        </aside>
        <main className="w-full flex flex-col gap-2 px-4 [&>*]:w-full p-2 text-primary-dark/80">
          <section className="" id="">
            <h2
              className={`text-3xl ${poppins.className} text-primary-dark mb-6`}
            >
              Privacy Policy
            </h2>
            <p className="text-lg mb-1">
              At JiffyGigs, we take your privacy seriously. This policy
              describes what information we collect, how we use it, and your
              rights regarding your personal data.
            </p>
            <p className="text-sm italic mb-4">
              Last Updated: October 24, 2023
            </p>
            <h3 className="text-xl text-primary-dark mb-2 font-bold">
              1. Data Collection
            </h3>
            <p className="mb-1">
              We collect information that you provide directly to us when you
              create an account, post a gig, or communicate with other users.
              This may include:
            </p>
            <ul className="flex flex-col gap-2 list-disc pl-8 mb-2">
              <li>
                <strong className="text-primary-dark">
                  Personal Identifiers:
                </strong>{" "}
                Name, university email address, and profile picture.
              </li>
              <li>
                <strong className="text-primary-dark">
                  Academic Information:
                </strong>{" "}
                University name, graduation year, and major.
              </li>
              <li>
                <strong className="text-primary-dark">
                  Payment Information:
                </strong>{" "}
                Processed securely through our third-party payment providers
                (Stripe).
              </li>
              <li>
                <strong className="text-primary-dark">Communications:</strong>{" "}
                Records of messages sent between users on the platform.
              </li>
            </ul>
            <h3 className="text-xl text-primary-dark mb-2 font-bold">
              2. How We Use Your Data
            </h3>
            <p className="mb-1">
              Your data is used to provide and improve the JiffyGigs experience,
              including:
            </p>
            <ul className="flex flex-col gap-2 list-disc pl-8 mb-2 text-primary-dark">
              <li>Connecting "Gigsters" with local student clients.</li>
              <li>Verifying student status to maintain community safety.</li>
              <li>Processing payments and preventing fraudulent activity.</li>
              <li>Sending system notifications and platform updates.</li>
            </ul>
            <div className="bg-primary-light/10 p-6 rounded-xl border border-primary-light my-2">
              <div className="flex gap-2 items-center mb-2">
                <ShieldCheck className="text-primary-light" />
                <h4 className="font-bold text-xl text-primary-light">
                  Safety First
                </h4>
              </div>
              <div>
                <p className="text-primary-light">
                  We never sell your personal data to third parties for
                  marketing purposes. Your trust is our most valuable asset.
                </p>
              </div>
            </div>
            <h3 className="text-xl text-primary-dark mb-2 font-bold">
              3. Data Sharing
            </h3>
            <p className="mb-1">
              We only share your information with your consent or as necessary
              to provide our services. This includes sharing your profile info
              with potential gig-posters and necessary data with our payment
              processors.
            </p>
          </section>
          <section className="" id=""></section>
          <section className="" id=""></section>
        </main>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="w-full h-120 bg-linear-to-br to-primary-dark from-primary-light rounded-xl flex flex-col gap-4 p-8 pl-14 text-secondary mb-4 justify-center">
      <h1
        className={`text-6xl font-bold ${poppins.className} text-neutral-light`}
      >
        Legal Information
      </h1>
      <p className="text-lg max-w-165">
        Everything you need to know about your rights, our responsibilities, and
        how we handle your data within the JiffyGigs community.
      </p>
    </section>
  );
}
