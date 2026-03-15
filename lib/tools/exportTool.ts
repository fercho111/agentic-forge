import { SpecState } from "@/lib/types";

function renderList(items?: string[]) {
  if (!items || items.length === 0) {
    return "- None";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

export function toMarkdown(spec: SpecState): string {
  return `# ${spec.projectTitle ?? "Untitled Project"}

## Problem Summary
${spec.problemSummary ?? "No summary generated."}

## Target Users
${renderList(spec.targetUsers)}

## Functional Requirements
${renderList(spec.functionalRequirements)}

## User Stories
${renderList(spec.userStories)}

## Technical Proposal
${renderList(spec.technicalProposal)}

## Data Entities
${renderList(spec.dataEntities)}

## Open Questions
${renderList(spec.openQuestions)}

## Review Notes
${renderList(spec.reviewNotes)}
`;
}