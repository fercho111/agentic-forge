import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = body?.password;

    const expectedPassword = process.env.APP_GATE_PASSWORD;
    const cookieName = process.env.APP_GATE_COOKIE;

    if (!expectedPassword || !cookieName) {
      return NextResponse.json(
        {
          ok: false,
          message: "Server gate configuration is missing",
        },
        { status: 500 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        {
          ok: false,
          message: "Password is required",
        },
        { status: 400 }
      );
    }

    if (password !== expectedPassword) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid password",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      message: "Unlocked",
    });

    response.cookies.set({
      name: cookieName,
      value: "allowed",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("unlock route error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to process unlock request",
      },
      { status: 500 }
    );
  }
}