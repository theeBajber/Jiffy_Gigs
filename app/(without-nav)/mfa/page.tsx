"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resendMFA, verifyMFA } from "@/app/hooks/auth";
import { Shield, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { poppins } from "@/app/ui/fonts";
import { useActionState } from "react";
import Image from "next/image";

export default function MFAPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [factorId] = useState(() =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("mfaFactorId") || ""
      : "",
  );
  const [challengeId] = useState(() =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("mfaChallengeId") || ""
      : "",
  );
  const [cooldown, setCooldown] = useState(() =>
    factorId === "email" ? 60 : 0,
  );
  const [resendState, setResendState] = useState<{
    error?: string;
    success?: string;
    cooldownSeconds?: number;
  } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const [resendPending, startResendTransition] = useTransition();

  const [state, formAction, pending] = useActionState(verifyMFA, null);

  useEffect(() => {
    if (!factorId || !challengeId) {
      router.push("/login");
      return;
    }

    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [router, factorId, challengeId]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [cooldown]);

  useEffect(() => {
    const fullCode = code.join("");
    if (fullCode.length === 6 && factorId && challengeId && !pending) {
      const form = document.getElementById("mfa-form") as HTMLFormElement;
      form?.requestSubmit();
    }
  }, [code, factorId, challengeId, pending]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData.length === 6) {
      setCode(pastedData.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem("mfaFactorId");
    sessionStorage.removeItem("mfaChallengeId");
    router.push("/login");
  };

  const handleResend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    startResendTransition(async () => {
      const result = await resendMFA(null, formData);
      setResendState(result);
      if (result?.cooldownSeconds) {
        setCooldown(result.cooldownSeconds);
      }
    });
  };

  return (
    <section className="w-4/5 max-w-5xl h-[65%] flex items-center text-secondary">
      <div className="rounded-l-3xl border border-primary-dark border-r-0 w-1/2 h-4/5 flex items-center justify-center p-8 bg-primary-dark/5">
        <div className="w-full flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <KeyRound className="size-8 text-accent" />
            <h1
              className={`text-3xl uppercase font-bold ${poppins.className} text-neutral-light`}
            >
              Verify Identity
            </h1>
          </div>

          <p className="text-secondary/80 text-center max-w-[80%] text-sm">
            Enter the 6-digit verification code sent to your email
          </p>

          {state?.error && (
            <div className="w-3/4 bg-red-500/15 border border-red-500/50 rounded-lg p-3 flex items-start gap-2 text-red-200 text-sm animate-in fade-in slide-in-from-top-2">
              <Shield className="size-4 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {resendState?.error && (
            <div className="w-3/4 bg-red-500/15 border border-red-500/50 rounded-lg p-3 flex items-start gap-2 text-red-200 text-sm animate-in fade-in slide-in-from-top-2">
              <Shield className="size-4 shrink-0 mt-0.5" />
              <span>{resendState.error}</span>
            </div>
          )}

          {resendState?.success && (
            <div className="w-3/4 bg-emerald-500/15 border border-emerald-500/50 rounded-lg p-3 flex items-start gap-2 text-emerald-100 text-sm animate-in fade-in slide-in-from-top-2">
              <Shield className="size-4 shrink-0 mt-0.5" />
              <span>{resendState.success}</span>
            </div>
          )}

          <form
            id="mfa-form"
            action={formAction}
            className="w-full flex flex-col items-center gap-6"
          >
            <input type="hidden" name="factorId" value={factorId} />
            <input type="hidden" name="challengeId" value={challengeId} />
            <input type="hidden" name="code" value={code.join("")} />

            <div className="flex justify-center gap-2 md:gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={pending || !factorId}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none disabled:opacity-50 bg-secondary text-primary-dark border-primary-dark focus:border-accent focus:shadow-[0_0_0_3px_rgba(43,196,138,0.2)] data-[filled=true]:border-accent"
                  data-filled={digit ? "true" : "false"}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={pending || code.join("").length !== 6 || !factorId}
              className="w-[65%] h-11 rounded-3xl bg-accent text-primary-dark font-semibold hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify & Continue</span>
              )}
            </button>
          </form>

          {factorId === "email" && (
            <form
              onSubmit={handleResend}
              className="w-full flex justify-center -mt-2"
            >
              <input type="hidden" name="factorId" value={factorId} />
              <input type="hidden" name="challengeId" value={challengeId} />
              <button
                type="submit"
                disabled={
                  pending || resendPending || cooldown > 0 || !challengeId
                }
                className="text-sm text-accent hover:text-accent/80 disabled:text-secondary/60 disabled:cursor-not-allowed transition-colors"
              >
                {resendPending
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend code in ${cooldown}s`
                    : "Resend code"}
              </button>
            </form>
          )}

          <div className="w-3/4 flex flex-col items-center gap-4 pt-2">
            <div className="h-px w-full bg-secondary/20"></div>
            <button
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-sm text-secondary/80 hover:text-neutral-light transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>

      <div className="w-1/2 h-full bg-secondary/20 backdrop-blur-lg rounded-4xl flex items-center justify-center overflow-hidden">
        <Image
          src="/will.png"
          alt="MFA illustration"
          width={315}
          height={500}
          className="object-cover"
        />
      </div>
    </section>
  );
}

