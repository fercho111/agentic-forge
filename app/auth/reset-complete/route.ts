// app/auth/reset-complete/route.ts
import { NextResponse } from "next/server";

const RESET_FLOW_COOKIE = "reset_password_flow";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  response.cookies.set({
    name: RESET_FLOW_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}