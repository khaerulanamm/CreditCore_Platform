import { createFileRoute } from "@tanstack/react-router";

function id(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Lightweight liveness endpoint.
 *
 * Deliberately does not touch the scoring store, simulation engine, rate limiter,
 * dashboard aggregation, or observability log. A liveness probe must answer
 * quickly even when higher-level application services are unhealthy.
 */
export const Route = createFileRoute("/api/v1/health")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => {
        const requestId = request.headers.get("x-request-id") ?? id();
        const correlationId = request.headers.get("x-correlation-id") ?? id();
        return new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET,OPTIONS",
            "access-control-allow-headers":
              "content-type,x-client-type,x-correlation-id,x-request-id",
            "x-request-id": requestId,
            "x-correlation-id": correlationId,
          },
        });
      },
      GET: async ({ request }) => {
        const started = performance.now();
        const requestId = request.headers.get("x-request-id") ?? id();
        const correlationId = request.headers.get("x-correlation-id") ?? id();
        const body = {
          success: true,
          data: {
            status: "UP",
            service: "credit-scoring-engine",
            version: "1.0.0",
            uptimeSeconds: Math.round(process.uptime()),
          },
          error: null,
          meta: {
            requestId,
            correlationId,
            timestamp: new Date().toISOString(),
            latencyMs: Math.max(0, Math.round(performance.now() - started)),
            path: "/api/v1/health",
            method: "GET",
            source: "Health Probe",
          },
        };
        const serverMs = Math.max(0, performance.now() - started);
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
            "x-service": "credit-scoring-engine",
            "x-request-id": requestId,
            "x-correlation-id": correlationId,
            "server-timing": `app;dur=${serverMs.toFixed(2)}`,
            "access-control-allow-origin": "*",
          },
        });
      },
    },
  },
});
