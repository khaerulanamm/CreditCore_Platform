import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/api-docs")({
  head: () => ({
    meta: [
      { title: "API Documentation — CreditCore Platform" },
      {
        name: "description",
        content: "REST endpoints, contracts, and status codes for the CreditCore Platform.",
      },
      { property: "og:title", content: "API Documentation — CreditCore Platform" },
      {
        property: "og:description",
        content: "REST endpoints, contracts, and status codes for the CreditCore Platform.",
      },
    ],
  }),
  component: ApiDocsPage,
});

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  path: string;
  summary: string;
  request?: string;
  response: string;
};

const methodTone: Record<Endpoint["method"], string> = {
  GET: "bg-primary/15 text-primary",
  POST: "bg-success/15 text-success",
  PATCH: "bg-warning/15 text-warning-foreground",
  PUT: "bg-warning/15 text-warning-foreground",
  DELETE: "bg-destructive/15 text-destructive",
};

const business: Endpoint[] = [
  {
    method: "POST",
    path: "/api/v1/assessments",
    summary: "Create a new credit assessment.",
    request: `{
  "accountId": "ACC-2026-0042",
  "borrowerName": "Anam Setiawan",
  "requestedAmount": 10000000,
  "monthlyIncome": 15000000,
  "employmentLengthMonths": 24,
  "purposeOfLoan": "Business Venture",
  "numberOfDependents": 2,
  "slikStatus": "Kolektibilitas 1"
}`,
    response: `HTTP 201 Created
{
  "assessmentId": "ASM-2026-0001",
  "status": "MANUAL_REVIEW",
  "createdAt": "2026-07-09T22:15:32+07:00"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/assessments/{assessmentId}",
    summary: "Retrieve the full assessment record.",
    response: `HTTP 200 OK — full assessment object`,
  },
  {
    method: "GET",
    path: "/api/v1/credit-scores/{assessmentId}",
    summary: "Retrieve the scoring result for an assessment.",
    response: `HTTP 200 OK
{
  "creditScore": 647,
  "riskGrade": "Medium",
  "slikStatus": "Kolektibilitas 1",
  "decision": "MANUAL_REVIEW",
  "probabilityOfDefault": 0.369,
  "reasonCode": "RC-002"
}`,
  },
  {
    method: "PATCH",
    path: "/api/v1/assessments/{assessmentId}/status",
    summary: "Update the processing lifecycle status.",
    request: `{ "status": "APPROVED" }`,
    response: `HTTP 200 OK — updated assessment`,
  },
];

const infra: Endpoint[] = [
  {
    method: "GET",
    path: "/api/v1/health",
    summary: "Health probe.",
    response: `{ "status": "UP", "service": "credit-scoring-engine" }`,
  },
  {
    method: "GET",
    path: "/api/v1/observability/logs",
    summary: "Immutable audit trail.",
    response: `HTTP 200 OK — [ { correlationId, method, path, status, latencyMs, ... } ]`,
  },
  {
    method: "GET",
    path: "/api/v1/dashboard",
    summary: "Aggregated business metrics.",
    response: `HTTP 200 OK — dashboard object`,
  },
  {
    method: "GET",
    path: "/api/v1/simulation",
    summary: "Read simulation control state.",
    response: `HTTP 200 OK`,
  },
  {
    method: "PUT",
    path: "/api/v1/simulation",
    summary: "Update status / source overrides.",
    response: `HTTP 200 OK`,
  },
];

const statuses = [
  { code: 200, label: "OK", note: "Successful GET / PATCH." },
  { code: 201, label: "Created", note: "Assessment accepted." },
  { code: 400, label: "DATA_CONTRACT_VIOLATION", note: "Payload violates the request contract." },
  { code: 401, label: "UNAUTHORIZED", note: "Simulated auth failure." },
  { code: 404, label: "RESOURCE_NOT_FOUND", note: "Unknown assessment / endpoint." },
  { code: 429, label: "RATE_LIMIT_EXCEEDED", note: "Business endpoints throttled." },
  { code: 500, label: "SYSTEM_FAILURE", note: "Simulated application error." },
  { code: 503, label: "SERVICE_UNAVAILABLE", note: "Simulated infrastructure outage." },
];

function EndpointCard({ e }: { e: Endpoint }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Badge className={`${methodTone[e.method]} font-mono`}>{e.method}</Badge>
          <code className="font-mono text-sm">{e.path}</code>
        </div>
        <p className="pt-1 text-xs text-muted-foreground">{e.summary}</p>
      </CardHeader>
      <CardContent className="grid gap-3">
        {e.request && (
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
              Request body
            </div>
            <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
              {e.request}
            </pre>
          </div>
        )}
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            Response
          </div>
          <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
            {e.response}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">API Documentation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contracts for every REST endpoint exposed by the CreditCore Platform. All payloads are
          flat JSON in camelCase.
        </p>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-sm">Protocol & Required Headers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            <code>Content-Type: application/json</code>
          </p>
          <p>
            <code>X-Correlation-ID: UUIDv4</code> — optional; generated by server when absent.
          </p>
          <p>
            <code>X-Idempotency-Key: UUIDv4</code> — recommended for POST assessment; duplicate keys
            replay the original resource for 24 hours.
          </p>
          <p>
            Primary API version: <code>/api/v1</code>. Legacy <code>/api</code> routes remain
            available for backward compatibility.
          </p>
          <p>
            Error responses keep the CreditCore envelope and include RFC 7807-compatible problem
            fields: <code>type, title, status, detail, instance</code>.
          </p>
        </CardContent>
      </Card>

      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
          Business API
        </h2>
        <div className="grid gap-4">
          {business.map((e) => (
            <EndpointCard key={e.path + e.method} e={e} />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
          Infrastructure API
        </h2>
        <div className="grid gap-4">
          {infra.map((e) => (
            <EndpointCard key={e.path + e.method} e={e} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          HTTP Status Codes
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {statuses.map((s) => (
                <div key={s.code} className="flex items-center gap-4 px-4 py-3 text-sm">
                  <Badge variant="outline" className="font-mono">
                    {s.code}
                  </Badge>
                  <div className="font-mono text-xs text-foreground">{s.label}</div>
                  <div className="ml-auto text-xs text-muted-foreground">{s.note}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
