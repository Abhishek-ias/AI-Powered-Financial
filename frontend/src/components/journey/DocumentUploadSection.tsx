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
  Cpu,
  Check,
  AlertTriangle,
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
  onProceedToEvidence?: () => void;
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
  onProceedToEvidence,
}) => {
  const [selectedType, setSelectedType] = useState<string>('HOSPITAL_BILL');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const validateAndUpload = async (file: File, docType: string) => {
    setClientError(null);
    setUploadSuccessMsg(null);

    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.png') && !file.name.endsWith('.jpg')) {
      setClientError(`Unsupported format (${file.type || 'unknown'}). Please upload a PDF, PNG, or JPG document.`);
      return;
    }

    if (file.size > MAX_SIZE) {
      setClientError(`File size exceeds 20MB limit. Please upload a smaller file.`);
      return;
    }

    try {
      await onUploadFile(file, docType);
      setUploadSuccessMsg(`Uploaded ${file.name} as ${docType}.`);
      setTimeout(() => setUploadSuccessMsg(null), 3500);
    } catch (err: any) {
      setClientError(err.message || 'Failed to upload document.');
    }
  };

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
      setUploadSuccessMsg('Sample claim packet loaded successfully (4 documents).');
    } catch (err: any) {
      setClientError(err.message || 'Failed to upload sample documents.');
    } finally {
      setIsSynthesizing(false);
    }
  };

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
  const allProcessed = uploadedCount > 0 && processedCount === uploadedCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Sample Helper */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Documents required</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Provide itemized hospital records for automated OCR and policy verification.
          </p>
        </div>

        <button
          onClick={handleUploadSamplePacket}
          disabled={isUploading || isProcessing || isSynthesizing}
          className="btn btn-secondary"
          style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', gap: '0.375rem' }}
          title="Instantly upload synthetic test documents"
        >
          <Sparkles size={13} color="var(--primary-light)" />
          <span>{isSynthesizing ? 'Uploading Batch...' : 'Load Sample Claim Packet'}</span>
        </button>
      </div>

      {/* Structured Checklist of Requirements */}
      <Card style={{ padding: '0.5rem 0' }}>
        {requirements.map((req, idx) => {
          const { status, doc } = getRequirementStatus(req);
          const isUploaded = status !== 'MISSING';
          const isProcessed = status === 'PROCESSED';
          const docType = mapKeyToDocType(req.key);

          return (
            <div
              key={req.id || req.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.875rem 1.25rem',
                borderBottom: idx < requirements.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isProcessed
                      ? 'var(--success-bg)'
                      : isUploaded
                      ? 'var(--primary-subtle)'
                      : 'var(--warning-bg)',
                    color: isProcessed
                      ? 'var(--success)'
                      : isUploaded
                      ? 'var(--primary-light)'
                      : 'var(--warning)',
                    flexShrink: 0,
                  }}
                >
                  {isProcessed ? (
                    <Check size={14} />
                  ) : isUploaded ? (
                    <Check size={14} />
                  ) : (
                    <AlertTriangle size={13} />
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {req.label || req.key}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {req.reason || 'Required for claim settlement'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <Badge variant={isProcessed ? 'green' : isUploaded ? 'blue' : 'amber'}>
                  {isProcessed ? 'Processed' : isUploaded ? 'Uploaded' : 'Missing'}
                </Badge>

                {!isUploaded && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType(docType);
                      fileInputRef.current?.click();
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
                  >
                    Upload
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </Card>

      {/* Clean Drag/Drop Zone */}
      <Card
        style={{
          border: dragActive ? '2px dashed var(--primary)' : '1px dashed var(--border-subtle)',
          background: dragActive ? 'var(--primary-subtle)' : 'var(--surface-sunken)',
          padding: '1.75rem 1.25rem',
          textAlign: 'center',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        <UploadCloud
          size={32}
          color={dragActive ? 'var(--primary-light)' : 'var(--text-muted)'}
          style={{ margin: '0 auto 0.5rem' }}
        />

        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Drop your document here, or{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary-light)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              font: 'inherit',
            }}
          >
            browse files
          </button>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Accepted formats: PDF, JPG, PNG • Max size: 20MB
        </p>

        {/* Selected target category picker */}
        <div style={{ marginTop: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Uploading as:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            disabled={isUploading || isProcessing}
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          >
            <option value="HOSPITAL_BILL">Hospital Bill (Itemized)</option>
            <option value="DISCHARGE_SUMMARY">Discharge Summary & Diagnosis</option>
            <option value="CLAIM_FORM">Claim Form (Signed)</option>
            <option value="AADHAAR">ID Proof (Aadhaar)</option>
            <option value="PAN">ID Proof (PAN)</option>
            <option value="OTHER">Other Document</option>
          </select>
        </div>

        {clientError && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', color: 'var(--danger)', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
            <AlertCircle size={14} />
            <span>{clientError}</span>
          </div>
        )}

        {uploadSuccessMsg && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', color: 'var(--success)', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
            <CheckCircle2 size={14} />
            <span>{uploadSuccessMsg}</span>
          </div>
        )}

        {isUploading && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--primary-light)' }}>
            <div className="spinner" style={{ width: '13px', height: '13px', borderTopColor: 'var(--primary)' }} />
            <span>Uploading...</span>
          </div>
        )}
      </Card>

      {/* Processing Sequence Indicator */}
      {isProcessing && (
        <Card style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Document Processing Pipeline:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <div style={{ color: 'var(--success)' }}>✓ Uploaded files secured</div>
            <div style={{ color: 'var(--primary-light)', fontWeight: 600 }}>● Analyzing document structure & OCR...</div>
            <div style={{ color: 'var(--text-muted)' }}>○ Extracting itemized hospital charges</div>
            <div style={{ color: 'var(--text-muted)' }}>○ Checking cross-document consistency</div>
            <div style={{ color: 'var(--text-muted)' }}>○ Preparing evidence items</div>
          </div>
        </Card>
      )}

      {/* Uploaded Documents Grid & Action CTA */}
      {documents.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Uploaded Files ({documents.length})
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={onProcessDocuments}
                disabled={!canProcess}
                className="btn btn-primary"
                style={{ gap: '0.375rem' }}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Cpu size={15} />
                    <span>{processedCount > 0 ? 'Re-run Document AI' : 'Process Documents with AI'}</span>
                  </>
                )}
              </button>

              {allProcessed && onProceedToEvidence && (
                <button
                  onClick={onProceedToEvidence}
                  className="btn btn-primary"
                  style={{ gap: '0.375rem' }}
                >
                  <span>View Evidence</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
