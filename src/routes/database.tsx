import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Database, Table2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/database")({
  head: () => ({
    meta: [
      { title: "Data Layer — CreditCore Platform" },
      {
        name: "description",
        content: "PostgreSQL migration plan for the CreditCore Platform's data layer.",
      },
      { property: "og:title", content: "Data Layer — CreditCore Platform" },
      {
        property: "og:description",
        content: "PostgreSQL migration plan for the CreditCore Platform's data layer.",
      },
    ],
  }),
  component: DatabasePage,
});

const tables = [
  {
    name: "assessments",
    columns:
      "assessment_id (pk), account_id, borrower_name, requested_amount, monthly_income, employment_length_months, purpose_of_loan, number_of_dependents, slik_status, status, created_at, updated_at",
  },
  {
    name: "credit_scores",
    columns:
      "assessment_id (fk → assessments), credit_score, risk_grade, decision, probability_of_default, computed_at",
  },
  {
    name: "api_logs",
    columns:
      "log_id (pk), correlation_id, request_id, source, method, endpoint, status_code, latency_ms, created_at",
  },
];

function DatabasePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Data Layer
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          PostgreSQL Integration Plan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The current sandbox runs on an in-memory store. This is the planned migration to a
          persistent PostgreSQL repository via Prisma.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4 text-primary" /> Current State
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>In-memory JavaScript store, reset on every server restart.</p>
            <p>Seeded with 12 sample assessments for demonstration.</p>
            <Badge variant="outline" className="mt-1">
              Current
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ArrowRight className="h-4 w-4 text-primary" /> Target State
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Prisma ORM over PostgreSQL, with the exact same REST response shapes.</p>
            <p>No breaking changes to API contracts or TanStack Start routing.</p>
            <Badge className="mt-1 bg-warning/15 text-warning-foreground">Planned</Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Table2 className="h-4 w-4 text-primary" /> Planned Schema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tables.map((t) => (
            <div key={t.name} className="rounded-lg border border-border/60 p-3">
              <p className="font-mono text-xs font-semibold text-foreground">{t.name}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{t.columns}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Migration Approach</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Introduce a Prisma schema mirroring the tables above.</li>
            <li>
              2. Swap the in-memory repository functions in{" "}
              <span className="font-mono text-[11px]">store.server.ts</span> for Prisma Client
              calls, one endpoint at a time.
            </li>
            <li>
              3. Keep every route handler's request/response contract byte-for-byte identical.
            </li>
            <li>
              4. Run the existing Postman collection against both implementations to confirm parity
              before switching over.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
