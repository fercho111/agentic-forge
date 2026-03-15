import { NextResponse } from "next/server";
import {
  createProject,
  logAgentRunEnd,
  logAgentRunStart,
} from "@/lib/tools/persistenceTool";

export async function GET() {
  try {
    const project = await createProject({
      rawIdea: "A small app to generate technical specs from vague software ideas",
      projectTitle: "Spec Builder Test",
      finalJson: {
        summary: "This is a test project",
        functionalRequirements: [
          "User can enter a raw project idea",
          "System generates a structured project spec",
        ],
        technicalProposal: [
          "Use Next.js route handlers",
          "Use Neon as Postgres database",
        ],
        openQuestions: [
          "Should authentication be added later?",
        ],
      },
      markdownOutput: "# Spec Builder Test\n\nThis is only a test.",
    });

    const run = await logAgentRunStart({
      projectId: project.id,
      agentName: "intake-agent",
    });

    const finishedRun = await logAgentRunEnd({
      runId: run.id,
      status: "success",
    });

    return NextResponse.json({
      ok: true,
      project,
      run: finishedRun,
    });
  } catch (error) {
    console.error("test-project route error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to insert test project",
      },
      { status: 500 }
    );
  }
}