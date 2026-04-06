"use client";
import { signIn } from "@/app/hooks/auth";
import { poppins } from "@/app/ui/fonts";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { useActionState } from "react";

export default function Login() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <section className="w-4/5 max-w-5xl h-[65%] flex items-center text-secondary">
      <div className="rounded-l-3xl border border-primary-dark border-r-0 w-1/2 h-4/5 flex items-center justify-center p-8 bg-primary-dark/5">
        <form
          className="w-full flex flex-col items-center gap-6"
          action={formAction}
        >
          <h1
            className={`text-3xl uppercase font-bold ${poppins.className} text-neutral-light`}
          >
            Log In
          </h1>

          {/* Error Display */}
          {state?.error && (
            <div className="w-3/4 bg-red-500/15 border border-red-500/50 rounded-lg p-3 flex items-start gap-2 text-red-200 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="w-3/4 space-y-5">
            <div className="relative border-b border-secondary/30 p-2 flex items-center justify-between focus-within:border-accent transition-colors">
              <input
                type="email"
                className="w-[90%] outline-none bg-transparent placeholder:text-secondary/50"
                placeholder="Email"
                name="email"
                required
                disabled={pending}
              />
              <Mail className="size-5 text-secondary/60" />
            </div>

            <div className="relative border-b border-secondary/30 p-2 flex items-center justify-between focus-within:border-accent transition-colors">
              <input
                type="password"
                className="w-[90%] outline-none bg-transparent placeholder:text-secondary/50"
                placeholder="Password"
                name="password"
                required
                minLength={6}
                disabled={pending}
              />
              <Lock className="size-5 text-secondary/60" />
            </div>
          </div>

          <button
            className="w-[65%] h-11 rounded-3xl bg-accent text-primary-dark font-semibold hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
            type="submit"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>

          <div className="w-3/4 text-sm flex items-center justify-between text-secondary/80">
            <a
              href="/register"
              className="hover:text-neutral-light underline underline-offset-2 transition-colors"
            >
              New here?
            </a>
            <a
              href="/forgot-password"
              className="hover:text-neutral-light underline underline-offset-2 transition-colors"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </div>

      <div className="w-1/2 h-full bg-secondary/20 backdrop-blur-lg rounded-4xl flex items-center justify-center overflow-hidden">
        <img
          src="/will.png"
          alt="Login illustration"
          className="object-cover"
        />
      </div>
    </section>
  );
}
