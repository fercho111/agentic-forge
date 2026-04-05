---
name: spec-review
description: Review generated software specifications for clarity, scope completeness, implementation ambiguity, and rework necessity. Use when validating a structured project spec before finalizing it.
license: Proprietary
compatibility: Designed for Agentic Forge reviewer flows running in Next.js/Node.js environments.
metadata:
  author: agentic-forge
  version: "1.0"
---

# Spec Review Skill

Use this skill when you are reviewing a structured software specification produced by earlier planning agents.

Your goal is not to rewrite the specification from scratch. Your goal is to assess whether the current specification is good enough to finalize, and to identify any critical issues that should block finalization.

## What to evaluate

Review the specification for these dimensions:

1. **Clarity**
   - Is the project title understandable?
   - Is the problem summary concrete and coherent?
   - Are the requirements and user stories understandable without guesswork?

2. **Scope completeness**
   - Are the main functional expectations represented?
   - Are the target users explicit enough?
   - Is the technical proposal minimally aligned with the product requirements?

3. **Implementation ambiguity**
   - Are there major contradictions between product and technical sections?
   - Are there missing pieces that make implementation unclear?
   - Are the data entities too vague or disconnected from the requirements?

4. **Rework necessity**
   - Only request rework if the specification is **critically incomplete, contradictory, or unusable**.
   - Do **not** request rework merely because there are normal open questions.
   - Prefer capturing concerns in `openQuestions` and `reviewNotes` rather than forcing another graph cycle.

## Output policy

You must return:

- `openQuestions: string[]`
- `reviewNotes: string[]`
- `shouldRework: boolean`

## Review rules

### Set `shouldRework = true` only if:
- the problem summary is too vague to support implementation,
- the requirements are missing major core functionality,
- the technical proposal is fundamentally misaligned with the stated product,
- or the specification contains serious contradictions.

### Set `shouldRework = false` if:
- the spec is mostly usable,
- the remaining issues are normal clarifications,
- or the gaps can be captured as open questions without blocking the workflow.

## Best practices

- Be concise and specific.
- Focus on implementation relevance, not stylistic perfection.
- Prefer actionable review notes over generic criticism.
- Avoid over-triggering rework.
- Treat open questions as normal unless they block execution entirely.

## Example interpretation

### Good enough spec
- Some unresolved details
- Reasonable summary
- Coherent product and technical sections
- Result: `shouldRework = false`

### Not good enough spec
- Vague problem statement
- Missing core requirements
- Technical proposal unrelated to the product
- Result: `shouldRework = true`