/**
 * CreditCore persistence boundary.
 *
 * Step 4.3 intentionally defines the contract without switching production
 * routes away from the frozen in-memory implementation. Step 4.5+ will add a
 * PostgreSQL implementation and regression-test it before activation.
 */

export interface PersistedAssessmentRecord {
  assessmentId: string;
  accountId: string;
  borrowerName: string;
  requestedAmount: number;
  monthlyIncome: number;
  employmentLengthMonths: number;
  purposeOfLoan: string;
  numberOfDependents: number;
  slikStatus: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentRepository {
  create(record: PersistedAssessmentRecord): Promise<PersistedAssessmentRecord>;
  findById(assessmentId: string): Promise<PersistedAssessmentRecord | undefined>;
  list(): Promise<PersistedAssessmentRecord[]>;
  updateStatus(
    assessmentId: string,
    status: string,
  ): Promise<PersistedAssessmentRecord | undefined>;
}

export interface CreditScoreRepository {
  save(assessmentId: string, score: unknown): Promise<void>;
  findByAssessmentId(assessmentId: string): Promise<unknown | undefined>;
}

export interface AuditLogRepository {
  append(log: unknown): Promise<void>;
  list(limit?: number): Promise<unknown[]>;
}

export interface IdempotencyRepository {
  findAssessmentId(key: string): Promise<string | undefined>;
  save(key: string, assessmentId: string): Promise<void>;
}
