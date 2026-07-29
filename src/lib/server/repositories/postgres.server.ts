import { desc, eq } from "drizzle-orm";
import { getDatabase } from "../db/client.server";
import {
  assessments,
  auditLogs,
  creditScores,
  idempotencyKeys,
  runtimeSimulation,
} from "../db/schema.server";
import type {
  ApiLog,
  Assessment,
  AssessmentStatus,
  CreditScoreResult,
  LogSource,
  Simulation,
  StatusOverride,
} from "../store.server";

function toAssessment(
  row: typeof assessments.$inferSelect,
  score?: typeof creditScores.$inferSelect,
): Assessment {
  return {
    assessmentId: row.assessmentId,
    accountId: row.accountId,
    borrowerName: row.borrowerName,
    requestedAmount: row.requestedAmount,
    monthlyIncome: row.monthlyIncome,
    employmentLengthMonths: row.employmentLengthMonths,
    purposeOfLoan: row.purposeOfLoan,
    numberOfDependents: row.numberOfDependents,
    slikStatus: row.slikStatus,
    status: row.status as AssessmentStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    score: score
      ? ({
          creditScore: score.creditScore,
          riskGrade: score.riskGrade,
          slikStatus: score.slikStatus,
          decision: score.decision,
          probabilityOfDefault: score.probabilityOfDefault,
          reasonCode: score.reasonCode,
          reason: score.reason,
          hardGateApplied: score.hardGateApplied,
          breakdown: score.breakdown,
        } as CreditScoreResult)
      : undefined,
  };
}

export async function persistAssessment(assessment: Assessment): Promise<void> {
  const db = getDatabase();

  await db.transaction(async (tx) => {
    await tx
      .insert(assessments)
      .values({
        assessmentId: assessment.assessmentId,
        accountId: assessment.accountId,
        borrowerName: assessment.borrowerName,
        requestedAmount: assessment.requestedAmount,
        monthlyIncome: assessment.monthlyIncome,
        employmentLengthMonths: assessment.employmentLengthMonths,
        purposeOfLoan: assessment.purposeOfLoan,
        numberOfDependents: assessment.numberOfDependents,
        slikStatus: assessment.slikStatus,
        status: assessment.status,
        createdAt: new Date(assessment.createdAt),
        updatedAt: new Date(assessment.updatedAt),
      })
      .onConflictDoUpdate({
        target: assessments.assessmentId,
        set: {
          status: assessment.status,
          updatedAt: new Date(assessment.updatedAt),
        },
      });

    if (assessment.score) {
      await tx
        .insert(creditScores)
        .values({
          assessmentId: assessment.assessmentId,
          creditScore: assessment.score.creditScore,
          riskGrade: assessment.score.riskGrade,
          slikStatus: assessment.score.slikStatus,
          decision: assessment.score.decision,
          probabilityOfDefault: assessment.score.probabilityOfDefault,
          reasonCode: assessment.score.reasonCode,
          reason: assessment.score.reason,
          hardGateApplied: assessment.score.hardGateApplied,
          breakdown: assessment.score.breakdown,
        })
        .onConflictDoNothing();
    }
  });
}

export async function findPersistedAssessment(id: string): Promise<Assessment | undefined> {
  const db = getDatabase();
  const [row] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.assessmentId, id))
    .limit(1);
  if (!row) return undefined;
  const [score] = await db
    .select()
    .from(creditScores)
    .where(eq(creditScores.assessmentId, id))
    .limit(1);
  return toAssessment(row, score);
}

export async function listPersistedAssessments(): Promise<Assessment[]> {
  const db = getDatabase();
  const rows = await db.select().from(assessments).orderBy(desc(assessments.createdAt));
  const scores = await db.select().from(creditScores);
  const byId = new Map(scores.map((score) => [score.assessmentId, score]));
  return rows.map((row) => toAssessment(row, byId.get(row.assessmentId)));
}

export async function nextPersistedAssessmentId(): Promise<string> {
  const db = getDatabase();
  const rows = await db.select({ assessmentId: assessments.assessmentId }).from(assessments);
  const highest = rows.reduce((max, row) => {
    const sequence = Number(row.assessmentId.match(/^ASM-\d{4}-(\d+)$/)?.[1]);
    return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
  }, 0);
  return `ASM-2026-${String(highest + 1).padStart(4, "0")}`;
}

export async function persistAssessmentStatus(
  id: string,
  status: AssessmentStatus,
  updatedAt: string,
): Promise<Assessment | undefined> {
  const db = getDatabase();
  const [row] = await db
    .update(assessments)
    .set({ status, updatedAt: new Date(updatedAt) })
    .where(eq(assessments.assessmentId, id))
    .returning();
  if (!row) return undefined;
  const [score] = await db
    .select()
    .from(creditScores)
    .where(eq(creditScores.assessmentId, id))
    .limit(1);
  return toAssessment(row, score);
}

export async function persistAuditLog(log: ApiLog): Promise<void> {
  const db = getDatabase();
  await db.insert(auditLogs).values({
    requestId: log.requestId,
    correlationId: log.correlationId,
    timestamp: new Date(log.timestamp),
    method: log.method,
    path: log.path,
    status: log.status,
    latencyMs: log.latencyMs,
    source: log.source,
    clientType: log.clientType,
    userAgent: log.userAgent,
    responseType: log.responseType,
    requestHeaders: log.requestHeaders,
    requestBody: log.requestBody,
    responseHeaders: log.responseHeaders,
    responseBody: log.responseBody,
    errorMessage: log.errorMessage,
  });
}

export async function listPersistedLogs(limit = 200): Promise<ApiLog[]> {
  const db = getDatabase();
  const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(limit);
  return rows.map((row) => ({
    id: row.id,
    requestId: row.requestId,
    correlationId: row.correlationId,
    timestamp: row.timestamp.toISOString(),
    method: row.method,
    path: row.path,
    status: row.status,
    latencyMs: row.latencyMs,
    source: row.source as LogSource,
    clientType: row.clientType as LogSource,
    userAgent: row.userAgent,
    responseType: "json" as const,
    requestHeaders: row.requestHeaders as Record<string, string>,
    requestBody: row.requestBody,
    responseHeaders: row.responseHeaders as Record<string, string>,
    responseBody: row.responseBody,
    errorMessage: row.errorMessage ?? undefined,
  }));
}

export async function persistIdempotencyKey(key: string, assessmentId: string): Promise<void> {
  const db = getDatabase();
  await db
    .insert(idempotencyKeys)
    .values({ idempotencyKey: key, assessmentId })
    .onConflictDoNothing();
}

export async function findPersistedIdempotencyKey(key: string): Promise<string | undefined> {
  const db = getDatabase();
  const [row] = await db
    .select()
    .from(idempotencyKeys)
    .where(eq(idempotencyKeys.idempotencyKey, key))
    .limit(1);
  return row?.assessmentId;
}

export async function getPersistedSimulation(): Promise<Simulation> {
  const db = getDatabase();
  const [row] = await db.select().from(runtimeSimulation).limit(1);
  return {
    statusOverride: (row?.statusOverride ?? "none") as StatusOverride,
    source: (row?.source ?? "Web Server") as LogSource,
  };
}

export async function persistSimulation(simulation: Simulation): Promise<void> {
  const db = getDatabase();
  await db
    .insert(runtimeSimulation)
    .values({
      singleton: true,
      statusOverride: simulation.statusOverride,
      source: simulation.source,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: runtimeSimulation.singleton,
      set: {
        statusOverride: simulation.statusOverride,
        source: simulation.source,
        updatedAt: new Date(),
      },
    });
}
