import { describe, it, expect } from "vitest";
import {
  computeTrendPercent,
  getPreviousPeriodRange,
  calculateSessionMetricTrends,
} from "@/utils/analyticsHelpers";
import type { VisitorSession } from "@/types/analytics";

const session = (startTime: number, pages = 2, revenue = 0): VisitorSession => ({
  sessionId: `s-${startTime}`,
  startTime,
  lastActivity: startTime + 60000,
  pages: Array.from({ length: pages }, (_, i) => ({
    path: `/p${i}`,
    title: "Page",
    timestamp: startTime + i * 1000,
    timeSpent: 1000,
  })),
  actions: revenue
    ? [{ type: "checkout_complete", timestamp: startTime + 5000, page: "/checkout", data: { orderValue: revenue } }]
    : [],
  referrer: "",
  device: { type: "desktop", os: "Windows", browser: "Chrome" },
  bounced: pages <= 1,
});

describe("computeTrendPercent", () => {
  it("returns null when both periods are zero", () => {
    expect(computeTrendPercent(0, 0)).toBeNull();
  });

  it("returns 100 when previous is zero and current is positive", () => {
    expect(computeTrendPercent(5, 0)).toBe(100);
  });

  it("computes positive change", () => {
    expect(computeTrendPercent(150, 100)).toBe(50);
  });
});

describe("getPreviousPeriodRange", () => {
  it("returns null when start is zero (all time)", () => {
    expect(getPreviousPeriodRange(0, 1000)).toBeNull();
  });

  it("returns equal-length window before start", () => {
    const prev = getPreviousPeriodRange(1000, 2000);
    expect(prev).toEqual({ start: 0, end: 1000 });
  });
});

describe("calculateSessionMetricTrends", () => {
  it("computes visitor trend between two periods", () => {
    const now = Date.now();
    const sessions = [
      session(now - 10 * 86400000, 2),
      session(now - 3 * 86400000, 2),
      session(now - 2 * 86400000, 2),
    ];
    const start = now - 7 * 86400000;
    const trends = calculateSessionMetricTrends(sessions, start, now);
    expect(trends.visitors).toBe(100);
  });
});
