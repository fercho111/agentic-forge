export type LLMStructuredRequest = {
  model?: "deepseek-chat" | "deepseek-reasoner";
  systemPrompt: string;
  userPrompt: string;
};

export type LLMRuntime = {
  generateStructured<T>(input: LLMStructuredRequest): Promise<T>;
};

export type CreateProjectInput = {
  rawIdea: string;
  projectTitle?: string;
  finalJson: unknown;
  markdownOutput?: string;
};

export type ProjectRecord = {
  id: string;
  user_id?: string;
  raw_idea: string;
  project_title: string | null;
  final_json: unknown;
  markdown_output: string | null;
  created_at: string;
};

export type AgentRunRecord = {
  id: string;
  user_id?: string;
  project_id: string | null;
  agent_name: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
};

export type AgentStepRecord = {
  id: string;
  user_id?: string;
  project_id: string | null;
  agent_name: string;
  model_name: string | null;
  retry_attempt: number;
  status: string;
  input_snapshot: unknown;
  output_snapshot: unknown;
  error_message: string | null;
  trace_name: string | null;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  created_at: string;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  reset_at: string;
  current_count: number;
};

export type ToolExecutor = {
  createProject(input: CreateProjectInput): Promise<ProjectRecord>;
  updateProject(input: {
    projectId: string;
    projectTitle?: string;
    finalJson: unknown;
    markdownOutput?: string;
  }): Promise<ProjectRecord>;
  logAgentRunStart(input: {
    projectId?: string | null;
    agentName: string;
    status?: string;
  }): Promise<AgentRunRecord>;
  logAgentRunEnd(input: {
    runId: string;
    status: "success" | "failed";
    errorMessage?: string | null;
  }): Promise<AgentRunRecord>;

  logAgentStepStart(input: {
    projectId?: string | null;
    agentName: string;
    modelName?: string | null;
    retryAttempt?: number;
    inputSnapshot?: unknown;
    traceName?: string | null;
  }): Promise<AgentStepRecord>;

  logAgentStepEnd(input: {
    stepId: string;
    status: "success" | "failed";
    outputSnapshot?: unknown;
    errorMessage?: string | null;
  }): Promise<AgentStepRecord>;

  checkAnalyzeRateLimit(input: {
    userId: string;
    route: string;
    limit: number;
    windowSeconds: number;
  }): Promise<RateLimitResult>;

  exportMarkdown(input: {
    projectTitle?: string;
    problemSummary?: string;
    targetUsers?: string[];
    functionalRequirements?: string[];
    userStories?: string[];
    technicalProposal?: string[];
    dataEntities?: string[];
    openQuestions?: string[];
    reviewNotes?: string[];
  }): Promise<string>;
};

export type GraphRuntime = {
  llm: LLMRuntime;
  tools: ToolExecutor;
};