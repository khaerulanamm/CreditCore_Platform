import { describe, expect, test } from "bun:test";
import { computeScore } from "../src/lib/server/store.server";

describe("CreditCore production scoring engine", () => {
  test("uses the locked 40/30/20/10 weights", () => {
    const result = computeScore(
      25_000_000,
      50_000_000,
      60,
      "Kolektibilitas 1",
      0,
    );

    expect(result.breakdown.slik.weight).toBe(0.4);
    expect(result.breakdown.income.weight).toBe(0.3);
    expect(result.breakdown.employment.weight).toBe(0.2);
    expect(result.breakdown.dependents.weight).toBe(0.1);
    expect(result.breakdown.weightedSubScore).toBe(100);
    expect(result.creditScore).toBe(850);
    expect(result.decision).toBe("APPROVED");
  });

  test("keeps the calculated credit score within 300–850", () => {
    const cases = [
      computeScore(1, 0, 0, "Kolektibilitas 1", 5),
      computeScore(1, 50_000_000, 60, "Kolektibilitas 1", 0),
      computeScore(1, 50_000_000, 60, "Kolektibilitas 2", 0),
      computeScore(1, -10_000_000, -12, "Kolektibilitas 1", 99),
    ];

    for (const result of cases) {
      expect(result.creditScore).toBeGreaterThanOrEqual(300);
      expect(result.creditScore).toBeLessThanOrEqual(850);
    }
  });

  test("applies the SLIK 3–5 hard gate", () => {
    for (const slik of ["Kolektibilitas 3", "Kolektibilitas 4", "Kolektibilitas 5"]) {
      const result = computeScore(100_000_000, 50_000_000, 60, slik, 0);
      expect(result.hardGateApplied).toBe(true);
      expect(result.creditScore).toBe(300);
      expect(result.decision).toBe("REJECTED");
      expect(result.riskGrade).toBe("High");
      expect(result.reasonCode).toBe("RC-OJK-COL3-5");
    }
  });

  test("routes scores to APPROVED, MANUAL_REVIEW, and REJECTED using production thresholds", () => {
    const approved = computeScore(1, 50_000_000, 60, "Kolektibilitas 1", 0);
    const manual = computeScore(1, 20_000_000, 24, "Kolektibilitas 1", 2);
    const rejected = computeScore(1, 0, 0, "Kolektibilitas 2", 5);

    expect(approved.creditScore).toBeGreaterThanOrEqual(750);
    expect(approved.decision).toBe("APPROVED");

    expect(manual.creditScore).toBeGreaterThanOrEqual(600);
    expect(manual.creditScore).toBeLessThan(750);
    expect(manual.decision).toBe("MANUAL_REVIEW");

    expect(rejected.creditScore).toBeLessThan(600);
    expect(rejected.decision).toBe("REJECTED");
  });

  test("normalizes out-of-range financial inputs instead of producing an out-of-range score", () => {
    const result = computeScore(
      1,
      -10_000_000,
      -24,
      "Kolektibilitas 1",
      99,
    );

    expect(result.breakdown.income.subScore).toBe(0);
    expect(result.breakdown.employment.subScore).toBe(0);
    expect(result.breakdown.dependents.subScore).toBe(0);
    expect(result.creditScore).toBeGreaterThanOrEqual(300);
    expect(result.creditScore).toBeLessThanOrEqual(850);
  });
});
