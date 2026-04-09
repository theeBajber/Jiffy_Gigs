"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Shield, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { poppins } from "@/app/ui/fonts";
import { enrollMFA } from "@/app/hooks/auth";
import { useActionState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MFAEnrollPage() {
  const [step, setStep] = useState<"loading" | "qr" | "success">("loading");
  const [factorId, setFactorId] = useState("");
  const [qrUri, setQrUri] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState("");
  const router = useRouter();
  
  const [state, formAction, pending] = useActionState(enrollMFA, null);

  const startEnrollment = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/mfa/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const payload = await response.json();

      if (payload?.bypass) {
        router.replace("/dashboard");
        return;
      }

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to start MFA setup");
      }

      setFactorId(payload.factorId);
      setQrUri(payload.qrUri);
      setSecret(payload.secret);
      setStep("qr");
    } catch (err: unknown) {
      setLocalError(
        err instanceof Error
          ? err.message
          : "Failed to start MFA setup. Please refresh.",
      );
      setStep("loading");
    }
  }, [router]);

  useEffect(() => {
    startEnrollment();
  }, [startEnrollment]);

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle server action result
  useEffect(() => {
    if (state?.error) {
      setLocalError(state.error);
      setCode("");
    }
    // Success case: server action redirects to /dashboard
  }, [state]);

  const handleSubmit = () => {
    if (code.length !== 6) return;
    setLocalError("");
    // Form will submit via action
  };

  if (step === "loading") {
    return (
      <section className="w-4/5 max-w-5xl h-[65%] flex items-center justify-center text-secondary">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-10 animate-spin text-accent" />
          <p className="text-neutral-light">Setting up MFA...</p>
          {localError && <p className="text-red-400 text-sm">{localError}</p>}
        </div>
      </section>
    );
  }

  if (step === "qr") {
    return (
      <section className="w-4/5 max-w-5xl h-[65%] flex items-center text-secondary">
        <div className="rounded-l-3xl border border-primary-dark border-r-0 w-1/2 h-4/5 flex items-center justify-center p-8 bg-primary-dark/5 overflow-y-auto">
          <div className="w-full flex flex-col items-center gap-6">
            <Shield className="size-12 text-accent" />
            <h1 className={`text-2xl font-bold ${poppins.className} text-neutral-light text-center`}>
              Set Up Two-Factor Authentication
            </h1>

            <p className="text-secondary/80 text-center text-sm max-w-[90%]">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>

            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG value={qrUri} size={180} />
            </div>

            <div className="w-full space-y-2">
              <p className="text-secondary/60 text-xs text-center">Can&apos;t scan? Use this code:</p>
              <button
                onClick={copySecret}
                className="w-full p-3 bg-primary-dark/30 border border-secondary/20 rounded-lg flex items-center justify-between text-neutral-light hover:bg-primary-dark/50 transition-colors"
              >
                <code className="text-xs tracking-wider">{secret}</code>
                {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4 text-secondary" />}
              </button>
            </div>

            <div className="w-full h-px bg-secondary/20"></div>

            <form action={formAction} className="w-full space-y-3">
              <input type="hidden" name="factorId" value={factorId} />
              <input type="hidden" name="code" value={code} />
              
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code from app"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ""));
                  setLocalError("");
                }}
                className="w-full p-4 text-center text-2xl font-bold bg-secondary text-primary-dark rounded-xl border-2 border-transparent focus:border-accent focus:outline-none"
              />
              
              {(localError || state?.error) && (
                <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="size-4" />
                  {localError || state?.error}
                </div>
              )}

              <button
                type="submit"
                disabled={pending || code.length !== 6}
                onClick={handleSubmit}
                className="w-full py-3 bg-accent text-primary-dark font-semibold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : "Verify & Enable"}
              </button>
            </form>
          </div>
        </div>

        <div className="w-1/2 h-full bg-secondary/20 backdrop-blur-lg rounded-4xl flex items-center justify-center overflow-hidden">
          <Image
            src="/will.png"
            alt="MFA setup"
            width={800}
            height={800}
            className="object-cover"
          />
        </div>
      </section>
    );
  }

  return null;
}