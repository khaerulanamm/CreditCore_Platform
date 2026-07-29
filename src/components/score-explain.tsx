import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { explainScore } from "@/lib/score-explain";
type Props = {
  monthlyIncome: number;
  employmentLengthMonths: number;
  numberOfDependents: number;
  slikStatus: string;
  requestedAmount?: number;
};
export function ScoreExplain(props: Props) {
  const x = explainScore(props);
  const rows = [
    ["SLIK OJK", x.slik],
    ["Monthly Income", x.income],
    ["Employment Length", x.employment],
    ["Dependents", x.dependents],
  ] as const;
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Score breakdown
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          Rule-Based Weighted Linear
        </Badge>
      </div>
      <div className="space-y-2">
        {rows.map(([label, v]) => (
          <div
            key={label}
            className="grid grid-cols-[1fr_60px_60px_80px] items-center gap-2 rounded-md border border-border/50 px-3 py-2 text-xs"
          >
            <span className="font-medium">{label}</span>
            <span className="font-mono text-muted-foreground">{v.subScore}</span>
            <span className="font-mono text-muted-foreground">{Math.round(v.weight * 100)}%</span>
            <span className="text-right font-mono font-semibold">{v.contribution}</span>
          </div>
        ))}
        <div className="mt-3 rounded-md bg-muted/50 p-3 text-xs">
          <p className="font-mono">
            Score = 300 + 5.5 × ({x.weightedSubScore}) = <b>{x.finalScore}</b>
          </p>
          {x.hardGateApplied && (
            <p className="mt-1 text-destructive">
              Hard Gate applied: SLIK Kolektibilitas 3–5 → score 300 and REJECTED.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
