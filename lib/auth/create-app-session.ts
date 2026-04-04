import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateSessionId,
  getRequestIp,
  getSessionExpiry,
  hashSessionId,
  sidCookieOptions,
  SID_COOKIE_NAME,
} from "@/lib/auth/session";

export async function issueAppSession(params: {
  userId: string;
  request: NextRequest;
  response: NextResponse;
}) {
  const sid = generateSessionId();
  const sessionHash = hashSessionId(sid);
  const now = new Date();
  const expiresAt = getSessionExpiry(now);

  const supabase = createAdminClient();

  const { error } = await supabase.from("app_sessions").insert({
    user_id: params.userId,
    session_hash: sessionHash,
    created_at: now.toISOString(),
    last_seen_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    user_agent: params.request.headers.get("user-agent"),
    ip: getRequestIp(params.request.headers.get("x-forwarded-for")),
  });

  if (error) {
    throw new Error(`Failed to create app session: ${error.message}`);
  }

  // The browser only gets an opaque sid cookie; raw sid never goes to the database.
  params.response.cookies.set(SID_COOKIE_NAME, sid, sidCookieOptions(expiresAt));
}
