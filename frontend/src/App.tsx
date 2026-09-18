import React, { useEffect, useState } from 'react';
import { Shield, Home, DollarSign, CreditCard, History, LifeBuoy } from 'lucide-react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
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
      <div className="nav-bar">
        <div className="nav-tabs">
          <button
            onClick={() => setActiveTab('home')}
            className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
          >
            <Home size={15} />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveTab('claimsahay')}
            className={`nav-tab ${activeTab === 'claimsahay' ? 'active' : ''}`}
          >
            <Shield size={15} />
            <span>ClaimSahay (Insurance)</span>
          </button>
          <button
            onClick={() => setActiveTab('lending')}
            className={`nav-tab ${activeTab === 'lending' ? 'active' : ''}`}
          >
            <DollarSign size={15} />
            <span>Lending Copilot</span>
          </button>
          <button
            onClick={() => setActiveTab('fintech')}
            className={`nav-tab ${activeTab === 'fintech' ? 'active' : ''}`}
          >
            <CreditCard size={15} />
            <span>Fintech Disputes</span>
          </button>
          <button
            onClick={() => setActiveTab('journeys')}
            className={`nav-tab ${activeTab === 'journeys' ? 'active' : ''}`}
          >
            <History size={15} />
            <span>Journeys & Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`nav-tab ${activeTab === 'support' ? 'active' : ''}`}
          >
            <LifeBuoy size={15} />
            <span>Support Specialist</span>
          </button>
        </div>

        {/* Current Active Persona Indicator */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span>Session:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{currentUser.userId}</span>
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

      {/* Institutional Enterprise Footer */}
      <Footer onNavigateTab={(tab) => setActiveTab(tab as any)} />
    </div>
  );
}

export default App;
