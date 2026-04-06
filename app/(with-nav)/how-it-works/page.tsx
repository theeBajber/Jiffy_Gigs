"use client";
import Image from "next/image";
import { useState } from "react";
import {
  Bolt,
  Wrench,
  Megaphone,
  ArrowRight,
  ChevronDown,
  User,
  Briefcase,
  Map,
  CreditCard,
  CheckCircle,
  FileText,
  Shield,
  GraduationCap,
  Link,
} from "lucide-react";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"gigsters" | "posters">(
    "gigsters",
  );
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  const faqs = [
    {
      question: "How do payments work?",
      answer:
        "Payments are held in escrow when a gig starts and released automatically to the worker once the poster approves the completed work.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use industry-standard encryption and security practices to protect your personal information and payment details.",
    },
    {
      question: "Do I need to be a student?",
      answer:
        "While Jiffy Gigs is built for university communities, anyone with a valid university email or located near campus can participate.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="flex w-full flex-col bg-background-light text-slate-900 mt-18">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-12 text-center">
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight">
          How Jiffy Gigs Works
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Connecting university students with local micro-jobs. Simple, fast,
          and secure. Choose your path to get started today.
        </p>
      </section>

      {/* Track Selection Tabs */}
      <div className="mx-auto mb-16 flex max-w-7xl justify-center px-6">
        <div className="inline-flex gap-1 rounded-xl border border-primary-light/10 bg-primary-light/5 p-1">
          <button
            onClick={() => setActiveTab("gigsters")}
            className={`rounded-lg px-8 py-3 font-bold transition-all ${
              activeTab === "gigsters"
                ? "bg-primary-light text-white shadow-md"
                : "text-slate-600 hover:text-primary-light"
            }`}
          >
            For Gigsters
          </button>
          <button
            onClick={() => setActiveTab("posters")}
            className={`rounded-lg px-8 py-3 font-bold transition-all ${
              activeTab === "posters"
                ? "bg-primary-light text-white shadow-md"
                : "text-slate-600 hover:text-primary-light"
            }`}
          >
            For Posters
          </button>
        </div>
      </div>

      {/* Two-Column Timeline Section */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 lg:grid-cols-2 lg:items-start">
        {/* Gigsters Track */}
        <div className="flex flex-col gap-12">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-light/10 p-3 text-primary-light">
              <Wrench size={32} />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">For Gigsters (Workers)</h2>
              <p className="text-sm text-slate-500">
                Earn extra cash on your own schedule.
              </p>
            </div>
          </div>

          <div className="relative flex flex-col gap-16 pl-4">
            {/* Timeline Line */}
            <div
              className="absolute left-6 top-12 bottom-0 w-0.5"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, #258cf4 0%, #258cf4 50%, transparent 50%, transparent 100%)",
                backgroundSize: "1px 10px",
              }}
            ></div>

            {/* Step 1 */}
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
              <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-xl font-bold text-white shadow-lg shadow-primary-light/30">
                1
              </div>
              <div className="flex flex-1 flex-col items-center gap-6 md:flex-row">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">
                    Create Your Profile
                  </h3>
                  <p className="text-slate-600">
                    Sign up with your university email. Highlight your skills,
                    availability, and what kind of micro-jobs you're looking
                    for.
                  </p>
                </div>
                <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-xl shadow-md">
                  <Image
                    alt="University student creating a profile on a smartphone"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcsKIHc8XVWSgp6p9L98vnyziHndFAllRzfiUHN4K2Z7Z9Jsquj4G_KStNYAvcJv6xjqKz1u8JUNGCAmF0Alg2r_gPHxtD0KfjS_0JPotAr7dVawgWq1jAroEJpe6UB6c5Jc06zz_nBLYV20frXrqZPm4xGY2hCkdwPQYUMAfbTJa0aSp13yw7oaLUrkwaNwEDCm8-x0uY1zRiFSTspsrosdLNYvaX6A-1JGfetDmRELZYYwGB2tlPL8vmzx2DsE9jrLP_X_6lHig"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
              <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-xl font-bold text-white shadow-lg shadow-primary-light/30">
                2
              </div>
              <div className="flex flex-1 flex-col items-center gap-6 md:flex-row">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Find Local Gigs</h3>
                  <p className="text-slate-600">
                    Browse the map for gigs right on or near your campus. Filter
                    by category, pay, or duration. Apply with one click.
                  </p>
                </div>
                <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-xl shadow-md">
                  <Image
                    alt="Student looking at job listings on a laptop in a cafe"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBa0b4opiZHAqaw6pLvI5FBJLMFgfcuw-l5K2b1oTQnYqoooFkswomVRcGmqsPPR17hj8vdJLuwY2AQjLd7GW-QvCA7oajo4saXhopm2UKsErPEAqKgZXfi0fl4RCeRgupr5jfDdHRArcAjWf01DwEdjtDzwuPwfc7cn-4vLi7GHWq--s4mtXZIsZ_GS-KiEnosSGh-D8Zkm4IeklKSsu9ehp98U8jj-8f-EzW7CB6hJpDL8NNkuOxei-U1ZpFdwdFIKewi9Dp8Irs"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
              <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-xl font-bold text-white shadow-lg shadow-primary-light/30">
                3
              </div>
              <div className="flex flex-1 flex-col items-center gap-6 md:flex-row">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">
                    Complete & Get Paid
                  </h3>
                  <p className="text-slate-600">
                    Finish the task, get a review, and receive your payment
                    directly to your account. Fast and secure transactions.
                  </p>
                </div>
                <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-xl shadow-md">
                  <Image
                    alt="Close up of a student receiving a digital payment notification"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAs6mG-prWWSnV0YQCCFyX-RX4IakTHHWLkjobbzvWTMDiQLia_LcreUFaw-zmsda9HysTXA5cDKilbAT8qj_zxbymYInk_uhXLx9OC1AsyTo9UeM5vRmmXwWWQKUwaOAPbjJlrjvC3VqnoRgw07bNHYysjdSqIPGy6jW8kZ0ZA-vrpREkBlkiaWtVNSlyU3Lt1X5S7syFUfxA7Da3lP7dxMvF3CwLb1sVumdpLgcyZVsZhqdQxu3VibRYnSo5Zkgv_2KIT-jB8if4"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posters Track */}
        <div className="sticky top-28 flex flex-col gap-8 rounded-2xl border border-primary-light/10 bg-primary-light/5 p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-light p-3 text-white">
              <Megaphone size={32} />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">For Posters (Employers)</h2>
              <p className="text-sm text-slate-500">
                Get things done by students nearby.
              </p>
            </div>
          </div>

          <div
            className={`flex flex-col gap-8 ${activeTab === "posters" ? "" : "opacity-60"}`}
          >
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary-light font-bold text-primary-light">
                1
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold">Post a Gig</h4>
                <p className="text-sm text-slate-600">
                  Describe what you need, from tutoring to errands.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary-light font-bold text-primary-light">
                2
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold">Choose a Gigster</h4>
                <p className="text-sm text-slate-600">
                  Review profiles and ratings to hire the best fit.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary-light font-bold text-primary-light">
                3
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold">Release Payment</h4>
                <p className="text-sm text-slate-600">
                  Approve the work and pay with peace of mind.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("posters")}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-light py-4 font-bold text-white shadow-lg transition-all hover:bg-primary-light/90"
          >
            Switch to Poster Track <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="mx-auto mt-32 max-w-3xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="flex flex-col overflow-hidden rounded-xl border border-primary-light/10 bg-white"
            >
              <button
                onClick={() => toggleFaq(index + 1)}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-primary-light/5"
              >
                <span className="font-semibold">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-primary-light transition-transform ${
                    openFaq === index + 1 ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === index + 1 && (
                <div className="bg-primary-light/5 px-6 py-4 text-sm text-slate-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative mx-auto mt-32 w-full max-w-7xl overflow-hidden rounded-[2rem] bg-primary-light px-6 py-20 text-center mb-12">
        {/* Decorative circles */}
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <h2 className="text-4xl font-extrabold text-white">
            Ready to Start?
          </h2>
          <p className="mx-auto max-w-xl text-white/80">
            Join thousands of students and locals making things happen in their
            campus community.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/register"
              className="rounded-xl bg-white px-10 py-4 font-bold text-primary-light shadow-xl transition-all hover:scale-105"
            >
              Create Free Account
            </a>
            <a
              href="/gigs"
              className="rounded-xl border border-white/30 bg-primary-light/20 px-10 py-4 font-bold text-white transition-all hover:bg-white/10"
            >
              Browse Gigs First
            </a>
          </div>
        </div>
      </section>
    </section>
  );
}
