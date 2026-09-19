import React, { useEffect, useState } from 'react';
import { LifeBuoy, ShieldAlert, Lock, CheckCircle2, RefreshCw, UserCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { api, getActiveUser } from '../api/client';

export const SupportView: React.FC = () => {
  const currentUser = getActiveUser();
  const [adminAuditEvents, setAdminAuditEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ events: any[]; count: number }>('/api/admin/audit');
      setAdminAuditEvents(res.events);
    } catch (err: any) {
      setError(err.message || 'Access denied or failed to load audit');
      setAdminAuditEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminAudit();
  }, [currentUser.userId, currentUser.role]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="purple">Support & Compliance</Badge>
          <Badge variant={currentUser.role === 'ADMIN' ? 'green' : 'amber'}>
            Role: {currentUser.role}
          </Badge>
        </div>
        <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>
          Human Support Handoff & Audit Log
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Structured escalation packaging and immutable audit trail verification with role-based access control.
        </p>
      </div>

      <div className="grid-2">
        {/* Support Workflow Explainer */}
        <Card>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LifeBuoy size={18} color="#8b5cf6" />
            Human Escalation Standard
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            When an ambiguous policy clause or contradictory evidence arises, ClaimSahay does NOT guess.
            Instead, it generates a structured 15-field context packet:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-body)' }}>
              ✓ Customer Goal & Language
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-body)' }}>
              ✓ Questions & Answers
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-body)' }}>
              ✓ Granted Consent Scope
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-body)' }}>
              ✓ Uploaded Documents
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-body)' }}>
              ✓ Extracted Evidence
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-body)' }}>
              ✓ Validation Conflicts
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-body)' }}>
              ✓ Policy Reconciliations
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-body)' }}>
              ✓ Insurer Queries
            </div>
          </div>
          <div style={{ marginTop: '1.25rem', background: 'var(--sage-subtle)', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--sage-border)', fontSize: '0.8125rem' }}>
            <strong style={{ color: 'var(--color-primary)' }}>Handoff Guarantee:</strong>
            <p style={{ color: 'var(--color-text)', marginTop: '0.25rem' }}>
              Human claims specialists receive pre-compiled dossier cards rather than unparsed, noisy chat transcripts.
            </p>
          </div>
        </Card>

        {/* Admin RBAC Audit Trail */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} color="#D97706" />
                Compliance Audit Trail (Admin Only)
              </h3>
              <button
                onClick={fetchAdminAudit}
                disabled={loading}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {loading ? (
              <LoadingState message="Verifying role permissions & fetching audit..." />
            ) : error ? (
              <div style={{ background: 'var(--danger-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-text)', fontWeight: 600 }}>
                  <ShieldAlert size={18} />
                  RBAC Enforcement Active
                </div>
                <p style={{ color: 'var(--danger-text)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                  {error}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  Tip: Use the persona switcher in the header to change your persona to <strong>Admin User (System Admin)</strong> to view the audit feed.
                </p>
              </div>
            ) : adminAuditEvents.length > 0 ? (
              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {adminAuditEvents.slice(0, 6).map((e, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{e.eventType}</strong>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>by {e.actorType}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                      {new Date(e.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                No audit events recorded yet.
              </p>
            )}
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Source: GET /api/admin/audit (requireRole: ADMIN)
            </span>
            <Badge variant="amber" size="sm">RBAC Protected</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
