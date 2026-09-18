// ============================================================
// API Routes — All backend endpoints
// ============================================================
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Helper to extract string param (Express 5 params can be string | string[])
function p(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

import { authMiddleware, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errors';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';

// Services
import { createJourney, getJourney, transitionJourney, listJourneys } from '../modules/journeys/service';
import { detectIntent } from '../modules/intent/service';
import { generateQuestions, answerQuestion, getQuestions, allRequiredQuestionsAnswered } from '../modules/questions/service';
import { grantConsent, checkConsent, getConsents } from '../modules/consent/service';
import { uploadDocument, getDocuments, updateDocumentStatus, createDocumentFields } from '../modules/documents/service';
import { createEvidence, getEvidence } from '../modules/evidence/service';
import { generateRequirements, getRequirements } from '../modules/requirements/service';
import { validateEvidence, getValidationResults } from '../modules/validation/service';
import { reconcile, getReconciliations } from '../modules/reconciliation/service';
import { determineNextActions } from '../modules/next-best-action/service';
import { createApprovalRequest, processApproval, getApprovals } from '../modules/approvals/service';
import { createEscalation } from '../modules/escalation/service';
import { getTimeline } from '../modules/timeline/service';
import { getAuditEvents, createAuditEvent } from '../modules/audit/service';
import { calculateEMI, calculateAffordability, generateScenarios } from '../modules/calculations/service';

// Mock providers
import { MockDocumentAIProvider } from '../integrations/mock/document-ai';
import { MockLLMProvider } from '../integrations/mock/llm';
import { MockWorkflowProvider } from '../integrations/mock/workflow';
import { mockInsurer, mockLender, mockFintech } from '../integrations/mock/financial-systems';

import prisma from '../config/database';
import { Domain, JourneyType, JourneyStatus } from '../types';
import {
  sanitizeDocumentFields,
  sanitizeUntrustedDocumentText,
  buildSecurePrompt,
  createDefensiveSystemPrompt,
} from '../utils/sanitizer';

const router = Router();
const documentAI = new MockDocumentAIProvider();
const llm = new MockLLMProvider();
const workflow = new MockWorkflowProvider();

// ---- Upload config ----
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uuidv4()}-${safeName}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// All API routes require auth
router.use(authMiddleware);

// ============================================================
// JOURNEYS
// ============================================================

// Create journey
router.post('/journeys', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      message: z.string().optional(),
      domain: z.enum(['INSURANCE', 'LENDING', 'FINTECH']).optional(),
      journeyType: z.string().optional(),
      goal: z.string().optional(),
      language: z.string().optional(),
      parentJourneyId: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const userId = (req as any).userId;
    const requestId = (req as any).requestId;

    // If message provided, detect intent
    let domain = body.domain as Domain;
    let journeyType = body.journeyType as JourneyType;
    let goal = body.goal;
    let intentResult = null;

    if (body.message) {
      intentResult = detectIntent(body.message);
      domain = domain || intentResult.domain;
      journeyType = journeyType || intentResult.journeyType;
      goal = goal || intentResult.goal;
    }

    if (!domain) {
      errorResponse(res, ErrorCodes.INVALID_REQUEST, 'Domain is required. Provide message or domain.', 400);
      return;
    }

    const journey = await createJourney({
      userId,
      domain,
      journeyType: journeyType || 'GENERAL',
      goal,
      language: body.language,
      parentJourneyId: body.parentJourneyId,
    }, requestId);

    // Auto-transition to GOAL_IDENTIFIED
    await transitionJourney(journey.id, 'GOAL_IDENTIFIED', 'SYSTEM', undefined, 'Intent detected', requestId);

    // Generate questions
    const questions = await generateQuestions(journey.id, domain, journeyType || 'GENERAL');

    // Auto-transition to QUESTIONS_PENDING
    if (questions.length > 0) {
      await transitionJourney(journey.id, 'QUESTIONS_PENDING', 'SYSTEM', undefined, 'Questions generated', requestId);
    }

    // Generate requirements
    await generateRequirements(journey.id, domain, journeyType || 'GENERAL');

    const updatedJourney = await getJourney(journey.id);

    successResponse(res, {
      journey: updatedJourney,
      intent: intentResult,
      questions,
      message: `${domain} journey created. Please answer the required questions to proceed.`,
    }, 201);
  } catch (err) { next(err); }
});

// List user journeys
router.get('/journeys', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const journeys = await listJourneys(userId);
    successResponse(res, { journeys });
  } catch (err) { next(err); }
});

// Get journey
router.get('/journeys/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const journey = await getJourney(p(req.params.id), userId);
    const nextActions = await determineNextActions(p(req.params.id));
    successResponse(res, { journey, nextActions });
  } catch (err) { next(err); }
});

// ============================================================
// INTENT
// ============================================================
router.post('/journeys/:id/intent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = z.object({ message: z.string() }).parse(req.body);
    const userId = (req as any).userId;
    const journey = await getJourney(p(req.params.id), userId);
    const intent = detectIntent(message);

    await createAuditEvent({
      journeyId: journey.id,
      eventType: 'intent_identified',
      actorType: 'AI',
      metadata: { ...intent } as Record<string, unknown>,
    });

    successResponse(res, { intent });
  } catch (err) { next(err); }
});

// ============================================================
// QUESTIONS
// ============================================================
router.get('/journeys/:id/questions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await getJourney(p(req.params.id), userId);
    const questions = await getQuestions(p(req.params.id));
    successResponse(res, { questions });
  } catch (err) { next(err); }
});

router.post('/journeys/:id/questions/:questionId/answer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { answer } = z.object({ answer: z.string() }).parse(req.body);
    const userId = (req as any).userId;
    const requestId = (req as any).requestId;
    await getJourney(p(req.params.id), userId);

    const question = await answerQuestion(p(req.params.id), p(req.params.questionId), answer, userId, requestId);

    // Check if all required questions are answered
    const allAnswered = await allRequiredQuestionsAnswered(p(req.params.id));
    let journeyUpdate = null;
    if (allAnswered) {
      journeyUpdate = await transitionJourney(
        p(req.params.id), 'CONSENT_PENDING', 'SYSTEM', undefined,
        'All required questions answered', requestId
      );
    }

    successResponse(res, {
      question,
      allRequiredAnswered: allAnswered,
      nextStep: allAnswered ? 'Grant consent to proceed' : 'Continue answering questions',
      journey: journeyUpdate,
    });
  } catch (err) { next(err); }
});

// ============================================================
// CONSENT
// ============================================================
router.post('/journeys/:id/consent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      purposes: z.array(z.string()).min(1),
      scope: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const userId = (req as any).userId;
    const requestId = (req as any).requestId;
    await getJourney(p(req.params.id), userId);

    const consents = await grantConsent({
      userId,
      journeyId: p(req.params.id),
      purposes: body.purposes,
      scope: body.scope,
    }, requestId);

    // Transition to DOCUMENTS_PENDING
    await transitionJourney(p(req.params.id), 'DOCUMENTS_PENDING', 'SYSTEM', undefined, 'Consent granted', requestId);

    const requirements = await getRequirements(p(req.params.id));

    successResponse(res, {
      consents,
      nextStep: 'Upload required documents',
      requirements: requirements.filter(r => r.required),
    });
  } catch (err) { next(err); }
});

// ============================================================
// DOCUMENTS
// ============================================================
router.post('/journeys/:id/documents', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const requestId = (req as any).requestId;
    await getJourney(p(req.params.id), userId);

    if (!req.file) {
      errorResponse(res, ErrorCodes.INVALID_REQUEST, 'No file uploaded.', 400);
      return;
    }

    const documentType = req.body.documentType || 'OTHER';

    // Read file buffer for checksum
    const buffer = fs.readFileSync(req.file.path);

    const document = await uploadDocument(
      p(req.params.id),
      userId,
      documentType,
      { ...req.file, buffer },
      requestId
    );

    successResponse(res, { document }, 201);
  } catch (err) { next(err); }
});

router.get('/journeys/:id/documents', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await getJourney(p(req.params.id), userId);
    const documents = await getDocuments(p(req.params.id));
    successResponse(res, { documents });
  } catch (err) { next(err); }
});

// Process documents — trigger Document AI pipeline
router.post('/journeys/:id/process-documents', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const requestId = (req as any).requestId;
    const journey = await getJourney(p(req.params.id), userId);

    // Check consent
    const hasConsent = await checkConsent(p(req.params.id), 'DOCUMENT_ANALYSIS');
    if (!hasConsent) {
      // Auto-check DATA_PROCESSING consent
      const hasDataConsent = await checkConsent(p(req.params.id), 'DATA_PROCESSING');
      if (!hasDataConsent) {
        errorResponse(res, ErrorCodes.CONSENT_REQUIRED, 'Consent for document analysis is required.', 403);
        return;
      }
    }

    // Transition to DOCUMENT_PROCESSING
    await transitionJourney(p(req.params.id), 'DOCUMENT_PROCESSING', 'SYSTEM', undefined, 'Processing documents', requestId);

    const documents = await prisma.document.findMany({
      where: { journeyId: p(req.params.id), status: 'UPLOADED' },
    });

    const results = [];
    for (const doc of documents) {
      const startTime = Date.now();

      // Read file
      let buffer: Buffer;
      try {
        buffer = fs.readFileSync(path.resolve(doc.storageRef));
      } catch {
        buffer = Buffer.from('mock-content');
      }

      // Process with Document AI
      const extraction = await documentAI.analyzeDocument(buffer, doc.mimeType, doc.documentType);

      // Apply Prompt Injection Sanitization Barrier to extracted fields (treat as untrusted DATA)
      const { sanitizedFields, hasInjections, injectionCount } = sanitizeDocumentFields(extraction.fields);

      if (hasInjections) {
        await createAuditEvent({
          journeyId: p(req.params.id),
          eventType: 'security_alert',
          actorType: 'SYSTEM',
          requestId,
          metadata: {
            alertType: 'PROMPT_INJECTION_DEFUSED',
            documentId: doc.id,
            injectionCount,
          },
        });
      }

      // Save sanitized fields
      await createDocumentFields(doc.id, sanitizedFields);

      // Update document status with timing
      await updateDocumentStatus(doc.id, 'PROCESSED', {
        classificationMs: extraction.classificationMs,
        extractionMs: extraction.extractionMs,
        totalProcessingMs: extraction.totalProcessingMs,
      });

      // Create evidence items from sanitized extracted fields
      const evidenceItems = sanitizedFields
        .filter(f => f.confidence >= 0.5)
        .map(f => ({
          factType: doc.documentType,
          fieldName: f.fieldName,
          value: f.value,
          normalizedValue: f.normalizedValue,
          unit: f.unit,
          sourceDocumentId: doc.id,
          sourcePage: f.page,
          sourceText: f.sourceText,
          confidence: f.confidence,
          status: f.confidence >= 0.7 ? 'VALID' : 'LOW_CONFIDENCE',
        }));

      await createEvidence(p(req.params.id), evidenceItems, requestId);

      results.push({
        documentId: doc.id,
        documentType: doc.documentType,
        fieldsExtracted: extraction.fields.length,
        evidenceCreated: evidenceItems.length,
        timing: {
          classificationMs: extraction.classificationMs,
          extractionMs: extraction.extractionMs,
          totalProcessingMs: extraction.totalProcessingMs,
        },
      });

      await createAuditEvent({
        journeyId: p(req.params.id),
        eventType: 'document_processed',
        actorType: 'SYSTEM',
        requestId,
        metadata: {
          documentId: doc.id,
          documentType: doc.documentType,
          fieldsExtracted: extraction.fields.length,
          totalProcessingMs: extraction.totalProcessingMs,
          provider: 'MOCK',
        },
      });
    }

    // Transition to VALIDATING
    await transitionJourney(p(req.params.id), 'VALIDATING', 'SYSTEM', undefined, 'Documents processed, validating', requestId);

    // Run validation
    const evidence = await getEvidence(p(req.params.id));

    // Get policy clauses if insurance
    let policyData = undefined;
    if (journey.domain === 'INSURANCE') {
      const policy = await prisma.policy.findFirst({
        include: { versions: true },
      });
      if (policy && policy.versions.length > 0) {
        const pv = policy.versions[0];
        if (pv.clauses) {
          policyData = { clauses: JSON.parse(pv.clauses) };
        }
      }
    }

    const validation = await validateEvidence({
      journeyId: p(req.params.id),
      evidence: evidence.map(e => ({
        fieldName: e.fieldName,
        value: e.value,
        normalizedValue: e.normalizedValue || undefined,
        unit: e.unit || undefined,
        source: e.sourceDocumentId || 'unknown',
        confidence: e.confidence,
      })),
      policyData,
    }, requestId);

    // Transition based on validation
    if (validation.blocking.length > 0) {
      await transitionJourney(p(req.params.id), 'NEEDS_ACTION', 'SYSTEM', undefined, 'Validation issues found', requestId);
    } else {
      await transitionJourney(p(req.params.id), 'READY_FOR_REVIEW', 'SYSTEM', undefined, 'Validation passed', requestId);
    }

    const nextActions = await determineNextActions(p(req.params.id));

    successResponse(res, {
      processingResults: results,
      validation,
      nextActions,
      providerMode: 'MOCK',
      message: validation.blocking.length > 0
        ? 'Documents processed. Issues detected that need attention.'
        : 'Documents processed and validated. Ready for review.',
    });
  } catch (err) { next(err); }
});

// ============================================================
// REQUIREMENTS / EVIDENCE / VALIDATION
// ============================================================
router.get('/journeys/:id/requirements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await getJourney(p(req.params.id), userId);
    const requirements = await getRequirements(p(req.params.id));
    successResponse(res, { requirements });
  } catch (err) { next(err); }
});

router.get('/journeys/:id/evidence', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await getJourney(p(req.params.id), userId);
    const evidence = await getEvidence(p(req.params.id));
    successResponse(res, { evidence });
  } catch (err) { next(err); }
});

router.get('/journeys/:id/validation', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await getJourney(p(req.params.id), userId);
    const results = await getValidationResults(p(req.params.id));
    successResponse(res, { validationResults: results });
  } catch (err) { next(err); }
});

// ============================================================
// RECONCILIATION
// ============================================================
router.get('/journeys/:id/reconciliation', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await getJourney(p(req.params.id), userId);
    const reconciliations = await getReconciliations(p(req.params.id));
    successResponse(res, { reconciliations });
  } catch (err) { next(err); }
});

router.post('/journeys/:id/reconcile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      queryType: z.string(),
      queryText: z.string(),
      policyId: z.string(),
      policyVersion: z.string(),
      claimId: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const userId = (req as any).userId;
    const requestId = (req as any).requestId;
    await getJourney(p(req.params.id), userId);

    const result = await reconcile({
      journeyId: p(req.params.id),
      claimId: body.claimId,
      queryType: body.queryType,
      queryText: body.queryText,
      policyId: body.policyId,
      policyVersion: body.policyVersion,
    }, requestId);

    successResponse(res, result);
  } catch (err) { next(err); }
});

// ============================================================
// NEXT ACTIONS
// ============================================================
router.get('/journeys/:id/next-actions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await getJourney(p(req.params.id), userId);
    const actions = await determineNextActions(p(req.params.id));
    successResponse(res, { nextActions: actions });
  } catch (err) { next(err); }
});

// ============================================================
// CONFIRM / APPROVE / ESCALATE
// ============================================================
router.post('/journeys/:id/confirm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const requestId = (req as any).requestId;
    const journey = await getJourney(p(req.params.id), userId);

    if (journey.status !== 'READY_FOR_REVIEW' && journey.status !== 'NEEDS_ACTION') {
      errorResponse(res, ErrorCodes.INVALID_STATE_TRANSITION, 'Journey must be in READY_FOR_REVIEW or NEEDS_ACTION state.', 400);
      return;
    }

    await transitionJourney(p(req.params.id), 'USER_CONFIRMED', 'USER', userId, 'User confirmed information', requestId);

    // Create approval request for the consequential action
    const action = journey.domain === 'INSURANCE' ? 'SUBMIT_CLAIM' :
                   journey.domain === 'LENDING' ? 'SUBMIT_LOAN_APPLICATION' : 'SUBMIT_DISPUTE';

    const approval = await createApprovalRequest(
      p(req.params.id),
      userId,
      action,
      { journeyId: p(req.params.id), domain: journey.domain, confirmedAt: new Date().toISOString() },
      `${p(req.params.id)}-${action}`,
      requestId
    );

    successResponse(res, {
      message: 'Information confirmed. Approval created for submission.',
      approval,
      nextStep: `Approve the ${action} to proceed.`,
    });
  } catch (err) { next(err); }
});

router.post('/journeys/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      approvalId: z.string(),
      approved: z.boolean(),
    });
    const body = schema.parse(req.body);
    const userId = (req as any).userId;
    const requestId = (req as any).requestId;
    await getJourney(p(req.params.id), userId);

    const approval = await processApproval(body.approvalId, userId, body.approved, requestId);

    if (body.approved) {
      // Transition to ACTION_PENDING
      await transitionJourney(p(req.params.id), 'ACTION_PENDING', 'USER', userId, 'User approved action', requestId);

      // Trigger workflow
      const journey = await getJourney(p(req.params.id), userId);
      const workflowResult = await workflow.trigger('claim_submission', {
        journeyId: p(req.params.id),
        domain: journey.domain,
        action: approval.action,
      });

      // Record workflow run
      await prisma.workflowRun.create({
        data: {
          journeyId: p(req.params.id),
          workflowType: approval.action,
          executionId: workflowResult.executionId,
          status: workflowResult.status,
          input: JSON.stringify({ action: approval.action }),
          output: JSON.stringify(workflowResult),
          providerMode: 'MOCK',
        },
      });

      // Transition to SUBMITTED
      await transitionJourney(p(req.params.id), 'SUBMITTED', 'SYSTEM', undefined, 'Action submitted via workflow', requestId);

      // Submit to mock institution
      let institutionResult;
      if (journey.domain === 'INSURANCE') {
        institutionResult = await mockInsurer.submitClaim({ journeyId: p(req.params.id) });
      } else if (journey.domain === 'LENDING') {
        institutionResult = await mockLender.submitApplication({ journeyId: p(req.params.id) });
      } else if (journey.domain === 'FINTECH') {
        institutionResult = await mockFintech.submitDispute({ journeyId: p(req.params.id) });
      }

      // Transition to INSTITUTION_REVIEW
      await transitionJourney(p(req.params.id), 'INSTITUTION_REVIEW', 'SYSTEM', undefined, 'Submitted to institution (MOCK)', requestId);

      successResponse(res, {
        approval,
        workflow: workflowResult,
        institutionResult,
        providerMode: 'MOCK',
        message: 'Action approved and submitted. The institution (MOCK) is reviewing.',
        safetyNote: 'This is a MOCK submission. No real financial action has been taken.',
      });
    } else {
      successResponse(res, {
        approval,
        message: 'Action rejected by user.',
      });
    }
  } catch (err) { next(err); }
});

router.post('/journeys/:id/escalate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const requestId = (req as any).requestId;
    await getJourney(p(req.params.id), userId);

    const result = await createEscalation(p(req.params.id), userId, requestId);

    // Transition to HUMAN_REVIEW
    try {
      await transitionJourney(p(req.params.id), 'HUMAN_REVIEW', 'USER', userId, 'User requested escalation', requestId);
    } catch {
      // May already be in HUMAN_REVIEW
    }

    successResponse(res, {
      supportCase: result.supportCase,
      contextPacket: result.contextPacket,
      message: 'Escalated to human support with complete journey context.',
    });
  } catch (err) { next(err); }
});

// ============================================================
// TIMELINE / AUDIT
// ============================================================
router.get('/journeys/:id/timeline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await getJourney(p(req.params.id), userId);
    const timeline = await getTimeline(p(req.params.id));
    successResponse(res, { timeline });
  } catch (err) { next(err); }
});

router.get('/journeys/:id/audit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    if (userRole !== 'ADMIN' && userRole !== 'AGENT') {
      await getJourney(p(req.params.id), userId); // Auth check
    }
    const events = await getAuditEvents(p(req.params.id));
    successResponse(res, { auditEvents: events });
  } catch (err) { next(err); }
});

// ============================================================
// INSURANCE — Claims
// ============================================================
router.post('/insurance/claims', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      journeyId: z.string(),
      policyNumber: z.string(),
      claimType: z.string(),
      amount: z.number().optional(),
      description: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const userId = (req as any).userId;
    const requestId = (req as any).requestId;
    await getJourney(body.journeyId, userId);

    const policy = await prisma.policy.findUnique({
      where: { policyNumber: body.policyNumber },
    });
    if (!policy) {
      errorResponse(res, ErrorCodes.NOT_FOUND, 'Policy not found.', 404);
      return;
    }

    const claim = await prisma.claim.create({
      data: {
        journeyId: body.journeyId,
        policyId: policy.id,
        claimType: body.claimType,
        amount: body.amount,
        description: body.description,
        status: 'DRAFT',
      },
    });

    // Generate synthetic insurer query for demo
    const syntheticQuery = mockInsurer.generateSyntheticQuery(body.claimType);
    await prisma.insurerQuery.create({
      data: {
        claimId: claim.id,
        queryType: syntheticQuery.queryType,
        query: syntheticQuery.query,
        source: 'INSURER',
        status: 'OPEN',
      },
    });

    await createAuditEvent({
      journeyId: body.journeyId,
      eventType: 'claim_created',
      actorType: 'SYSTEM',
      requestId,
      metadata: { claimId: claim.id, policyNumber: body.policyNumber },
    });

    successResponse(res, {
      claim,
      insurerQuery: syntheticQuery,
      message: 'Claim created. An insurer query has been received (synthetic).',
      safetyNote: 'This is a prototype. No real claim has been filed.',
    }, 201);
  } catch (err) { next(err); }
});

router.get('/insurance/claims/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await prisma.claim.findUnique({
      where: { id: p(req.params.id) },
      include: {
        policy: true,
        insurerQueries: true,
        reconciliations: true,
        journey: { select: { userId: true } },
      },
    });
    if (!claim) {
      errorResponse(res, ErrorCodes.NOT_FOUND, 'Claim not found.', 404);
      return;
    }
    successResponse(res, { claim });
  } catch (err) { next(err); }
});

// ============================================================
// LENDING — Calculations & Applications
// ============================================================
router.post('/lending/calculate-emi', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      principal: z.number().positive(),
      annualRate: z.number().min(0),
      tenureMonths: z.number().positive().int(),
    });
    const body = schema.parse(req.body);
    const result = calculateEMI(body);
    successResponse(res, { calculation: result });
  } catch (err) { next(err); }
});

router.post('/lending/affordability', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      monthlyIncome: z.number().positive(),
      existingEMI: z.number().min(0),
      requestedEMI: z.number().positive(),
      maxDTI: z.number().min(0).max(1).optional(),
    });
    const body = schema.parse(req.body);
    const result = calculateAffordability(body);
    successResponse(res, { affordability: result });
  } catch (err) { next(err); }
});

router.post('/lending/scenarios', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      principal: z.number().positive(),
      annualRate: z.number().min(0),
      tenures: z.array(z.number().positive().int()),
    });
    const body = schema.parse(req.body);
    const scenarios = generateScenarios(body.principal, body.annualRate, body.tenures);
    successResponse(res, { scenarios });
  } catch (err) { next(err); }
});

router.post('/lending/applications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      journeyId: z.string(),
      loanType: z.string(),
      amount: z.number().positive(),
    });
    const body = schema.parse(req.body);
    const userId = (req as any).userId;
    await getJourney(body.journeyId, userId);

    const app = await prisma.application.create({
      data: {
        journeyId: body.journeyId,
        domain: 'LENDING',
        applicationType: body.loanType,
        status: 'DRAFT',
        payload: JSON.stringify(body),
      },
    });

    successResponse(res, {
      application: app,
      safetyNote: 'This is a prototype. No real loan application has been submitted.',
    }, 201);
  } catch (err) { next(err); }
});

router.get('/lending/applications/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const app = await prisma.application.findUnique({
      where: { id: p(req.params.id) },
      include: { events: true },
    });
    if (!app) {
      errorResponse(res, ErrorCodes.NOT_FOUND, 'Application not found.', 404);
      return;
    }
    successResponse(res, { application: app });
  } catch (err) { next(err); }
});

// ============================================================
// FINTECH — Transactions & Disputes
// ============================================================
router.get('/fintech/transactions/:ref', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check DB first, then mock
    let txn = await prisma.transaction.findUnique({
      where: { transactionRef: p(req.params.ref) },
    });

    if (!txn) {
      const mockTxn = await mockFintech.getTransaction(p(req.params.ref));
      successResponse(res, { transaction: mockTxn, source: 'MOCK' });
      return;
    }

    successResponse(res, { transaction: txn, source: 'DATABASE' });
  } catch (err) { next(err); }
});

router.post('/fintech/disputes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      journeyId: z.string(),
      transactionRef: z.string(),
      reason: z.string(),
    });
    const body = schema.parse(req.body);
    const userId = (req as any).userId;
    await getJourney(body.journeyId, userId);

    // Find transaction
    let txn = await prisma.transaction.findUnique({
      where: { transactionRef: body.transactionRef },
    });

    if (!txn) {
      errorResponse(res, ErrorCodes.NOT_FOUND, 'Transaction not found.', 404);
      return;
    }

    const dispute = await prisma.dispute.create({
      data: {
        journeyId: body.journeyId,
        transactionId: txn.id,
        reason: body.reason,
        status: 'DRAFT',
      },
    });

    successResponse(res, {
      dispute,
      transaction: txn,
      safetyNote: 'This is a prototype. No real dispute has been filed.',
    }, 201);
  } catch (err) { next(err); }
});

// ============================================================
// MOCK INSTITUTION APIs (for demo/testing)
// ============================================================
router.post('/mock/insurer/claims', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mockInsurer.submitClaim(req.body);
    successResponse(res, { ...result, providerMode: 'MOCK' });
  } catch (err) { next(err); }
});

router.get('/mock/insurer/claims/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mockInsurer.getClaim(p(req.params.id));
    successResponse(res, { ...result, providerMode: 'MOCK' });
  } catch (err) { next(err); }
});

router.post('/mock/lender/applications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mockLender.submitApplication(req.body);
    successResponse(res, { ...result, providerMode: 'MOCK' });
  } catch (err) { next(err); }
});

router.get('/mock/lender/applications/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mockLender.getApplication(p(req.params.id));
    successResponse(res, { ...result, providerMode: 'MOCK' });
  } catch (err) { next(err); }
});

router.get('/mock/fintech/transactions/:ref', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mockFintech.getTransaction(p(req.params.ref));
    successResponse(res, { ...result, providerMode: 'MOCK' });
  } catch (err) { next(err); }
});

router.post('/mock/fintech/disputes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mockFintech.submitDispute(req.body);
    successResponse(res, { ...result, providerMode: 'MOCK' });
  } catch (err) { next(err); }
});

// ============================================================
// LLM — Explanation endpoint
// ============================================================
router.post('/journeys/:id/explain', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = z.object({ query: z.string() }).parse(req.body);
    const userId = (req as any).userId;
    await getJourney(p(req.params.id), userId);

    const evidence = await getEvidence(p(req.params.id));
    const { systemPrompt, userMessage } = buildSecurePrompt({
      baseSystemPrompt: 'You are a helpful financial copilot. Explain based on evidence and policy terms only. Never fabricate information.',
      untrustedData: evidence.slice(0, 10).map(e => ({
        label: e.fieldName,
        content: `${e.value}${e.sourceText ? ` (from ${e.sourceText})` : ''}`,
        page: e.sourcePage || undefined,
      })),
      userInstruction: query,
    });

    const response = await llm.chat(systemPrompt, userMessage);

    successResponse(res, {
      explanation: response.content,
      model: response.model,
      providerMode: 'MOCK',
      disclaimer: 'Based on the provided information. This is not financial advice.',
    });
  } catch (err) { next(err); }
});

// ============================================================
// CHAT — Conversational endpoint
// ============================================================
router.post('/journeys/:id/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = z.object({ message: z.string() }).parse(req.body);
    const userId = (req as any).userId;
    const requestId = (req as any).requestId;
    const journey = await getJourney(p(req.params.id), userId);

    // Detect intent from message
    const intent = detectIntent(message);

    // Get current context
    const nextActions = await determineNextActions(p(req.params.id));
    const evidence = await getEvidence(p(req.params.id));

    // Generate contextual LLM response with prompt barrier
    const sanitizedUserMsg = sanitizeUntrustedDocumentText(message).sanitizedText;
    const context = `Journey: ${journey.domain}/${journey.journeyType}, Status: ${journey.status}, Evidence items: ${evidence.length}, Actions needed: ${nextActions.length}`;
    const defensiveSystemPrompt = createDefensiveSystemPrompt(
      `You are a financial copilot. Current context: ${context}. Guide the user based on their journey status.`
    );
    const response = await llm.chat(defensiveSystemPrompt, sanitizedUserMsg);

    // Log the interaction
    await createAuditEvent({
      journeyId: p(req.params.id),
      eventType: 'chat_message',
      actorType: 'USER',
      actorId: userId,
      requestId,
      metadata: { message: message.slice(0, 200) } as Record<string, unknown>,
    });

    successResponse(res, {
      reply: response.content,
      intent: { domain: intent.domain, journeyType: intent.journeyType, confidence: intent.confidence },
      nextActions,
      journeyStatus: journey.status,
      providerMode: 'MOCK',
    });
  } catch (err) { next(err); }
});

// ============================================================
// RULES — Deterministic rule checking endpoints
// ============================================================
import { insuranceRules, lendingRules, fintechRules } from '../rules';

router.post('/rules/insurance/room-rent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({ dailyRent: z.number(), policyLimit: z.number(), days: z.number().int() });
    const body = schema.parse(req.body);
    const result = insuranceRules.checkRoomRentLimit(body.dailyRent, body.policyLimit, body.days);
    successResponse(res, { result });
  } catch (err) { next(err); }
});

router.post('/rules/insurance/claim-amount', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({ amount: z.number(), sumInsured: z.number() });
    const body = schema.parse(req.body);
    const result = insuranceRules.validateClaimAmount(body.amount, body.sumInsured);
    successResponse(res, { result });
  } catch (err) { next(err); }
});

router.post('/rules/insurance/copay', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({ amount: z.number(), coPayPercent: z.number(), age: z.number().int() });
    const body = schema.parse(req.body);
    const result = insuranceRules.calculateCoPay(body.amount, body.coPayPercent, body.age);
    successResponse(res, { result });
  } catch (err) { next(err); }
});

router.post('/rules/lending/income-validation', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      salarySlipIncome: z.number(), bankStatementIncome: z.number(), tolerancePercent: z.number().optional(),
    });
    const body = schema.parse(req.body);
    const result = lendingRules.validateIncome(body.salarySlipIncome, body.bankStatementIncome, body.tolerancePercent);
    successResponse(res, { result });
  } catch (err) { next(err); }
});

router.post('/rules/lending/max-loan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      monthlyIncome: z.number(), maxDTI: z.number().optional(), existingEMI: z.number().optional(),
      tenureMonths: z.number().optional(), annualRate: z.number().optional(),
    });
    const body = schema.parse(req.body);
    const maxLoan = lendingRules.getMaxLoanAmount(
      body.monthlyIncome, body.maxDTI, body.existingEMI, body.tenureMonths, body.annualRate
    );
    successResponse(res, {
      maxLoanAmount: maxLoan,
      assumptions: ['Based on DTI ratio and declared income', 'Subject to credit score and lender policies'],
    });
  } catch (err) { next(err); }
});

router.post('/rules/lending/credit-readiness', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      monthlyIncome: z.number(), existingEMI: z.number(), requestedAmount: z.number(),
      employmentType: z.string(), hasITR: z.boolean(), hasBankStatement: z.boolean(),
    });
    const body = schema.parse(req.body);
    const result = lendingRules.assessCreditReadiness(body);
    successResponse(res, { result });
  } catch (err) { next(err); }
});

router.post('/rules/fintech/classify-issue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      status: z.string(), debitConfirmed: z.boolean(), creditConfirmed: z.boolean(),
    });
    const body = schema.parse(req.body);
    const classification = fintechRules.classifyTransactionIssue(body.status, body.debitConfirmed, body.creditConfirmed);
    const resolution = fintechRules.estimateResolutionTime(classification.issueType);
    successResponse(res, { classification, resolution });
  } catch (err) { next(err); }
});

// ============================================================
// KNOWLEDGE — Policy search
// ============================================================
import { MockKnowledgeProvider } from '../integrations/mock/knowledge';
const knowledge = new MockKnowledgeProvider();

router.post('/knowledge/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = z.object({ query: z.string() }).parse(req.body);
    const results = await knowledge.search(query);
    successResponse(res, { results, providerMode: 'MOCK' });
  } catch (err) { next(err); }
});

router.post('/knowledge/policy-search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({ policyId: z.string(), version: z.string(), query: z.string() });
    const body = schema.parse(req.body);
    const results = await knowledge.searchPolicy(body.policyId, body.version, body.query);
    successResponse(res, { results, providerMode: 'MOCK' });
  } catch (err) { next(err); }
});

// ============================================================
// ADMIN — Role-based protected endpoints
// ============================================================
router.get('/admin/audit', requireRole('ADMIN'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await prisma.auditEvent.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
    successResponse(res, { events, count: events.length });
  } catch (err) { next(err); }
});

export default router;


