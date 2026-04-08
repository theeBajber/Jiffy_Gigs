"use client";

import { useActionState } from "react";
import { sendPasswordReset } from "@/app/hooks/auth";
import { poppins } from "@/app/ui/fonts";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(sendPasswordReset, null);

  return (
    <section className="w-11/12 max-w-xl rounded-3xl border border-primary-dark/20 bg-white/10 p-8 text-secondary backdrop-blur-sm">
      <h1 className={`text-3xl font-bold text-neutral-light ${poppins.className}`}>
        Reset Password
      </h1>
      <p className="mt-2 text-sm text-secondary/90">
        Enter your campus email and we’ll send you a reset link.
      </p>

      {state?.error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-400/50 bg-red-500/15 p-3 text-sm text-red-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-green-400/40 bg-green-500/15 p-3 text-sm text-green-100">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.success}</span>
        </div>
      )}

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div className="relative border-b border-secondary/40 p-2 flex items-center justify-between">
          <input
            name="email"
            type="email"
            required
            placeholder="your.name@campus.ac.ke"
            className="w-[90%] bg-transparent outline-none placeholder:text-secondary/60"
            disabled={pending}
          />
          <Mail className="h-5 w-5 text-secondary/70" />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 h-11 rounded-3xl bg-accent font-semibold text-primary-dark transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </section>
  );
}
