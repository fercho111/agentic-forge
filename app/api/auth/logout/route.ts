import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { expiredSidCookieOptions, hashSessionId, SID_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const sid = request.cookies.get(SID_COOKIE_NAME)?.value;

  if (sid) {
    const sessionHash = hashSessionId(sid);
    const supabase = createAdminClient();

    // Logout invalidates the server-side app session row so future sid reuse is denied.
    await supabase
      .from("app_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("session_hash", sessionHash)
      .is("revoked_at", null);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SID_COOKIE_NAME, "", expiredSidCookieOptions());

  return response;
}
