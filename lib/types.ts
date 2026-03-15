export type SpecState = {
  rawIdea: string;
  projectTitle?: string;
  problemSummary?: string;
  targetUsers?: string[];
  functionalRequirements?: string[];
  userStories?: string[];
  technicalProposal?: string[];
  dataEntities?: string[];
  openQuestions?: string[];
  reviewNotes?: string[];
};

export type AnalyzeIdeaInput = {
  idea: string;
};

export type AnalyzeIdeaResult = {
  projectId: string;
  spec: SpecState;
  markdown: string;
};