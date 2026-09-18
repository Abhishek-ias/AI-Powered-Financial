import React from 'react';
import { Shield, Sparkles, User, Database, Server } from 'lucide-react';
import { Badge } from './Badge';
import { getActiveUser, setActiveUser } from '../../api/client';
import { ReadyStatus, UserRole } from '../../types';

export interface HeaderProps {
  readyStatus?: ReadyStatus | null;
  backendOnline: boolean;
  onUserChange?: (userId: string, role: UserRole) => void;
}

const DEMO_USERS = [
  { id: 'user-customer-001', name: 'Ramesh Kumar', role: 'CUSTOMER' as UserRole, label: 'Customer' },
  { id: 'user-agent-001', name: 'Priya Sharma', role: 'AGENT' as UserRole, label: 'Claims Agent' },
  { id: 'user-admin-001', name: 'Admin User', role: 'ADMIN' as UserRole, label: 'System Admin' },
];

export const Header: React.FC<HeaderProps> = ({
  backendOnline,
  readyStatus,
  onUserChange,
}) => {
  const currentUser = getActiveUser();

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = DEMO_USERS.find(u => u.id === e.target.value);
    if (selected) {
      setActiveUser(selected.id, selected.role);
      if (onUserChange) onUserChange(selected.id, selected.role);
    }
  };

  return (
    <header className="app-header">
      {/* Brand & Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
          }}
        >
          <Shield size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>
              ClaimSahay
            </span>
            <Badge variant="blue" size="sm">
              <Sparkles size={11} style={{ marginRight: '3px' }} />
              Copilot
            </Badge>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            AI Financial Journey Copilot • Team NOVA
          </p>
        </div>
      </div>

      {/* Center/Status Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Backend Heartbeat */}
        <Badge variant={backendOnline ? 'green' : 'red'}>
          <Server size={12} style={{ marginRight: '4px' }} />
          {backendOnline ? 'Backend Online :3000' : 'Backend Disconnected'}
        </Badge>

        {/* Sandbox/Mock Provider Label */}
        {readyStatus && (
          <Badge variant="amber">
            <Database size={12} style={{ marginRight: '4px' }} />
            Sandbox Environment ({readyStatus.providerSummary.mockCount} Mocks)
          </Badge>
        )}
      </div>

      {/* Right Controls: Demo Identity Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(30, 41, 59, 0.7)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <User size={15} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Persona:</span>
          <select
            value={currentUser.userId}
            onChange={handleUserSelect}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {DEMO_USERS.map(u => (
              <option key={u.id} value={u.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                {u.name} ({u.label})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
