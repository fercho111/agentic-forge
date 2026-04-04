import { START, END, StateGraph, Annotation } from "@langchain/langgraph";
import { createInitialSpecGraphState, type SpecGraphState } from "./state";
import type { GraphRuntime } from "@/lib/runtime/types";
import { createIntakeNode } from "./nodes/intakeNode";
import { createProductNode } from "./nodes/productNode";
import { createTechnicalNode } from "./nodes/technicalNode";
import { createReviewerNode } from "./nodes/reviewerNode";
import { reviewerRouter } from "./router";

const SpecGraphAnnotation = Annotation.Root({
  rawIdea: Annotation<string>,
  projectId: Annotation<string | undefined>,
  projectTitle: Annotation<string | undefined>,
  problemSummary: Annotation<string | undefined>,
  targetUsers: Annotation<string[] | undefined>,
  functionalRequirements: Annotation<string[] | undefined>,
  userStories: Annotation<string[] | undefined>,
  technicalProposal: Annotation<string[] | undefined>,
  dataEntities: Annotation<string[] | undefined>,
  openQuestions: Annotation<string[] | undefined>,
  reviewNotes: Annotation<string[] | undefined>,
  currentAgent: Annotation<"intake" | "product" | "technical" | "reviewer" | undefined>,
  shouldRework: Annotation<boolean | undefined>,
  retries: Annotation<number | undefined>,
  errors: Annotation<string[] | undefined>,
});

type SpecGraphAnnotationState = typeof SpecGraphAnnotation.State;

function createBootstrapNode(runtime: GraphRuntime) {
  return async (
    state: SpecGraphAnnotationState
  ): Promise<Partial<SpecGraphAnnotationState>> => {
    const project = await runtime.tools.createProject({
      rawIdea: state.rawIdea,
      projectTitle: "Pending analysis",
      finalJson: {
        rawIdea: state.rawIdea,
        status: "running",
      },
      markdownOutput: "",
    });

    return {
      projectId: project.id,
    };
  };
}

function createFinalizeNode(runtime: GraphRuntime) {
  return async (
    state: SpecGraphAnnotationState
  ): Promise<Partial<SpecGraphAnnotationState>> => {
    const markdown = await runtime.tools.exportMarkdown({
      projectTitle: state.projectTitle,
      problemSummary: state.problemSummary,
      targetUsers: state.targetUsers,
      functionalRequirements: state.functionalRequirements,
      userStories: state.userStories,
      technicalProposal: state.technicalProposal,
      dataEntities: state.dataEntities,
      openQuestions: state.openQuestions,
      reviewNotes: state.reviewNotes,
    });

    if (state.projectId) {
      await runtime.tools.updateProject({
        projectId: state.projectId,
        projectTitle: state.projectTitle,
        finalJson: state,
        markdownOutput: markdown,
      });
    }

    return {};
  };
}

function createReworkIncrementNode() {
  return async (
    state: SpecGraphAnnotationState
  ): Promise<Partial<SpecGraphAnnotationState>> => {
    return {
      retries: (state.retries ?? 0) + 1,
      shouldRework: false,
    };
  };
}

export function buildSpecGraph(runtime: GraphRuntime) {
  const graph = new StateGraph(SpecGraphAnnotation)
    .addNode("bootstrap", createBootstrapNode(runtime))
    .addNode("intake", createIntakeNode(runtime))
    .addNode("product", createProductNode(runtime))
    .addNode("technical", createTechnicalNode(runtime))
    .addNode("reviewer", createReviewerNode(runtime))
    .addNode("reworkIncrement", createReworkIncrementNode())
    .addNode("finalize", createFinalizeNode(runtime))
    .addEdge(START, "bootstrap")
    .addEdge("bootstrap", "intake")
    .addEdge("intake", "product")
    .addEdge("product", "technical")
    .addEdge("technical", "reviewer")
    .addConditionalEdges("reviewer", reviewerRouter, {
      product: "reworkIncrement",
      finalize: "finalize",
    })
    .addEdge("reworkIncrement", "product")
    .addEdge("finalize", END);

  return graph.compile();
}

export async function runSpecGraph(runtime: GraphRuntime, rawIdea: string) {
  const graph = buildSpecGraph(runtime);
  const initialState = createInitialSpecGraphState(rawIdea);
  const result = await graph.invoke(initialState);
  return result as SpecGraphState;
}