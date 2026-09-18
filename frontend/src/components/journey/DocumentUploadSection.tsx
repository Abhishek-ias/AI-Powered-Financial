import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  FileText,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { DocumentItem, JourneyRequirement } from '../../types';
import { DocumentCard } from './DocumentCard';

export interface DocumentUploadSectionProps {
  journeyId: string;
  requirements: JourneyRequirement[];
  documents: DocumentItem[];
  onUploadFile: (file: File, documentType: string) => Promise<void>;
  onProcessDocuments: () => Promise<void>;
  isUploading: boolean;
  isProcessing: boolean;
  hasConsented: boolean;
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  journeyId,
  requirements,
  documents,
  onUploadFile,
  onProcessDocuments,
  isUploading,
  isProcessing,
  hasConsented,
}) => {
  const [selectedType, setSelectedType] = useState<string>('HOSPITAL_BILL');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map requirement key to document type
  const mapKeyToDocType = (key: string): string => {
    switch (key.toLowerCase()) {
      case 'hospital_bill':
        return 'HOSPITAL_BILL';
      case 'discharge_summary':
        return 'DISCHARGE_SUMMARY';
      case 'claim_form':
        return 'CLAIM_FORM';
      case 'id_proof':
      case 'aadhaar':
        return 'AADHAAR';
      case 'pan':
        return 'PAN';
      default:
        return key.toUpperCase();
    }
  };

  // Client-side validation
  const validateAndUpload = async (file: File, docType: string) => {
    setClientError(null);
    setUploadSuccessMsg(null);

    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.png') && !file.name.endsWith('.jpg')) {
      setClientError(`Unsupported file format (${file.type || 'unknown'}). Please select a PDF, PNG, or JPG document.`);
      return;
    }

    if (file.size > MAX_SIZE) {
      setClientError(`File size exceeds 20MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller file.`);
      return;
    }

    try {
      await onUploadFile(file, docType);
      setUploadSuccessMsg(`Successfully uploaded ${file.name} as ${docType}.`);
      setTimeout(() => setUploadSuccessMsg(null), 4000);
    } catch (err: any) {
      setClientError(err.message || 'Failed to upload document to backend.');
    }
  };

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0], selectedType);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0], selectedType);
    }
  };

  // Synthetic Test Batch Generator for Instant Testing & Evaluation
  const handleUploadSamplePacket = async () => {
    setIsSynthesizing(true);
    setClientError(null);

    const sampleFiles = [
      {
        name: 'Apollo_Hospital_Final_Bill_INV8841.pdf',
        type: 'HOSPITAL_BILL',
        content: '%PDF-1.4 Mock Hospital Bill for Ramesh Kumar Apollo Hospital Bangalore Total: 165000 Room Rent: 7500',
      },
      {
        name: 'Discharge_Summary_Dr_Anil_Mehta.pdf',
        type: 'DISCHARGE_SUMMARY',
        content: '%PDF-1.4 Mock Discharge Summary Acute Appendicitis Laparoscopic Appendectomy Ramesh Kumar 2024-08-10',
      },
      {
        name: 'Star_Health_Claim_Form_Signed.pdf',
        type: 'CLAIM_FORM',
        content: '%PDF-1.4 Mock Claim Form Policy POL-HEALTH-2024-001 Ramesh Kumar Diagnosis Appendicitis',
      },
      {
        name: 'Government_ID_Aadhaar_Card.pdf',
        type: 'AADHAAR',
        content: '%PDF-1.4 Mock Aadhaar Ramesh Kumar DOB 1985-03-15 XXXX-XXXX-1234',
      },
    ];

    try {
      for (const sample of sampleFiles) {
        const blob = new Blob([sample.content], { type: 'application/pdf' });
        const file = new File([blob], sample.name, { type: 'application/pdf' });
        await onUploadFile(file, sample.type);
      }
      setUploadSuccessMsg('Successfully loaded complete synthetic claim document packet (4 documents).');
    } catch (err: any) {
      setClientError(err.message || 'Failed to upload sample documents.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Requirement status helper
  const getRequirementStatus = (req: JourneyRequirement) => {
    const docType = mapKeyToDocType(req.key);
    const uploadedDoc = documents.find((d) => d.documentType === docType);
    if (!uploadedDoc) {
      return { status: 'MISSING', doc: null };
    }
    return { status: uploadedDoc.status, doc: uploadedDoc };
  };

  const uploadedCount = documents.length;
  const processedCount = documents.filter((d) => d.status === 'PROCESSED').length;
  const canProcess = uploadedCount > 0 && !isProcessing && !isUploading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Requirements Checklist Card */}
      <Card
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid var(--border-subtle)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <FileCheck size={16} color="#60a5fa" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-light)' }}>
                Stage 4 • Document Intelligence & Intake
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Required Insurance Claim Documentation
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Upload original hospital bills, diagnosis papers, and claim forms for automated OCR and evidence extraction.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Badge variant="blue">
              {uploadedCount} of {requirements.length > 0 ? requirements.length : 4} Uploaded
            </Badge>
            <button
              onClick={handleUploadSamplePacket}
              disabled={isUploading || isProcessing || isSynthesizing}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              title="Instantly generate & upload synthetic test claim documents"
            >
              <Sparkles size={13} color="#60a5fa" />
              <span>{isSynthesizing ? 'Uploading Batch...' : 'Load Sample Claim Packet'}</span>
            </button>
          </div>
        </div>

        {/* Requirements Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
            marginTop: '1rem',
          }}
        >
          {requirements.map((req) => {
            const { status, doc } = getRequirementStatus(req);
            const isUploaded = status !== 'MISSING';

            return (
              <div
                key={req.id || req.key}
                onClick={() => setSelectedType(mapKeyToDocType(req.key))}
                style={{
                  background: isUploaded ? 'rgba(16, 185, 129, 0.08)' : 'rgba(30, 41, 59, 0.4)',
                  border: isUploaded
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : selectedType === mapKeyToDocType(req.key)
                    ? '1px solid #3b82f6'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: req.priority === 'HIGH' ? '#f59e0b' : 'var(--text-muted)',
                    }}
                  >
                    {req.priority || 'REQUIRED'}
                  </span>
                  <Badge variant={isUploaded ? 'green' : 'amber'}>
                    {isUploaded ? '✓ Uploaded' : '⚠ Missing'}
                  </Badge>
                </div>

                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {req.label || req.key}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  {req.reason}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Drag & Drop Upload Zone */}
      <Card
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: dragActive ? '2px dashed #60a5fa' : '1px solid var(--border-subtle)',
          padding: '1.5rem',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>File Upload Gateway</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Target Document Category:
            </span>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            disabled={isUploading || isProcessing}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '0.375rem 0.75rem',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          >
            <option value="HOSPITAL_BILL">Hospital Bill (Itemized)</option>
            <option value="DISCHARGE_SUMMARY">Discharge Summary & Diagnosis</option>
            <option value="CLAIM_FORM">Claim Form (Signed)</option>
            <option value="AADHAAR">ID Proof (Aadhaar Card)</option>
            <option value="PAN">ID Proof (PAN Card)</option>
            <option value="OTHER">Other Supporting Document</option>
          </select>
        </div>

        {/* Drop Box Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragActive ? 'rgba(59, 130, 246, 0.08)' : 'rgba(30, 41, 59, 0.3)',
            transition: 'all 0.2s',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />

          <UploadCloud size={40} color={dragActive ? '#60a5fa' : 'var(--text-muted)'} style={{ margin: '0 auto 0.75rem' }} />

          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Drag & drop your document here, or <span style={{ color: 'var(--primary-light)' }}>browse files</span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
            Supported: PDF, JPG, PNG • Max size: 20MB • Untrusted document content is isolated safely
          </p>
        </div>

        {/* Feedback Messages */}
        {clientError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
            <AlertCircle size={15} />
            <span>{clientError}</span>
          </div>
        )}

        {uploadSuccessMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
            <CheckCircle2 size={15} />
            <span>{uploadSuccessMsg}</span>
          </div>
        )}

        {isUploading && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--primary-light)' }}>
            <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#60a5fa' }} />
            <span>Uploading file to backend...</span>
          </div>
        )}
      </Card>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <Card style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="#60a5fa" />
              <h4 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                Intake Documents ({documents.length})
              </h4>
            </div>

            {/* AI Document Processing Action Button */}
            <button
              onClick={onProcessDocuments}
              disabled={!canProcess}
              className="btn btn-primary"
              style={{
                minWidth: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {isProcessing ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} />
                  <span>Processing with Document AI...</span>
                </>
              ) : (
                <>
                  <Cpu size={16} />
                  <span>
                    {processedCount > 0 ? 'Re-run Document AI Pipeline' : 'Process Documents with AI Pipeline'}
                  </span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>

          {/* Processing Stages Visualization */}
          {isProcessing && (
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                marginBottom: '1rem',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Executing Document AI Processing Pipeline:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', color: 'var(--text-secondary)' }}>
                <div>✓ Uploaded files secured and validated</div>
                <div style={{ color: '#60a5fa' }}>● Analyzing document layout & Optical Character Recognition (OCR)...</div>
                <div>○ Applying prompt-injection sanitization barrier</div>
                <div>○ Extracting structured line items & medical evidence</div>
                <div>○ Cross-document consistency & policy clause validation</div>
              </div>
            </div>
          )}

          {/* Document Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
