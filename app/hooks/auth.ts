"use server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Extend return type to include MFA requirements
type AuthResult = { 
  error: string;
  mfaRequired?: boolean;
  factorId?: string;
  challengeId?: string;
} | null;

type MfaResendResult = {
  error?: string;
  success?: string;
  cooldownSeconds?: number;
} | null;

const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);
const shouldBypassEmailInDev =
  process.env.NODE_ENV === "development" &&
  process.env.DISABLE_EMAIL_RATE_LIMIT_IN_DEV !== "false";
const mfaMethod = process.env.MFA_METHOD || "email";
const MFA_COOKIE = "mfa_email_challenge";
const MFA_CODE_EXPIRY_SECONDS = 10 * 60;
const MFA_RESEND_COOLDOWN_SECONDS = 60;

type EmailMfaChallenge = {
  challengeId: string;
  email: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
};

const hashOtp = (code: string) =>
  crypto
    .createHash("sha256")
    .update(`${code}:${process.env.SUPABASE_SERVICE_ROLE_KEY || "dev"}`)
    .digest("hex");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

async function sendMfaCodeByEmail(email: string, code: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || "no-reply@jiffygigs.local";

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[DEV MFA EMAIL] ${email} -> code: ${code}`);
      return;
    }
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your Jiffy Gigs verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height:1.5;">
        <h2>Jiffy Gigs verification code</h2>
        <p>Your verification code is:</p>
        <p style="font-size:28px; font-weight:700; letter-spacing:6px;">${code}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}

async function createEmailMfaChallenge(email: string) {
  const code = generateOtp();
  const challengeId = crypto.randomUUID();
  const payload: EmailMfaChallenge = {
    challengeId,
    email,
    codeHash: hashOtp(code),
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
    lastSentAt: Date.now(),
  };

  await persistEmailMfaChallenge(payload);
  await sendMfaCodeByEmail(email, code);
  return challengeId;
}

async function persistEmailMfaChallenge(payload: EmailMfaChallenge) {
  const cookieStore = await cookies();
  cookieStore.set(MFA_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MFA_CODE_EXPIRY_SECONDS,
  });
}

async function readEmailMfaChallenge() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(MFA_COOKIE)?.value;

  if (!raw) {
    return { cookieStore, challenge: null as EmailMfaChallenge | null };
  }

  try {
    return {
      cookieStore,
      challenge: JSON.parse(raw) as EmailMfaChallenge,
    };
  } catch {
    cookieStore.delete(MFA_COOKIE);
    return { cookieStore, challenge: null as EmailMfaChallenge | null };
  }
}

export async function signIn(
  prevState: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "Invalid email or password. Please try again." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please verify your email before logging in." };
    }
    return { error: error.message };
  }

  if (mfaMethod === "email") {
    const challengeId = await createEmailMfaChallenge(email.trim().toLowerCase());
    return {
      error: "",
      mfaRequired: true,
      factorId: "email",
      challengeId,
    };
  }

  // MFA Check - Mandatory for all users
  const { data: factors, error: mfaError } = await supabase.auth.mfa.listFactors();
  
  if (mfaError) {
    console.error("MFA check failed:", mfaError);
    return { error: "Security verification failed. Please try again." };
  }

  // No MFA enrolled yet - first time user needs setup
  if (!factors?.totp || factors.totp.length === 0) {
    return {
      error: "", // Empty error, but signal MFA required with enrollment
      mfaRequired: true,
      factorId: "enroll",
    };
  }

  // MFA enrolled - create challenge for verification
  const factor = factors.totp[0];
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId: factor.id,
  });

  if (challengeError) {
    return { error: "Failed to create security challenge. Please try again." };
  }

  return {
    error: "",
    mfaRequired: true,
    factorId: factor.id,
    challengeId: challenge.id,
  };
}

export async function verifyMFA(
  prevState: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  
  const code = formData.get("code") as string;
  const factorId = formData.get("factorId") as string;
  const challengeId = formData.get("challengeId") as string;

  if (!code || code.length !== 6) {
    return { error: "Please enter a valid 6-digit code" };
  }

  if (!factorId || !challengeId) {
    return { error: "Security session expired. Please log in again." };
  }

  if (factorId === "email") {
    const { cookieStore, challenge } = await readEmailMfaChallenge();

    if (!challenge) {
      return { error: "MFA session expired. Please log in again." };
    }

    if (challenge.challengeId !== challengeId) {
      cookieStore.delete(MFA_COOKIE);
      return { error: "MFA session mismatch. Please log in again." };
    }

    if (Date.now() > challenge.expiresAt) {
      cookieStore.delete(MFA_COOKIE);
      return { error: "Code expired. Please log in again." };
    }

    if (challenge.attempts >= 5) {
      cookieStore.delete(MFA_COOKIE);
      return { error: "Too many attempts. Please log in again." };
    }

    const isValid = challenge.codeHash === hashOtp(code);

    if (!isValid) {
      challenge.attempts += 1;
      await persistEmailMfaChallenge(challenge);
      return { error: "Invalid verification code. Please try again." };
    }

    cookieStore.delete(MFA_COOKIE);
    redirect("/dashboard");
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code,
  });

  if (error) {
    return { error: "Invalid verification code. Please try again." };
  }

  // Success - redirect to dashboard
  redirect("/dashboard");
}

export async function resendMFA(
  prevState: MfaResendResult,
  formData: FormData,
): Promise<MfaResendResult> {
  const factorId = formData.get("factorId") as string;
  const challengeId = formData.get("challengeId") as string;

  if (factorId !== "email" || !challengeId) {
    return { error: "Security session expired. Please log in again." };
  }

  const { challenge } = await readEmailMfaChallenge();

  if (!challenge) {
    return { error: "MFA session expired. Please log in again." };
  }

  if (challenge.challengeId !== challengeId) {
    return { error: "MFA session mismatch. Please log in again." };
  }

  if (Date.now() > challenge.expiresAt) {
    return { error: "Code expired. Please log in again." };
  }

  const cooldownMs = MFA_RESEND_COOLDOWN_SECONDS * 1000;
  const timeSinceLastSend = Date.now() - challenge.lastSentAt;
  if (timeSinceLastSend < cooldownMs) {
    const waitSeconds = Math.ceil((cooldownMs - timeSinceLastSend) / 1000);
    return {
      error: `Please wait ${waitSeconds}s before requesting another code.`,
      cooldownSeconds: waitSeconds,
    };
  }

  const code = generateOtp();
  challenge.codeHash = hashOtp(code);
  challenge.lastSentAt = Date.now();
  challenge.expiresAt = Date.now() + MFA_CODE_EXPIRY_SECONDS * 1000;
  challenge.attempts = 0;

  await persistEmailMfaChallenge(challenge);
  await sendMfaCodeByEmail(challenge.email, code);

  return {
    success: "A new verification code has been sent.",
    cooldownSeconds: MFA_RESEND_COOLDOWN_SECONDS,
  };
}

export async function enrollMFA(
  prevState: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  
  const code = formData.get("code") as string;
  const factorId = formData.get("factorId") as string;

  if (!code || code.length !== 6) {
    return { error: "Please enter a valid 6-digit code" };
  }

  if (!factorId) {
    return { error: "Setup session expired. Please refresh and try again." };
  }

  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId,
    });

  if (challengeError) {
    return { error: "Failed to verify MFA setup. Please try again." };
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });

  if (error) {
    return { error: "Invalid code. Please check your authenticator app and try again." };
  }

  // MFA enrolled successfully
  redirect("/dashboard");
}

export async function signUp(
  prevState: { error: string } | null,
  formData: FormData,
) {
  const supabase = await createServerSupabaseClient();
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const institution = (formData.get("institution") as string) || "";
  const password = formData.get("password") as string;
  const repeat = formData.get("repeat") as string;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !name?.trim() || !password || !repeat) {
    return { error: "Please fill in all required fields" };
  }

  if (!isValidEmail(normalizedEmail)) {
    return { error: "Please enter a valid email address" };
  }

  if (password !== repeat) return { error: "Passwords do not match!" };

  let bypassAttempted = false;
  if (shouldBypassEmailInDev) {
    bypassAttempted = true;
    try {
      const adminSupabase = createAdminSupabaseClient();
      const { data, error } = await adminSupabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          name: name.trim(),
          institution,
          campus_email: normalizedEmail,
          campus_verified: false,
        },
      });

      if (error) return { error: error.message };

      if (data.user?.id) {
        await adminSupabase.from("users").upsert({
          id: data.user.id,
          name: name.trim(),
          institution: institution || null,
          campus_email: normalizedEmail,
          campus_verified: true,
        });
      }

      redirect(
        "/login?message=Development mode: account created without verification email",
      );
    } catch (error: unknown) {
      console.warn(
        "Dev signup bypass failed; falling back to standard sign up flow:",
        error,
      );
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
      data: {
        name: name.trim(),
        institution,
        campus_email: normalizedEmail,
        campus_verified: false,
      },
    },
  });
  if (error) {
    const fallbackHint = bypassAttempted
      ? " (fallback used after dev bypass failure)"
      : "";
    return { error: `${error.message}${fallbackHint}` };
  }

  await supabase
    .from("users")
    .update({
      name: name.trim(),
      institution: institution || null,
      campus_email: normalizedEmail,
      campus_verified: false,
    })
    .eq("id", data.user?.id || "");

  redirect("/login?message=Check your email to confirm your account");
}

export async function sendPasswordReset(
  prevState: { error?: string; success?: string } | null,
  formData: FormData,
) {
  const supabase = await createServerSupabaseClient();
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) {
    return { error: "Email is required" };
  }

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address" };
  }

  if (shouldBypassEmailInDev) {
    return {
      success:
        "Development mode: reset email skipped to avoid rate limits. Use a test account password flow locally.",
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "Password reset link sent. Check your inbox and spam folder.",
  };
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}