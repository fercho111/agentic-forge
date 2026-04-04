import "server-only";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  hashSessionId,
  isIdleTimedOut,
  SID_COOKIE_NAME,
} from "@/lib/auth/session";

export type AppSession = {
  id: string;
  user_id: string;
  session_hash: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  revoked_at: string | null;
  user_agent: string | null;
  ip: string | null;
};

function isSessionValid(session: AppSession, now = new Date()) {
  if (session.revoked_at) return false;
  if (new Date(session.expires_at).getTime() <= now.getTime()) return false;
  if (isIdleTimedOut(new Date(session.last_seen_at), now)) return false;
  return true;
}

export async function getAppSessionBySid(sid: string | null | undefined) {
  if (!sid) return null;

  const supabase = createAdminClient();
  const sessionHash = hashSessionId(sid);

  const { data, error } = await supabase
    .from("app_sessions")
    .select(
      "id,user_id,session_hash,created_at,last_seen_at,expires_at,revoked_at,user_agent,ip"
    )
    .eq("session_hash", sessionHash)
    .maybeSingle<AppSession>();

  if (error || !data) {
    return null;
  }

  if (!isSessionValid(data)) {
    return null;
  }

  const nowIso = new Date().toISOString();
  await supabase.from("app_sessions").update({ last_seen_at: nowIso }).eq("id", data.id);

  return { ...data, last_seen_at: nowIso };
}

export async function getAppSessionFromCookies() {
  const cookieStore = await cookies();
  const sid = cookieStore.get(SID_COOKIE_NAME)?.value;
  return getAppSessionBySid(sid);
}

export async function getAppUserFromSession() {
  const session = await getAppSessionFromCookies();
  if (!session) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(session.user_id);
  if (error || !data.user) return null;

  return {
    session,
    user: data.user,
  };
}
