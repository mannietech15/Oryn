import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import OrganizationPage from './pages/OrganizationPage';
import FinancialsPage from './pages/FinancialsPage';
import ExplorePage from './pages/ExplorePage';
import SettingsPage from './pages/SettingsPage';
import type { Page } from './types';
import { useChat } from './hooks/useChat';

export default function App() {
  const [page, setPage] = useState<Page>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chat = useChat();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const navigate = (p: Page) => {
    setPage(p);
    setIsSidebarOpen(false);
  };

  const renderPage = () => {
    switch (page) {
      case 'chat':         return <ChatPage {...chat} />;
      case 'dashboard':    return <DashboardPage />;
      case 'analytics':    return <AnalyticsPage />;
      case 'organization': return <OrganizationPage />;
      case 'financials':   return <FinancialsPage />;
      case 'explore':      return <ExplorePage />;
      case 'settings':     return <SettingsPage />;
      case 'automation':   return <AutomationPlaceholder />;
      default:             return <DashboardPage />;
    }
  };

  return (
    <>
      {page !== 'chat' && <BackgroundOrbs />}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 10 }}>
        <Header page={page} onNavigate={navigate} onToggleSidebar={toggleSidebar} />
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
          />
          <main style={{ 
            flex: 1, 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative'
          }}>
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}

function AutomationPlaceholder() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 24, opacity: 0.5 }}>
      <div style={{ fontSize: 48, color: 'var(--accent)' }}>⟁</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, letterSpacing: 4, color: 'var(--muted)', textTransform: 'uppercase' }}>
        Automation · Coming Soon
      </div>
    </div>
  );
}

function BackgroundOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      <div className="bg-orb" style={{ 
        width: 600, height: 600, top: '-10%', left: '10%', 
        background: 'radial-gradient(circle, rgba(0, 240, 255, 0.4) 0%, rgba(0, 240, 255, 0.15) 50%, transparent 80%)',
        animation: 'float-1 30s ease-in-out infinite' 
      }} />
      <div className="bg-orb" style={{ 
        width: 800, height: 800, bottom: '-10%', right: '5%', 
        background: 'radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, rgba(138, 43, 226, 0.1) 50%, transparent 80%)',
        animation: 'float-2 40s ease-in-out infinite' 
      }} />
      <div className="bg-orb" style={{ 
        width: 500, height: 500, top: '40%', left: '40%', 
        background: 'radial-gradient(circle, rgba(0, 136, 255, 0.35) 0%, rgba(0, 136, 255, 0.12) 50%, transparent 80%)',
        animation: 'float-3 35s ease-in-out infinite' 
      }} />
    </div>
  );
}

