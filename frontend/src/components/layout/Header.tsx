import React from 'react';
import { Shield, User, Server, Database } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { getActiveUser, setActiveUser } from '../../api/client';
import { ReadyStatus, UserRole } from '../../types';

export interface HeaderProps {
  readyStatus?: ReadyStatus | null;
  backendOnline: boolean;
  onUserChange?: (userId: string, role: UserRole) => void;
}

const DEMO_USERS = [
  { id: 'user-customer-001', name: 'Ramesh Kumar', role: 'CUSTOMER' as UserRole, label: 'Customer' },
  { id: 'user-agent-001', name: 'Priya Sharma', role: 'AGENT' as UserRole, label: 'Claims Specialist' },
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
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Product Identity (Dark Navy #0F172A) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Shield size={18} color="#FFFFFF" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.02em', color: '#0F172A' }}>
            ClaimSahay
          </span>
          <span className="header-brand-subtitle" style={{ fontSize: '0.75rem', color: '#64748B', borderLeft: '1px solid #E2E8F0', paddingLeft: '0.5rem' }}>
            AI Financial Journey Copilot
          </span>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="header-status-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Badge variant={backendOnline ? 'green' : 'red'}>
          <Server size={11} />
          <span>{backendOnline ? 'Backend Connected' : 'Backend Disconnected'}</span>
        </Badge>

        <Badge variant="amber">
          <Database size={11} />
          <span>Sandbox Mode</span>
        </Badge>
      </div>

      {/* Right Controls: Persona Switcher (#F1F5F9 neutral surface) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: '#F1F5F9',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #E2E8F0',
          }}
        >
          <User size={13} style={{ color: '#64748B' }} />
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Persona:</span>
          <select
            value={currentUser.userId}
            onChange={handleUserSelect}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0F172A',
              fontSize: '0.75rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {DEMO_USERS.map(u => (
              <option key={u.id} value={u.id} style={{ background: '#FFFFFF', color: '#0F172A' }}>
                {u.name} ({u.label})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
