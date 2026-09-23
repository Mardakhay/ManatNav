import { describe, expect, it } from "vitest";
import { computeTrend, formatTrendPercent } from "../src/services/trend";

describe("trend computation", () => {
  it("computes upward trend from a rising series", () => {
    const result = computeTrend([0.5, 0.52, 0.55, 0.58]);
    expect(result).not.toBeNull();
    expect(result!.direction).toBe("up");
    expect(result!.changePercent).toBeCloseTo(16, 0);
    expect(result!.sparkline).toHaveLength(4);
  });

  it("computes downward trend from a falling series", () => {
    const result = computeTrend([0.6, 0.58, 0.55, 0.52]);
    expect(result).not.toBeNull();
    expect(result!.direction).toBe("down");
    expect(result!.changePercent).toBeLessThan(0);
  });

  it("reports flat when change is negligible", () => {
    const result = computeTrend([0.5, 0.5, 0.5, 0.5]);
    expect(result).not.toBeNull();
    expect(result!.direction).toBe("flat");
    expect(result!.changePercent).toBe(0);
  });

  it("returns null for fewer than two data points", () => {
    expect(computeTrend([])).toBeNull();
    expect(computeTrend([0.5])).toBeNull();
  });
});

describe("trend percent formatting", () => {
  it("prepends a plus sign for positive values", () => {
    expect(formatTrendPercent(2.5, "en")).toBe("+2.50%");
  });

  it("does not prepend a plus sign for negative values", () => {
    expect(formatTrendPercent(-1.3, "en")).toBe("-1.30%");
  });

  it("uses Azerbaijani locale formatting", () => {
    expect(formatTrendPercent(2.5, "az")).toBe("+2,50%");
  });
});
