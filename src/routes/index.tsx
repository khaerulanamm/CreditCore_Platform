import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  FilePlus2,
  Gauge,
  TrendingUp,
  ShieldAlert,
  Timer,
  TriangleAlert,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/scoring-store";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
export const Route = createFileRoute("/")({ component: DashboardOverview });
function DashboardOverview() {
  const d = useStore((s) => s.dashboard);
  const stats = [
    ["Total Assessments", d?.totalAssessments ?? 0, Activity, "All submitted cases"],
    ["Approval Rate", `${d?.approvalRate ?? 0}%`, TrendingUp, `${d?.approvedCount ?? 0} approved`],
    [
      "Manual Review Rate",
      `${d?.manualReviewRate ?? 0}%`,
      ShieldAlert,
      `${d?.manualReviewCount ?? 0} require analyst review`,
    ],
    [
      "Rejected Rate",
      `${d?.rejectedRate ?? 0}%`,
      TriangleAlert,
      `${d?.rejectedCount ?? 0} rejected`,
    ],
    ["Average Credit Score", d?.averageCreditScore || "—", Gauge, "Portfolio mean"],
    ["Request Rate", `${d?.requestRate ?? 0}/min`, Activity, "Last 60 minutes"],
    ["Error Rate", `${d?.errorRate ?? 0}%`, TriangleAlert, "HTTP 4xx/5xx"],
    ["P95 Latency", `${d?.p95LatencyMs ?? 0} ms`, Timer, `P99 ${d?.p99LatencyMs ?? 0} ms`],
  ] as const;
  if (!d) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl gradient-hero p-8 text-white shadow-elegant">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">
                CreditCore · Business Platform
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold">
                Credit Decisioning & API Operations
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80">
                Monitor portfolio decisions, scoring quality, REST traffic, reliability, and
                traceable assessment outcomes from one console.
              </p>
            </div>
          </div>
        </section>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <Skeleton className="mt-3 h-7 w-16" />
                <Skeleton className="mt-2 h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl gradient-hero p-8 text-white shadow-elegant">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70">
              CreditCore · Business Platform
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold">
              Credit Decisioning & API Operations
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              Monitor portfolio decisions, scoring quality, REST traffic, reliability, and traceable
              assessment outcomes from one console.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link to="/assessment">
              <FilePlus2 className="mr-2 h-4 w-4" />
              New Assessment
            </Link>
          </Button>
        </div>
      </section>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, Icon, hint]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Assessment Trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={d?.assessmentTrend ?? []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--chart-blue)"
                strokeWidth={3}
                dot={{ fill: "var(--chart-blue)", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Risk Grade Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d?.riskDistribution ?? []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--chart-purple)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Decision Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={d?.decisionDistribution ?? []}
                dataKey="value"
                nameKey="name"
                outerRadius={75}
                label
              >
                {(d?.decisionDistribution ?? []).map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      [
                        "var(--chart-green)",
                        "var(--chart-amber)",
                        "var(--chart-red)",
                        "var(--chart-blue)",
                      ][i % 4]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Reliability</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Mini label="Success Rate" value={`${d?.apiSuccessRate ?? 100}%`} icon={CheckCircle2} />
            <Mini label="Average Latency" value={`${d?.averageLatencyMs ?? 0} ms`} icon={Timer} />
            <Mini label="P95" value={`${d?.p95LatencyMs ?? 0} ms`} icon={Timer} />
            <Mini label="P99" value={`${d?.p99LatencyMs ?? 0} ms`} icon={Timer} />
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  {["Assessment ID", "Borrower", "Score", "Risk Grade", "Decision", "Status"].map(
                    (h) => (
                      <th key={h} className="border-b p-2">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {(d?.recentAssessments ?? []).map((a) => (
                  <tr key={a.assessmentId} className="border-b border-border/50">
                    <td className="p-2 font-mono">{a.assessmentId}</td>
                    <td className="p-2">{a.borrowerName}</td>
                    <td className="p-2 font-mono">{a.score?.creditScore}</td>
                    <td className="p-2">{a.score?.riskGrade}</td>
                    <td className="p-2 font-semibold">{a.score?.decision}</td>
                    <td className="p-2">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
function Mini({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 text-[11px] text-muted-foreground">{label}</p>
      <p className="font-mono text-lg font-semibold">{value}</p>
    </div>
  );
}
