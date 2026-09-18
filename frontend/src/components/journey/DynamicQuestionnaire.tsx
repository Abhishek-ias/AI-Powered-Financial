import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Question } from '../../types';

export interface DynamicQuestionnaireProps {
  journeyId: string;
  questions: Question[];
  onAnswerQuestion: (questionId: string, answer: string) => Promise<boolean>;
  onAllCompleted: () => void;
  isSubmittingAnswer: boolean;
}

export const DynamicQuestionnaire: React.FC<DynamicQuestionnaireProps> = ({
  journeyId,
  questions,
  onAnswerQuestion,
  onAllCompleted,
  isSubmittingAnswer,
}) => {
  const sortedQuestions = [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const initialIndex = sortedQuestions.findIndex((q) => q.status === 'PENDING');
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex >= 0 ? initialIndex : 0);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isFillingDemo, setIsFillingDemo] = useState<boolean>(false);

  const currentQ = sortedQuestions[currentIndex];

  useEffect(() => {
    if (currentQ) {
      setCurrentInput(currentQ.answer || '');
      setLocalError(null);
    }
  }, [currentIndex, currentQ?.id, currentQ?.answer]);

  if (!currentQ || sortedQuestions.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#64748B' }}>No questions found for this journey.</p>
      </Card>
    );
  }

  const answeredCount = sortedQuestions.filter((q) => q.status === 'ANSWERED').length;
  const requiredCount = sortedQuestions.filter((q) => q.required ?? q.isRequired ?? true).length;
  const answeredRequiredCount = sortedQuestions.filter(
    (q) => (q.required ?? q.isRequired ?? true) && q.status === 'ANSWERED'
  ).length;
  const allRequiredDone = answeredRequiredCount === requiredCount;

  let parsedOptions: string[] = [];
  if (currentQ.options) {
    if (Array.isArray(currentQ.options)) {
      parsedOptions = currentQ.options;
    } else if (typeof currentQ.options === 'string') {
      try {
        const parsed = JSON.parse(currentQ.options);
        if (Array.isArray(parsed)) parsedOptions = parsed;
      } catch {
        parsedOptions = currentQ.options.split(',').map((s) => s.trim());
      }
    }
  }

  const handleSaveAnswer = async (answerValue?: string) => {
    const valueToSubmit = answerValue !== undefined ? answerValue : currentInput;
    const isRequired = currentQ.required ?? currentQ.isRequired ?? true;

    if (isRequired && !valueToSubmit.trim()) {
      setLocalError('This question is required to continue.');
      return;
    }

    setLocalError(null);
    try {
      const allDone = await onAnswerQuestion(currentQ.id, valueToSubmit);

      if (currentIndex < sortedQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (allDone || allRequiredDone) {
        onAllCompleted();
      }
    } catch (err: any) {
      setLocalError(err.message || 'Failed to submit answer. Please try again.');
    }
  };

  const handleQuickFillDemo = async () => {
    setIsFillingDemo(true);
    setLocalError(null);
    try {
      for (let i = 0; i < sortedQuestions.length; i++) {
        const q = sortedQuestions[i];
        if (q.status !== 'ANSWERED') {
          let ans = 'Yes';
          const key = (q.key || q.questionKey || '').toLowerCase();
          if (key.includes('hospital')) ans = 'Apollo Hospital Bangalore';
          else if (key.includes('bill') || key.includes('amount')) ans = '165000';
          else if (key.includes('date')) ans = '2024-08-10';
          else if (key.includes('diagnosis')) ans = 'Acute Appendicitis';
          else if (key.includes('policy')) ans = 'POL-HEALTH-2024-001';
          else if (key.includes('rent')) ans = '7500';
          await onAnswerQuestion(q.id, ans);
        }
      }
      onAllCompleted();
    } catch (err: any) {
      setLocalError(err.message || 'Demo answer fill encountered an error.');
    } finally {
      setIsFillingDemo(false);
    }
  };

  const questionType = (currentQ.type || currentQ.questionType || 'TEXT').toUpperCase();
  const reasonText = currentQ.reason || currentQ.rationale || 'Required to match policy schedules and claim records.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 12. Active Question Focus Card (#FFFFFF) */}
      <Card style={{ padding: '1.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>
              Question {currentIndex + 1} of {sortedQuestions.length}
            </span>
            {(currentQ.required ?? currentQ.isRequired ?? true) ? (
              <Badge variant="blue">Required</Badge>
            ) : (
              <Badge variant="gray">Optional</Badge>
            )}
            {currentQ.status === 'ANSWERED' && (
              <Badge variant="green">Answered</Badge>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickFillDemo}
            disabled={isSubmittingAnswer || isFillingDemo}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', gap: '0.375rem' }}
            title="Pre-populate answers for seamless testing"
          >
            <Sparkles size={13} color="#2563EB" />
            <span>{isFillingDemo ? 'Filling...' : 'Auto-fill Demo Answers'}</span>
          </button>
        </div>

        {/* Question Text (#0F172A) */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
            marginBottom: '0.75rem',
            color: '#0F172A',
          }}
        >
          {currentQ.text || currentQ.questionText}
        </h3>

        {/* Informational Panel (#EFF6FF, border #BFDBFE) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            background: '#EFF6FF',
            borderLeft: '3px solid #2563EB',
            padding: '0.625rem 0.875rem',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            marginBottom: '1.5rem',
            fontSize: '0.8125rem',
            color: '#1E40AF',
          }}
        >
          <HelpCircle size={15} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#1E3A8A', marginRight: '0.375rem' }}>Why we ask this:</strong>
            {reasonText}
          </div>
        </div>

        {/* Input Area */}
        <div style={{ marginBottom: '1.75rem' }}>
          {questionType === 'SELECT' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.625rem' }}>
              {parsedOptions.map((opt, idx) => {
                const isSelected = currentInput === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentInput(opt);
                      handleSaveAnswer(opt);
                    }}
                    disabled={isSubmittingAnswer}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      border: isSelected ? '1px solid #2563EB' : '1px solid #CBD5E1',
                      color: isSelected ? '#1E40AF' : '#334155',
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.15s ease',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check size={16} color="#2563EB" />}
                  </button>
                );
              })}
            </div>
          )}

          {questionType === 'BOOLEAN' && (
            <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '320px' }}>
              {['Yes', 'No'].map((val) => {
                const isSelected = currentInput.toLowerCase() === val.toLowerCase();
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setCurrentInput(val);
                      handleSaveAnswer(val);
                    }}
                    disabled={isSubmittingAnswer}
                    className={isSelected ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ flex: 1, padding: '0.75rem 1.25rem' }}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          )}

          {questionType === 'DATE' && (
            <div style={{ maxWidth: '280px' }}>
              <input
                type="date"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                disabled={isSubmittingAnswer}
                className="input-text"
              />
            </div>
          )}

          {questionType === 'NUMBER' && (
            <div style={{ display: 'flex', alignItems: 'center', maxWidth: '280px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  color: '#64748B',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                }}
              >
                ₹
              </span>
              <input
                type="number"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                disabled={isSubmittingAnswer}
                placeholder="0.00"
                className="input-text"
                style={{ paddingLeft: '2rem' }}
              />
            </div>
          )}

          {questionType === 'TEXT' && (
            <div>
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveAnswer();
                  }
                }}
                disabled={isSubmittingAnswer}
                placeholder="Type your response here..."
                className="input-text"
                autoFocus
              />
            </div>
          )}

          {localError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#DC2626',
                fontSize: '0.8125rem',
                marginTop: '0.5rem',
              }}
            >
              <AlertCircle size={14} />
              <span>{localError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions: Back & Continue */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0 || isSubmittingAnswer}
            className="btn btn-secondary"
            style={{ gap: '0.375rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAnswer()}
            disabled={isSubmittingAnswer}
            className="btn btn-primary"
            style={{ minWidth: '140px', gap: '0.5rem' }}
          >
            {isSubmittingAnswer ? (
              <>
                <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Answered Questions Quick Review */}
      {answeredCount > 0 && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>
              Completed Answers ({answeredCount} of {sortedQuestions.length})
            </span>
            {allRequiredDone && (
              <button
                onClick={onAllCompleted}
                className="btn btn-primary"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', gap: '0.375rem' }}
              >
                <span>Proceed to Consent</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.5rem' }}>
            {sortedQuestions
              .filter((q) => q.status === 'ANSWERED')
              .map((q) => (
                <div
                  key={q.id}
                  onClick={() => {
                    const idx = sortedQuestions.findIndex((x) => x.id === q.id);
                    if (idx >= 0) setCurrentIndex(idx);
                  }}
                  style={{
                    background: '#F8FAFC',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {q.text || q.questionText}
                    </span>
                    <Check size={12} color="#16A34A" />
                  </div>
                  <strong style={{ fontSize: '0.875rem', color: '#0F172A' }}>
                    {q.answer}
                  </strong>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
