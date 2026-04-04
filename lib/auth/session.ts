import crypto from "crypto";

export const SID_COOKIE_NAME = "sid";
export const SESSION_ABSOLUTE_DAYS = 7;
export const SESSION_IDLE_MINUTES = 30;

export function generateSessionId() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashSessionId(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function getSessionExpiry(from = new Date()) {
  const expiresAt = new Date(from);
  expiresAt.setDate(expiresAt.getDate() + SESSION_ABSOLUTE_DAYS);
  return expiresAt;
}

export function isIdleTimedOut(lastSeenAt: Date, now = new Date()) {
  const idleMs = SESSION_IDLE_MINUTES * 60 * 1000;
  return now.getTime() - lastSeenAt.getTime() > idleMs;
}

export function sidCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  };
}

export function expiredSidCookieOptions() {
  return sidCookieOptions(new Date(0));
}

export function getRequestIp(forwardedForHeader: string | null) {
  if (!forwardedForHeader) return null;
  return forwardedForHeader.split(",")[0]?.trim() || null;
}
