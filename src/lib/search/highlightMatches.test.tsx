/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { highlightMatches } from "@/lib/search/highlightMatches";

describe("highlightMatches", () => {
  it("returns original text if query is empty", () => {
    const text = "Hello world";
    expect(highlightMatches(text, "")).toBe(text);
  });

  it("returns original text if no match found", () => {
    const text = "Hello world";
    const result = highlightMatches(text, "foo");
    // When there's no match, it returns an array with the single original string
    expect(result).toEqual([text]);
  });

  it("highlights a single match", () => {
    const text = "Hello world";
    const result = highlightMatches(text, "world");

    // Result should be ['Hello ', <mark>world</mark>, '']
    expect(result.length).toBe(3);
    expect(result[0]).toBe("Hello ");
    expect(result[1]).toHaveProperty("type", "mark");
    expect((result[1] as React.ReactElement).props.children).toBe("world");
    expect(result[2]).toBe("");
  });

  it("highlights matches case-insensitively", () => {
    const text = "Hello WORLD";
    const result = highlightMatches(text, "world");

    // Result should be ['Hello ', <mark>WORLD</mark>, '']
    expect(result.length).toBe(3);
    expect(result[0]).toBe("Hello ");
    expect(result[1]).toHaveProperty("type", "mark");
    expect((result[1] as React.ReactElement).props.children).toBe("WORLD");
    expect(result[2]).toBe("");
  });

  it("safely handles special regex characters in query", () => {
    const text = "Are you sure? (Yes/No) [100%]";
    const result = highlightMatches(text, "? (Yes/No) [");

    // Result should be ['Are you sure', <mark>? (Yes/No) [</mark>, '100%]']
    expect(result.length).toBe(3);
    expect(result[0]).toBe("Are you sure");
    expect(result[1]).toHaveProperty("type", "mark");
    expect((result[1] as React.ReactElement).props.children).toBe("? (Yes/No) [");
    expect(result[2]).toBe("100%]");
  });

  it("highlights multiple matches", () => {
    const text = "foo bar foo";
    const result = highlightMatches(text, "foo");

    // Result should be ['', <mark>foo</mark>, ' bar ', <mark>foo</mark>, '']
    expect(result.length).toBe(5);
    expect(result[0]).toBe("");
    expect(result[1]).toHaveProperty("type", "mark");
    expect((result[1] as React.ReactElement).props.children).toBe("foo");
    expect(result[2]).toBe(" bar ");
    expect(result[3]).toHaveProperty("type", "mark");
    expect((result[3] as React.ReactElement).props.children).toBe("foo");
    expect(result[4]).toBe("");
  });

  it("highlights match at the beginning of string", () => {
    const text = "Hello world";
    const result = highlightMatches(text, "Hello");

    expect(result.length).toBe(3);
    expect(result[0]).toBe("");
    expect(result[1]).toHaveProperty("type", "mark");
    expect((result[1] as React.ReactElement).props.children).toBe("Hello");
    expect(result[2]).toBe(" world");
  });

  it("highlights match that is the entire string", () => {
    const text = "Hello world";
    const result = highlightMatches(text, "Hello world");

    expect(result.length).toBe(3);
    expect(result[0]).toBe("");
    expect(result[1]).toHaveProperty("type", "mark");
    expect((result[1] as React.ReactElement).props.children).toBe("Hello world");
    expect(result[2]).toBe("");
  });
});
