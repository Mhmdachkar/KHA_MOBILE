/**
 * Unit tests for src/lib/imageUtils.ts
 *
 * Covers:
 *  - resolveImageUrl with VITE_API_URL configured
 *  - resolveImageUrl without VITE_API_URL (production passthrough)
 *  - edge cases: empty, blob, data, protocol-relative, CDN URLs
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ─── helpers ────────────────────────────────────────────────────────────────

function loadModule(viteApiUrl: string | undefined) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", viteApiUrl ?? "");
  // Vite exposes import.meta.env, but in Vitest we stub it via vi.stubEnv
  // We also need to stub import.meta.env directly since the module reads it
  return import("../lib/imageUtils");
}

// ─── Dev: no VITE_API_URL → same-origin /uploads (Vite proxy to :3001) ───────

describe("resolveImageUrl — no VITE_API_URL (dev / proxy)", () => {
  let resolveImageUrl: (url: string | undefined) => string;

  beforeEach(async () => {
    vi.resetModules();
    // Simulate missing env var: empty string means "localhost fallback" in apiBase()
    vi.stubEnv("VITE_API_URL", "");
    const mod = await import("../lib/imageUtils");
    resolveImageUrl = mod.resolveImageUrl;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns empty string for undefined", () => {
    expect(resolveImageUrl(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(resolveImageUrl("")).toBe("");
  });

  it("returns empty string for whitespace", () => {
    expect(resolveImageUrl("   ")).toBe("");
  });

  it("passes through blob: URLs unchanged", () => {
    const url = "blob:http://localhost/abc-123";
    expect(resolveImageUrl(url)).toBe(url);
  });

  it("passes through data: URLs unchanged", () => {
    const url = "data:image/png;base64,abc==";
    expect(resolveImageUrl(url)).toBe(url);
  });

  it("rewrites full https /uploads/ URL to same-origin path (vite proxy)", () => {
    const url = "https://api.render.com/uploads/image.jpg";
    expect(resolveImageUrl(url)).toBe("/uploads/image.jpg");
  });

  it("rewrites full http /uploads/ URL to same-origin path", () => {
    const url = "http://api.render.com/uploads/image.jpg";
    expect(resolveImageUrl(url)).toBe("/uploads/image.jpg");
  });

  it("keeps /uploads/ relative path for proxy", () => {
    expect(resolveImageUrl("/uploads/photo.png")).toBe("/uploads/photo.png");
  });

  it("passes through root-relative non-upload paths", () => {
    expect(resolveImageUrl("/assets/logo.png")).toBe("/assets/logo.png");
  });

  it("passes through CDN URLs unchanged", () => {
    const url = "https://cdn.example.com/images/product.jpg";
    expect(resolveImageUrl(url)).toBe(url);
  });

  it("normalises protocol-relative // URL using window.location.protocol", () => {
    Object.defineProperty(window, "location", {
      value: { protocol: "https:" },
      writable: true,
    });
    expect(resolveImageUrl("//cdn.example.com/img.jpg")).toBe(
      "https://cdn.example.com/img.jpg"
    );
  });
});

// ─── WITH VITE_API_URL configured ───────────────────────────────────────────

describe("resolveImageUrl — VITE_API_URL=https://my-api.onrender.com", () => {
  let resolveImageUrl: (url: string | undefined) => string;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "https://my-api.onrender.com");
    const mod = await import("../lib/imageUtils");
    resolveImageUrl = mod.resolveImageUrl;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rewrites /uploads/ relative path to configured API base", () => {
    expect(resolveImageUrl("/uploads/product.jpg")).toBe(
      "https://my-api.onrender.com/uploads/product.jpg"
    );
  });

  it("rewrites uploads/ (no leading slash) to configured API base", () => {
    expect(resolveImageUrl("uploads/product.jpg")).toBe(
      "https://my-api.onrender.com/uploads/product.jpg"
    );
  });

  it("rewrites full https /uploads/ URL host to configured API base", () => {
    expect(
      resolveImageUrl("https://old-render-host.onrender.com/uploads/img.png")
    ).toBe("https://my-api.onrender.com/uploads/img.png");
  });

  it("preserves query string when rewriting", () => {
    expect(
      resolveImageUrl(
        "https://old-host.com/uploads/img.png?w=200"
      )
    ).toBe("https://my-api.onrender.com/uploads/img.png?w=200");
  });

  it("does not rewrite CDN URLs (non-upload path)", () => {
    const url = "https://cdn.example.com/images/product.jpg";
    expect(resolveImageUrl(url)).toBe(url);
  });

  it("still passes through blob: URLs", () => {
    const url = "blob:http://localhost/preview";
    expect(resolveImageUrl(url)).toBe(url);
  });

  it("still returns empty for undefined", () => {
    expect(resolveImageUrl(undefined)).toBe("");
  });
});

// ─── resolveImageUrls (batch) ────────────────────────────────────────────────

describe("resolveImageUrls", () => {
  it("maps array and filters empty results", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "");
    const { resolveImageUrls } = await import("../lib/imageUtils");
    const result = resolveImageUrls([
      "https://cdn.example.com/a.jpg",
      undefined,
      "",
      "https://cdn.example.com/b.jpg",
    ]);
    expect(result).toEqual([
      "https://cdn.example.com/a.jpg",
      "https://cdn.example.com/b.jpg",
    ]);
    vi.unstubAllEnvs();
  });
});
