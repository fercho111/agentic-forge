import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/require-app-session", () => ({
  requireAppSessionForApi: vi.fn(),
}));

vi.mock("@/lib/runtime/llm-runtime", () => ({
  localGraphRuntime: {
    tools: {
      checkAnalyzeRateLimit: vi.fn(),
    },
  },
}));

vi.mock("@/lib/graph/workflow", () => ({
  runSpecGraph: vi.fn(),
}));

vi.mock("@/lib/tools/exportTool", () => ({
  toMarkdown: vi.fn(),
}));

describe("POST /api/analyze", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns 401 when app session auth fails", async () => {
    const { requireAppSessionForApi } = await import(
      "@/lib/auth/require-app-session"
    );

    vi.mocked(requireAppSessionForApi).mockResolvedValue({
      response: new Response(
        JSON.stringify({ ok: false, message: "Unauthorized" }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        }
      ),
    } as Awaited<ReturnType<typeof requireAppSessionForApi>>);

    const { POST } = await import("@/app/(app)/api/analyze/route");

    const request = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      body: JSON.stringify({ idea: "A valid looking idea that should not matter here." }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid input after successful auth and rate-limit pass", async () => {
    const { requireAppSessionForApi } = await import(
      "@/lib/auth/require-app-session"
    );
    const { localGraphRuntime } = await import("@/lib/runtime/llm-runtime");

    vi.mocked(requireAppSessionForApi).mockResolvedValue({
      session: {
        user_id: "test-user-id",
      },
    } as Awaited<ReturnType<typeof requireAppSessionForApi>>);

    vi.mocked(localGraphRuntime.tools.checkAnalyzeRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 4,
      reset_at: new Date().toISOString(),
      current_count: 1,
    });

    const { POST } = await import("@/app/(app)/api/analyze/route");

    const request = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      body: JSON.stringify({ idea: "short idea" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});