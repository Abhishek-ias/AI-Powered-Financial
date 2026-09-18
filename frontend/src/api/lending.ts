// ============================================================
// Lending API Service — Authoritative calculations from backend
// ============================================================

import { api } from './client';
import { LendingEMIResult, LendingAffordabilityResult } from '../types';

export const lendingApi = {
  calculateEMI: (principal: number, annualRate: number, tenureMonths: number) =>
    api.post<LendingEMIResult>('/api/lending/calculate-emi', { principal, annualRate, tenureMonths }),

  checkAffordability: (monthlyIncome: number, existingEMI: number, requestedEMI: number) =>
    api.post<LendingAffordabilityResult>('/api/lending/affordability', {
      monthlyIncome,
      existingEMI,
      requestedEMI,
    }),

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
