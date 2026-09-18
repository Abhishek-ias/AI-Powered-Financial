// ============================================================
// Mock Financial System APIs — Insurer, Lender, Fintech
// All data is SYNTHETIC. These are NOT real financial institutions.
// ============================================================
import { v4 as uuidv4 } from 'uuid';

// In-memory mock stores
const mockClaims = new Map<string, any>();
const mockApplications = new Map<string, any>();
const mockDisputes = new Map<string, any>();

// ---- Mock Insurer ----
export const mockInsurer = {
  async submitClaim(payload: any) {
    const id = `CLAIM-${uuidv4().slice(0, 8).toUpperCase()}`;
    const claim = {
      id,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      estimatedReviewDays: 5,
      ...payload,
    };
    mockClaims.set(id, claim);
    return claim;
  },

  async getClaim(claimId: string) {
    const claim = mockClaims.get(claimId);
    if (!claim) return { id: claimId, status: 'NOT_FOUND' };
    return claim;
  },

  async createQuery(claimId: string, queryType: string, query: string) {
    const claim = mockClaims.get(claimId);
    if (claim) {
      claim.status = 'QUERY';
      claim.queries = claim.queries || [];
      claim.queries.push({ queryType, query, createdAt: new Date().toISOString() });
      mockClaims.set(claimId, claim);
    }
    return { claimId, queryType, query, status: 'QUERY' };
  },

  // Generate a synthetic insurer query/rejection for demo
  generateSyntheticQuery(claimType: string) {
    const queries: Record<string, { queryType: string; query: string }[]> = {
      HOSPITALIZATION: [
        { queryType: 'AMOUNT_DISPUTE', query: 'Room rent exceeds permissible limit as per policy terms. Please provide justification or revised bills.' },
        { queryType: 'MISSING_DOCUMENT', query: 'Investigation reports for the surgical procedure are missing. Please submit.' },
      ],
      REIMBURSEMENT: [
        { queryType: 'POLICY_EXCLUSION', query: 'The claimed treatment appears to be for a pre-existing condition. Please provide medical history.' },
        { queryType: 'AMOUNT_DISPUTE', query: 'Room rent exceeds the sub-limit of ₹5,000/day as per your policy. Excess amount of ₹2,500/day is not payable.' },
      ],
    };
    const typeQueries = queries[claimType] || queries['HOSPITALIZATION']!;
    return typeQueries[Math.floor(Math.random() * typeQueries.length)];
  },
};

// ---- Mock Lender ----
export const mockLender = {
  async submitApplication(payload: any) {
    const id = `LOAN-${uuidv4().slice(0, 8).toUpperCase()}`;
    const app = {
      id,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      estimatedDecisionDays: 3,
      ...payload,
    };
    mockApplications.set(id, app);
    return app;
  },

  async getApplication(applicationId: string) {
    const app = mockApplications.get(applicationId);
    if (!app) return { id: applicationId, status: 'NOT_FOUND' };
    return app;
  },
};

// ---- Mock Fintech ----
export const mockFintech = {
  async getTransaction(transactionRef: string) {
    // Return synthetic transactions
    const transactions: Record<string, any> = {
      'TXN-UPI-2024-FAIL-001': {
        transactionRef: 'TXN-UPI-2024-FAIL-001',
        type: 'UPI',
        amount: 4999,
        currency: 'INR',
        status: 'FAILED_BUT_DEBITED',
        senderAccount: 'ramesh@upi',
        receiverAccount: 'merchant@upi',
        description: 'Payment to ABC Electronics',
        timestamp: '2024-09-15T14:30:00Z',
        debitConfirmed: true,
        creditConfirmed: false,
      },
      'TXN-UPI-2024-OK-001': {
        transactionRef: 'TXN-UPI-2024-OK-001',
        type: 'UPI',
        amount: 1500,
        currency: 'INR',
        status: 'SUCCESS',
        senderAccount: 'ramesh@upi',
        receiverAccount: 'grocery@upi',
        description: 'Payment to QuickMart',
        timestamp: '2024-09-14T10:15:00Z',
      },
    };
    return transactions[transactionRef] || { transactionRef, status: 'NOT_FOUND' };
  },

  async submitDispute(payload: any) {
    const id = `DISP-${uuidv4().slice(0, 8).toUpperCase()}`;
    const dispute = {
      id,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      estimatedResolutionDays: 7,
      ...payload,
    };
    mockDisputes.set(id, dispute);
    return dispute;
  },
};
