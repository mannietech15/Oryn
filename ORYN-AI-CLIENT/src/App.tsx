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
  return null;
}

