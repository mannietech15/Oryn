import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import OrganizationPage from './pages/OrganizationPage';
import FinancialsPage from './pages/FinancialsPage';
import ExplorePage from './pages/ExplorePage';
import SettingsPage from './pages/SettingsPage';
import AddOrganizationPage from './pages/AddOrganizationPage';
import AutomationPage from './pages/AutomationPage';
import IntegrationsPage from './pages/IntegrationsPage';
import DocumentsPage from './pages/DocumentsPage';
import CalendarPage from './pages/CalendarPage';
import type { Page } from './types';
import { useChat } from './hooks/useChat';
import { Toaster } from './components/ui/Toaster';

export default function App() {
  const [page, setPage] = useState<Page>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth > 768;
    return true;
  });
  const [orgProfile, setOrgProfile] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oryn_orgProfile');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { return null; }
      }
    }
    return null;
  });
  const chat = useChat();

  const handleCompleteOrg = (data: any) => {
    setOrgProfile(data);
    localStorage.setItem('oryn_orgProfile', JSON.stringify(data));
    navigate('dashboard');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const navigate = (p: Page) => {
    setPage(p);
    setIsSidebarOpen(false);
  };

  const renderPage = () => {
    switch (page) {
      case 'chat':         return <ChatPage {...chat} />;
      case 'dashboard':    return <DashboardPage orgProfile={orgProfile} />;
      case 'analytics':    return <AnalyticsPage />;
      case 'organization': return <OrganizationPage />;
      case 'financials':   return <FinancialsPage />;
      case 'explore':      return <ExplorePage />;
      case 'settings':     return <SettingsPage />;
      case 'automation':   return <AutomationPage />;
      case 'integrations': return <IntegrationsPage />;
      case 'documents':    return <DocumentsPage />;
      case 'calendar':     return <CalendarPage />;
      case 'add-organization': return <AddOrganizationPage onComplete={handleCompleteOrg} />;
      default:             return <DashboardPage orgProfile={orgProfile} />;
    }
  };

  return (
    <>
      <Toaster />
      {page !== 'chat' && <BackgroundOrbs />}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 10 }}>
        
        {/* Mobile Top Navigation */}
        <div className="hide-on-desktop" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', background: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', position: 'relative', zIndex: 50
        }}>
          <button onClick={toggleSidebar} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg-subtle)', borderRadius: 10, border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)"><polygon points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="12" r="2" fill="var(--accent-primary)" stroke="none" /></svg>
            <span style={{ fontFamily: 'var(--font-script)', fontSize: 22, color: 'var(--text-primary)', paddingBottom: 2 }}>Oryn</span>
          </div>
          
          <button onClick={() => { chat.startNewSession(); navigate('chat'); }} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(249, 115, 22, 0.1)', borderRadius: 10, border: '1px solid rgba(249, 115, 22, 0.2)', color: 'var(--accent-primary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Sidebar 
            page={page} 
            onNavigate={navigate} 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            sessions={chat.sessions}
            activeSessionId={chat.activeSessionId}
            onNewChat={chat.startNewSession}
            onSelectSession={chat.setActiveSessionId}
            organizationName={orgProfile?.name || null}
            organizationLogo={orgProfile?.logo || null}
          />
          <main style={{ 
            flex: 1, 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Desktop Sidebar Toggle */}
            <div className="desktop-only hide-on-mobile" style={{ position: 'absolute', top: 24, left: 24, zIndex: 100 }}>
              {!isSidebarOpen && (
                <button onClick={toggleSidebar} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg-subtle)', borderRadius: 10, border: '1px solid var(--card-border)', color: 'var(--text-primary)', cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-hover)'; e.currentTarget.style.color = 'var(--accent-primary)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg-subtle)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
              )}
            </div>
            {renderPage()}
          </main>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}

function BackgroundOrbs() {
  return null;
}

