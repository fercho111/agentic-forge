import { describe, expect, it } from "vitest";
import { reviewerRouter } from "@/lib/graph/router";

describe("reviewerRouter", () => {
  it("routes back to product when rework is requested and retries are still available", () => {
    const result = reviewerRouter({
      rawIdea: "test",
      shouldRework: true,
      retries: 0,
    });

    expect(result).toBe("product");
  });

  it("finalizes when no rework is requested", () => {
    const result = reviewerRouter({
      rawIdea: "test",
      shouldRework: false,
      retries: 0,
    });

    expect(result).toBe("finalize");
  });

  it("finalizes when retry budget is exhausted", () => {
    const result = reviewerRouter({
      rawIdea: "test",
      shouldRework: true,
      retries: 1,
    });

    expect(result).toBe("finalize");
  });
});