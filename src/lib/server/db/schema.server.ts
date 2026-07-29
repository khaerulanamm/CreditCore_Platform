import {
  bigint,
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Persistence schema only.
 * Credit scoring remains owned by store.server.ts / computeScore().
 */

export const assessments = pgTable(
  "assessments",
  {
    assessmentId: text("assessment_id").primaryKey(),
    accountId: text("account_id").notNull(),
    borrowerName: text("borrower_name").notNull(),
    requestedAmount: bigint("requested_amount", { mode: "number" }).notNull(),
    monthlyIncome: bigint("monthly_income", { mode: "number" }).notNull(),
    employmentLengthMonths: integer("employment_length_months").notNull(),
    purposeOfLoan: text("purpose_of_loan").notNull(),
    numberOfDependents: integer("number_of_dependents").notNull(),
    slikStatus: text("slik_status").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_assessments_account_id").on(table.accountId),
    index("idx_assessments_status").on(table.status),
    index("idx_assessments_created_at").on(table.createdAt),
  ],
);

export const creditScores = pgTable(
  "credit_scores",
  {
    assessmentId: text("assessment_id")
      .primaryKey()
      .references(() => assessments.assessmentId, { onDelete: "cascade" }),
    creditScore: integer("credit_score").notNull(),
    riskGrade: text("risk_grade").notNull(),
    slikStatus: text("slik_status").notNull(),
    decision: text("decision").notNull(),
    probabilityOfDefault: doublePrecision("probability_of_default").notNull(),
    reasonCode: text("reason_code").notNull(),
    reason: text("reason").notNull(),
    hardGateApplied: boolean("hard_gate_applied").notNull().default(false),
    breakdown: jsonb("breakdown").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_credit_scores_decision").on(table.decision),
    index("idx_credit_scores_risk_grade").on(table.riskGrade),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: text("request_id").notNull(),
    correlationId: text("correlation_id").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    method: text("method").notNull(),
    path: text("path").notNull(),
    status: integer("status").notNull(),
    latencyMs: integer("latency_ms").notNull(),
    source: text("source").notNull(),
    clientType: text("client_type").notNull(),
    userAgent: text("user_agent").notNull().default(""),
    responseType: text("response_type").notNull().default("json"),
    requestHeaders: jsonb("request_headers").notNull().default({}),
    requestBody: jsonb("request_body"),
    responseHeaders: jsonb("response_headers").notNull().default({}),
    responseBody: jsonb("response_body"),
    errorMessage: text("error_message"),
  },
  (table) => [
    index("idx_audit_logs_timestamp").on(table.timestamp),
    index("idx_audit_logs_correlation_id").on(table.correlationId),
    index("idx_audit_logs_request_id").on(table.requestId),
    index("idx_audit_logs_status").on(table.status),
  ],
);

export const idempotencyKeys = pgTable("idempotency_keys", {
  idempotencyKey: text("idempotency_key").primaryKey(),
  assessmentId: text("assessment_id")
    .notNull()
    .references(() => assessments.assessmentId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const runtimeSimulation = pgTable("runtime_simulation", {
  singleton: boolean("singleton").primaryKey().default(true),
  statusOverride: text("status_override").notNull().default("none"),
  source: text("source").notNull().default("Web Server"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
