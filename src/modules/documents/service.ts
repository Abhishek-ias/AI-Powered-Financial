// ============================================================
// Document Service — Upload, validation, processing pipeline
// ============================================================
import prisma from '../../config/database';
import { createAuditEvent } from '../audit/service';
import { createTimelineEvent } from '../timeline/service';
import { AppError } from '../../middleware/errors';
import { ErrorCodes } from '../../utils/response';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const ALLOWED_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/tiff',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export function validateFile(file: { originalname: string; mimetype: string; size: number; buffer?: Buffer }) {
  // Filename safety: prevent path traversal
  const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
  if (safeName !== file.originalname && file.originalname.includes('..')) {
    throw new AppError(ErrorCodes.DOCUMENT_INVALID, 'Invalid filename: path traversal detected.', 400);
  }

  // MIME validation
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    throw new AppError(
      ErrorCodes.DOCUMENT_INVALID,
      `Unsupported file type: ${file.mimetype}. Allowed: ${ALLOWED_MIMES.join(', ')}`,
      400
    );
  }

  // Size validation
  if (file.size > MAX_SIZE) {
    throw new AppError(ErrorCodes.DOCUMENT_INVALID, `File too large. Maximum size: ${MAX_SIZE / 1024 / 1024}MB`, 400);
  }

  return safeName;
}

export async function uploadDocument(
  journeyId: string,
  userId: string,
  documentType: string,
  file: { originalname: string; mimetype: string; size: number; buffer: Buffer; filename: string; path: string },
  requestId?: string
) {
  const safeName = validateFile(file);

  // Compute checksum
  const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

  // Store file reference
  const storageRef = file.path || `uploads/${file.filename}`;

  const document = await prisma.document.create({
    data: {
      journeyId,
      userId,
      documentType,
      filename: file.filename || safeName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storageRef,
      checksum,
      status: 'UPLOADED',
      source: 'USER',
    },
  });

  await createAuditEvent({
    journeyId,
    eventType: 'document_uploaded',
    actorType: 'USER',
    actorId: userId,
    requestId,
    metadata: { documentType, filename: safeName, size: file.size, checksum },
  });

  await createTimelineEvent({
    journeyId,
    eventType: 'document_uploaded',
    title: `Document uploaded: ${documentType}`,
    details: `${safeName} (${(file.size / 1024).toFixed(1)} KB)`,
    actorType: 'USER',
    actorId: userId,
  });

  return document;
}

export async function getDocuments(journeyId: string) {
  return prisma.document.findMany({
    where: { journeyId },
    include: { fields: true },
    orderBy: { createdAt: 'asc' },
  });
}

export async function updateDocumentStatus(documentId: string, status: string, processingMs?: Record<string, number>) {
  return prisma.document.update({
    where: { id: documentId },
    data: {
      status,
      processingMs: processingMs ? JSON.stringify(processingMs) : undefined,
    },
  });
}

export async function createDocumentFields(documentId: string, fields: Array<{
  fieldName: string;
  value: string;
  normalizedValue?: string;
  unit?: string;
  page?: number;
  confidence: number;
  sourceText?: string;
  status?: string;
}>) {
  return prisma.documentField.createMany({
    data: fields.map(f => ({
      documentId,
      fieldName: f.fieldName,
      value: f.value,
      normalizedValue: f.normalizedValue,
      unit: f.unit,
      page: f.page,
      confidence: f.confidence,
      sourceText: f.sourceText,
      status: f.status || 'EXTRACTED',
    })),
  });
}
