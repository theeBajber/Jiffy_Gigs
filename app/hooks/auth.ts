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
  const password = formData.get("password") as string;
  const repeat = formData.get("repeat") as string;
  if (password !== repeat) return { error: "Passwords do not match!" };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      },
    },
  });
  if (error) return { error: error.message };
  redirect("/login?message=Check your email to confirm your account");
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
