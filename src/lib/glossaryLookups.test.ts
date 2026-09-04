import { describe, it, expect, beforeEach } from "vitest";
import { recordGlossaryLookup, getGlossaryLookupCount } from "./glossaryLookups";

beforeEach(() => {
  localStorage.clear();
});

describe("glossaryLookups", () => {
  it("counts only string entries (ignores manually-injected non-strings)", () => {
    localStorage.setItem("hmc-glossary-lookups", JSON.stringify(["a", 1, null, {}, "b"]));
    expect(getGlossaryLookupCount()).toBe(2);
  });

  it("record filters non-strings and caps at 20", () => {
    for (let i = 0; i < 25; i++) recordGlossaryLookup(`term-${i}`);
    expect(getGlossaryLookupCount()).toBe(20);
  });
});
