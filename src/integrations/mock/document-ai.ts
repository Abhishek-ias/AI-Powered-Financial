// ============================================================
// Mock Document AI Provider
// Implements DocumentAIProvider interface with deterministic results
// ============================================================
import { DocumentAIProvider, DocumentExtractionResult, ExtractedField } from '../../types';

export class MockDocumentAIProvider implements DocumentAIProvider {
  async analyzeDocument(buffer: Buffer, mimeType: string, documentType?: string): Promise<DocumentExtractionResult> {
    const startTime = Date.now();

    // Simulate processing delay
    await sleep(200 + Math.random() * 300);

    const fields = this.getMockFields(documentType || 'UNKNOWN');
    const classificationMs = 50 + Math.random() * 50;
    const extractionMs = Date.now() - startTime - classificationMs;

    return {
      documentType: documentType || 'GENERAL_DOCUMENT',
      fields,
      rawText: `[Mock extracted text from ${documentType || 'document'}]`,
      pages: 1 + Math.floor(Math.random() * 5),
      classificationMs: Math.round(classificationMs),
      extractionMs: Math.round(extractionMs),
      totalProcessingMs: Date.now() - startTime,
    };
  }

  async analyzeIdentityDocument(buffer: Buffer, mimeType: string): Promise<DocumentExtractionResult> {
    const startTime = Date.now();
    await sleep(150 + Math.random() * 200);

    return {
      documentType: 'ID_DOCUMENT',
      fields: [
        { fieldName: 'full_name', value: 'Ramesh Kumar', confidence: 0.95, page: 1, sourceText: 'Name: Ramesh Kumar' },
        { fieldName: 'document_number', value: 'XXXX-XXXX-1234', confidence: 0.92, page: 1, sourceText: 'ID: XXXX-XXXX-1234' },
        { fieldName: 'date_of_birth', value: '1985-03-15', normalizedValue: '1985-03-15', confidence: 0.90, page: 1 },
        { fieldName: 'address', value: '42, MG Road, Bengaluru, Karnataka 560001', confidence: 0.88, page: 1 },
      ],
      rawText: '[Mock identity document text]',
      pages: 1,
      classificationMs: 30,
      extractionMs: Math.round(Date.now() - startTime - 30),
      totalProcessingMs: Date.now() - startTime,
    };
  }

  private getMockFields(documentType: string): ExtractedField[] {
    switch (documentType) {
      case 'HOSPITAL_BILL':
        return [
          { fieldName: 'patient_name', value: 'Ramesh Kumar', confidence: 0.96, page: 1, sourceText: 'Patient: Ramesh Kumar' },
          { fieldName: 'hospital_name', value: 'Apollo Hospital, Bengaluru', confidence: 0.98, page: 1, sourceText: 'Apollo Hospital' },
          { fieldName: 'admission_date', value: '2024-08-10', normalizedValue: '2024-08-10', confidence: 0.94, page: 1 },
          { fieldName: 'discharge_date', value: '2024-08-15', normalizedValue: '2024-08-15', confidence: 0.94, page: 1 },
          { fieldName: 'room_rent_per_day', value: '7500', normalizedValue: '7500', unit: 'INR', confidence: 0.97, page: 3, sourceText: 'Room Rent: ₹7,500/day' },
          { fieldName: 'total_room_rent', value: '37500', normalizedValue: '37500', unit: 'INR', confidence: 0.96, page: 3 },
          { fieldName: 'surgery_charges', value: '85000', normalizedValue: '85000', unit: 'INR', confidence: 0.95, page: 3 },
          { fieldName: 'medicine_charges', value: '15000', normalizedValue: '15000', unit: 'INR', confidence: 0.93, page: 3 },
          { fieldName: 'total_bill', value: '165000', normalizedValue: '165000', unit: 'INR', confidence: 0.97, page: 4, sourceText: 'Total: ₹1,65,000' },
          { fieldName: 'diagnosis', value: 'Appendectomy', confidence: 0.91, page: 1, sourceText: 'Diagnosis: Acute Appendicitis' },
        ];

      case 'DISCHARGE_SUMMARY':
        return [
          { fieldName: 'patient_name', value: 'Ramesh Kumar', confidence: 0.96, page: 1 },
          { fieldName: 'admission_date', value: '2024-08-10', normalizedValue: '2024-08-10', confidence: 0.95, page: 1 },
          { fieldName: 'discharge_date', value: '2024-08-15', normalizedValue: '2024-08-15', confidence: 0.95, page: 1 },
          { fieldName: 'diagnosis', value: 'Acute Appendicitis', confidence: 0.93, page: 1 },
          { fieldName: 'procedure', value: 'Laparoscopic Appendectomy', confidence: 0.92, page: 1 },
          { fieldName: 'treating_doctor', value: 'Dr. Anil Mehta', confidence: 0.90, page: 1 },
          { fieldName: 'days_of_stay', value: '5', normalizedValue: '5', unit: 'days', confidence: 0.95, page: 1 },
        ];

      case 'SALARY_SLIP':
        return [
          { fieldName: 'employee_name', value: 'Ramesh Kumar', confidence: 0.96, page: 1 },
          { fieldName: 'employer', value: 'TechCorp Solutions Pvt Ltd', confidence: 0.94, page: 1 },
          { fieldName: 'month', value: 'August 2024', confidence: 0.95, page: 1 },
          { fieldName: 'basic_salary', value: '40000', normalizedValue: '40000', unit: 'INR', confidence: 0.95, page: 1 },
          { fieldName: 'hra', value: '16000', normalizedValue: '16000', unit: 'INR', confidence: 0.94, page: 1 },
          { fieldName: 'special_allowance', value: '14500', normalizedValue: '14500', unit: 'INR', confidence: 0.93, page: 1 },
          { fieldName: 'gross_salary', value: '70500', normalizedValue: '70500', unit: 'INR', confidence: 0.96, page: 1, sourceText: 'Gross: ₹70,500' },
          { fieldName: 'net_salary', value: '62000', normalizedValue: '62000', unit: 'INR', confidence: 0.95, page: 1, sourceText: 'Net Pay: ₹62,000' },
        ];

      case 'BANK_STATEMENT':
        return [
          { fieldName: 'account_holder', value: 'Ramesh Kumar', confidence: 0.96, page: 1 },
          { fieldName: 'bank_name', value: 'State Bank of India', confidence: 0.98, page: 1 },
          { fieldName: 'account_number', value: 'XXXX-XXXX-5678', confidence: 0.94, page: 1 },
          { fieldName: 'statement_period', value: 'Aug 2024', confidence: 0.93, page: 1 },
          { fieldName: 'salary_credit', value: '52000', normalizedValue: '52000', unit: 'INR', confidence: 0.99, page: 2, sourceText: 'SAL CREDIT - ₹52,000' },
          { fieldName: 'average_balance', value: '125000', normalizedValue: '125000', unit: 'INR', confidence: 0.92, page: 1 },
          { fieldName: 'closing_balance', value: '98500', normalizedValue: '98500', unit: 'INR', confidence: 0.95, page: 3 },
        ];

      case 'CLAIM_FORM':
        return [
          { fieldName: 'claimant_name', value: 'Ramesh Kumar', confidence: 0.95, page: 1 },
          { fieldName: 'policy_number', value: 'POL-HEALTH-2024-001', confidence: 0.97, page: 1 },
          { fieldName: 'claim_type', value: 'Reimbursement', confidence: 0.93, page: 1 },
          { fieldName: 'claim_amount', value: '165000', normalizedValue: '165000', unit: 'INR', confidence: 0.94, page: 1 },
        ];

      case 'AADHAAR':
        return [
          { fieldName: 'full_name', value: 'Ramesh Kumar', confidence: 0.95, page: 1 },
          { fieldName: 'aadhaar_number', value: 'XXXX-XXXX-1234', confidence: 0.92, page: 1 },
          { fieldName: 'date_of_birth', value: '1985-03-15', normalizedValue: '1985-03-15', confidence: 0.90, page: 1 },
          { fieldName: 'gender', value: 'Male', confidence: 0.96, page: 1 },
          { fieldName: 'address', value: '42, MG Road, Bengaluru, Karnataka 560001', confidence: 0.88, page: 2 },
        ];

      case 'PAN':
        return [
          { fieldName: 'full_name', value: 'Ramesh Kumar', confidence: 0.96, page: 1 },
          { fieldName: 'pan_number', value: 'ABCPK1234M', confidence: 0.94, page: 1 },
          { fieldName: 'date_of_birth', value: '1985-03-15', normalizedValue: '1985-03-15', confidence: 0.91, page: 1 },
          { fieldName: 'father_name', value: 'Suresh Kumar', confidence: 0.89, page: 1 },
        ];

      default:
        return [
          { fieldName: 'content_type', value: documentType, confidence: 0.60, page: 1 },
          { fieldName: 'text_detected', value: 'true', confidence: 0.80, page: 1 },
        ];
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
