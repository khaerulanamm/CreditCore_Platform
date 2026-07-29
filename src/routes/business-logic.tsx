import { createFileRoute } from "@tanstack/react-router";
import { Calculator, GitBranch, Scale, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export const Route = createFileRoute("/business-logic")({ component: BusinessLogicPage });
function BusinessLogicPage() {
  const vars = [
    ["SLIK OJK", "40%", "Kol.1=100 · Kol.2=50 · Kol.3–5=0"],
    ["Monthly Income", "30%", "SI = min(100, I / Rp50.000.000 × 100)"],
    ["Employment Length", "20%", "SE = min(100, E / 60 × 100)"],
    ["Dependents", "10%", "SD = max(0, 100 − D × 20)"],
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Single Source of Truth
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold">Business Logic</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deterministic Rule-Based Weighted Linear Scoring Model used by the live API.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 text-sm">
              <Calculator className="h-4 w-4 text-primary" />
              Variable Normalization & Weights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {vars.map((v) => (
              <div key={v[0]} className="rounded-md border p-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span>{v[0]}</span>
                  <Badge variant="outline">{v[1]}</Badge>
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{v[2]}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 text-sm">
              <Scale className="h-4 w-4 text-primary" />
              Weighted Scoring Formula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 font-mono text-xs">
              Credit Score = 300 + 5.5 × (0.40×S_SLIK + 0.30×S_I + 0.20×S_E + 0.10×S_D)
            </pre>
            <p className="mt-3 text-xs text-muted-foreground">
              The weighted sub-score is 0–100. Multiplying by 5.5 maps it to 0–550, then the
              300-point base produces the 300–850 credit-score range.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 text-sm">
              <GitBranch className="h-4 w-4 text-primary" />
              Risk Grade & Decision Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Rule range="750–850" grade="Low Risk" decision="APPROVED" code="RC-001" />
            <Rule range="600–749" grade="Medium Risk" decision="MANUAL_REVIEW" code="RC-002" />
            <Rule range="300–599" grade="High Risk" decision="REJECTED" code="RC-003" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Hard Gate & Assessment Lifecycle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-muted-foreground">
            <p>
              <b className="text-foreground">Hard Gate:</b> SLIK Kolektibilitas 3–5 forces score
              300, decision REJECTED, reason code RC-OJK-COL3-5.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">SUBMITTED</Badge>→<Badge variant="outline">SCORING</Badge>→
              <Badge variant="outline">APPROVED</Badge>/
              <Badge variant="outline">MANUAL_REVIEW</Badge>/
              <Badge variant="outline">REJECTED</Badge>
            </div>
            <p>
              MANUAL_REVIEW is a non-final state. A Risk Analyst can subsequently transition it to
              APPROVED or REJECTED through the status endpoint.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function Rule({
  range,
  grade,
  decision,
  code,
}: {
  range: string;
  grade: string;
  decision: string;
  code: string;
}) {
  return (
    <div className="grid grid-cols-[70px_1fr_1fr_70px] gap-2 rounded-md border p-3 text-xs">
      <span className="font-mono">{range}</span>
      <span>{grade}</span>
      <b>{decision}</b>
      <span className="font-mono">{code}</span>
    </div>
  );
}
