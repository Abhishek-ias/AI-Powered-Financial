import React, { useEffect, useState } from 'react';
import { Shield, Home, DollarSign, CreditCard, History, LifeBuoy } from 'lucide-react';
import { Header } from './components/common/Header';
import { HomeView } from './views/HomeView';
import { ClaimSahayView } from './views/ClaimSahayView';
import { LendingView } from './views/LendingView';
import { FintechView } from './views/FintechView';
import { JourneysListView } from './views/JourneysListView';
import { SupportView } from './views/SupportView';
import { api, getActiveUser } from './api/client';
import { ReadyStatus, UserRole } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'claimsahay' | 'lending' | 'fintech' | 'journeys' | 'support'>('home');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [readyStatus, setReadyStatus] = useState<ReadyStatus | null>(null);
  const [activeGoal, setActiveGoal] = useState<string>('');
  const [currentUser, setCurrentUser] = useState(getActiveUser());

  // Check backend connectivity on mount
  useEffect(() => {
    let isMounted = true;

    async function checkBackend() {
      try {
        const health = await api.checkHealth();
        if (isMounted && health.status === 'healthy') {
          setBackendOnline(true);
        }
        const ready = await api.checkReadiness();
        if (isMounted) {
          setReadyStatus(ready);
        }
      } catch {
        if (isMounted) {
          setBackendOnline(false);
          setReadyStatus(null);
        }
      }
    }

    checkBackend();
    const interval = setInterval(checkBackend, 15000); // Heartbeat check every 15s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleStartJourney = (goalMessage: string, domain?: 'INSURANCE' | 'LENDING' | 'FINTECH') => {
    setActiveGoal(goalMessage);
    if (domain === 'LENDING') {
      setActiveTab('lending');
    } else if (domain === 'FINTECH') {
      setActiveTab('fintech');
    } else {
      setActiveTab('claimsahay');
    }
  };

  const handleUserChange = (userId: string, role: UserRole) => {
    setCurrentUser({ userId, role });
  };

  return (
    <div className="app-container">
      {/* Global Top Bar */}
      <Header
        backendOnline={backendOnline}
        readyStatus={readyStatus}
        onUserChange={handleUserChange}
      />

      {/* Primary Navigation Tabs */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          overflowX: 'auto',
        }}
      >
        <div className="nav-tabs">
          <button
            onClick={() => setActiveTab('home')}
            className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
          >
            <Home size={16} /> Home
          </button>
          <button
            onClick={() => setActiveTab('claimsahay')}
            className={`nav-tab ${activeTab === 'claimsahay' ? 'active' : ''}`}
          >
            <Shield size={16} color="#3b82f6" /> ClaimSahay (Insurance)
          </button>
          <button
            onClick={() => setActiveTab('lending')}
            className={`nav-tab ${activeTab === 'lending' ? 'active' : ''}`}
          >
            <DollarSign size={16} color="#10b981" /> Lending Copilot
          </button>
          <button
            onClick={() => setActiveTab('fintech')}
            className={`nav-tab ${activeTab === 'fintech' ? 'active' : ''}`}
          >
            <CreditCard size={16} color="#8b5cf6" /> Fintech Disputes
          </button>
          <button
            onClick={() => setActiveTab('journeys')}
            className={`nav-tab ${activeTab === 'journeys' ? 'active' : ''}`}
          >
            <History size={16} /> Journeys / History
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`nav-tab ${activeTab === 'support' ? 'active' : ''}`}
          >
            <LifeBuoy size={16} /> Support & Compliance
          </button>
        </div>

        {/* Current Active Persona Indicator */}
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Acting as:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{currentUser.userId}</strong>
        </div>
      </div>

      {/* Main Workspace Area */}
      <main className="app-main">
        {activeTab === 'home' && (
          <HomeView
            onStartJourney={handleStartJourney}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            readyStatus={readyStatus}
          />
        )}
        {activeTab === 'claimsahay' && (
          <ClaimSahayView
            initialGoal={activeGoal}
            onResetGoal={() => setActiveGoal('')}
          />
        )}
        {activeTab === 'lending' && <LendingView />}
        {activeTab === 'fintech' && <FintechView />}
        {activeTab === 'journeys' && (
          <JourneysListView
            onSelectJourney={(j) => {
              if (j.domain === 'INSURANCE') setActiveTab('claimsahay');
              else if (j.domain === 'LENDING') setActiveTab('lending');
              else if (j.domain === 'FINTECH') setActiveTab('fintech');
            }}
          />
        )}
        {activeTab === 'support' && <SupportView />}
      </main>
    </div>
  );
}

export default App;
