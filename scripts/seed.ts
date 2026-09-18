// ============================================================
// Seed Script — Synthetic Test Data
// ALL DATA IS SYNTHETIC. No real financial/personal data.
// ============================================================
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database with synthetic data...\n');

  // ---- Users ----
  const customer = await prisma.user.upsert({
    where: { email: 'ramesh.kumar@example.com' },
    update: {},
    create: {
      id: 'user-customer-001',
      email: 'ramesh.kumar@example.com',
      name: 'Ramesh Kumar',
      role: 'CUSTOMER',
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'priya.agent@example.com' },
    update: {},
    create: {
      id: 'user-agent-001',
      email: 'priya.agent@example.com',
      name: 'Priya Sharma',
      role: 'AGENT',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: 'user-admin-001',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('  ✅ Users created');

  // ---- Insurance Policy ----
  const policy = await prisma.policy.upsert({
    where: { policyNumber: 'POL-HEALTH-2024-001' },
    update: {},
    create: {
      id: 'policy-001',
      policyNumber: 'POL-HEALTH-2024-001',
      holderName: 'Ramesh Kumar',
      insurerName: 'SafeGuard Health Insurance',
      productName: 'Family Floater Health Plan',
      domain: 'INSURANCE',
      status: 'ACTIVE',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      sumInsured: 500000,
      metadata: JSON.stringify({
        planType: 'Family Floater',
        members: ['Ramesh Kumar', 'Sunita Kumar', 'Arjun Kumar'],
        networkHospitals: true,
      }),
    },
  });

  console.log('  ✅ Insurance policy created');

  // ---- Policy Version with Clauses ----
  await prisma.policyVersion.upsert({
    where: { id: 'pv-001' },
    update: {},
    create: {
      id: 'pv-001',
      policyId: policy.id,
      version: '2024-v1',
      effectiveFrom: new Date('2024-01-01'),
      effectiveTo: new Date('2025-12-31'),
      clauses: JSON.stringify([
        {
          id: 'clause-001',
          section: 'Room Rent',
          title: 'Room Rent Sub-Limit',
          content: 'Room rent is limited to ₹5,000 per day for a single private room. Any excess room rent will be borne by the policyholder. ICU charges are covered up to ₹10,000 per day.',
          page: 12,
          type: 'SUB_LIMIT',
        },
        {
          id: 'clause-002',
          section: 'Pre-Hospitalization',
          title: 'Pre-Hospitalization Expenses',
          content: 'Pre-hospitalization expenses incurred up to 30 days prior to hospitalization are covered, subject to the overall sum insured limit.',
          page: 14,
          type: 'COVERAGE',
        },
        {
          id: 'clause-003',
          section: 'Post-Hospitalization',
          title: 'Post-Hospitalization Expenses',
          content: 'Post-hospitalization expenses incurred up to 60 days after discharge are covered, subject to the overall sum insured limit.',
          page: 15,
          type: 'COVERAGE',
        },
        {
          id: 'clause-004',
          section: 'Exclusions',
          title: 'Pre-Existing Conditions',
          content: 'Pre-existing diseases are covered after a continuous waiting period of 4 years from the policy inception date. Conditions diagnosed within the waiting period are not covered.',
          page: 22,
          type: 'EXCLUSION',
        },
        {
          id: 'clause-005',
          section: 'Claim Process',
          title: 'Required Documents for Reimbursement',
          content: 'For reimbursement claims, the following documents are required: (1) Duly filled claim form, (2) Hospital discharge summary, (3) Original hospital bills and receipts, (4) Prescription from treating doctor, (5) Investigation reports, (6) Photo ID proof (Aadhaar/PAN). Documents must be submitted within 15 days of discharge.',
          page: 28,
          type: 'PROCESS',
        },
        {
          id: 'clause-006',
          section: 'Co-Payment',
          title: 'Co-Payment Clause',
          content: 'A co-payment of 10% applies to all claims for policyholders aged 60 years and above. No co-payment for policyholders below 60 years.',
          page: 18,
          type: 'CO_PAYMENT',
        },
      ]),
      metadata: JSON.stringify({
        documentRef: 'POL-HEALTH-2024-001-T&C-v1.pdf',
        totalPages: 42,
      }),
    },
  });

  console.log('  ✅ Policy version with clauses created');

  // ---- Synthetic Transactions (Fintech) ----
  await prisma.transaction.upsert({
    where: { transactionRef: 'TXN-UPI-2024-FAIL-001' },
    update: {},
    create: {
      id: 'txn-001',
      transactionRef: 'TXN-UPI-2024-FAIL-001',
      type: 'UPI',
      amount: 4999,
      currency: 'INR',
      status: 'FAILED_BUT_DEBITED',
      senderAccount: 'ramesh@upi',
      receiverAccount: 'merchant@upi',
      description: 'Payment to ABC Electronics',
      timestamp: new Date('2024-09-15T14:30:00Z'),
      metadata: JSON.stringify({
        upiRef: 'UPI123456789',
        bankRef: 'BANK-REF-001',
        debitConfirmed: true,
        creditConfirmed: false,
      }),
    },
  });

  await prisma.transaction.upsert({
    where: { transactionRef: 'TXN-UPI-2024-OK-001' },
    update: {},
    create: {
      id: 'txn-002',
      transactionRef: 'TXN-UPI-2024-OK-001',
      type: 'UPI',
      amount: 1500,
      currency: 'INR',
      status: 'SUCCESS',
      senderAccount: 'ramesh@upi',
      receiverAccount: 'grocery@upi',
      description: 'Payment to QuickMart',
      timestamp: new Date('2024-09-14T10:15:00Z'),
    },
  });

  console.log('  ✅ Synthetic transactions created');

  console.log('\n✅ Seed complete!\n');
  console.log('  Synthetic users:');
  console.log(`    Customer: ${customer.email} (ID: ${customer.id})`);
  console.log(`    Agent:    ${agent.email} (ID: ${agent.id})`);
  console.log(`    Admin:    ${admin.email} (ID: ${admin.id})`);
  console.log(`  Policy:     ${policy.policyNumber}`);
  console.log('');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
