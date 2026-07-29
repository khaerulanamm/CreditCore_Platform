import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, CheckCircle2, RefreshCw, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHealth } from "@/lib/scoring-api";
import { useStore } from "@/lib/scoring-store";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Health Probe — CreditCore Platform" },
      {
        name: "description",
        content: "Live health probe for the CreditCore Platform scoring engine.",
      },
      { property: "og:title", content: "Health Probe — CreditCore Platform" },
      {
        property: "og:description",
        content: "Live health probe for the CreditCore Platform scoring engine.",
      },
    ],
  }),
  component: HealthPage,
});

function HealthPage() {
  const dashboard = useStore((s) => s.dashboard);
  const [state, setState] = useState<{ statusCode: number; statusText: string; latency: number; body: unknown } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlight = useRef(false);

  const ping = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    const started = performance.now();
    try {
      const res = await getHealth(8000);
      const latency = Math.round(performance.now() - started);
      if (!res.ok) {
        const message = res.status === 0
          ? "Health probe could not reach the API."
          : `Health probe failed (${res.errorCode ?? `HTTP_${res.status}`}).`;
        setError(message);
        setState({ statusCode: res.status, statusText: "ERROR", latency, body: res.data });
        return;
      }
      setState({ statusCode: res.status, statusText: "OK", latency, body: res.data });
    } catch (e) {
      const latency = Math.round(performance.now() - started);
      setError(e instanceof Error ? e.message : String(e));
      setState({ statusCode: 0, statusText: "ERROR", latency, body: {} });
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void ping();
    const id = window.setInterval(() => void ping(), 15000);
    return () => window.clearInterval(id);
  }, [ping]);

  const up = state?.statusCode === 200;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">System Health</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Continuous probe against <code className="font-mono text-xs">GET /api/v1/health</code>.
            Auto-refreshes every 15 seconds.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={ping} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Probe now
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Server className="h-4 w-4" /> Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-lg">credit-scoring-engine</div>
            <div className="mt-1 text-xs text-muted-foreground">CreditCore Platform</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" /> Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={
                up
                  ? "bg-success text-success-foreground"
                  : "bg-destructive text-destructive-foreground"
              }
            >
              {loading && !state ? "PROBING…" : up ? "HEALTHY" : "UNHEALTHY"}
            </Badge>
            <div className="mt-2 text-xs text-muted-foreground">
              Status code: {state?.statusCode ? `${state.statusCode} ${state.statusText}` : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4" /> Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl">{state ? `${state.latency} ms` : "—"}</div>
            <div className="mt-1 text-xs text-muted-foreground">Round trip from browser</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Raw response</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">{error}</div>
          ) : (
            <pre className="max-h-80 overflow-auto rounded-md bg-muted p-4 font-mono text-xs">
              {JSON.stringify(state?.body ?? {}, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
