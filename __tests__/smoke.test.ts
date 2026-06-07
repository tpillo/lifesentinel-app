import { describe, it, expect } from "vitest";
import { resolvePersona } from "@/lib/resolvePersona";

describe("smoke: resolvePersona", () => {
  it("returns military_veteran for military_veteran", () => {
    expect(resolvePersona("military_veteran")).toBe("military_veteran");
  });
});
