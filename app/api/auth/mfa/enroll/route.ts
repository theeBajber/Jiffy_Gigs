import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Authenticator App",
  });

  if (error || !data?.totp?.uri || !data?.totp?.secret) {
    const message = error?.message || "Failed to initialize MFA enrollment";

    if (message.toLowerCase().includes("mfa enroll is disabled for totp")) {
      return NextResponse.json(
        {
          error:
            "MFA enrollment is disabled for TOTP in Supabase. Enable TOTP in Auth settings.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }

  return NextResponse.json({
    factorId: data.id,
    qrUri: data.totp.uri,
    secret: data.totp.secret,
  });
}
