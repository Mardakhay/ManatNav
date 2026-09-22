import { describe, expect, it } from "vitest";
import { translate } from "../src/i18n/copy";

describe("language copy", () => {
  it("returns translated copy with interpolated values", () => {
    expect(translate("en", "historyTitle", { value: "USD" })).toBe("AZN vs USD");
    expect(translate("az", "historyDescription", { value: 3 })).toContain("3 ay");
  });

  it("keeps unknown interpolation values visible instead of failing", () => {
    expect(translate("en", "updated", {})).toBe("Updated {value}");
  });
});
