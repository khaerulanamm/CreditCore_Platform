import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Circle,
  Clock,
  Database,
  Dock,
  GitBranch,
  Globe,
  KeyRound,
  Repeat,
  ShieldCheck,
  Timer,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Production Readiness — CreditCore Platform" },
      {
        name: "description",
        content: "Security and production-readiness roadmap for the CreditCore Platform.",
      },
      { property: "og:title", content: "Production Readiness — CreditCore Platform" },
      {
        property: "og:description",
        content: "Security and production-readiness roadmap for the CreditCore Platform.",
      },
    ],
  }),
  component: SecurityPage,
});

type ReadinessStatus = "Implemented" | "Planned" | "Coming Soon";

type ReadinessItem = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: ReadinessStatus;
  detail: string;
};

const items: ReadinessItem[] = [
  {
    name: "JWT Authentication",
    icon: KeyRound,
    status: "Planned",
    detail:
      "Bearer token issuance and verification for all business endpoints, replacing the current open sandbox access.",
  },
  {
    name: "RBAC (Role-Based Access Control)",
    icon: Users,
    status: "Planned",
    detail:
      "Separate Risk Analyst, Admin, and Read-Only roles with scoped permissions per endpoint.",
  },
  {
    name: "Rate Limiting",
    icon: Timer,
    status: "Implemented",
    detail:
      "A real in-memory sliding-window guard limits business traffic to 3 requests per 5 seconds and returns HTTP 429 with Retry-After.",
  },
  {
    name: "Idempotency Keys",
    icon: Repeat,
    status: "Implemented",
    detail:
      "POST /api/v1/assessments accepts X-Idempotency-Key and replays the original assessment for duplicate keys within 24 hours.",
  },
  {
    name: "PostgreSQL",
    icon: Database,
    status: "Coming Soon",
    detail:
      "Persistent repository adapter replacing the in-memory store — see the Data Layer page for the migration plan.",
  },
  {
    name: "Redis",
    icon: GitBranch,
    status: "Coming Soon",
    detail:
      "Caching layer for dashboard aggregates and a distributed store for rate-limit counters.",
  },
  {
    name: "Docker",
    icon: Dock,
    status: "Implemented",
    detail:
      "Dockerfile and docker-compose.yml already ship in the repository for containerized local/prod runs.",
  },
  {
    name: "HTTPS",
    icon: Globe,
    status: "Implemented",
    detail: "Enforced automatically by the Vercel deployment target.",
  },
  {
    name: "CI/CD",
    icon: ShieldCheck,
    status: "Planned",
    detail:
      "GitHub Actions pipeline for lint, typecheck, and build on every push before Vercel deployment.",
  },
];

const statusMeta: Record<
  ReadinessStatus,
  { icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  Implemented: { icon: CheckCircle2, tone: "bg-success/15 text-success" },
  Planned: { icon: Clock, tone: "bg-warning/15 text-warning-foreground" },
  "Coming Soon": { icon: Circle, tone: "bg-muted text-muted-foreground" },
};

function SecurityPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Production Readiness
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          Security &amp; Production Readiness
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The hardening checklist between this sandbox and a real production deployment.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          const status = statusMeta[item.status];
          const StatusIcon = status.icon;
          return (
            <Card key={item.name}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm">{item.name}</CardTitle>
                </div>
                <Badge className={`shrink-0 gap-1 ${status.tone}`}>
                  <StatusIcon className="h-3 w-3" />
                  {item.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
