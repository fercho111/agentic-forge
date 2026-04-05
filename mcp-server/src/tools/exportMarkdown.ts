import { exportMarkdownInputSchema, type ExportMarkdownInput } from "../schemas/exportMarkdown.js";

function renderList(items?: string[]) {
  if (!items || items.length === 0) {
    return "- None";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

export function exportMarkdown(input: ExportMarkdownInput): string {
  const parsed = exportMarkdownInputSchema.parse(input);

  return `# ${parsed.projectTitle ?? "Untitled Project"}

## Problem Summary
${parsed.problemSummary ?? "No summary generated."}

## Target Users
${renderList(parsed.targetUsers)}

## Functional Requirements
${renderList(parsed.functionalRequirements)}

## User Stories
${renderList(parsed.userStories)}

## Technical Proposal
${renderList(parsed.technicalProposal)}

## Data Entities
${renderList(parsed.dataEntities)}

## Open Questions
${renderList(parsed.openQuestions)}

## Review Notes
${renderList(parsed.reviewNotes)}
`;
}

export const exportMarkdownToolMeta = {
  name: "export_markdown",
  description:
    "Generate a markdown specification document from the structured project state.",
  inputSchema: exportMarkdownInputSchema,
};