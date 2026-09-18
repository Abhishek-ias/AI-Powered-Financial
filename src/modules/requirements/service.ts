// ============================================================
// Requirements Service — Dynamic document/info requirements
// ============================================================
import prisma from '../../config/database';

interface RequirementDef {
  key: string;
  label: string;
  required: boolean;
  reason: string;
  priority: string;
}

const INSURANCE_CLAIM_REQUIREMENTS: RequirementDef[] = [
  { key: 'claim_form', label: 'Claim Form', required: true, reason: 'Required by insurer for claim processing', priority: 'HIGH' },
  { key: 'hospital_bill', label: 'Hospital Bill', required: true, reason: 'Required to verify treatment costs', priority: 'HIGH' },
  { key: 'discharge_summary', label: 'Discharge Summary', required: true, reason: 'Required to verify diagnosis and treatment', priority: 'HIGH' },
  { key: 'id_proof', label: 'ID Proof (Aadhaar/PAN)', required: true, reason: 'Required for identity verification', priority: 'HIGH' },
  { key: 'prescription', label: 'Doctor Prescription', required: false, reason: 'May be required for specific treatments', priority: 'MEDIUM' },
  { key: 'investigation_reports', label: 'Investigation Reports', required: false, reason: 'Required for surgical/major treatment claims', priority: 'MEDIUM' },
];

const LENDING_REQUIREMENTS: RequirementDef[] = [
  { key: 'pan', label: 'PAN Card', required: true, reason: 'Required for financial identification', priority: 'HIGH' },
  { key: 'aadhaar', label: 'Aadhaar Card', required: true, reason: 'Required for identity and address verification', priority: 'HIGH' },
  { key: 'salary_slip', label: 'Latest Salary Slip', required: true, reason: 'Required for income verification', priority: 'HIGH' },
  { key: 'bank_statement', label: 'Bank Statement (6 months)', required: true, reason: 'Required for income and spending pattern verification', priority: 'HIGH' },
  { key: 'address_proof', label: 'Address Proof', required: true, reason: 'Required for address verification', priority: 'MEDIUM' },
  { key: 'itr', label: 'Income Tax Return', required: false, reason: 'Strengthens income verification', priority: 'LOW' },
];

const FINTECH_REQUIREMENTS: RequirementDef[] = [
  { key: 'transaction_screenshot', label: 'Transaction Screenshot', required: true, reason: 'Required to verify the transaction', priority: 'HIGH' },
  { key: 'bank_statement_entry', label: 'Bank Statement showing debit', required: false, reason: 'Required for debit verification', priority: 'MEDIUM' },
];

export async function generateRequirements(journeyId: string, domain: string, journeyType: string) {
  const existing = await prisma.requirement.findMany({ where: { journeyId } });
  if (existing.length > 0) return existing;

  let templates: RequirementDef[];
  if (domain === 'INSURANCE') templates = INSURANCE_CLAIM_REQUIREMENTS;
  else if (domain === 'LENDING') templates = LENDING_REQUIREMENTS;
  else if (domain === 'FINTECH') templates = FINTECH_REQUIREMENTS;
  else templates = [];

  await prisma.requirement.createMany({
    data: templates.map(t => ({
      journeyId,
      key: t.key,
      label: t.label,
      domain,
      journeyType,
      required: t.required,
      reason: t.reason,
      source: 'SYSTEM',
      priority: t.priority,
      status: 'PENDING',
    })),
  });

  return prisma.requirement.findMany({
    where: { journeyId },
    orderBy: { priority: 'asc' },
  });
}

export async function getRequirements(journeyId: string) {
  return prisma.requirement.findMany({
    where: { journeyId },
    orderBy: { priority: 'asc' },
  });
}

export async function updateRequirementStatus(requirementId: string, status: string) {
  return prisma.requirement.update({
    where: { id: requirementId },
    data: { status },
  });
}
