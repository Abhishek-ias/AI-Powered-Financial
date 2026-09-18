// ============================================================
// Journeys API Service — All ClaimSahay & Journey Endpoints
// ============================================================

import { api } from './client';
import {
  Domain,
  Journey,
  Question,
  ConsentRecord,
  DocumentItem,
  EvidenceItem,
  ValidationSummary,
  ReconciliationResult,
  NextBestAction,
  ApprovalRequest,
  TimelineEvent,
  SupportCase,
  JourneyRequirement,
} from '../types';

export interface CreateJourneyPayload {
  message?: string;
  domain?: Domain;
  journeyType?: string;
  goal?: string;
  language?: string;
}

export interface CreateJourneyResponse {
  journey: Journey;
  intent?: { domain: Domain; journeyType: string; confidence: number; goal?: string };
  questions: Question[];
  message: string;
}

export const journeysApi = {
  // Create journey (triggers intent detection + question generation)
  createJourney: (payload: CreateJourneyPayload) =>
    api.post<CreateJourneyResponse>('/api/journeys', payload),

  // List user's journeys
  listJourneys: () =>
    api.get<{ journeys: Journey[]; count: number }>('/api/journeys'),

  // Get single journey with related entities
  getJourney: (id: string) =>
    api.get<{ journey: Journey; nextActions: NextBestAction[] }>(`/api/journeys/${id}`),

  // Detect intent on a journey
  detectIntent: (journeyId: string, message: string) =>
    api.post<{ intent: any }>(`/api/journeys/${journeyId}/intent`, { message }),

  // Fetch journey questions
  getQuestions: (journeyId: string) =>
    api.get<{ questions: Question[] }>(`/api/journeys/${journeyId}/questions`),

  // Answer a question
  answerQuestion: (journeyId: string, questionId: string, answer: string) =>
    api.post<{ question: Question; allRequiredAnswered: boolean; nextStep?: string; journey?: Journey }>(
      `/api/journeys/${journeyId}/questions/${questionId}/answer`,
      { answer }
    ),

  // Grant consent for purposes
  grantConsent: (journeyId: string, purposes: string[], scope?: string) =>
    api.post<{ consents: ConsentRecord[]; nextStep: string; requirements: any[] }>(
      `/api/journeys/${journeyId}/consent`,
      { purposes, scope }
    ),

  // Upload document
  uploadDocument: (journeyId: string, file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return api.post<{ document: DocumentItem; message: string }>(
      `/api/journeys/${journeyId}/documents`,
      formData
    );
  },

  // Fetch uploaded documents for journey
  getDocuments: (journeyId: string) =>
    api.get<{ documents: DocumentItem[] }>(`/api/journeys/${journeyId}/documents`),

  // Fetch document requirements
  getRequirements: (journeyId: string) =>
    api.get<{ requirements: JourneyRequirement[] }>(`/api/journeys/${journeyId}/requirements`),

  // Process uploaded documents via Document AI pipeline
  processDocuments: (journeyId: string) =>
    api.post<{
      processingResults: any[];
      validation: ValidationSummary;
      nextActions: NextBestAction[];
      providerMode: string;
      message: string;
    }>(`/api/journeys/${journeyId}/process-documents`),

  // Retrieve evidence items
  getEvidence: (journeyId: string) =>
    api.get<{ evidence: EvidenceItem[] }>(`/api/journeys/${journeyId}/evidence`),

  // Retrieve validation results
  getValidation: (journeyId: string) =>
    api.get<{ validationResults: ValidationSummary | any[] }>(`/api/journeys/${journeyId}/validation`),

  // Create claim (for insurance journey)
  createClaim: (payload: {
    journeyId: string;
    policyNumber: string;
    claimType: string;
    amount: number;
    incidentDate?: string;
  }) =>
    api.post<{ claim: any; insurerQuery: any; message: string }>('/api/insurance/claims', payload),

  // Reconcile policy vs evidence vs insurer query
  reconcile: (
    journeyId: string,
    payload: {
      queryType: string;
      queryText: string;
      policyId: string;
      policyVersion: string;
      claimId?: string;
    }
  ) => api.post<ReconciliationResult>(`/api/journeys/${journeyId}/reconcile`, payload),

  // Retrieve previous reconciliations for journey
  getReconciliations: (journeyId: string) =>
    api.get<{ reconciliations: any[] }>(`/api/journeys/${journeyId}/reconciliation`),

  // Retrieve next best actions
  getNextActions: (journeyId: string) =>
    api.get<{ nextActions: NextBestAction[] }>(`/api/journeys/${journeyId}/next-actions`),

  // Consequential confirmation gate (transitions to USER_CONFIRMED and generates approval)
  confirmJourney: (journeyId: string) =>
    api.post<{ message: string; approval: ApprovalRequest; nextStep: string }>(
      `/api/journeys/${journeyId}/confirm`
    ),

  // Execute approval (submits to institution via workflow)
  approveAction: (journeyId: string, payload: { approvalId: string; approved: boolean; notes?: string }) =>
    api.post<{
      approval: ApprovalRequest;
      workflow: any;
      institutionResult: any;
      providerMode: string;
      message: string;
      safetyNote: string;
    }>(`/api/journeys/${journeyId}/approve`, payload),

  // Fetch timeline events
  getTimeline: (journeyId: string) =>
    api.get<{ timeline: TimelineEvent[]; count: number }>(`/api/journeys/${journeyId}/timeline`),

  // Escalate to human support (builds 15-field context packet)
  escalate: (journeyId: string, reason: string, notes?: string) =>
    api.post<{
      supportCase: SupportCase;
      message: string;
      nextStep: string;
      contextPacketSummary: {
        fieldsIncluded: number;
        sections: string[];
      };
    }>(`/api/journeys/${journeyId}/escalate`, { reason, notes }),

  // LLM Explanation endpoint with citation
  getExplanation: (journeyId: string, query: string) =>
    api.post<{ explanation: string; model: string; providerMode: string; disclaimer: string }>(
      `/api/journeys/${journeyId}/explain`,
      { query }
    ),

  // Conversational chat assistant
  sendChatMessage: (journeyId: string, message: string) =>
    api.post<{
      reply: string;
      intent: { domain: string; journeyType: string; confidence: number };
      nextActions: NextBestAction[];
      journeyStatus: string;
      providerMode: string;
    }>(`/api/journeys/${journeyId}/chat`, { message }),
};
