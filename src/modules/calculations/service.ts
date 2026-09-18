// ============================================================
// Financial Calculations — Deterministic EMI/Affordability
// LLM is NOT used for arithmetic.
// ============================================================

export interface EMIInput {
  principal: number;
  annualRate: number;
  tenureMonths: number;
}

export interface EMIResult {
  emi: number;
  totalRepayment: number;
  totalInterest: number;
  principal: number;
  annualRate: number;
  tenureMonths: number;
  assumptions: string[];
}

export interface AffordabilityInput {
  monthlyIncome: number;
  existingEMI: number;
  requestedEMI: number;
  maxDTI?: number; // debt-to-income ratio limit
}

export interface AffordabilityResult {
  affordable: boolean;
  dtiRatio: number;
  maxAllowedDTI: number;
  disposableIncome: number;
  totalEMI: number;
  monthlyIncome: number;
  assumptions: string[];
}

/**
 * Calculate EMI using standard reducing-balance formula.
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 */
export function calculateEMI(input: EMIInput): EMIResult {
  const { principal, annualRate, tenureMonths } = input;

  if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) {
    throw new Error('Invalid calculation inputs: principal, rate, and tenure must be positive');
  }

  const monthlyRate = annualRate / 12 / 100;

  let emi: number;
  if (monthlyRate === 0) {
    emi = principal / tenureMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    emi = principal * monthlyRate * factor / (factor - 1);
  }

  const totalRepayment = emi * tenureMonths;
  const totalInterest = totalRepayment - principal;

  return {
    emi: Math.round(emi * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    principal,
    annualRate,
    tenureMonths,
    assumptions: [
      'Reducing balance method',
      'Fixed interest rate assumed for entire tenure',
      'This is an ESTIMATE — actual EMI may vary',
      'Processing fees and other charges not included',
      'Approval remains subject to the lending institution',
    ],
  };
}

/**
 * Calculate affordability based on debt-to-income ratio.
 */
export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const maxDTI = input.maxDTI || 0.5; // 50% default DTI limit
  const totalEMI = input.existingEMI + input.requestedEMI;
  const dtiRatio = totalEMI / input.monthlyIncome;
  const disposableIncome = input.monthlyIncome - totalEMI;

  return {
    affordable: dtiRatio <= maxDTI,
    dtiRatio: Math.round(dtiRatio * 10000) / 10000,
    maxAllowedDTI: maxDTI,
    disposableIncome: Math.round(disposableIncome * 100) / 100,
    totalEMI,
    monthlyIncome: input.monthlyIncome,
    assumptions: [
      `Maximum debt-to-income ratio: ${maxDTI * 100}%`,
      'Based on declared income — subject to verification',
      'This is a READINESS assessment, not a credit approval',
      'Actual eligibility depends on credit score and institution policies',
    ],
  };
}

/**
 * Generate what-if scenarios for different tenures.
 */
export function generateScenarios(principal: number, annualRate: number, tenures: number[]): EMIResult[] {
  return tenures.map(t => calculateEMI({ principal, annualRate, tenureMonths: t }));
}
