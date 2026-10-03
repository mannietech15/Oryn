import { useState, useEffect } from 'react';
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
import AuthPage from './pages/AuthPage';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Page } from './types';
import { useChat } from './hooks/useChat';
import { Toaster } from './components/ui/Toaster';
import { toast } from './components/ui/use-toast';
import { authService, UserProfile } from './services/auth.service';

const VALID_PAGES: Page[] = [
  'chat', 'dashboard', 'analytics', 'organization', 'financials',
  'explore', 'settings', 'automation', 'integrations', 'documents',
  'calendar', 'add-organization', 'edit-organization'
];

const getScopedOrgProfile = (user: UserProfile | null) => {
  if (typeof window === 'undefined' || !user) return null;
  const userKey = `oryn_orgProfile_${user.id || user.email}`;
  const saved = localStorage.getItem(userKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.name) return parsed;
    } catch { /* noop */ }
  }
  if (user.organization) {
    return { name: user.organization, logo: null };
  }
  return null;
};

export default function App() {
  const routerNavigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return authService.isAuthenticated();
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const user = authService.getUser();
    return user || {
      id: 'usr_default',
      name: 'Oryn User',
      email: 'user@oryn.ai',
      role: 'Verified Administrator',
      organization: 'Enterprise Workspace'
    };
  });

  const [orgProfile, setOrgProfile] = useState<any>(() => {
    const user = authService.getUser();
    return getScopedOrgProfile(user);
  });

  useEffect(() => {
    authService.getMe().then(user => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setOrgProfile((prev: any) => {
          if (!prev || !prev.name) {
            return getScopedOrgProfile(user);
          }
          return prev;
        });
      }
    }).catch(() => {
      // Offline fallback preserves current session
    });
  }, []);

  const pathSlug = location.pathname.replace(/^\/+/, '').split('/')[0];
  const page: Page = (pathSlug && VALID_PAGES.includes(pathSlug as Page))
    ? (pathSlug as Page)
    : 'chat';

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth > 768;
    return true;
  });
  const chat = useChat();

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    const profile = getScopedOrgProfile(user);
    setOrgProfile(profile);
    toast({
      title: 'Welcome to Oryn',
      description: `Authenticated as ${user.name} (${user.role}).`
    });
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setOrgProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oryn_orgProfile');
    }
    toast({
      title: 'Signed Out',
      description: 'You have been safely logged out of your active workspace session.'
    });
  };

  const handleCompleteOrg = (data: any) => {
    setOrgProfile(data);
    if (typeof window !== 'undefined') {
      if (currentUser?.id || currentUser?.email) {
        const userKey = `oryn_orgProfile_${currentUser.id || currentUser.email}`;
        localStorage.setItem(userKey, JSON.stringify(data));
      }
      localStorage.setItem('oryn_orgProfile', JSON.stringify(data));
    }
    navigate('dashboard');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const navigate = (p: Page) => {
    routerNavigate(p === 'chat' ? '/' : `/${p}`);
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster />
        <AuthPage onLogin={handleLogin} />
      </>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'chat':         return <ChatPage {...chat} />;
      case 'dashboard':    return <DashboardPage orgProfile={orgProfile || (currentUser?.organization ? { name: currentUser.organization } : null)} />;
      case 'analytics':    return <AnalyticsPage />;
      case 'organization': return <OrganizationPage />;
      case 'financials':   return <FinancialsPage />;
      case 'explore':      return <ExplorePage />;
      case 'settings':     return <SettingsPage onLogout={handleLogout} />;
      case 'automation':   return <AutomationPage />;
      case 'integrations': return <IntegrationsPage />;
      case 'documents':    return <DocumentsPage />;
      case 'calendar':     return <CalendarPage />;
      case 'add-organization': return <AddOrganizationPage onComplete={handleCompleteOrg} />;
      default:             return <DashboardPage orgProfile={orgProfile || (currentUser?.organization ? { name: currentUser.organization } : null)} />;
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)"><polygon points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="12" r="2" fill="var(--accent-primary)" stroke="none" /></svg>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Oryn</span>
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
            organizationName={orgProfile?.name || currentUser?.organization || null}
            organizationLogo={orgProfile?.logo || null}
            userName={currentUser.name}
            userEmail={currentUser.email}
            onLogout={handleLogout}
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

