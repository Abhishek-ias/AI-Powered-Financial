// ============================================================
// Rules Engine — Deterministic business rules
// Critical logic NOT hidden inside prompts
// ============================================================

import { Domain, JourneyType, JourneyStatus } from '../types';

// ---- Insurance Rules ----
export const insuranceRules = {
  getRequiredDocuments(claimType: string): string[] {
    const base = ['CLAIM_FORM', 'HOSPITAL_BILL', 'DISCHARGE_SUMMARY'];
    const identity = ['AADHAAR'];
    if (claimType === 'Hospitalization' || claimType === 'HOSPITALIZATION') {
      return [...base, ...identity, 'PRESCRIPTION'];
    }
    if (claimType === 'Reimbursement' || claimType === 'REIMBURSEMENT') {
      return [...base, ...identity];
    }
    return [...base, ...identity];
  },

  validateClaimAmount(amount: number, sumInsured: number): { valid: boolean; message: string } {
    if (amount <= 0) return { valid: false, message: 'Claim amount must be positive' };
    if (amount > sumInsured) {
      return { valid: false, message: `Claim amount ₹${amount} exceeds sum insured ₹${sumInsured}` };
    }
    return { valid: true, message: 'Claim amount within policy limits' };
  },

  checkRoomRentLimit(dailyRent: number, policyLimit: number, days: number) {
    const excess = Math.max(0, dailyRent - policyLimit);
    const totalExcess = excess * days;
    return {
      withinLimit: excess === 0,
      dailyRent,
      policyLimit,
      dailyExcess: excess,
      totalExcess,
      days,
      message: excess > 0
        ? `Room rent ₹${dailyRent}/day exceeds policy limit of ₹${policyLimit}/day. Total excess: ₹${totalExcess} for ${days} days.`
        : 'Room rent within policy limits.',
    };
  },

  checkPreExistingWaitingPeriod(policyStartDate: Date, conditionDate: Date, waitingYears: number = 4): {
    covered: boolean; message: string; yearsElapsed: number;
  } {
    const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
    const yearsElapsed = (conditionDate.getTime() - policyStartDate.getTime()) / msPerYear;
    const covered = yearsElapsed >= waitingYears;
    return {
      covered,
      yearsElapsed: Math.round(yearsElapsed * 10) / 10,
      message: covered
        ? `Waiting period of ${waitingYears} years completed (${Math.round(yearsElapsed * 10) / 10} years elapsed).`
        : `Pre-existing condition waiting period not met. ${waitingYears} years required, only ${Math.round(yearsElapsed * 10) / 10} years elapsed.`,
    };
  },

  calculateCoPay(amount: number, coPayPercent: number, age: number): {
    coPayApplicable: boolean; coPayAmount: number; netPayable: number; message: string;
  } {
    const applicable = age >= 60 && coPayPercent > 0;
    const coPayAmount = applicable ? Math.round(amount * coPayPercent / 100) : 0;
    return {
      coPayApplicable: applicable,
      coPayAmount,
      netPayable: amount - coPayAmount,
      message: applicable
        ? `Co-payment of ${coPayPercent}% applies (age ${age}). Co-pay: ₹${coPayAmount}. Net payable: ₹${amount - coPayAmount}.`
        : 'No co-payment applicable.',
    };
  },
};

// ---- Lending Rules ----
export const lendingRules = {
  validateIncome(salarySlipIncome: number, bankStatementIncome: number, tolerancePercent: number = 15): {
    valid: boolean; status: string; message: string;
  } {
    const diff = Math.abs(salarySlipIncome - bankStatementIncome);
    const maxDiff = salarySlipIncome * (tolerancePercent / 100);
    if (diff <= maxDiff) {
      return { valid: true, status: 'VALID', message: 'Income values are consistent.' };
    }
    return {
      valid: false,
      status: 'CONTRADICTED',
      message: `Income contradiction: Salary slip shows ₹${salarySlipIncome}, bank statement shows ₹${bankStatementIncome}. Difference of ₹${diff} exceeds ${tolerancePercent}% tolerance.`,
    };
  },

  getMaxLoanAmount(monthlyIncome: number, maxDTI: number = 0.5, existingEMI: number = 0, tenureMonths: number = 240, annualRate: number = 8.5): number {
    const availableEMI = (monthlyIncome * maxDTI) - existingEMI;
    if (availableEMI <= 0) return 0;
    const r = annualRate / 12 / 100;
    const factor = Math.pow(1 + r, tenureMonths);
    return Math.round(availableEMI * (factor - 1) / (r * factor));
  },

  assessCreditReadiness(params: {
    monthlyIncome: number;
    existingEMI: number;
    requestedAmount: number;
    employmentType: string;
    hasITR: boolean;
    hasBankStatement: boolean;
  }): { ready: boolean; score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 0;

    if (params.monthlyIncome > 25000) score += 25; else issues.push('Monthly income below ₹25,000');
    if (params.existingEMI / params.monthlyIncome < 0.3) score += 25; else issues.push('Existing EMI exceeds 30% of income');
    if (params.employmentType === 'Salaried') score += 20; else if (params.employmentType === 'Self-Employed') score += 10;
    if (params.hasBankStatement) score += 15; else issues.push('Bank statement not provided');
    if (params.hasITR) score += 15; else issues.push('ITR not provided (optional but strengthens application)');

    return { ready: score >= 60, score, issues };
  },
};

// ---- Fintech Rules ----
export const fintechRules = {
  classifyTransactionIssue(status: string, debitConfirmed: boolean, creditConfirmed: boolean): {
    issueType: string; severity: string; message: string;
  } {
    if (status === 'FAILED' && !debitConfirmed) {
      return { issueType: 'FAILED_NO_DEBIT', severity: 'LOW', message: 'Transaction failed. No debit detected. No action needed.' };
    }
    if (status === 'FAILED' && debitConfirmed && !creditConfirmed) {
      return { issueType: 'FAILED_BUT_DEBITED', severity: 'HIGH', message: 'Payment failed but money was debited. Immediate dispute recommended.' };
    }
    if (status === 'DUPLICATE') {
      return { issueType: 'DUPLICATE_CHARGE', severity: 'HIGH', message: 'Duplicate transaction detected. Dispute one of the charges.' };
    }
    return { issueType: 'REQUIRES_REVIEW', severity: 'MEDIUM', message: 'Transaction status unclear. Requires manual review.' };
  },

  estimateResolutionTime(issueType: string): { days: number; message: string } {
    const times: Record<string, number> = {
      FAILED_BUT_DEBITED: 5,
      DUPLICATE_CHARGE: 7,
      REQUIRES_REVIEW: 14,
      FAILED_NO_DEBIT: 0,
    };
    const days = times[issueType] || 14;
    return {
      days,
      message: days === 0
        ? 'No action required.'
        : `Estimated resolution: ${days} business days. This is an estimate based on typical processing times.`,
    };
  },
};

// ---- Allowed Actions by State ----
export function getAllowedActions(status: JourneyStatus, domain: Domain): string[] {
  const common: Record<string, string[]> = {
    CREATED: ['PROVIDE_INFORMATION'],
    GOAL_IDENTIFIED: ['PROVIDE_INFORMATION'],
    QUESTIONS_PENDING: ['PROVIDE_INFORMATION'],
    CONSENT_PENDING: ['GRANT_CONSENT'],
    DOCUMENTS_PENDING: ['UPLOAD_DOCUMENT'],
    DOCUMENT_PROCESSING: [],
    VALIDATING: [],
    NEEDS_ACTION: ['CORRECT_FIELD', 'UPLOAD_DOCUMENT', 'CONFIRM_INFORMATION', 'ESCALATE_TO_HUMAN'],
    READY_FOR_REVIEW: ['CONFIRM_INFORMATION', 'CORRECT_FIELD', 'ESCALATE_TO_HUMAN'],
    USER_CONFIRMED: [],
    ACTION_PENDING: [],
    SUBMITTED: [],
    INSTITUTION_REVIEW: ['ESCALATE_TO_HUMAN'],
    QUERY_RECEIVED: ['RESPOND_TO_INSURER', 'ESCALATE_TO_HUMAN'],
    RECONCILIATION_PENDING: ['ESCALATE_TO_HUMAN'],
    HUMAN_REVIEW: [],
    COMPLETED: [],
    FAILED: ['ESCALATE_TO_HUMAN'],
  };

  return common[status] || [];
}
