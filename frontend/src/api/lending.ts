// ============================================================
// Lending API Service — Authoritative calculations from backend
// ============================================================

import { api } from './client';
import { LendingEMIResult, LendingAffordabilityResult } from '../types';

export const lendingApi = {
  calculateEMI: async (principal: number, annualRate: number, tenureMonths: number): Promise<LendingEMIResult> => {
    const raw = await api.post<any>('/api/lending/calculate-emi', { principal, annualRate, tenureMonths });
    const calc = raw?.calculation || raw;
    return {
      principal: calc.principal ?? principal,
      annualRate: calc.annualRate ?? annualRate,
      tenureMonths: calc.tenureMonths ?? tenureMonths,
      monthlyEMI: calc.emi ?? calc.monthlyEMI ?? 0,
      totalRepayment: calc.totalRepayment ?? 0,
      totalInterest: calc.totalInterest ?? 0,
      providerMode: calc.providerMode ?? 'DETERMINISTIC_RULES',
      isEstimate: true,
      ...calc,
    };
  },

  checkAffordability: async (
    monthlyIncome: number,
    existingEMI: number,
    requestedEMI: number
  ): Promise<LendingAffordabilityResult> => {
    const raw = await api.post<any>('/api/lending/affordability', {
      monthlyIncome,
      existingEMI,
      requestedEMI,
    });
    const afford = raw?.affordability || raw;
    const isAffordable = afford.affordable ?? afford.isAffordable ?? false;
    const dtiRatio = afford.dtiRatio !== undefined ? afford.dtiRatio : (afford.dtiPercent ? afford.dtiPercent / 100 : 0);
    const dtiPercent = dtiRatio <= 1 ? dtiRatio * 100 : dtiRatio;
    const maxDtiPercent = afford.maxAllowedDTI !== undefined ? (afford.maxAllowedDTI <= 1 ? afford.maxAllowedDTI * 100 : afford.maxAllowedDTI) : (afford.maxDtiPercent ?? 50);
    const totalMonthlyObligations = afford.totalEMI ?? (existingEMI + requestedEMI);
    const maxRecommendedEMI = Math.max(0, monthlyIncome * (maxDtiPercent / 100) - existingEMI);

    let riskCategory: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
    if (dtiPercent > 50) riskCategory = 'HIGH';
    else if (dtiPercent > 40) riskCategory = 'MODERATE';

    return {
      monthlyIncome: afford.monthlyIncome ?? monthlyIncome,
      existingEMI: afford.existingEMI ?? existingEMI,
      requestedEMI: requestedEMI,
      totalMonthlyObligations,
      dtiPercent,
      isAffordable,
      maxRecommendedEMI,
      maxDtiPercent,
      riskCategory,
      providerMode: afford.providerMode ?? 'DETERMINISTIC_RULES',
      ...afford,
    };
  },

  getScenarios: (principal: number, annualRate: number, tenures?: number[]) =>
    api.post<{ scenarios: LendingEMIResult[]; providerMode: string }>('/api/lending/scenarios', {
      principal,
      annualRate,
      tenures,
    }),

  getMaxLoan: (monthlyIncome: number, maxDTI?: number, existingEMI?: number, tenureMonths?: number, annualRate?: number) =>
    api.post<{ maxLoanAmount: number; assumptions: string[] }>('/api/rules/lending/max-loan', {
      monthlyIncome,
      maxDTI,
      existingEMI,
      tenureMonths,
      annualRate,
    }),

  validateIncome: (salarySlipIncome: number, bankStatementIncome: number) =>
    api.post<{ result: { isConsistent: boolean; difference: number; differencePercent: number; status: string; message: string } }>(
      '/api/rules/lending/income-validation',
      { salarySlipIncome, bankStatementIncome }
    ),
};
