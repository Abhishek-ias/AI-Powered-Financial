import React, { useEffect, useState } from 'react';
import { Shield, Home, DollarSign, CreditCard, History, LifeBuoy } from 'lucide-react';
import { Header, Footer } from './components/layout';
import {
  HomePage,
  ClaimSahayPage,
  LendingPage,
  FintechPage,
  JourneysPage,
  SupportPage,
} from './pages';
import { api, getActiveUser } from './api/client';
import { ReadyStatus, UserRole } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'claimsahay' | 'lending' | 'fintech' | 'journeys' | 'support'>('home');
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [readyStatus, setReadyStatus] = useState<ReadyStatus | null>(null);
  const [activeGoal, setActiveGoal] = useState<string>('');
  const [currentUser, setCurrentUser] = useState(getActiveUser());

  const navigateToTab = (tab: 'home' | 'claimsahay' | 'lending' | 'fintech' | 'journeys' | 'support', updateHistory = true) => {
    setActiveTab(tab);
    if (tab !== 'claimsahay') {
      setSelectedJourneyId(null);
    }
    if (updateHistory) {
      const url = tab === 'home' ? '/' : `/${tab}`;
      window.history.pushState({ tab }, '', url);
    }
  };

  const openJourney = (journeyId: string, updateHistory = true) => {
    setSelectedJourneyId(journeyId);
    setActiveTab('claimsahay');
    if (updateHistory) {
      window.history.pushState({ tab: 'claimsahay', journeyId }, '', `/journeys/${journeyId}`);
    }
  };

  // Popstate listener for Browser Back / Forward and deep links
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const journeyMatch = path.match(/^\/journeys\/([a-zA-Z0-9_-]+)$/);
      if (journeyMatch) {
        openJourney(journeyMatch[1], false);
      } else if (path === '/journeys') {
        setSelectedJourneyId(null);
        setActiveTab('journeys');
      } else if (path === '/claimsahay') {
        setSelectedJourneyId(null);
        setActiveTab('claimsahay');
      } else if (path === '/lending') {
        setSelectedJourneyId(null);
        setActiveTab('lending');
      } else if (path === '/fintech') {
        setSelectedJourneyId(null);
        setActiveTab('fintech');
      } else if (path === '/support') {
        setSelectedJourneyId(null);
        setActiveTab('support');
      } else if (path === '/' || path === '') {
        setSelectedJourneyId(null);
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
      navigateToTab('lending');
    } else if (domain === 'FINTECH') {
      navigateToTab('fintech');
    } else {
      setSelectedJourneyId(null);
      navigateToTab('claimsahay');
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
            onClick={() => navigateToTab('home')}
            className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
          >
            <Home size={15} />
            <span>Home</span>
          </button>
          <button
            onClick={() => navigateToTab('claimsahay')}
            className={`nav-tab ${activeTab === 'claimsahay' ? 'active' : ''}`}
          >
            <Shield size={15} />
            <span>ClaimSahay (Insurance)</span>
          </button>
          <button
            onClick={() => navigateToTab('lending')}
            className={`nav-tab ${activeTab === 'lending' ? 'active' : ''}`}
          >
            <DollarSign size={15} />
            <span>Lending Copilot</span>
          </button>
          <button
            onClick={() => navigateToTab('fintech')}
            className={`nav-tab ${activeTab === 'fintech' ? 'active' : ''}`}
          >
            <CreditCard size={15} />
            <span>Fintech Disputes</span>
          </button>
          <button
            onClick={() => navigateToTab('journeys')}
            className={`nav-tab ${activeTab === 'journeys' ? 'active' : ''}`}
          >
            <History size={15} />
            <span>Journeys & Audit</span>
          </button>
          <button
            onClick={() => navigateToTab('support')}
            className={`nav-tab ${activeTab === 'support' ? 'active' : ''}`}
          >
            <LifeBuoy size={15} />
            <span>Support Specialist</span>
          </button>
        </div>

        {/* Current Active Persona Indicator */}
        <div className="nav-bar-session" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span>Session:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{currentUser.userId}</span>
        </div>
      </div>

      {/* Main Workspace Area */}
      <main className="app-main">
        {activeTab === 'home' && (
          <HomePage
            onStartJourney={handleStartJourney}
            onNavigateTab={(tab) => navigateToTab(tab as any)}
            readyStatus={readyStatus}
          />
        )}
        {activeTab === 'claimsahay' && (
          <ClaimSahayPage
            initialGoal={activeGoal}
            initialJourneyId={selectedJourneyId || undefined}
            onResetGoal={() => {
              setActiveGoal('');
              setSelectedJourneyId(null);
            }}
            onNavigateToJourneys={() => navigateToTab('journeys')}
          />
        )}
        {activeTab === 'lending' && <LendingPage />}
        {activeTab === 'fintech' && <FintechPage />}
        {activeTab === 'journeys' && (
          <JourneysPage
            onSelectJourney={(j) => openJourney(j.id)}
            onStartJourney={() => {
              setSelectedJourneyId(null);
              navigateToTab('claimsahay');
            }}
          />
        )}
        {activeTab === 'support' && <SupportPage />}
      </main>

      {/* Institutional Enterprise Footer */}
      <Footer onNavigateTab={(tab) => navigateToTab(tab as any)} />
    </div>
  );
}

export default App;
