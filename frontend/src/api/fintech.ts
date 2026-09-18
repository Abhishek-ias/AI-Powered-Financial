// ============================================================
// Fintech API Service — Transaction and dispute handling
// ============================================================

import { api } from './client';
import { FintechTransaction } from '../types';

export const fintechApi = {
  getTransaction: (txnId: string) =>
    api.get<{ transaction: FintechTransaction; providerMode: string }>(
      `/api/fintech/transactions/${txnId}`
    ),

  classifyIssue: (status: string, debitConfirmed: boolean, creditConfirmed: boolean) =>
    api.post<{
      classification: { issueType: string; description: string; autoRefundEligible: boolean };
      resolution: { estimatedDays: number; standardResolution: string };
    }>('/api/rules/fintech/classify-issue', { status, debitConfirmed, creditConfirmed }),

  submitDispute: (payload: { transactionId: string; journeyId?: string; reason?: string }) =>
    api.post<{ disputeId: string; status: string; estimatedDays: number; providerMode: string }>(
      '/api/fintech/disputes',
      payload
    ),
};
