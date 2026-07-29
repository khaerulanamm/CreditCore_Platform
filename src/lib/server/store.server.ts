// Server-side authoritative store for CreditCore.
// Business rules here are the single source of truth for scoring and lifecycle.

export type AssessmentStatus =
  "SUBMITTED" | "SCORING" | "MANUAL_REVIEW" | "APPROVED" | "REJECTED" | "FAILED";
export type RiskGrade = "Low" | "Medium" | "High";
export type Decision = "APPROVED" | "MANUAL_REVIEW" | "REJECTED";
export type ReasonCode = "RC-001" | "RC-002" | "RC-003" | "RC-OJK-COL3-5";
export type LogSource = "Web Server" | "Postman" | "n8n Webhook" | "curl" | "Webhook" | "Unknown";
export type StatusOverride = "none" | "400" | "401" | "404" | "429" | "500" | "503";

export type ScoreBreakdown = {
  slik: { subScore: number; weight: 0.4; contribution: number };
  income: { subScore: number; weight: 0.3; contribution: number };
  employment: { subScore: number; weight: 0.2; contribution: number };
  dependents: { subScore: number; weight: 0.1; contribution: number };
  weightedSubScore: number;
};
export type CreditScoreResult = {
  creditScore: number;
  riskGrade: RiskGrade;
  slikStatus: string;
  decision: Decision;
  probabilityOfDefault: number;
  reasonCode: ReasonCode;
  reason: string;
  hardGateApplied: boolean;
  breakdown: ScoreBreakdown;
};
export type Assessment = {
  assessmentId: string;
  accountId: string;
  borrowerName: string;
  requestedAmount: number;
  monthlyIncome: number;
  employmentLengthMonths: number;
  purposeOfLoan: string;
  numberOfDependents: number;
  slikStatus: string;
  status: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
  score?: CreditScoreResult;
};
export type ApiLog = {
  id: string;
  requestId: string;
  correlationId: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  latencyMs: number;
  source: LogSource;
  clientType: LogSource;
  userAgent: string;
  responseType: "json";
  requestHeaders: Record<string, string>;
  requestBody: unknown;
  responseHeaders: Record<string, string>;
  responseBody: unknown;
  errorMessage?: string;
};
export type Simulation = { statusOverride: StatusOverride; source: LogSource };
type IdempotencyRecord = { assessmentId: string; createdAt: number };
type ServerState = {
  assessments: Assessment[];
  logs: ApiLog[];
  simulation: Simulation;
  rateWindow: number[];
  idempotency: Record<string, IdempotencyRecord>;
};
const GLOBAL_KEY = "__creditcore_server_store__";

function slikSubScore(slik: string): number {
  if (slik === "Kolektibilitas 1") return 100;
  if (slik === "Kolektibilitas 2") return 50;
  return 0;
}
function scoreFor(
  income: number,
  tenure: number,
  dependents: number,
  slik: string,
): CreditScoreResult {
  const sSlik = slikSubScore(slik);
  const sIncome = Math.min(100, Math.max(0, (income / 50_000_000) * 100));
  const sEmployment = Math.min(100, Math.max(0, (tenure / 60) * 100));
  const sDependents = Math.max(0, Math.min(100, 100 - dependents * 20));
  const cSlik = 0.4 * sSlik,
    cIncome = 0.3 * sIncome,
    cEmployment = 0.2 * sEmployment,
    cDependents = 0.1 * sDependents;
  const weightedSubScore = cSlik + cIncome + cEmployment + cDependents;
  const hardGateApplied = sSlik === 0;
  const creditScore = hardGateApplied
    ? 300
    : Math.max(300, Math.min(850, Math.round(300 + 5.5 * weightedSubScore)));
  const riskGrade: RiskGrade = creditScore >= 750 ? "Low" : creditScore >= 600 ? "Medium" : "High";
  const decision: Decision = hardGateApplied
    ? "REJECTED"
    : creditScore >= 750
      ? "APPROVED"
      : creditScore >= 600
        ? "MANUAL_REVIEW"
        : "REJECTED";
  const reasonCode: ReasonCode = hardGateApplied
    ? "RC-OJK-COL3-5"
    : decision === "APPROVED"
      ? "RC-001"
      : decision === "MANUAL_REVIEW"
        ? "RC-002"
        : "RC-003";
  const reason = hardGateApplied
    ? "SLIK OJK Kolektibilitas 3–5 triggers the hard-gate auto-decline rule."
    : decision === "APPROVED"
      ? "Score meets the automatic approval threshold (750–850)."
      : decision === "MANUAL_REVIEW"
        ? "Score falls in the manual-review band (600–749)."
        : "Score is below the risk tolerance threshold (<600).";
  const probabilityOfDefault = Math.max(
    0.01,
    Math.min(0.6, +(1 - (creditScore - 300) / 550).toFixed(3)),
  );
  return {
    creditScore,
    riskGrade,
    slikStatus: slik,
    decision,
    probabilityOfDefault,
    reasonCode,
    reason,
    hardGateApplied,
    breakdown: {
      slik: { subScore: sSlik, weight: 0.4, contribution: +cSlik.toFixed(2) },
      income: { subScore: +sIncome.toFixed(2), weight: 0.3, contribution: +cIncome.toFixed(2) },
      employment: {
        subScore: +sEmployment.toFixed(2),
        weight: 0.2,
        contribution: +cEmployment.toFixed(2),
      },
      dependents: {
        subScore: +sDependents.toFixed(2),
        weight: 0.1,
        contribution: +cDependents.toFixed(2),
      },
      weightedSubScore: +weightedSubScore.toFixed(2),
    },
  };
}
function finalStatus(score: CreditScoreResult): AssessmentStatus {
  return score.decision === "APPROVED"
    ? "APPROVED"
    : score.decision === "MANUAL_REVIEW"
      ? "MANUAL_REVIEW"
      : "REJECTED";
}
function cryptoRandom(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function seed(): ServerState {
  const rows = [
    [
      "ACC-2026-0031",
      "Andi Wijaya",
      25000000,
      12000000,
      48,
      "Home Renovation",
      2,
      "Kolektibilitas 1",
    ],
    [
      "ACC-2026-0032",
      "Sri Lestari",
      80000000,
      22000000,
      72,
      "Business Venture",
      1,
      "Kolektibilitas 1",
    ],
    [
      "ACC-2026-0033",
      "Bagas Prasetyo",
      15000000,
      7500000,
      18,
      "Consumer Goods",
      0,
      "Kolektibilitas 2",
    ],
    ["ACC-2026-0034", "Dewi Kartika", 45000000, 18000000, 60, "Education", 3, "Kolektibilitas 1"],
    [
      "ACC-2026-0035",
      "Rizal Hakim",
      120000000,
      9000000,
      12,
      "Business Venture",
      4,
      "Kolektibilitas 3",
    ],
    [
      "ACC-2026-0036",
      "Maya Anggraini",
      30000000,
      15000000,
      36,
      "Home Renovation",
      1,
      "Kolektibilitas 1",
    ],
    ["ACC-2026-0037", "Fajar Nugroho", 60000000, 25000000, 84, "Education", 2, "Kolektibilitas 1"],
    [
      "ACC-2026-0038",
      "Nina Rahmawati",
      20000000,
      6000000,
      24,
      "Consumer Goods",
      2,
      "Kolektibilitas 2",
    ],
    [
      "ACC-2026-0039",
      "Yoga Pratama",
      95000000,
      30000000,
      96,
      "Business Venture",
      1,
      "Kolektibilitas 1",
    ],
    [
      "ACC-2026-0040",
      "Intan Permata",
      40000000,
      10000000,
      30,
      "Home Renovation",
      3,
      "Kolektibilitas 2",
    ],
    [
      "ACC-2026-0041",
      "Bima Saputra",
      200000000,
      8000000,
      6,
      "Business Venture",
      5,
      "Kolektibilitas 4",
    ],
    [
      "ACC-2026-0042",
      "Anam Setiawan",
      10000000,
      15000000,
      24,
      "Business Venture",
      2,
      "Kolektibilitas 1",
    ],
  ] as const;
  const now = Date.now();
  const assessments: Assessment[] = rows.map((r, i) => {
    const created = new Date(now - (rows.length - i) * 18_000_000).toISOString();
    const score = scoreFor(r[3], r[4], r[6], r[7]);
    return {
      accountId: r[0],
      borrowerName: r[1],
      requestedAmount: r[2],
      monthlyIncome: r[3],
      employmentLengthMonths: r[4],
      purposeOfLoan: r[5],
      numberOfDependents: r[6],
      slikStatus: r[7],
      assessmentId: `ASM-2026-${String(i + 1).padStart(4, "0")}`,
      status: finalStatus(score),
      createdAt: created,
      updatedAt: created,
      score,
    };
  });
  const logs: ApiLog[] = assessments.slice(-6).map((a, idx) => ({
    id: cryptoRandom(),
    requestId: cryptoRandom(),
    correlationId: cryptoRandom(),
    timestamp: new Date(now - (6 - idx) * 600_000).toISOString(),
    method: idx % 2 ? "GET" : "POST",
    path: idx % 2 ? `/api/assessments/${a.assessmentId}` : "/api/assessments",
    status: idx === 1 ? 400 : idx === 4 ? 404 : idx % 2 ? 200 : 201,
    latencyMs: [4, 7, 9, 12, 18, 28][idx],
    source: "Web Server",
    clientType: "Web Server",
    userAgent: "seed/2.2",
    responseType: "json",
    requestHeaders: { "content-type": "application/json" },
    requestBody: { accountId: a.accountId },
    responseHeaders: { "content-type": "application/json; charset=utf-8" },
    responseBody: { assessmentId: a.assessmentId, status: a.status },
  }));
  return {
    assessments,
    logs,
    simulation: { statusOverride: "none", source: "Web Server" },
    rateWindow: [],
    idempotency: {},
  };
}
function getStore(): ServerState {
  const g = globalThis as unknown as Record<string, ServerState | undefined>;
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = seed();
  return g[GLOBAL_KEY]!;
}
export function resetStore() {
  (globalThis as unknown as Record<string, ServerState | undefined>)[GLOBAL_KEY] = seed();
}
export function listAssessments() {
  return [...getStore().assessments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function findAssessment(id: string) {
  return getStore().assessments.find((a) => a.assessmentId === id);
}
export function nextAssessmentId() {
  const nums = getStore()
    .assessments.map((a) => Number(a.assessmentId.split("-").pop()))
    .filter((n) => !Number.isNaN(n));
  return `ASM-2026-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, "0")}`;
}
export function createAssessment(
  input: {
    accountId: string;
    borrowerName: string;
    requestedAmount: number;
    monthlyIncome: number;
    employmentLengthMonths: number;
    purposeOfLoan: string;
    numberOfDependents: number;
    slikStatus: string;
  },
  assessmentId = nextAssessmentId(),
): Assessment {
  const now = new Date().toISOString();
  const score = scoreFor(
    input.monthlyIncome,
    input.employmentLengthMonths,
    input.numberOfDependents,
    input.slikStatus,
  );
  const a: Assessment = {
    ...input,
    assessmentId,
    status: finalStatus(score),
    createdAt: now,
    updatedAt: now,
    score,
  };
  getStore().assessments.push(a);
  return a;
}
// Lifecycle statuses that are final: once an assessment reaches one of
// these, it cannot be moved to a different status (e.g. APPROVED cannot
// flip to REJECTED, nor REJECTED to APPROVED). Re-setting a terminal
// status to itself (idempotent replay) remains allowed.
const TERMINAL_STATUSES: AssessmentStatus[] = ["APPROVED", "REJECTED"];

export function isValidStatusTransition(
  current: AssessmentStatus,
  next: AssessmentStatus,
): boolean {
  if (current === next) return true;
  return !TERMINAL_STATUSES.includes(current);
}

export function updateAssessmentStatus(id: string, status: AssessmentStatus) {
  const a = findAssessment(id);
  if (!a) return undefined;
  a.status = status;
  a.updatedAt = new Date().toISOString();
  return a;
}
export function getSimulation() {
  return { ...getStore().simulation };
}
export function setSimulation(sim: Partial<Simulation>) {
  const s = getStore().simulation;
  if (sim.statusOverride) s.statusOverride = sim.statusOverride;
  if (sim.source) s.source = sim.source;
  return { ...s };
}
export function listLogs() {
  return [...getStore().logs].reverse();
}
export function appendLog(log: ApiLog) {
  const s = getStore();
  s.logs.push(log);
  if (s.logs.length > 500) s.logs.splice(0, s.logs.length - 500);
}
export function clearLogs() {
  getStore().logs = [];
}
export function rateLimitTouch(now: number, windowMs = 5000, max = 3) {
  const s = getStore();
  s.rateWindow = s.rateWindow.filter((t) => now - t < windowMs);
  if (s.rateWindow.length >= max) return true;
  s.rateWindow.push(now);
  return false;
}
export function getIdempotentAssessment(key: string): Assessment | undefined {
  const s = getStore();
  const rec = s.idempotency[key];
  if (!rec) return;
  if (Date.now() - rec.createdAt > 86_400_000) {
    delete s.idempotency[key];
    return;
  }
  return findAssessment(rec.assessmentId);
}
export function saveIdempotencyKey(key: string, assessmentId: string) {
  getStore().idempotency[key] = { assessmentId, createdAt: Date.now() };
}
function percentile(values: number[], p: number) {
  if (!values.length) return 0;
  const a = [...values].sort((x, y) => x - y);
  return a[Math.min(a.length - 1, Math.ceil(p * a.length) - 1)];
}
export function dashboardMetrics() {
  const assessments = getStore().assessments,
    logs = getStore().logs,
    total = assessments.length;
  const scores = assessments.flatMap((a) => (a.score ? [a.score.creditScore] : []));
  const approved = assessments.filter((a) => a.score?.decision === "APPROVED").length,
    manual = assessments.filter((a) => a.score?.decision === "MANUAL_REVIEW").length,
    rejected = assessments.filter((a) => a.score?.decision === "REJECTED").length;
  const now = Date.now(),
    recentLogs = logs.filter((l) => now - new Date(l.timestamp).getTime() <= 3_600_000);
  const latencies = recentLogs.map((l) => l.latencyMs);
  const errors = recentLogs.filter((l) => l.status >= 400).length;
  const byRisk = ["Low", "Medium", "High"].map((name) => ({
    name,
    value: assessments.filter((a) => a.score?.riskGrade === name).length,
  }));
  const byDecision = ["APPROVED", "MANUAL_REVIEW", "REJECTED"].map((name) => ({
    name,
    value: assessments.filter((a) => a.score?.decision === name).length,
  }));
  const trend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 86_400_000).toISOString().slice(0, 10);
    return { date: d, count: assessments.filter((a) => a.createdAt.startsWith(d)).length };
  });
  return {
    totalAssessments: total,
    averageCreditScore: scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0,
    approvalRate: total ? Math.round((approved / total) * 100) : 0,
    approvedCount: approved,
    manualReviewRate: total ? Math.round((manual / total) * 100) : 0,
    rejectedRate: total ? Math.round((rejected / total) * 100) : 0,
    manualReviewCount: manual,
    rejectedCount: rejected,
    requestRate: +(recentLogs.length / 60).toFixed(2),
    errorRate: recentLogs.length ? +((errors / recentLogs.length) * 100).toFixed(1) : 0,
    averageLatencyMs: latencies.length
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0,
    p95LatencyMs: percentile(latencies, 0.95),
    p99LatencyMs: percentile(latencies, 0.99),
    apiSuccessRate: recentLogs.length
      ? +(100 - (errors / recentLogs.length) * 100).toFixed(1)
      : 100,
    riskDistribution: byRisk,
    decisionDistribution: byDecision,
    assessmentTrend: trend,
    recentAssessments: listAssessments().slice(0, 8),
  };
}
export function computeScore(
  _amount: number,
  income: number,
  tenure: number,
  slik: string,
  dependents = 0,
) {
  return scoreFor(income, tenure, dependents, slik);
}
