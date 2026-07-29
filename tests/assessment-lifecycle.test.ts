import { beforeEach, describe, expect, test } from "bun:test";
import {
  createAssessment,
  isValidStatusTransition,
  resetStore,
  updateAssessmentStatus,
} from "../src/lib/server/store.server";

const manualReviewInput = {
  accountId: "ACC-TEST-001",
  borrowerName: "Lifecycle Test",
  requestedAmount: 10_000_000,
  monthlyIncome: 20_000_000,
  employmentLengthMonths: 24,
  purposeOfLoan: "Test",
  numberOfDependents: 2,
  slikStatus: "Kolektibilitas 1",
};

describe("CreditCore assessment lifecycle", () => {
  beforeEach(() => resetStore());

  test("creates a MANUAL_REVIEW assessment from the production scoring engine", () => {
    const assessment = createAssessment(manualReviewInput);
    expect(assessment.score?.decision).toBe("MANUAL_REVIEW");
    expect(assessment.status).toBe("MANUAL_REVIEW");
  });

  test("uses a caller-provided durable assessment id", () => {
    const assessment = createAssessment(manualReviewInput, "ASM-2026-0099");
    expect(assessment.assessmentId).toBe("ASM-2026-0099");
  });

  test("supports MANUAL_REVIEW → APPROVED", () => {
    const assessment = createAssessment(manualReviewInput);
    const updated = updateAssessmentStatus(assessment.assessmentId, "APPROVED");
    expect(updated?.status).toBe("APPROVED");
  });

  test("supports MANUAL_REVIEW → REJECTED", () => {
    const assessment = createAssessment(manualReviewInput);
    const updated = updateAssessmentStatus(assessment.assessmentId, "REJECTED");
    expect(updated?.status).toBe("REJECTED");
  });

  test("returns undefined for an unknown assessment id", () => {
    expect(updateAssessmentStatus("ASM-NOT-FOUND", "APPROVED")).toBeUndefined();
  });

  // STEP 4.8 — lifecycle status persistence: terminal-state transition guard.
  test("blocks APPROVED → REJECTED", () => {
    expect(isValidStatusTransition("APPROVED", "REJECTED")).toBe(false);
  });

  test("blocks REJECTED → APPROVED", () => {
    expect(isValidStatusTransition("REJECTED", "APPROVED")).toBe(false);
  });

  test("allows MANUAL_REVIEW → APPROVED", () => {
    expect(isValidStatusTransition("MANUAL_REVIEW", "APPROVED")).toBe(true);
  });

  test("allows MANUAL_REVIEW → REJECTED", () => {
    expect(isValidStatusTransition("MANUAL_REVIEW", "REJECTED")).toBe(true);
  });

  test("allows re-setting a terminal status to itself (idempotent replay)", () => {
    expect(isValidStatusTransition("APPROVED", "APPROVED")).toBe(true);
  });
});
