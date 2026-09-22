import { describe, expect, it } from "vitest";
import { summarizeHistory } from "../src/services/history";

const rows = [
  { date: "2026-01-01", base: "AZN", quote: "USD", rate: 0.6 },
  { date: "2026-02-01", base: "AZN", quote: "USD", rate: 0.5 },
  { date: "2026-03-01", base: "AZN", quote: "USD", rate: 0.7 },
] as const;

describe("history summaries", () => {
  it("calculates latest, range, and average values", () => {
    expect(summarizeHistory([...rows])).toEqual({
      latest: 0.7,
      lowest: 0.5,
      highest: 0.7,
      average: 0.6,
    });
  });

  it("returns empty values when history is unavailable", () => {
    expect(summarizeHistory([])).toEqual({
      latest: null,
      lowest: null,
      highest: null,
      average: null,
    });
  });
});
