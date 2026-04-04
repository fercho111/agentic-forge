export type SpecGraphState = {
  rawIdea: string;

  // ownership / persistence
  projectId?: string;

  // enriched specification fields
  projectTitle?: string;
  problemSummary?: string;
  targetUsers?: string[];
  functionalRequirements?: string[];
  userStories?: string[];
  technicalProposal?: string[];
  dataEntities?: string[];
  openQuestions?: string[];
  reviewNotes?: string[];

  // runtime metadata
  currentAgent?: "intake" | "product" | "technical" | "reviewer";
  shouldRework?: boolean;
  retries?: number;
  errors?: string[];
};

export function createInitialSpecGraphState(rawIdea: string): SpecGraphState {
  return {
    rawIdea,
    retries: 0,
    errors: [],
    shouldRework: false,
  };
}