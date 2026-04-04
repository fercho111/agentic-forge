import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createIdentityClient } from "@/lib/supabase/identity";
import { issueAppSession } from "@/lib/auth/create-app-session";

const loginPayloadSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const parsed = loginPayloadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid email or password payload" },
      { status: 400 }
    );
  }

  const identity = createIdentityClient();
  const { data, error } = await identity.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { ok: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  await issueAppSession({ userId: data.user.id, request, response });

  return response;
}
