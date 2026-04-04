import { NextRequest, NextResponse } from "next/server";
import { requireAppSessionForApi } from "@/lib/auth/require-app-session";
import { analyzeIdeaSchema } from "@/lib/analyze/schema";
import { sanitizeIdeaForPrompt } from "@/lib/analyze/sanitize";
import { localGraphRuntime } from "@/lib/runtime/llm-runtime";
import { runSpecGraph } from "@/lib/graph/workflow";
import { toMarkdown } from "@/lib/tools/exportTool";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAppSessionForApi(request);

    if ("response" in auth) {
      return auth.response;
    }

    const userId = auth.session.user_id;

    const rateLimit = await localGraphRuntime.tools.checkAnalyzeRateLimit({
      userId,
      route: "analyze",
      limit: 5,
      windowSeconds: 60,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: "Rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": rateLimit.reset_at,
          },
        }
      );
    }

    const body = await request.json();

    const parsed = analyzeIdeaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 }
      );
    }

    const safeIdea = sanitizeIdeaForPrompt(parsed.data.idea);

    const result = await runSpecGraph(localGraphRuntime, safeIdea);

    const markdown = toMarkdown({
      rawIdea: result.rawIdea,
      projectTitle: result.projectTitle,
      problemSummary: result.problemSummary,
      targetUsers: result.targetUsers,
      functionalRequirements: result.functionalRequirements,
      userStories: result.userStories,
      technicalProposal: result.technicalProposal,
      dataEntities: result.dataEntities,
      openQuestions: result.openQuestions,
      reviewNotes: result.reviewNotes,
    });

    return NextResponse.json(
      {
        ok: true,
        projectId: result.projectId,
        spec: result,
        markdown,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": rateLimit.reset_at,
        },
      }
    );
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