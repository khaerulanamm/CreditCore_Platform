import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Code2, GraduationCap, Layers, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CreditCore Platform" },
      {
        name: "description",
        content:
          "About the CreditCore Platform — a production-oriented credit decisioning and observability portfolio platform.",
      },
      { property: "og:title", content: "About — CreditCore Platform" },
      {
        property: "og:description",
        content:
          "About the CreditCore Platform — a production-oriented credit decisioning and observability portfolio platform.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 overflow-hidden rounded-2xl gradient-hero p-8 text-white shadow-elegant">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest opacity-80">
          <GraduationCap className="h-4 w-4" /> Origin: Independent Portfolio · Evolved as Portfolio
          Project
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          CreditCore Platform
        </h1>
        <p className="mt-2 max-w-2xl text-sm opacity-90">
          A credit decisioning sandbox that began as an academic mini-project and is now iteratively
          developed as a backend/API and observability portfolio case study.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Layers className="h-4 w-4 text-primary" /> Purpose
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Provide a realistic REST API that any client — Web Server, Postman, n8n, cURL — can
            consume identically, so reviewers can inspect protocol design, business rules,
            contracts, reliability, and observability in a controlled environment.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Code2 className="h-4 w-4 text-primary" /> Stack
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5 text-xs">
            {["TanStack Start", "React 19", "TypeScript", "Tailwind v4", "shadcn/ui", "Zod"].map(
              (t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ),
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" /> Scope
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Mock-only. No real borrower data, no external credit bureau integration. SLIK OJK
            statuses and scoring outputs are simulated for educational demonstration.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-primary" /> Learning Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            REST semantics, HTTP status negotiation, request contract validation, rate limiting,
            correlation-based observability, and multi-client interoperability.
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Project Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <Row label="Project" value="CreditCore Platform" />
          <Row label="Course" value="Independent Portfolio" />
          <Row label="Environment" value="Production" />
          <Row label="Version" value="v2.2.0" />
          <Row label="License" value="Portfolio Project" />
          <Row label="Data" value="Deterministic mock seed" />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}
