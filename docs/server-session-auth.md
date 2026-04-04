# Server Session Auth Architecture

This project uses **Supabase Auth only for identity** (email/password + OAuth) and a separate **opaque app session** (`sid`) for browser authentication.

## Flow overview

1. User authenticates with Supabase identity endpoints.
2. Server creates an opaque random `sid`.
3. Server stores only `sha256(sid)` in `public.app_sessions`.
4. Browser receives only `sid` cookie (`HttpOnly`, `SameSite=Lax`, `Secure` in production).
5. Protected pages/routes validate `sid` server-side against `app_sessions`.

## Why this design

- The `sid` is opaque so clients cannot derive user identity or privileges from cookie contents.
- Only the hash is stored in DB so DB compromise does not leak reusable raw session IDs.
- Logout revokes server-side session row (`revoked_at`) for immediate invalidation.
- Idle timeout is enforced by checking `last_seen_at` age and refreshing it on valid requests.

## Session policy

- Absolute lifetime: `SESSION_ABSOLUTE_DAYS` in `lib/auth/session.ts` (default `7`).
- Idle timeout: `SESSION_IDLE_MINUTES` in `lib/auth/session.ts` (default `30`).

## Files to customize

- `lib/auth/session.ts` → cookie flags + timeout/lifetime constants.
- `lib/auth/get-app-session.ts` → validation and idle timeout logic.
- `proxy.ts` → lightweight protected-path presence checks for `sid`.
- `app/auth/callback/route.ts` → OAuth callback that issues `sid`.
- `app/api/auth/login/route.ts` and `app/api/auth/logout/route.ts` → login/logout session lifecycle.

## Required env vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; required for `app_sessions` CRUD)
