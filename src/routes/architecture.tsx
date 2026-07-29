import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Cloud, Database, Layers, Network, Server, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture — CreditCore Platform" },
      {
        name: "description",
        content:
          "Enterprise architecture of the CreditCore Platform: client layer, REST gateway, services, and repository.",
      },
      { property: "og:title", content: "Architecture — CreditCore Platform" },
      {
        property: "og:description",
        content:
          "Enterprise architecture of the CreditCore Platform: client layer, REST gateway, services, and repository.",
      },
    ],
  }),
  component: ArchitecturePage,
});

function Layer({
  icon: Icon,
  title,
  subtitle,
  items,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  items: string[];
  tone?: "default" | "primary" | "accent";
}) {
  const toneMap = {
    default:
      "border-[color:color-mix(in_oklab,var(--chart-blue)_28%,transparent)] bg-[color:color-mix(in_oklab,var(--chart-blue)_7%,var(--color-card))]",
    primary:
      "border-[color:color-mix(in_oklab,var(--chart-purple)_38%,transparent)] bg-[color:color-mix(in_oklab,var(--chart-purple)_10%,var(--color-card))]",
    accent:
      "border-[color:color-mix(in_oklab,var(--chart-green)_34%,transparent)] bg-[color:color-mix(in_oklab,var(--chart-green)_8%,var(--color-card))]",
  } as const;
  return (
    <Card className={toneMap[tone]}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {items.map((it) => (
          <div
            key={it}
            className="rounded-md border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs"
          >
            {it}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        <div className="h-px w-10 bg-border" />
        {label}
        <div className="h-px w-10 bg-border" />
      </div>
    </div>
  );
}

function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Enterprise Architecture
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Layered view of the CreditCore Platform: how requests flow from clients through the REST
          gateway into the scoring engine and repository.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Layer
          icon={Cloud}
          title="Client Layer"
          subtitle="Consumers"
          items={[
            "CreditCore Web Dashboard (Browser)",
            "Postman Collection",
            "n8n Workflow",
            "cURL / External Clients",
          ]}
        />
        <Layer
          icon={Network}
          title="Communication"
          subtitle="Protocol"
          items={["HTTPS", "REST API", "JSON payloads (camelCase)", "Correlation ID headers"]}
        />
      </div>

      <Arrow label="HTTP" />

      <Card className="border-primary/40 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero text-white">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">CreditCore Platform Server</CardTitle>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                TanStack Start · Server Routes
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
              Business API
            </div>
            <div className="grid gap-2">
              {[
                "POST   /api/v1/assessments",
                "GET    /api/v1/assessments/{assessmentId}",
                "GET    /api/v1/credit-scores/{assessmentId}",
                "PATCH  /api/v1/assessments/{assessmentId}/status",
              ].map((r) => (
                <div
                  key={r}
                  className="rounded-md border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs"
                >
                  {r}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
              Infrastructure API
            </div>
            <div className="grid gap-2">
              {[
                "GET    /api/v1/health",
                "GET    /api/v1/observability/logs",
                "GET    /api/v1/dashboard",
                "GET/PUT /api/v1/simulation",
              ].map((r) => (
                <div
                  key={r}
                  className="rounded-md border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs"
                >
                  {r}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Arrow label="invokes" />

      <div className="grid gap-4 md:grid-cols-3">
        <Layer
          icon={Layers}
          title="Credit Scoring Engine"
          subtitle="Service"
          items={[
            "Variable normalization (0–100)",
            "Weighted scoring 40/30/20/10",
            "SLIK hard gate + decision policy",
          ]}
          tone="accent"
        />
        <Layer
          icon={Shield}
          title="Mock SLIK OJK"
          subtitle="Service"
          items={["Kolektibilitas 1–5", "Historical mock lookup", "Regulatory flags"]}
          tone="accent"
        />
        <Layer
          icon={Boxes}
          title="Observability Logging"
          subtitle="Service"
          items={[
            "Structured audit trail",
            "Request + Correlation ID tracking",
            "Latency + status capture",
          ]}
          tone="accent"
        />
      </div>

      <Arrow label="persists" />

      <Layer
        icon={Database}
        title="Mock Assessment Repository"
        subtitle="Repository"
        items={["In-memory server store", "Assessments · Scores · Logs", "Deterministic seed data"]}
      />
    </div>
  );
}
