import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  User,
  Cpu,
  RefreshCw,
  ArrowRight,
  Shield,
  AlertTriangle,
  FileText,
  Send,
  LifeBuoy,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { TimelineEvent, JourneyStatus } from '../../types';
import { journeysApi } from '../../api/journeys';

export interface TimelineViewProps {
  journeyId: string;
  status: JourneyStatus;
  onEscalate?: () => void;
  onRefreshJourney?: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  journeyId,
  status,
  onEscalate,
  onRefreshJourney,
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async () => {
    if (!journeyId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await journeysApi.getTimeline(journeyId);
      if (res.timeline) {
        setEvents(res.timeline);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch timeline events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [journeyId, status]);

  // Customer-friendly status mapping
  const getStatusMapping = (rawStatus: string) => {
    switch (rawStatus) {
      case 'INSTITUTION_REVIEW':
        return {
          title: 'Your case is being reviewed.',
          desc: 'Submitted to the insurer claims system in simulated sandbox mode. Awaiting decision.',
          variant: 'blue' as const,
        };
      case 'QUERY_RECEIVED':
        return {
          title: 'Additional information is required.',
          desc: 'The insurer has raised an inquiry regarding room rent sub-limits or missing records.',
          variant: 'amber' as const,
        };
      case 'HUMAN_REVIEW':
        return {
          title: 'A specialist needs to review this case.',
          desc: 'Escalated to our senior insurance claims advocate with your full dossier.',
          variant: 'purple' as const,
        };
      case 'COMPLETED':
        return {
          title: 'Your journey is complete.',
          desc: 'All claims documentation and reconciliations have finalized successfully.',
          variant: 'green' as const,
        };
      case 'FAILED':
        return {
          title: "We couldn't complete this step. Your case is preserved for review.",
          desc: 'An unrecoverable exception occurred. An agent will review the stored state.',
          variant: 'red' as const,
        };
      case 'NEEDS_ACTION':
        return {
          title: 'Action required to address policy or document discrepancies.',
          desc: 'A contradiction or policy sub-limit capping requires customer review.',
          variant: 'amber' as const,
        };
      case 'USER_CONFIRMED':
        return {
          title: 'Confirmed by you.',
          desc: 'Cryptographic approval record created. Ready for final workflow submission.',
          variant: 'blue' as const,
        };
      case 'ACTION_PENDING':
        return {
          title: 'Workflow execution in progress.',
          desc: 'Triggering mock external workflow dispatch to the insurer.',
          variant: 'blue' as const,
        };
      case 'SUBMITTED':
        return {
          title: 'Case successfully submitted.',
          desc: 'Payload delivered to institution mock API.',
          variant: 'green' as const,
        };
      default:
        return {
          title: `Current State: ${rawStatus.replace(/_/g, ' ')}`,
          desc: 'Journey progressing through standard ClaimSahay checkpoints.',
          variant: 'blue' as const,
        };
    }
  };

  const currentStatusInfo = getStatusMapping(status);

  // Helper for actor icon & badge
  const getActorDetails = (actorType: string) => {
    switch (actorType) {
      case 'USER':
        return { icon: User, color: '#60a5fa', badge: 'Customer' };
      case 'SYSTEM':
        return { icon: Cpu, color: '#34d399', badge: 'System' };
      case 'AI':
        return { icon: Activity, color: '#c084fc', badge: 'Copilot AI' };
      case 'WORKFLOW':
        return { icon: Shield, color: '#fde047', badge: 'Workflow' };
      default:
        return { icon: Clock, color: '#94a3b8', badge: actorType };
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. STATUS CARD (Requirement 9) */}
      <Card
        glow
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(96, 165, 250, 0.3)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <Activity size={18} color="#60a5fa" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-light)' }}>
                Authoritative Case Status
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              {currentStatusInfo.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {currentStatusInfo.desc}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge variant={currentStatusInfo.variant}>{status}</Badge>
            {onRefreshJourney && (
              <button
                type="button"
                onClick={() => {
                  fetchTimeline();
                  onRefreshJourney();
                }}
                disabled={isLoading}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                title="Refresh timeline from backend"
              >
                <RefreshCw size={12} className={isLoading ? 'spinner' : ''} />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* 2. CHRONOLOGICAL TIMELINE (Requirement 8) */}
      <Card
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid var(--border-subtle)',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#ffffff' }}>
              Audit & Activity Feed ({events.length} Events)
            </h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
              Immutable backend timeline events recorded across the lifecycle
            </div>
          </div>

          <Badge variant="blue">Real-Time Audit Log</Badge>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              color: '#fca5a5',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {events.length === 0 && !isLoading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No timeline events recorded yet.
          </div>
        )}

        {/* Vertical Timeline Tree */}
        <div style={{ position: 'relative', paddingLeft: '1.75rem' }}>
          {/* Vertical Track Line */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              bottom: '8px',
              left: '8px',
              width: '2px',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {events.map((ev, idx) => {
              const { icon: ActorIcon, color, badge } = getActorDetails(ev.actorType);
              const dateStr = new Date(ev.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div key={ev.id || idx} style={{ position: 'relative' }}>
                  {/* Event Node Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.75rem',
                      top: '4px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'var(--bg-card)',
                      border: `2px solid ${color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}
                  >
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                  </div>

                  {/* Event Content Box */}
                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.45)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.875rem', color: '#ffffff' }}>
                          {ev.title}
                        </strong>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            padding: '0.125rem 0.375rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: color,
                            fontWeight: 600,
                          }}
                        >
                          {badge}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {dateStr}
                      </span>
                    </div>

                    {ev.details && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.125rem 0 0', lineHeight: 1.4 }}>
                        {ev.details}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            All state transitions and approvals are logged deterministically.
          </div>

          {onEscalate && (
            <button
              type="button"
              onClick={onEscalate}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
            >
              <LifeBuoy size={14} />
              <span>Escalate Case to Human Specialist</span>
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};
