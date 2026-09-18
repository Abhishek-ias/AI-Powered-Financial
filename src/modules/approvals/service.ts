// ============================================================
// Approval Service — Consequential action confirmation
// ============================================================
import prisma from '../../config/database';
import { createAuditEvent } from '../audit/service';
import { createTimelineEvent } from '../timeline/service';
import { AppError } from '../../middleware/errors';
import { ErrorCodes } from '../../utils/response';
import crypto from 'crypto';

export async function createApprovalRequest(
  journeyId: string,
  userId: string,
  action: string,
  payload: Record<string, unknown>,
  idempotencyKey?: string,
  requestId?: string,
) {
  // Idempotency check
  if (idempotencyKey) {
    const existing = await prisma.approvalRequest.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      if (existing.approvalState === 'APPROVED') {
        return existing; // Already approved, return same result
      }
      throw new AppError(ErrorCodes.IDEMPOTENCY_CONFLICT, 'This action has already been requested.', 409);
    }
  }

  const payloadStr = JSON.stringify(payload);
  const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex');

  const approval = await prisma.approvalRequest.create({
    data: {
      journeyId,
      userId,
      action,
      payload: payloadStr,
      payloadHash,
      requester: 'SYSTEM',
      approvalState: 'PENDING',
      idempotencyKey,
    },
  });

  await createAuditEvent({
    journeyId,
    eventType: 'approval_created',
    actorType: 'SYSTEM',
    actorId: userId,
    requestId,
    metadata: { action, approvalId: approval.id },
  });

  await createTimelineEvent({
    journeyId,
    eventType: 'approval_created',
    title: `Approval requested: ${action}`,
    details: 'Awaiting user confirmation before proceeding.',
    actorType: 'SYSTEM',
  });

  return approval;
}

export async function processApproval(
  approvalId: string,
  userId: string,
  approved: boolean,
  requestId?: string,
) {
  const approval = await prisma.approvalRequest.findUnique({ where: { id: approvalId } });
  if (!approval) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Approval request not found.', 404);
  }

  if (approval.userId !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'You cannot approve this request.', 403);
  }

  if (approval.approvalState !== 'PENDING') {
    throw new AppError(ErrorCodes.INVALID_STATE_TRANSITION, `Approval is already ${approval.approvalState}.`, 400);
  }

  // Verify payload integrity
  if (approval.payload) {
    const currentHash = crypto.createHash('sha256').update(approval.payload).digest('hex');
    if (currentHash !== approval.payloadHash) {
      throw new AppError(ErrorCodes.INVALID_REQUEST, 'Approval payload has been tampered with.', 400);
    }
  }

  const updated = await prisma.approvalRequest.update({
    where: { id: approvalId },
    data: { approvalState: approved ? 'APPROVED' : 'REJECTED' },
  });

  await createAuditEvent({
    journeyId: approval.journeyId,
    eventType: approved ? 'approval_granted' : 'approval_rejected',
    actorType: 'USER',
    actorId: userId,
    requestId,
    metadata: { approvalId, action: approval.action },
  });

  await createTimelineEvent({
    journeyId: approval.journeyId,
    eventType: approved ? 'approval_granted' : 'approval_rejected',
    title: approved ? `Approved: ${approval.action}` : `Rejected: ${approval.action}`,
    details: approved ? 'User confirmed the action.' : 'User rejected the action.',
    actorType: 'USER',
    actorId: userId,
  });

  return updated;
}

export async function getApprovals(journeyId: string) {
  return prisma.approvalRequest.findMany({
    where: { journeyId },
    orderBy: { createdAt: 'desc' },
  });
}
