import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  User,
  Cpu,
  RefreshCw,
  Shield,
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

  const getActorDetails = (actorType: string) => {
    switch (actorType) {
      case 'USER':
        return { icon: User, color: 'var(--primary-light)', badge: 'Customer' };
      case 'SYSTEM':
        return { icon: Cpu, color: 'var(--success)', badge: 'System' };
      case 'AI':
        return { icon: Activity, color: '#c084fc', badge: 'Copilot AI' };
      case 'WORKFLOW':
        return { icon: Shield, color: 'var(--warning)', badge: 'Workflow' };
      default:
        return { icon: Clock, color: 'var(--text-muted)', badge: actorType };
    }
  };

  return (
    <Card style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Audit & Timeline ({events.length} Events)
          </h4>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            Deterministic audit trail of all actions and state transitions
          </div>
        </div>

        <button
          onClick={fetchTimeline}
          disabled={isLoading}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', gap: '0.25rem' }}
        >
          <RefreshCw size={12} className={isLoading ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            color: 'var(--danger)',
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

      {/* Vertical Timeline */}
      <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
        <div
          style={{
            position: 'absolute',
            top: '8px',
            bottom: '8px',
            left: '6px',
            width: '1px',
            background: 'var(--border-subtle)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((ev, idx) => {
            const { color, badge } = getActorDetails(ev.actorType);
            const dateStr = new Date(ev.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={ev.id || idx} style={{ position: 'relative' }}>
                {/* Node dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    top: '5px',
                    width: '13px',
                    height: '13px',
                    borderRadius: '50%',
                    background: 'var(--surface-card)',
                    border: `2px solid ${color}`,
                    zIndex: 1,
                  }}
                />

                <div
                  style={{
                    background: 'var(--surface-sunken)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.625rem 0.875rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {ev.title}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--surface-card)',
                          color: color,
                          fontWeight: 600,
                        }}
                      >
                        {badge}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {dateStr}
                    </span>
                  </div>

                  {ev.details && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
                      {ev.details}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
