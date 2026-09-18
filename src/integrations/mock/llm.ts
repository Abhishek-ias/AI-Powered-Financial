// ============================================================
// Mock LLM Provider
// ============================================================
import { LLMProvider, LLMResponse } from '../../types';

export class MockLLMProvider implements LLMProvider {
  async chat(systemPrompt: string, userMessage: string): Promise<LLMResponse> {
    // Generate contextual mock responses
    const lower = userMessage.toLowerCase();

    let content = 'Based on the provided information, I can help you with your financial journey.';

    if (lower.includes('explain') || lower.includes('reconcil')) {
      content = 'Based on the available documents and policy terms, the room rent charged at ₹7,500/day exceeds your policy sub-limit of ₹5,000/day. The excess of ₹2,500/day (total ₹12,500 for 5 days) will need to be borne by you as per the policy terms. This is documented in Section "Room Rent Sub-Limit" (Page 12) of your policy.';
    } else if (lower.includes('claim') || lower.includes('hospital')) {
      content = 'I understand you need assistance with your insurance claim. Let me guide you through the process step by step. I\'ll need to collect some information and documents to prepare your claim.';
    } else if (lower.includes('loan') || lower.includes('emi')) {
      content = 'I can help you explore loan options. Based on the information provided, let me calculate your estimated EMI and affordability. Please note these are estimates — final approval remains subject to the lending institution.';
    } else if (lower.includes('payment') || lower.includes('transaction') || lower.includes('failed')) {
      content = 'I understand your payment issue. Let me look into the transaction details and help you file a dispute if needed. I\'ll gather the necessary evidence from the available records.';
    } else if (lower.includes('draft') || lower.includes('response')) {
      content = 'Based on the policy terms and the evidence gathered, here is a draft response to the insurer\'s query:\n\n"We acknowledge the query regarding room rent charges. The hospitalization at Apollo Hospital, Bengaluru was for an emergency appendectomy procedure. While the room rent of ₹7,500/day exceeds the policy sub-limit of ₹5,000/day, we request consideration of the medical necessity and emergency nature of the admission. Attached are the supporting medical documents and revised bills for your review."\n\nPlease review this draft before submission.';
    }

    return {
      content,
      usage: { promptTokens: 100, completionTokens: 150, totalTokens: 250 },
      model: 'mock-llm-v1',
    };
  }

  async structuredOutput<T>(systemPrompt: string, userMessage: string, schema: string): Promise<T> {
    // Return mock structured output
    return { understood: true, confidence: 0.85 } as T;
  }
}
