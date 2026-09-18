import React from 'react';
import { Shield, Sparkles, User, Server, Database } from 'lucide-react';
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
    <header
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Product Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Shield size={18} color="#ffffff" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
            ClaimSahay
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-medium)', paddingLeft: '0.5rem' }}>
            AI Financial Journey Copilot
          </span>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <Badge variant={backendOnline ? 'green' : 'red'}>
          <Server size={11} />
          <span>{backendOnline ? 'Backend Online' : 'Backend Disconnected'}</span>
        </Badge>

        <Badge variant="amber">
          <Database size={11} />
          <span>Sandbox / Mock Mode</span>
        </Badge>
      </div>

      {/* Right Controls: Persona Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: 'var(--bg-surface-elevated)',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <User size={13} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Persona:</span>
          <select
            value={currentUser.userId}
            onChange={handleUserSelect}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              fontWeight: 500,
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
