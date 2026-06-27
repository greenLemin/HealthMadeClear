import { describe, expect, it } from "vitest";
import { normalizeLineEndings } from "./normalizeLineEndings";

describe("normalizeLineEndings", () => {
  it("normalizes Windows CRLF to LF", () => {
    const input = "Hello\r\nWorld\r\n!";
    const expected = "Hello\nWorld\n!";
    expect(normalizeLineEndings(input)).toBe(expected);
  });

  it("leaves existing LF unchanged", () => {
    const input = "Hello\nWorld\n!";
    expect(normalizeLineEndings(input)).toBe(input);
  });

  it("handles a mix of CRLF and LF", () => {
    const input = "Hello\r\nWorld\n!\r\n";
    const expected = "Hello\nWorld\n!\n";
    expect(normalizeLineEndings(input)).toBe(expected);
  });

  it("returns empty string when given empty string", () => {
    expect(normalizeLineEndings("")).toBe("");
  });

  it("returns string without newlines unchanged", () => {
    expect(normalizeLineEndings("Hello World!")).toBe("Hello World!");
  });
});
