import { NextRequest, NextResponse } from "next/server";

function isPublicPath(pathname: string) {
  return (
    pathname === "/unlock" ||
    pathname === "/api/unlock" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public/")
  );
}

function isProtectedPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/runs" ||
    pathname.startsWith("/api/analyze") ||
    pathname.startsWith("/api/runs")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const cookieName = process.env.APP_GATE_COOKIE;

  if (!cookieName) {
    return NextResponse.next();
  }

  const gateCookie = request.cookies.get(cookieName)?.value;
  const isUnlocked = gateCookie === "allowed";

  if (isUnlocked) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const unlockUrl = new URL("/unlock", request.url);
  return NextResponse.redirect(unlockUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};