import { SpecState } from "@/lib/types";
import { toMarkdown } from "@/lib/tools/exportTool";
import {
  createProject,
  logAgentRunEnd,
  logAgentRunStart,
} from "@/lib/tools/persistenceTool";
import { runIntakeAgent } from "./intakeAgent";
import { runProductAgent } from "./productAgent";
import { runTechnicalAgent } from "./technicalAgent";
import { runReviewerAgent } from "./reviewerAgent";


export async function runAnalysisPipeline(rawIdea: string) {
  const intakeRun = await logAgentRunStart({
    agentName: "intake-agent",
  });

  let state: SpecState;

  try {
    state = await runIntakeAgent(rawIdea);

    await logAgentRunEnd({
      runId: intakeRun.id,
      status: "success",
    });
  } catch (error) {
    await logAgentRunEnd({
      runId: intakeRun.id,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown intake error",
    });
    throw error;
  }

  const productRun = await logAgentRunStart({
    agentName: "product-agent",
  });

  try {
    state = await runProductAgent(state);

    await logAgentRunEnd({
      runId: productRun.id,
      status: "success",
    });
  } catch (error) {
    await logAgentRunEnd({
      runId: productRun.id,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown product error",
    });
    throw error;
  }

  const technicalRun = await logAgentRunStart({
    agentName: "technical-agent",
  });

  try {
    state = await runTechnicalAgent(state);

    await logAgentRunEnd({
      runId: technicalRun.id,
      status: "success",
    });
  } catch (error) {
    await logAgentRunEnd({
      runId: technicalRun.id,
      status: "failed",
      errorMessage:
        error instanceof Error ? error.message : "Unknown technical error",
    });
    throw error;
  }

  const reviewerRun = await logAgentRunStart({
    agentName: "reviewer-agent",
  });

  try {
    state = await runReviewerAgent(state);

    await logAgentRunEnd({
      runId: reviewerRun.id,
      status: "success",
    });
  } catch (error) {
    await logAgentRunEnd({
      runId: reviewerRun.id,
      status: "failed",
      errorMessage:
        error instanceof Error ? error.message : "Unknown reviewer error",
    });
    throw error;
  }

  const markdown = toMarkdown(state);

  const project = await createProject({
    rawIdea,
    projectTitle: state.projectTitle,
    finalJson: state,
    markdownOutput: markdown,
  });

  return {
    projectId: project.id,
    spec: state,
    markdown,
  };
}