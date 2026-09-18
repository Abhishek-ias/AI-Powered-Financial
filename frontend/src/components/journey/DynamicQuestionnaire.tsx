import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Sparkles,
  ChevronRight,
  ListFilter,
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
  // Sort questions by order
  const sortedQuestions = [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Find the first unanswered question, or default to 0
  const initialIndex = sortedQuestions.findIndex((q) => q.status === 'PENDING');
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex >= 0 ? initialIndex : 0);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const currentQ = sortedQuestions[currentIndex];

  // Whenever currentIndex changes or question status changes, populate input with existing answer
  useEffect(() => {
    if (currentQ) {
      setCurrentInput(currentQ.answer || '');
      setLocalError(null);
    }
  }, [currentIndex, currentQ?.id, currentQ?.answer]);

  if (!currentQ || sortedQuestions.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No questions found for this journey.</p>
      </Card>
    );
  }

  const answeredCount = sortedQuestions.filter((q) => q.status === 'ANSWERED').length;
  const requiredCount = sortedQuestions.filter((q) => q.required ?? q.isRequired ?? true).length;
  const answeredRequiredCount = sortedQuestions.filter(
    (q) => (q.required ?? q.isRequired ?? true) && q.status === 'ANSWERED'
  ).length;
  const percentComplete = Math.round((answeredCount / sortedQuestions.length) * 100);
  const allRequiredDone = answeredRequiredCount === requiredCount;

  // Safe parse options for SELECT questions
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

  // Handle answering
  const handleSaveAnswer = async (answerValue?: string) => {
    const valueToSubmit = answerValue !== undefined ? answerValue : currentInput;
    const isRequired = currentQ.required ?? currentQ.isRequired ?? true;

    if (isRequired && !valueToSubmit.trim()) {
      setLocalError('This question is required to proceed with your insurance claim verification.');
      return;
    }

    setLocalError(null);
    try {
      const allDone = await onAnswerQuestion(currentQ.id, valueToSubmit);

      // Auto advance to next unanswered question if available
      if (currentIndex < sortedQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (allDone || allRequiredDone) {
        onAllCompleted();
      }
    } catch (err: any) {
      setLocalError(err.message || 'Failed to submit answer. Please try again.');
    }
  };

  const handleSkip = () => {
    if (currentIndex < sortedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const questionType = (currentQ.type || currentQ.questionType || 'TEXT').toUpperCase();
  const reasonText = currentQ.reason || currentQ.rationale || 'Required for accurate policy and claim verification.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Questionnaire Progress Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <ListFilter size={16} color="#60a5fa" />
            <strong style={{ fontSize: '0.875rem' }}>Claim Clarification Questionnaire</strong>
          </div>
          <Badge variant={allRequiredDone ? 'green' : 'blue'}>
            {answeredCount} of {sortedQuestions.length} answered ({percentComplete}%)
          </Badge>
        </div>

        {/* Question pagination pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', overflowX: 'auto', maxWidth: '100%' }}>
          {sortedQuestions.map((q, idx) => {
            const isAnswered = q.status === 'ANSWERED';
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isCurrent
                    ? '2px solid #60a5fa'
                    : isAnswered
                    ? '1px solid #10b981'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isCurrent
                    ? 'var(--primary-gradient)'
                    : isAnswered
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(30, 41, 59, 0.6)',
                  color: isCurrent || isAnswered ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
                title={`Question ${idx + 1}: ${q.text || q.questionText}`}
              >
                {isAnswered ? '✓' : idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Card */}
      <Card
        glow
        style={{
          border: '1px solid var(--border-focus)',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--primary-light)',
              }}
            >
              Question {currentIndex + 1} of {sortedQuestions.length}
            </span>
            {(currentQ.required ?? currentQ.isRequired ?? true) ? (
              <Badge variant="blue">Required</Badge>
            ) : (
              <Badge variant="gray">Optional</Badge>
            )}
            {currentQ.status === 'ANSWERED' && <Badge variant="green">Answered</Badge>}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Key: <code style={{ color: 'var(--text-secondary)' }}>{currentQ.key || currentQ.questionKey}</code>
          </div>
        </div>

        {/* Question Text */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
            marginBottom: '0.75rem',
            color: 'var(--text-primary)',
          }}
        >
          {currentQ.text || currentQ.questionText}
        </h3>

        {/* Explainability / Rationale Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            background: 'rgba(59, 130, 246, 0.08)',
            borderLeft: '3px solid #3b82f6',
            padding: '0.625rem 0.875rem',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            marginBottom: '1.5rem',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}
        >
          <HelpCircle size={15} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--text-primary)', marginRight: '0.375rem' }}>Why we ask this:</strong>
            {reasonText}
          </div>
        </div>

        {/* Input Rendering based on question type */}
        <div style={{ marginBottom: '1.5rem' }}>
          {/* SELECT / CHOICE */}
          {questionType === 'SELECT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
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
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%)'
                          : 'rgba(30, 41, 59, 0.6)',
                        border: isSelected ? '1px solid #60a5fa' : '1px solid var(--border-subtle)',
                        color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        fontSize: '0.875rem',
                        fontWeight: isSelected ? 600 : 500,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 size={16} color="#60a5fa" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* BOOLEAN */}
          {questionType === 'BOOLEAN' && (
            <div style={{ display: 'flex', gap: '1rem' }}>
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
                    style={{
                      flex: 1,
                      padding: '0.75rem 1.5rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      background: isSelected ? 'var(--primary-gradient)' : 'rgba(30, 41, 59, 0.6)',
                      border: isSelected ? '1px solid #60a5fa' : '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      transition: 'all 0.2s',
                    }}
                  >
                    {val}
                    {isSelected && <CheckCircle2 size={16} />}
                  </button>
                );
              })}
            </div>
          )}

          {/* DATE */}
          {questionType === 'DATE' && (
            <div style={{ position: 'relative', maxWidth: '320px' }}>
              <input
                type="date"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                disabled={isSubmittingAnswer}
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* NUMBER */}
          {questionType === 'NUMBER' && (
            <div style={{ display: 'flex', alignItems: 'center', maxWidth: '360px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '1rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '1rem',
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
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem 1rem 0.75rem 2.25rem',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* TEXT (Default) */}
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
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Local error message if validation fails */}
          {localError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#f87171',
                fontSize: '0.8125rem',
                marginTop: '0.5rem',
              }}
            >
              <AlertCircle size={14} />
              <span>{localError}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0 || isSubmittingAnswer}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!(currentQ.required ?? currentQ.isRequired ?? true) && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmittingAnswer}
                className="btn btn-ghost"
              >
                Skip Question
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSaveAnswer()}
              disabled={isSubmittingAnswer}
              className="btn btn-primary"
              style={{ minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isSubmittingAnswer ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>{currentQ.status === 'ANSWERED' ? 'Update Answer' : 'Save & Continue'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* Answered Questions Review Summary */}
      {answeredCount > 0 && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Answered Details ({answeredCount}/{sortedQuestions.length})
            </span>
            {allRequiredDone && (
              <button
                onClick={onAllCompleted}
                className="btn btn-primary"
                style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <span>Proceed to Consent</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.625rem' }}>
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
                    background: 'rgba(30, 41, 59, 0.4)',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {q.text || q.questionText}
                    </span>
                    <CheckCircle2 size={13} color="#34d399" />
                  </div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
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
