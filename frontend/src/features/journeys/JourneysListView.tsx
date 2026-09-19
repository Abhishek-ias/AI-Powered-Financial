import React, { useEffect, useState } from 'react';
import {
  History,
  Shield,
  DollarSign,
  CreditCard,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  HeadphonesIcon,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { journeysApi } from '../../api/journeys';
import { Journey, JourneyStatus, Domain, TimelineEvent } from '../../types';

// ─── Label maps — internal → customer-friendly ────────────────────────────────

const JOURNEY_TYPE_LABELS: Record<string, string> = {
  CLAIM_ASSISTANCE: 'Claim Assistance',
  HEALTH_INSURANCE_CLAIM: 'Health Insurance Claim',
  LOAN_APPLICATION: 'Loan Application',
  LOAN_REFINANCE: 'Loan Refinancing',
  TRANSACTION_DISPUTE: 'Payment Dispute',
  FRAUD_REPORT: 'Fraud Report',
  GENERAL: 'General Enquiry',
  POLICY_INQUIRY: 'Policy Enquiry',
};

const DOMAIN_LABELS: Record<Domain, string> = {
  INSURANCE: 'Insurance',
  LENDING: 'Lending',
  FINTECH: 'Fintech',
};

interface StatusMeta {
  label: string;
  explanation: string;
  badgeVariant: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  requiresAction: boolean;
  icon: React.ReactNode;
}

const STATUS_META: Record<JourneyStatus, StatusMeta> = {
  CREATED: {
    label: 'Started',
    explanation: 'Your journey has been created and is being set up.',
    badgeVariant: 'blue',
    requiresAction: false,
    icon: <Clock size={13} />,
  },
  GOAL_IDENTIFIED: {
    label: 'Goal Identified',
    explanation: "We've understood what you need help with.",
    badgeVariant: 'blue',
    requiresAction: false,
    icon: <Clock size={13} />,
  },
  QUESTIONS_PENDING: {
    label: 'Questions Pending',
    explanation: 'Please answer a few questions to continue.',
    badgeVariant: 'amber',
    requiresAction: true,
    icon: <AlertCircle size={13} />,
  },
  CONSENT_PENDING: {
    label: 'Consent Required',
    explanation: 'Your consent is needed to proceed.',
    badgeVariant: 'amber',
    requiresAction: true,
    icon: <AlertCircle size={13} />,
  },
  DOCUMENTS_PENDING: {
    label: 'Documents Needed',
    explanation: 'Please provide the required documents to continue.',
    badgeVariant: 'amber',
    requiresAction: true,
    icon: <AlertCircle size={13} />,
  },
  DOCUMENT_PROCESSING: {
    label: 'Processing Documents',
    explanation: "We're reviewing your uploaded documents.",
    badgeVariant: 'blue',
    requiresAction: false,
    icon: <Loader2 size={13} />,
  },
  VALIDATING: {
    label: 'Validating',
    explanation: "Your information is being verified.",
    badgeVariant: 'blue',
    requiresAction: false,
    icon: <Loader2 size={13} />,
  },
  NEEDS_ACTION: {
    label: 'Action Needed',
    explanation: 'Something requires your attention to move forward.',
    badgeVariant: 'amber',
    requiresAction: true,
    icon: <AlertCircle size={13} />,
  },
  READY_FOR_REVIEW: {
    label: 'Ready for Review',
    explanation: 'Your case is ready for final review.',
    badgeVariant: 'blue',
    requiresAction: false,
    icon: <Clock size={13} />,
  },
  USER_CONFIRMED: {
    label: 'Confirmed',
    explanation: "You've confirmed the details. Awaiting submission.",
    badgeVariant: 'blue',
    requiresAction: false,
    icon: <CheckCircle2 size={13} />,
  },
  ACTION_PENDING: {
    label: 'Action Pending',
    explanation: 'An action is pending on this journey.',
    badgeVariant: 'amber',
    requiresAction: true,
    icon: <AlertCircle size={13} />,
  },
  SUBMITTED: {
    label: 'Submitted',
    explanation: 'Your request has been successfully submitted.',
    badgeVariant: 'green',
    requiresAction: false,
    icon: <CheckCircle2 size={13} />,
  },
  INSTITUTION_REVIEW: {
    label: 'Under Review',
    explanation: "Your case is currently being reviewed.",
    badgeVariant: 'blue',
    requiresAction: false,
    icon: <Loader2 size={13} />,
  },
  QUERY_RECEIVED: {
    label: 'Query Received',
    explanation: 'A query has been raised. Please review and respond.',
    badgeVariant: 'amber',
    requiresAction: true,
    icon: <AlertCircle size={13} />,
  },
  RECONCILIATION_PENDING: {
    label: 'Policy Check',
    explanation: 'Your case is being reconciled against policy terms.',
    badgeVariant: 'blue',
    requiresAction: false,
    icon: <Loader2 size={13} />,
  },
  HUMAN_REVIEW: {
    label: 'Human Review',
    explanation: 'Your case has been sent to a specialist for review.',
    badgeVariant: 'purple',
    requiresAction: false,
    icon: <HeadphonesIcon size={13} />,
  },
  COMPLETED: {
    label: 'Completed',
    explanation: 'This journey has been completed successfully.',
    badgeVariant: 'green',
    requiresAction: false,
    icon: <CheckCircle2 size={13} />,
  },
  FAILED: {
    label: 'Needs Attention',
    explanation: 'There was an issue with this journey. Please contact support.',
    badgeVariant: 'red',
    requiresAction: true,
    icon: <AlertCircle size={13} />,
  },
};

const ACTIVE_STATUSES: JourneyStatus[] = [
  'CREATED', 'GOAL_IDENTIFIED', 'QUESTIONS_PENDING', 'CONSENT_PENDING',
  'DOCUMENTS_PENDING', 'DOCUMENT_PROCESSING', 'VALIDATING', 'NEEDS_ACTION',
  'READY_FOR_REVIEW', 'USER_CONFIRMED', 'ACTION_PENDING', 'INSTITUTION_REVIEW',
  'QUERY_RECEIVED', 'RECONCILIATION_PENDING', 'HUMAN_REVIEW',
];

export const isActionableStatus = (status: JourneyStatus): boolean => {
  const actionableList: JourneyStatus[] = [
    'CREATED',
    'GOAL_IDENTIFIED',
    'QUESTIONS_PENDING',
    'CONSENT_PENDING',
    'DOCUMENTS_PENDING',
    'DOCUMENT_PROCESSING',
    'VALIDATING',
    'NEEDS_ACTION',
    'READY_FOR_REVIEW',
    'ACTION_PENDING',
    'RECONCILIATION_PENDING',
  ];
  return actionableList.includes(status);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const friendlyJourneyTitle = (j: Journey): string => {
  const domainLabel = DOMAIN_LABELS[j.domain] || j.domain;
  const typeLabel = JOURNEY_TYPE_LABELS[j.journeyType] || j.journeyType.replace(/_/g, ' ');
  return `${domainLabel} — ${typeLabel}`;
};

const formatTimestamp = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yestStart = new Date(todayStart.getTime() - 86400000);

  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (d >= todayStart) return `Today · ${time}`;
  if (d >= yestStart) return `Yesterday · ${time}`;
  return `${dateStr} · ${time}`;
};

type FilterType = 'ALL' | 'INSURANCE' | 'LENDING' | 'FINTECH' | 'NEEDS_ATTENTION';

const FILTER_LABELS: Record<FilterType, string> = {
  ALL: 'All',
  INSURANCE: 'Insurance',
  LENDING: 'Lending',
  FINTECH: 'Fintech',
  NEEDS_ATTENTION: 'Needs Attention',
};

// ─── Domain icon ─────────────────────────────────────────────────────────────

const DomainIcon: React.FC<{ domain: Domain }> = ({ domain }) => {
  const style: React.CSSProperties = { flexShrink: 0 };
  switch (domain) {
    case 'INSURANCE': return <Shield size={20} color="var(--color-primary)" style={style} />;
    case 'LENDING':   return <DollarSign size={20} color="var(--color-secondary)" style={style} />;
    case 'FINTECH':   return <CreditCard size={20} color="var(--color-tertiary)" style={style} />;
    default:          return <History size={20} color="var(--color-text-muted)" style={style} />;
  }
};

const domainIconBg: Record<Domain, { bg: string; border: string }> = {
  INSURANCE: { bg: 'var(--primary-subtle)', border: 'var(--primary-border)' },
  LENDING:   { bg: 'var(--secondary-subtle)', border: 'var(--secondary-border)' },
  FINTECH:   { bg: 'var(--tertiary-subtle)', border: 'var(--tertiary-border)' },
};

// ─── Journey Card ─────────────────────────────────────────────────────────────

interface JourneyCardProps {
  journey: Journey;
  onSelect?: (j: Journey) => void;
  isOpening?: boolean;
  openError?: string | null;
  onRetryOpen?: () => void;
}

const JourneyCard: React.FC<JourneyCardProps> = ({
  journey: j,
  onSelect,
  isOpening = false,
  openError,
  onRetryOpen,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineLoaded, setTimelineLoaded] = useState(false);

  const meta: StatusMeta = STATUS_META[j.status] ?? {
    label: j.status.replace(/_/g, ' '),
    explanation: '',
    badgeVariant: 'gray',
    requiresAction: false,
    icon: <Clock size={13} />,
  };

  const isActionable = isActionableStatus(j.status);
  const iconColors = domainIconBg[j.domain] ?? { bg: 'var(--bg-surface-secondary)', border: 'var(--border-subtle)' };

  const copyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(j.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const toggleExpand = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextState = !expanded;
    setExpanded(nextState);
    if (nextState && !timelineLoaded) {
      setLoadingTimeline(true);
      try {
        const res = await journeysApi.getTimeline(j.id);
        if (res?.timeline) {
          setTimelineEvents(res.timeline);
        }
      } catch {
        // fail gracefully and show core metadata
      } finally {
        setLoadingTimeline(false);
        setTimelineLoaded(true);
      }
    }
  };

  const title = friendlyJourneyTitle(j);
  const ctaLabel = isActionable ? 'Continue Journey' : 'View Journey';

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid var(--border-subtle)',
      borderRadius: '16px',
      boxShadow: '0 1px 4px rgba(20,35,28,0.04)',
      overflow: 'hidden',
      transition: 'box-shadow 0.18s ease',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(20,35,28,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(20,35,28,0.04)')}
    >
      {/* Main row */}
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>

        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: '12px',
          background: iconColors.bg, border: `1px solid ${iconColors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <DomainIcon domain={j.domain} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)' }}>{title}</span>
            <Badge variant={meta.badgeVariant} size="sm" icon={meta.icon}>
              {meta.label}
            </Badge>
          </div>

          {/* Status explanation */}
          {meta.explanation && (
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
              {meta.explanation}
            </p>
          )}

          {/* Goal (if set) */}
          {j.goal && (
            <p style={{
              fontSize: '0.8125rem', color: '#475569', margin: '0 0 0.5rem',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '520px',
            }}>
              "{j.goal}"
            </p>
          )}

          {/* Timestamp */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#94A3B8' }}>
            <Clock size={11} />
            <span>Started {formatTimestamp(j.createdAt)}</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect && !isOpening) onSelect(j);
          }}
          disabled={isOpening}
          className={isActionable ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{
            padding: '0.5rem 1.125rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            gap: '0.375rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            opacity: isOpening ? 0.75 : 1,
            cursor: isOpening ? 'not-allowed' : 'pointer',
          }}
        >
          {isOpening ? (
            <>
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Opening your journey...</span>
            </>
          ) : (
            <>
              <span>{ctaLabel}</span>
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </div>

      {/* Inline opening error */}
      {openError && (
        <div style={{ padding: '0.625rem 1.5rem', background: '#FEF2F2', borderTop: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#991B1B', fontSize: '0.75rem' }}>
            <AlertCircle size={13} />
            <span>We couldn't open this journey right now. {openError}</span>
          </div>
          {onRetryOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRetryOpen();
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', color: '#991B1B', borderColor: '#FCA5A5' }}
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Expandable details & audit row */}
      <div style={{ borderTop: '1px solid #F1F5F9' }}>
        <button
          onClick={toggleExpand}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.625rem 1.5rem', background: 'transparent', border: 'none',
            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, color: '#94A3B8',
          }}
        >
          <span>{expanded ? 'Hide audit trail & reference' : 'View audit trail & reference'}</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {expanded && (
          <div style={{ padding: '0 1.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Reference ID */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Reference ID</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <code style={{ fontSize: '0.75rem', color: '#475569', background: '#F8FAFC', padding: '0.1875rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                  {j.id.slice(0, 8)}…{j.id.slice(-4)}
                </code>
                <button onClick={copyId} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0.125rem', display: 'flex' }} title="Copy ID">
                  {copied ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Technical state & Status transition */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Backend state</span>
              <code style={{ fontSize: '0.75rem', color: '#64748B', background: '#F8FAFC', padding: '0.1875rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                {j.status}
              </code>
            </div>

            {/* Domain / type */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Domain · Type</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{j.domain} · {j.journeyType}</span>
            </div>

            {/* Created */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Created</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {new Date(j.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </div>

            {/* Last updated */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Last updated</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {new Date(j.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </div>

            {/* Audit Trail & Events */}
            <div style={{ marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Activity &amp; Audit Trail</span>
                {loadingTimeline && <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Loading activity…</span>}
              </div>

              {timelineEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {timelineEvents.slice(-6).reverse().map((evt) => (
                    <div key={evt.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', marginTop: '0.35rem', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{evt.title || evt.eventType}</span>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem', flexShrink: 0 }}>{formatTimestamp(evt.createdAt)}</span>
                        </div>
                        {evt.details && (
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem', marginTop: '0.1rem' }}>{evt.details}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : !loadingTimeline ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, fontStyle: 'italic' }}>
                  Initial event: Journey record created in audit store.
                </p>
              ) : null}
            </div>

            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FileText size={10} /> Your activity is securely recorded and traceable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Section heading ──────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>{label}</span>
    <span style={{ fontSize: '0.6875rem', fontWeight: 600, background: 'var(--bg-surface-secondary)', color: 'var(--color-text-secondary)', borderRadius: '9999px', padding: '0.1rem 0.45rem' }}>{count}</span>
    <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export interface JourneysListViewProps {
  onSelectJourney?: (journey: Journey) => Promise<void> | void;
  onStartJourney?: () => void;
}

export const JourneysListView: React.FC<JourneysListViewProps> = ({ onSelectJourney, onStartJourney }) => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [openingJourneyId, setOpeningJourneyId] = useState<string | null>(null);
  const [openingError, setOpeningError] = useState<{ id: string; message: string } | null>(null);

  const fetchJourneys = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await journeysApi.listJourneys();
      setJourneys(res.journeys);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch journeys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJourneys(); }, []);

  const handleSelectJourney = async (j: Journey) => {
    if (openingJourneyId) return; // double-click prevention
    setOpeningJourneyId(j.id);
    setOpeningError(null);
    try {
      if (onSelectJourney) {
        await onSelectJourney(j);
      }
    } catch (err: any) {
      setOpeningError({
        id: j.id,
        message: err.message || "We couldn't open this journey right now.",
      });
    } finally {
      setOpeningJourneyId(null);
    }
  };

  // Client-side filter — does not change API
  const filtered = journeys.filter(j => {
    if (filter === 'ALL') return true;
    if (filter === 'NEEDS_ATTENTION') return STATUS_META[j.status]?.requiresAction ?? false;
    return j.domain === filter;
  });

  const activeJourneys = filtered.filter(j => ACTIVE_STATUSES.includes(j.status as JourneyStatus));
  const recentJourneys = filtered.filter(j => !ACTIVE_STATUSES.includes(j.status as JourneyStatus));

  // Count filters
  const needsAttentionCount = journeys.filter(j => STATUS_META[j.status]?.requiresAction).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <Badge variant="forest">Audit &amp; History</Badge>
          </div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.375rem' }}>
            Your Financial Journeys
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
            Track your claims, applications, and support requests in one place.
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.375rem 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <FileText size={11} /> Your activity is securely recorded and traceable.
          </p>
        </div>

        <button onClick={fetchJourneys} disabled={loading} className="btn btn-secondary" style={{ gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh activity
        </button>
      </div>

      {/* ── Filter Row ── */}
      {!loading && !error && journeys.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(Object.keys(FILTER_LABELS) as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.3125rem 0.875rem',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: filter === f ? 'var(--color-primary)' : 'var(--border-subtle)',
                background: filter === f ? 'var(--primary-subtle)' : '#FFFFFF',
                color: filter === f ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: filter === f ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              {FILTER_LABELS[f]}
              {f === 'NEEDS_ATTENTION' && needsAttentionCount > 0 && (
                <span style={{ background: 'var(--secondary-subtle)', color: 'var(--secondary-text)', border: '1px solid var(--secondary-border)', borderRadius: '9999px', padding: '0 0.375rem', fontSize: '0.6875rem', fontWeight: 700 }}>
                  {needsAttentionCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── States ── */}
      {loading ? (
        <Card>
          <LoadingState message="Loading your financial journeys..." />
        </Card>
      ) : error ? (
        <ErrorBanner title="Connection Error" message={error} onRetry={fetchJourneys} />
      ) : journeys.length === 0 ? (
        /* ── Empty state ── */
        <Card style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '16px', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: 'var(--color-text-muted)' }}>
            <History size={28} />
          </div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            No financial journeys yet
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: 380, margin: '0 auto 1.5rem', lineHeight: 1.65 }}>
            Start with a claim, borrowing question, or payment issue and we'll guide you through the next steps.
          </p>
          <button
            onClick={() => {
              if (onStartJourney) {
                onStartJourney();
              } else if (onSelectJourney) {
                onSelectJourney({ domain: 'INSURANCE' } as any);
              }
            }}
            className="btn btn-primary"
            style={{ gap: '0.5rem', padding: '0.625rem 1.375rem' }}
          >
            Start a Journey <ArrowRight size={14} />
          </button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>No journeys match this filter.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* ACTIVE section */}
          {activeJourneys.length > 0 && (
            <div>
              <SectionLabel label="Active" count={activeJourneys.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {activeJourneys.map(j => (
                  <JourneyCard
                    key={j.id}
                    journey={j}
                    onSelect={handleSelectJourney}
                    isOpening={openingJourneyId === j.id}
                    openError={openingError?.id === j.id ? openingError.message : null}
                    onRetryOpen={() => handleSelectJourney(j)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* RECENT section */}
          {recentJourneys.length > 0 && (
            <div>
              <SectionLabel label="Recent" count={recentJourneys.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {recentJourneys.map(j => (
                  <JourneyCard
                    key={j.id}
                    journey={j}
                    onSelect={handleSelectJourney}
                    isOpening={openingJourneyId === j.id}
                    openError={openingError?.id === j.id ? openingError.message : null}
                    onRetryOpen={() => handleSelectJourney(j)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
