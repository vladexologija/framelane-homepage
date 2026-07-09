import { describe, it, expect } from "vitest";
import { randomProjectName } from "./random-name";

describe("randomProjectName", () => {
  it("returns a capitalized two-word name", () => {
    for (let i = 0; i < 100; i++) {
      const name = randomProjectName();
      expect(name).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
    }
  });

  it("varies across calls (draws from the word lists, not a constant)", () => {
    const names = new Set(Array.from({ length: 50 }, () => randomProjectName()));
    expect(names.size).toBeGreaterThan(1);
  });
});
