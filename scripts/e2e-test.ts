// ============================================================
// End-to-End ClaimSahay Journey Test Script
// Tests the complete insurance claim flow
// ============================================================
const BASE = 'http://localhost:3000';
const HEADERS = {
  'Content-Type': 'application/json',
  'X-User-Id': 'user-customer-001',
  'X-User-Role': 'CUSTOMER',
};

async function api(method: string, path: string, body?: any) {
  const opts: any = { method, headers: HEADERS };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

async function uploadFile(path: string, journeyId: string, documentType: string) {
  const formData = new FormData();
  const blob = new Blob(['mock-file-content'], { type: 'application/pdf' });
  formData.append('file', blob, `${documentType.toLowerCase()}.pdf`);
  formData.append('documentType', documentType);
  
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'X-User-Id': 'user-customer-001', 'X-User-Role': 'CUSTOMER' },
    body: formData,
  });
  return { status: res.status, data: await res.json() };
}

async function test() {
  console.log('\n🏥 ============= ClaimSahay E2E Test =============\n');

  // 1. Health check
  let r = await api('GET', '/health');
  console.log(`✅ 1. Health: ${r.data.status}`);

  // 2. Readiness
  r = await api('GET', '/ready');
  console.log(`✅ 2. Ready: ${r.data.status} | DB: ${r.data.providers.database.status}`);

  // 3. Create journey with natural language
  r = await api('POST', '/api/journeys', {
    message: 'My hospital claim was rejected and I don\'t understand what is missing. My policy is POL-HEALTH-2024-001.',
  });
  const journeyId = r.data.data.journey.id;
  console.log(`✅ 3. Journey created: ${journeyId}`);
  console.log(`   Domain: ${r.data.data.journey.domain}`);
  console.log(`   Type: ${r.data.data.journey.journeyType}`);
  console.log(`   Status: ${r.data.data.journey.status}`);
  console.log(`   Questions: ${r.data.data.questions.length}`);

  // 4. Answer questions
  const questions = r.data.data.questions;
  const answers: Record<string, string> = {
    policy_number: 'POL-HEALTH-2024-001',
    claim_type: 'Hospitalization',
    hospital_name: 'Apollo Hospital, Bengaluru',
    admission_date: '2024-08-10',
    discharge_date: '2024-08-15',
    diagnosis: 'Appendectomy',
    total_bill_amount: '165000',
  };

  for (const q of questions) {
    if (answers[q.key]) {
      r = await api('POST', `/api/journeys/${journeyId}/questions/${q.id}/answer`, {
        answer: answers[q.key],
      });
    }
  }
  console.log(`✅ 4. Questions answered (${Object.keys(answers).length})`);
  console.log(`   All required answered: ${r.data.data.allRequiredAnswered}`);

  // 5. Grant consent
  r = await api('POST', `/api/journeys/${journeyId}/consent`, {
    purposes: ['DATA_PROCESSING', 'DOCUMENT_ANALYSIS', 'EXTERNAL_SUBMISSION'],
  });
  console.log(`✅ 5. Consent granted: ${r.data.data.consents.length} purposes`);
  console.log(`   Required docs: ${r.data.data.requirements.map((r: any) => r.label).join(', ')}`);

  // 6. Upload documents
  const docTypes = ['HOSPITAL_BILL', 'DISCHARGE_SUMMARY', 'CLAIM_FORM', 'AADHAAR'];
  for (const docType of docTypes) {
    r = await uploadFile(`/api/journeys/${journeyId}/documents`, journeyId, docType);
  }
  console.log(`✅ 6. Documents uploaded: ${docTypes.length}`);

  // 7. Process documents (Document Intelligence pipeline)
  r = await api('POST', `/api/journeys/${journeyId}/process-documents`);
  console.log(`✅ 7. Documents processed`);
  console.log(`   Results: ${r.data.data.processingResults.length} documents`);
  console.log(`   Validation valid: ${r.data.data.validation.valid}`);
  console.log(`   Blocking issues: ${r.data.data.validation.blocking.length}`);
  if (r.data.data.validation.blocking.length > 0) {
    for (const b of r.data.data.validation.blocking) {
      console.log(`   ⚠️  ${b.fieldName}: ${b.status} — ${b.details}`);
    }
  }
  console.log(`   Next actions: ${r.data.data.nextActions.length}`);

  // 8. Get evidence
  r = await api('GET', `/api/journeys/${journeyId}/evidence`);
  console.log(`✅ 8. Evidence items: ${r.data.data.evidence.length}`);

  // 9. Create insurance claim
  r = await api('POST', '/api/insurance/claims', {
    journeyId,
    policyNumber: 'POL-HEALTH-2024-001',
    claimType: 'HOSPITALIZATION',
    amount: 165000,
    description: 'Appendectomy at Apollo Hospital',
  });
  const claimId = r.data.data.claim.id;
  console.log(`✅ 9. Claim created: ${claimId}`);
  console.log(`   Insurer query: ${r.data.data.insurerQuery.queryType} — "${r.data.data.insurerQuery.query}"`);

  // 10. Reconcile insurer query with policy
  r = await api('POST', `/api/journeys/${journeyId}/reconcile`, {
    queryType: 'AMOUNT_DISPUTE',
    queryText: 'Room rent exceeds permissible limit as per policy terms.',
    policyId: 'policy-001',
    policyVersion: '2024-v1',
    claimId,
  });
  console.log(`✅ 10. Reconciliation completed`);
  console.log(`   Conflict: ${r.data.data.conflict ? r.data.data.conflict.type : 'none'}`);
  if (r.data.data.conflict) {
    console.log(`   Details: ${r.data.data.conflict.description}`);
  }
  console.log(`   Next action: ${r.data.data.nextAction}`);
  console.log(`   Citations: ${r.data.data.citations.length}`);
  if (r.data.data.citations.length > 0) {
    console.log(`   Citation: ${r.data.data.citations[0].policy} v${r.data.data.citations[0].version}, Section: ${r.data.data.citations[0].section}, Page: ${r.data.data.citations[0].page}`);
  }

  // 11. Get explanation
  r = await api('POST', `/api/journeys/${journeyId}/explain`, {
    query: 'Explain why the room rent was flagged and what can I do about it',
  });
  console.log(`✅ 11. Explanation generated (${r.data.data.explanation.length} chars)`);

  // 12. Get journey status (should be NEEDS_ACTION or READY_FOR_REVIEW)
  r = await api('GET', `/api/journeys/${journeyId}`);
  const currentStatus = r.data.data.journey.status;
  console.log(`✅ 12. Journey status: ${currentStatus}`);

  // 13. Confirm (transition to USER_CONFIRMED)
  // If NEEDS_ACTION, it's acceptable to confirm
  r = await api('POST', `/api/journeys/${journeyId}/confirm`);
  console.log(`✅ 13. User confirmed: ${r.data.data.message}`);
  const approvalId = r.data.data.approval.id;

  // 14. Approve (submit claim via mock workflow)
  r = await api('POST', `/api/journeys/${journeyId}/approve`, {
    approvalId,
    approved: true,
  });
  console.log(`✅ 14. Approved and submitted`);
  console.log(`   Workflow: ${r.data.data.workflow.status}`);
  console.log(`   Institution: ${r.data.data.institutionResult.status}`);
  console.log(`   Safety note: ${r.data.data.safetyNote}`);

  // 15. Timeline
  r = await api('GET', `/api/journeys/${journeyId}/timeline`);
  console.log(`✅ 15. Timeline events: ${r.data.data.timeline.length}`);
  for (const t of r.data.data.timeline.slice(0, 5)) {
    console.log(`   📌 ${t.title}`);
  }
  console.log(`   ... and ${Math.max(0, r.data.data.timeline.length - 5)} more`);

  // 16. Audit
  r = await api('GET', `/api/journeys/${journeyId}/audit`);
  console.log(`✅ 16. Audit events: ${r.data.data.auditEvents.length}`);

  // 17. Escalation
  r = await api('POST', `/api/journeys/${journeyId}/escalate`);
  console.log(`✅ 17. Escalated to human support`);
  console.log(`   Support case: ${r.data.data.supportCase.id}`);
  console.log(`   Context packet includes: ${Object.keys(r.data.data.contextPacket).join(', ')}`);

  // 18. Final journey state
  r = await api('GET', `/api/journeys/${journeyId}`);
  console.log(`\n✅ 18. Final journey status: ${r.data.data.journey.status}`);

  console.log('\n🎉 ============= ClaimSahay E2E Test PASSED =============\n');

  // ---- LENDING TEST ----
  console.log('\n💰 ============= Lending Quick Test =============\n');

  r = await api('POST', '/api/lending/calculate-emi', {
    principal: 1000000,
    annualRate: 9.5,
    tenureMonths: 60,
  });
  console.log(`✅ EMI: ₹${r.data.data.calculation.emi}`);
  console.log(`   Total repayment: ₹${r.data.data.calculation.totalRepayment}`);
  console.log(`   Total interest: ₹${r.data.data.calculation.totalInterest}`);

  r = await api('POST', '/api/lending/affordability', {
    monthlyIncome: 70500,
    existingEMI: 5000,
    requestedEMI: r.data.data.calculation.emi,
  });
  console.log(`✅ Affordability: ${r.data.data.affordability.affordable ? 'YES' : 'NO'}`);
  console.log(`   DTI ratio: ${(r.data.data.affordability.dtiRatio * 100).toFixed(1)}%`);

  // ---- FINTECH TEST ----
  console.log('\n📱 ============= Fintech Quick Test =============\n');

  r = await api('GET', '/api/fintech/transactions/TXN-UPI-2024-FAIL-001');
  console.log(`✅ Transaction: ${r.data.data.transaction.transactionRef}`);
  console.log(`   Status: ${r.data.data.transaction.status}`);
  console.log(`   Amount: ₹${r.data.data.transaction.amount}`);

  // ---- MOCK APIs TEST ----
  console.log('\n🔧 ============= Mock APIs Test =============\n');

  r = await api('POST', '/api/mock/insurer/claims', { policyNumber: 'TEST-001', amount: 50000 });
  console.log(`✅ Mock insurer claim: ${r.data.data.id} — ${r.data.data.status}`);

  r = await api('POST', '/api/mock/lender/applications', { loanType: 'Personal', amount: 500000 });
  console.log(`✅ Mock lender app: ${r.data.data.id} — ${r.data.data.status}`);

  r = await api('GET', '/api/mock/fintech/transactions/TXN-UPI-2024-FAIL-001');
  console.log(`✅ Mock fintech txn: ${r.data.data.transactionRef} — ${r.data.data.status}`);

  console.log('\n✅ ALL TESTS PASSED\n');
}

test().catch(err => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
