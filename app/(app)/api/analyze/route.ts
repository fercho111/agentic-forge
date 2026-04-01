import { NextRequest, NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/lib/agents/orchestrator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idea = body?.idea;

    if (!idea || typeof idea !== "string" || !idea.trim()) {
      return NextResponse.json(
        { ok: false, message: "Idea is required" },
        { status: 400 }
      );
    }

    const result = await runAnalysisPipeline(idea);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("analyze route error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to analyze idea",
      },
      { status: 500 }
    );
  }
}