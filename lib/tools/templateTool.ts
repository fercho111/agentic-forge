// lib/tools/templateTool.ts
export function getSpecTemplateHints() {
  return {
    requiredSections: [
      "projectTitle",
      "problemSummary",
      "targetUsers",
      "functionalRequirements",
      "userStories",
      "technicalProposal",
      "dataEntities",
      "openQuestions",
      "reviewNotes",
    ],
  };
}