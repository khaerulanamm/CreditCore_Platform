export type ScoreExplanation = {
  slik: { subScore: number; weight: number; contribution: number };
  income: { subScore: number; weight: number; contribution: number };
  employment: { subScore: number; weight: number; contribution: number };
  dependents: { subScore: number; weight: number; contribution: number };
  weightedSubScore: number;
  finalScore: number;
  hardGateApplied: boolean;
};
export function explainScore(input: {
  monthlyIncome: number;
  employmentLengthMonths: number;
  numberOfDependents: number;
  slikStatus: string;
}): ScoreExplanation {
  const sSlik =
    input.slikStatus === "Kolektibilitas 1"
      ? 100
      : input.slikStatus === "Kolektibilitas 2"
        ? 50
        : 0;
  const sIncome = Math.min(100, Math.max(0, (input.monthlyIncome / 50_000_000) * 100));
  const sEmployment = Math.min(100, Math.max(0, (input.employmentLengthMonths / 60) * 100));
  const sDependents = Math.max(0, Math.min(100, 100 - input.numberOfDependents * 20));
  const slik = { subScore: sSlik, weight: 0.4, contribution: +(0.4 * sSlik).toFixed(2) };
  const income = {
    subScore: +sIncome.toFixed(2),
    weight: 0.3,
    contribution: +(0.3 * sIncome).toFixed(2),
  };
  const employment = {
    subScore: +sEmployment.toFixed(2),
    weight: 0.2,
    contribution: +(0.2 * sEmployment).toFixed(2),
  };
  const dependents = {
    subScore: +sDependents.toFixed(2),
    weight: 0.1,
    contribution: +(0.1 * sDependents).toFixed(2),
  };
  const weightedSubScore = +(
    slik.contribution +
    income.contribution +
    employment.contribution +
    dependents.contribution
  ).toFixed(2);
  const hardGateApplied = sSlik === 0;
  return {
    slik,
    income,
    employment,
    dependents,
    weightedSubScore,
    hardGateApplied,
    finalScore: hardGateApplied ? 300 : Math.round(300 + 5.5 * weightedSubScore),
  };
}
