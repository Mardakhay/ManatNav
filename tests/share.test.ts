import { describe, expect, it, beforeEach } from "vitest";
import {
  buildCalculationShareUrl,
  readCalculationFromUrl,
} from "../src/services/share";

function setLocation(href: string) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { href } },
  });
}

describe("calculation sharing", () => {
  beforeEach(() => {
    setLocation("https://manatnav.example/");
  });

  it("serializes non-default calculation values into a share URL", () => {
    const url = buildCalculationShareUrl({
      retailerId: "amazon",
      from: "USD",
      to: "AZN",
      amount: "125.50",
      shipping: "10",
      serviceFee: "3",
      label: "Headphones",
    });

    expect(url).toContain("retailer=amazon");
    expect(url).toContain("amount=125.50");
    expect(url).toContain("label=Headphones");
    expect(url).not.toContain("to=AZN");
  });

  it("reads valid values and ignores unsupported currencies", () => {
    setLocation(
      "https://manatnav.example/?from=EUR&to=AZN&amount=80&fee=2&label=Coat"
    );

    expect(readCalculationFromUrl()).toEqual({
      from: "EUR",
      to: "AZN",
      amount: "80",
      serviceFee: "2",
      label: "Coat",
    });

    setLocation("https://manatnav.example/?from=INVALID&amount=80");
    expect(readCalculationFromUrl()).toEqual({ amount: "80" });
  });
});
