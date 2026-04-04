import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getAppSessionBySid, getAppSessionFromCookies } from "@/lib/auth/get-app-session";
import { expiredSidCookieOptions, SID_COOKIE_NAME } from "@/lib/auth/session";

export async function requireAppSession() {
  const session = await getAppSessionFromCookies();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireAppSessionForPage() {
  const session = await getAppSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAppSessionForApi(request: NextRequest) {
  const sid = request.cookies.get(SID_COOKIE_NAME)?.value;
  const session = await getAppSessionBySid(sid);

  if (!session) {
    const response = NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );

    // Clear invalid/expired opaque session cookie when the server-side lookup fails.
    response.cookies.set(SID_COOKIE_NAME, "", expiredSidCookieOptions());

    return { response };
  }

  return { session };
}
