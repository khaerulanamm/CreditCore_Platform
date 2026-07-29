import { createFileRoute } from "@tanstack/react-router";
import {
  beginRequest,
  fail,
  finish,
  optionsResponse,
  runSimulations,
} from "@/lib/server/api-runtime.server";
import {
  findAssessment,
  isValidStatusTransition,
  updateAssessmentStatus,
  type AssessmentStatus,
} from "@/lib/server/store.server";
import {
  findPersistedAssessment,
  persistAssessmentStatus,
} from "@/lib/server/repositories/postgres.server";

const ALLOWED: AssessmentStatus[] = [
  "SUBMITTED",
  "SCORING",
  "MANUAL_REVIEW",
  "APPROVED",
  "REJECTED",
  "FAILED",
];

export const Route = createFileRoute("/api/v1/assessments/$assessmentId/status")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => optionsResponse(await beginRequest(request)),
      PATCH: async ({ request, params }) => {
        const ctx = await beginRequest(request);
        const sim = runSimulations(ctx, { isBusiness: true });
        if (sim) return sim;
        const body = (ctx.requestBody ?? {}) as { status?: string };
        if (!body.status || !ALLOWED.includes(body.status as AssessmentStatus)) {
          return fail(
            ctx,
            400,
            "DATA_CONTRACT_VIOLATION",
            `Field "status" must be one of: ${ALLOWED.join(", ")}`,
          );
        }
        const persistedCurrent = await findPersistedAssessment(params.assessmentId);
        const inMemoryCurrent = findAssessment(params.assessmentId);
        const current = persistedCurrent ?? inMemoryCurrent;
        if (!current)
          return fail(
            ctx,
            404,
            "RESOURCE_NOT_FOUND",
            `Assessment ${params.assessmentId} not found.`,
          );

        const nextStatus = body.status as AssessmentStatus;
        if (!isValidStatusTransition(current.status, nextStatus)) {
          return fail(
            ctx,
            409,
            "INVALID_STATUS_TRANSITION",
            `Assessment ${params.assessmentId} cannot move from ${current.status} to ${nextStatus}.`,
          );
        }

        if (persistedCurrent) {
          const persisted = await persistAssessmentStatus(
            params.assessmentId,
            nextStatus,
            new Date().toISOString(),
          );
          if (!persisted)
            return fail(
              ctx,
              404,
              "RESOURCE_NOT_FOUND",
              `Assessment ${params.assessmentId} not found.`,
            );
          if (inMemoryCurrent) updateAssessmentStatus(params.assessmentId, nextStatus);
          return finish(ctx, 200, persisted);
        }

        const a = updateAssessmentStatus(params.assessmentId, nextStatus);
        if (!a)
          return fail(
            ctx,
            404,
            "RESOURCE_NOT_FOUND",
            `Assessment ${params.assessmentId} not found.`,
          );
        return finish(ctx, 200, a);
      },
    },
  },
});
