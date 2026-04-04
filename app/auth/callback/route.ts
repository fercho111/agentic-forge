import { NextRequest, NextResponse } from "next/server";
import { createIdentityClient } from "@/lib/supabase/identity";
import { issueAppSession } from "@/lib/auth/create-app-session";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const identity = createIdentityClient();
  const { data, error } = await identity.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  await issueAppSession({ userId: data.user.id, request, response });

  return response;
}
