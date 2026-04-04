import type { SpecGraphState } from "./state";

export function reviewerRouter(state: SpecGraphState) {
  const retries = state.retries ?? 0;

  if (state.shouldRework && retries < 1) {
    return "product";
  }

  return "finalize";
}