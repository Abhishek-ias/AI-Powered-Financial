import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  CornerDownLeft,
  Bot,
  User,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { LendingEMIResult, LendingAffordabilityResult } from '../../../types';

interface FinancialCoachChatProps {
  monthlyIncome: number;
  existingEMI: number;
  monthlyExpenses: number;
  emiResult: LendingEMIResult;
  affordResult: LendingAffordabilityResult;
  principal: number;
  rate: number;
  tenure: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const inr = (n: number) =>
  `₹${Math.round(n).toLocaleString('en-IN')}`;

export const FinancialCoachChat: React.FC<FinancialCoachChatProps> = ({
  monthlyIncome,
  existingEMI,
  monthlyExpenses,
  emiResult,
  affordResult,
  principal,
  rate,
  tenure,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  const newEMI = emiResult.monthlyEMI;
  const totalCommitments = existingEMI + newEMI + monthlyExpenses;
  const currentBuffer = monthlyIncome - totalCommitments;

  // Grounded dynamic answer generator using actual user figures
  const generateGroundedAnswer = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('falls by 10') || q.includes('salary') || q.includes('income')) {
      const reducedIncome = monthlyIncome * 0.9;
      const simBuffer = reducedIncome - totalCommitments;
      const simDti = ((existingEMI + newEMI) / reducedIncome) * 100;
      return `If your monthly take-home salary falls by 10% (from ${inr(monthlyIncome)} to ${inr(reducedIncome)}):\n• Your total monthly commitments (EMIs of ${inr(existingEMI + newEMI)} + living expenses of ${inr(monthlyExpenses)}) would remain ${inr(totalCommitments)}.\n• Your remaining monthly buffer would decrease from ${inr(currentBuffer)} to ${inr(simBuffer)} (${((simBuffer / reducedIncome) * 100).toFixed(0)}% of income).\n• Your Debt-to-Income (DTI) ratio would rise to ${simDti.toFixed(1)}% (still ${simDti <= 50 ? 'within' : 'exceeding'} the 50% regulatory threshold).`;
    }

    if (q.includes('down payment')) {
      const extraDownPayment = 100000;
      const reducedPrincipal = Math.max(100000, principal - extraDownPayment);
      const monthlyRate = rate / 12 / 100;
      const factor = Math.pow(1 + monthlyRate, tenure);
      const approxNewEmi = (reducedPrincipal * monthlyRate * factor) / (factor - 1);
      const monthlySavings = newEMI - approxNewEmi;
      return `If you increase your upfront down payment by ${inr(extraDownPayment)} (reducing borrowing from ${inr(principal)} to ${inr(reducedPrincipal)}):\n• Your monthly EMI could decrease by approximately ${inr(monthlySavings)}/month (from ${inr(newEMI)} to ${inr(approxNewEmi)}).\n• Over a ${tenure}-month repayment period, you would save roughly ${inr(monthlySavings * tenure - extraDownPayment)} in total interest charges.\n• Your uncommitted monthly cash buffer would expand accordingly.`;
    }

    if (q.includes('cheaper car') || q.includes('cheaper') || q.includes('lower loan')) {
      const reducedPrincipal = Math.round(principal * 0.85);
      const monthlyRate = rate / 12 / 100;
      const factor = Math.pow(1 + monthlyRate, tenure);
      const approxNewEmi = (reducedPrincipal * monthlyRate * factor) / (factor - 1);
      const monthlySavings = newEMI - approxNewEmi;
      return `If you choose a lower loan amount or more affordable vehicle by 15% (borrowing ${inr(reducedPrincipal)} instead of ${inr(principal)}):\n• Your estimated monthly repayment would drop by ~${inr(monthlySavings)}/month to ${inr(approxNewEmi)}.\n• Total commitments would fall to ${inr(existingEMI + approxNewEmi + monthlyExpenses)}/month, boosting your monthly safety buffer to ${inr(monthlyIncome - (existingEMI + approxNewEmi + monthlyExpenses))}.`;
    }

    if (q.includes('reduce') || q.includes('repayment') || q.includes('lower emi')) {
      const extendedTenure = Math.min(84, tenure + 12);
      const monthlyRate = rate / 12 / 100;
      const factor = Math.pow(1 + monthlyRate, extendedTenure);
      const approxNewEmi = (principal * monthlyRate * factor) / (factor - 1);
      return `To reduce your monthly repayment, you have two primary options:\n1. Increase upfront down payment: Adding ${inr(50000)} lowers EMI without increasing total interest.\n2. Extend repayment tenure: Extending from ${tenure} months to ${extendedTenure} months would lower your monthly EMI from ${inr(newEMI)} to ~${inr(approxNewEmi)}, though you will pay interest for an additional 12 months.`;
    }

    return `Based on your declared income of ${inr(monthlyIncome)} and current obligations, your estimated repayment of ${inr(newEMI)}/month leaves an uncommitted buffer of ${inr(currentBuffer)}. Consider maintaining at least 3–6 months of living expenses and EMIs in liquid savings before committing to long-term financing.`;
  };

  const handleAsk = (query: string) => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now() + 1}`,
      sender: 'assistant',
      text: generateGroundedAnswer(query),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputText('');
  };

  const promptChips = [
    'What happens if my salary falls by 10%?',
    'What if I increase my down payment?',
    'What if I choose a cheaper car?',
    'How can I reduce my monthly repayment?',
  ];

  return (
    <Card
      style={{
        padding: '1.75rem',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 2px 10px rgba(20,35,28,0.05)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Bot size={16} color="var(--color-primary)" />
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-primary)' }}>
              Financial Assistant
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            ASK ABOUT YOUR PLAN
          </h3>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          Grounded in your calculated numbers
        </span>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem' }}>
        Explore how adjustments to your salary, down payment, or borrowing amount impact your monthly cash flow:
      </p>

      {/* Suggested Prompt Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAsk(chip)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-secondary)',
              color: 'var(--color-text)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--color-text)';
            }}
          >
            <Sparkles size={11} color="var(--color-secondary)" />
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* Message History */}
      {messages.length > 0 && (
        <div
          style={{
            maxHeight: '320px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            padding: '1rem',
            background: 'var(--neutral-bg)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            marginBottom: '1rem',
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '0.625rem',
                alignItems: 'flex-start',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              {m.sender === 'assistant' && (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '0.2rem',
                  }}
                >
                  <Bot size={13} color="#fff" />
                </div>
              )}

              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: m.sender === 'user' ? 'var(--color-primary)' : '#FFFFFF',
                  color: m.sender === 'user' ? '#FFFFFF' : 'var(--color-text)',
                  border: m.sender === 'assistant' ? '1px solid var(--border-subtle)' : 'none',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                }}
              >
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--color-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '0.2rem',
                  }}
                >
                  <User size={13} color="#fff" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(inputText);
        }}
        style={{ display: 'flex', gap: '0.5rem' }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about your repayment or cash flow..."
          className="input-text"
          style={{ flex: 1, fontSize: '0.875rem' }}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', gap: '0.375rem' }}
        >
          <span>Ask</span>
          <Send size={14} />
        </button>
      </form>
    </Card>
  );
};
