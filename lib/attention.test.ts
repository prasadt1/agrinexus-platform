import { describe, it, expect } from "vitest";
import { attentionFor } from "./attention";

describe("attentionFor", () => {
  it("ignores non-active cohorts", () => {
    expect(attentionFor({ status: "draft", outcomes: { followThroughRate: 0, nudgesSent: 10, nudgesCompleted: 0 } }).needsAttention).toBe(false);
  });

  it("ignores active cohorts with nothing sent yet", () => {
    expect(attentionFor({ status: "active", outcomes: null }).needsAttention).toBe(false);
    expect(attentionFor({ status: "active", outcomes: { followThroughRate: 0, nudgesSent: 0, nudgesCompleted: 0 } }).needsAttention).toBe(false);
  });

  it("flags 'no replies' when nudges sent but none completed", () => {
    const f = attentionFor({ status: "active", outcomes: { followThroughRate: 0, nudgesSent: 12, nudgesCompleted: 0 } });
    expect(f.needsAttention).toBe(true);
    expect(f.reason).toBe("no-replies");
  });

  it("flags 'low-response' at or below the threshold", () => {
    const f = attentionFor({ status: "active", outcomes: { followThroughRate: 0.3, nudgesSent: 20, nudgesCompleted: 6 } });
    expect(f.needsAttention).toBe(true);
    expect(f.reason).toBe("low-response");
    expect(f.label).toContain("30%");
  });

  it("does not flag healthy cohorts", () => {
    expect(attentionFor({ status: "active", outcomes: { followThroughRate: 0.7, nudgesSent: 20, nudgesCompleted: 14 } }).needsAttention).toBe(false);
  });
});
