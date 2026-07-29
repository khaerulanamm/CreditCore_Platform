import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — CreditCore Platform" },
      {
        name: "description",
        content: "Delivered, in-progress, and planned capabilities of the CreditCore Platform.",
      },
      { property: "og:title", content: "Roadmap — CreditCore Platform" },
      {
        property: "og:description",
        content: "Delivered, in-progress, and planned capabilities of the CreditCore Platform.",
      },
    ],
  }),
  component: RoadmapPage,
});

type Status = "done" | "in-progress" | "planned";

const phases: { title: string; status: Status; items: string[] }[] = [
  {
    title: "Phase 1 — Foundation",
    status: "done",
    items: [
      "Business API endpoints (assessments, credit-scores, status)",
      "Infrastructure endpoints (health, observability, dashboard)",
      "Flat camelCase request/response contracts",
      "Immutable audit trail with correlation IDs",
    ],
  },
  {
    title: "Phase 2 — Simulation & Observability",
    status: "done",
    items: [
      "Global status code simulation (400/401/404/429/500/503)",
      "Traffic source tagging (Web Server · Postman · n8n)",
      "Endpoint playground with expandable log rows",
      "Live business KPI dashboard (approval/manual-review/rejection, request rate, error rate, P95/P99)",
      "Idempotency key protection on assessment creation",
      "Versioned /api/v1 routes with legacy compatibility",
    ],
  },
  {
    title: "Phase 3 — Enterprise UX",
    status: "done",
    items: [
      "Refined information architecture and sidebar",
      "Health probe page with continuous polling",
      "Architecture, Business Logic, API Docs, About",
      "Explainable credit score breakdown on every assessment",
    ],
  },
  {
    title: "Phase 4 — Production Readiness",
    status: "done",
    items: [
      "Production-readiness checklist with implemented rate limiting, idempotency, Docker and HTTPS",
      "PostgreSQL migration plan and target schema documented",
      "Dashboard skeleton loading states and hover micro-interactions",
    ],
  },
  {
    title: "Phase 5 — Extensibility",
    status: "planned",
    items: [
      "JWT authentication and RBAC",
      "Webhook publishing for scoring events",
      "OpenAPI-driven client SDK generation",
      "Persistent repository adapter (Prisma) implementation",
    ],
  },
  {
    title: "Phase 6 — Observability+",
    status: "planned",
    items: [
      "Structured log export (NDJSON)",
      "Prometheus metrics endpoint",
      "Distributed trace propagation",
    ],
  },
];

const meta: Record<
  Status,
  { icon: React.ComponentType<{ className?: string }>; label: string; tone: string }
> = {
  done: { icon: CheckCircle2, label: "Delivered", tone: "bg-success/15 text-success" },
  "in-progress": {
    icon: Loader2,
    label: "In progress",
    tone: "bg-warning/15 text-warning-foreground",
  },
  planned: { icon: Circle, label: "Planned", tone: "bg-muted text-muted-foreground" },
};

function RoadmapPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Roadmap</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Milestones for the CreditCore Platform, evolved incrementally from an academic prototype
          into a production-oriented portfolio platform.
        </p>
      </header>

      <div className="relative space-y-6 border-l border-border/60 pl-6">
        {phases.map((p) => {
          const m = meta[p.status];
          const Icon = m.icon;
          return (
            <div key={p.title} className="relative">
              <div className="absolute -left-[33px] top-2 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background">
                <Icon className={`h-3 w-3 ${p.status === "in-progress" ? "animate-spin" : ""}`} />
              </div>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{p.title}</CardTitle>
                    <Badge className={m.tone}>{m.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {p.items.map((it) => (
                      <li key={it} className="flex items-start gap-2">
                        <span className="mt-2 h-1 w-1 rounded-full bg-primary" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
