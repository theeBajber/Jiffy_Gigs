"use client";
import { signUp } from "@/app/hooks/auth";
import { poppins } from "@/app/ui/fonts";
import { Lock, Mail, User, AlertCircle } from "lucide-react";
import { useActionState } from "react";

export default function Register() {
  const [state, formAction, pending] = useActionState(signUp, null);

  return (
    <section className="w-4/5 max-w-5xl h-[65%] flex items-center text-secondary">
      <div className="w-1/2 h-full bg-secondary/20 backdrop-blur-lg rounded-4xl flex items-center justify-center">
        <img src="/will.png" className="scale-x-[-1]" />
      </div>
      <div className="rounded-r-3xl border border-primary-dark border-l-0 w-1/2 h-4/5 flex items-center justify-center p-8">
        <form
          className="w-full flex flex-col items-center gap-8"
          action={formAction}
        >
          <h1
            className={`text-3xl uppercase font-bold ${poppins.className} text-neutral-light`}
          >
            Sign Up
          </h1>

          {/* Error Display */}
          {state?.error && (
            <div className="w-3/4 bg-red-500/20 border border-red-500 rounded-lg p-3 flex items-center gap-2 text-red-200 text-sm">
              <AlertCircle className="size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="relative w-3/4 border-b p-1 flex items-center justify-between">
            <input
              className="w-[90%] outline-none"
              placeholder="Full Name"
              type="text"
              name="name"
              required
            />
            <User className="" />
          </div>
          <div className="relative w-3/4 border-b p-1 flex items-center justify-between">
            <input
              className="w-[90%] outline-none"
              placeholder="School Email"
              type="email"
              name="email"
              required
            />
            <Mail className="" />
          </div>
          <div className="relative w-3/4 border-b p-1 flex items-center justify-between">
            <input
              className="w-4/5 outline-none"
              type="password"
              placeholder="Password"
              name="password"
              required
              minLength={6}
            />
            <Lock className="" />
          </div>
          <div className="relative w-3/4 border-b p-1 flex items-center justify-between">
            <input
              className="w-4/5 outline-none"
              type="password"
              placeholder="Confirm Password"
              name="repeat"
              required
            />
            <Lock className="" />
          </div>
          <button
            className="w-[65%] h-10 rounded-3xl bg-accent text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={pending}
          >
            {pending ? "Signing Up..." : "Sign Up"}
          </button>
          <div className="flex items-center gap-2 text-secondary/80">
            Already have an account?{" "}
            <a className="text-neutral-light/80 underline" href="/login">
              Log In
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}
