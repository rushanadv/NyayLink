import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  // Support 1: PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    } else {
      console.error("[Auth Confirm Error: Code Exchange]", error.message);
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Support 2: Token hash OTP verification
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirect(next);
    } else {
      console.error("[Auth Confirm Error: Verify OTP]", error.message);
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Fallback error if neither parameter was provided
  redirect(`/auth/error?error=${encodeURIComponent("No valid confirmation token or code found in URL.")}`);
}

