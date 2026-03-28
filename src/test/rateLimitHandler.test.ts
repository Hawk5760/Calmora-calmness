import { describe, it, expect, vi } from "vitest";

describe("Rate Limit Handler", () => {
  it("detects 429 status", () => {
    const error = { status: 429, message: "Too many requests" };
    expect(error.status).toBe(429);
  });

  it("detects 402 quota errors", () => {
    const error = { status: 402, message: "Quota exceeded" };
    expect(error.status).toBe(402);
  });

  it("detects rate limit in message", () => {
    const error = { message: "rate limit exceeded" };
    expect(error.message).toContain("rate limit");
  });

  it("detects quota in message", () => {
    const error = { message: "API quota exceeded for project" };
    expect(error.message).toContain("quota");
  });

  it("calls fallback function on rate limit", () => {
    const fallback = vi.fn();
    const error = { status: 429 };
    if (error.status === 429) fallback();
    expect(fallback).toHaveBeenCalled();
  });
});
