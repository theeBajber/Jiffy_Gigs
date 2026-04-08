"use server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function signIn(
  prevState: { error: string } | null,
  formData: FormData,
) {
  const supabase = await createServerSupabaseClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  if (!email || !password) {
    return { error: "Please enter both email and password" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Return user-friendly error messages
    if (error.message.includes("Invalid login")) {
      return { error: "Invalid email or password. Please try again." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please verify your email before logging in." };
    }
    return { error: error.message };
  }

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

  if (!/\.(edu|ac\.ke)$/i.test(normalizedEmail)) {
    return { error: "Use a valid campus email (.edu or .ac.ke)" };
  }

  if (password !== repeat) return { error: "Passwords do not match!" };

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
  if (error) return { error: error.message };

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

  if (!/\.(edu|ac\.ke)$/i.test(email)) {
    return { error: "Use your campus email (.edu or .ac.ke)" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "Password reset link sent. Check your inbox and spam folder.",
  };
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
