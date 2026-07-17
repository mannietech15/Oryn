import React, { useState } from 'react';
import type { Page } from '../types';
import { motion } from 'framer-motion';

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
  isOpen?: boolean;
  onClose?: () => void;
  sessions?: { id: string, title: string, date: Date }[];
  activeSessionId?: string;
  onNewChat?: () => void;
  onSelectSession?: (id: string) => void;
  organizationName?: string | null;
  organizationLogo?: string | null;
}

interface SideItem {
  icon: React.ReactNode;
  label: string;
  page?: Page;
  badge?: string;
}

const icons = {
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>,
  analytics: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  organization: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  financials: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  explore: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>,
  automation: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  integrations: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
  documents: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  session: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
};

const sections: { label: string; items: SideItem[] }[] = [
  {
    label: 'Workspace',
    items: [
      { icon: icons.chat, label: 'Chat', page: 'chat', badge: '1' },
      { icon: icons.dashboard, label: 'Dashboard', page: 'dashboard' },
      { icon: icons.analytics, label: 'Analytics', page: 'analytics' },
      { icon: icons.organization, label: 'Organization', page: 'organization' },
      { icon: icons.financials, label: 'Financials', page: 'financials' },
      { icon: icons.explore, label: 'Explore', page: 'explore' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { icon: icons.automation, label: 'Automation', page: 'automation' },
      { icon: icons.integrations, label: 'Integrations', page: 'integrations' },
      { icon: icons.documents, label: 'Documents', page: 'documents' },
      { icon: icons.calendar, label: 'Calendar', page: 'calendar' },
    ],
  }
];

export default function Sidebar({ page, onNavigate, isOpen, onClose, sessions, activeSessionId, onNewChat, onSelectSession, organizationName, organizationLogo }: Props) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = windowWidth <= 768;

  return (
    <>
      {isOpen && isMobile && (
        <div 
          className="mobile-overlay hide-on-desktop" 
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}
        />
      )}

      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: isMobile ? (isOpen ? 0 : '-100%') : 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        style={{
          width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--card-border)',
          background: 'var(--card-bg)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          overflowY: 'auto',
          position: 'relative', zIndex: 110,
          ...(isMobile ? {
            position: 'fixed', top: 0, bottom: 0, left: 0
          } : {})
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 20px 16px' }}>
          <div onClick={() => onNavigate('chat')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)">
                  <polygon points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" fill="var(--accent-primary)" stroke="none" />
                  <g strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5.5" x2="12" y2="8" />
                    <line x1="12" y1="16" x2="12" y2="18.5" />
                    <line x1="17.6" y1="8.7" x2="15.46" y2="10" />
                    <line x1="8.54" y1="14" x2="6.4" y2="15.3" />
                    <line x1="17.6" y1="15.3" x2="15.46" y2="14" />
                    <line x1="8.54" y1="10" x2="6.4" y2="8.7" />
                  </g>
                </svg>
            </div>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 24, color: 'var(--text-primary)', marginLeft: 0, paddingBottom: 4 }}>
              Oryn
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{
              background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: 6, borderRadius: 8
            }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg-hover)'; }}
               onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </button>
            <button 
              className="hide-on-desktop"
              onClick={onClose}
              style={{
                background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: 6, borderRadius: 8
              }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.1)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.2)'; }}
                 onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg-subtle)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--card-border)'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', 
            background: 'var(--card-bg)', border: '1px solid var(--card-border)', 
            borderRadius: 12, padding: '10px 14px', gap: 10, transition: 'all 0.2s',
            boxShadow: 'var(--shadow-subtle)'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(249,115,22,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" placeholder="Search commands..." 
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13.5, width: '100%', fontFamily: 'var(--font-body)' }} 
            />
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <kbd style={{ background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 6, padding: '2px 6px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: 0.5, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>⌘K</kbd>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px 12px' }}>
          {organizationName ? (
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)',
              padding: '10px 14px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {organizationLogo ? (
                  <img src={organizationLogo} alt={organizationName} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-subtle)' }} />
                ) : (
                  <div style={{ width: 20, height: 20, background: 'var(--accent-primary)', borderRadius: 4, boxShadow: '0 0 10px rgba(249,115,22,0.3)' }} />
                )}
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{organizationName}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          ) : (
            <div 
              onClick={() => onNavigate('add-organization')}
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                background: 'linear-gradient(145deg, rgba(249,115,22,0.05), transparent)', 
                border: '1px dashed var(--accent-primary)',
                padding: '10px 14px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.3s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(145deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(145deg, rgba(249,115,22,0.05), transparent)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ 
                  width: 20, height: 20, background: 'var(--accent-primary)', borderRadius: 4, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: '#fff', boxShadow: '0 0 10px rgba(249,115,22,0.3)' 
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Add Organization.</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 24px' }}>
          {sections.map(sec => (
            <div key={sec.label} style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', padding: '0 12px 8px' }}>
                {sec.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sec.items.map(item => {
                  const isActive = item.page === page;
                  const isHovered = hoveredItem === item.label;
                  return (
                    <div
                      key={item.label}
                      onClick={() => item.page && onNavigate(item.page)}
                      onMouseEnter={() => setHoveredItem(item.label)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', cursor: item.page ? 'pointer' : 'default',
                        borderRadius: 8, position: 'relative',
                        background: isActive ? 'rgba(249,115,22,0.1)' : isHovered ? 'var(--glass-bg-subtle)' : 'transparent',
                        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isActive && (
                        <motion.div layoutId="sidebar-active" style={{
                          position: 'absolute', left: 0, top: '15%', height: '70%', width: 3,
                          background: 'var(--accent-primary)', borderRadius: '0 4px 4px 0'
                        }} />
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, color: isActive ? 'var(--accent-primary)' : 'inherit' }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{item.label}</span>
                      
                      {item.badge && (
                        <span style={{ marginLeft: 'auto', background: 'var(--accent-primary)', color: 'white', fontSize: 10, padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Intelligence History */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 8px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Intelligence History
              </div>
              {onNewChat && (
                <button onClick={onNewChat} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sessions?.map(s => {
                const isActive = s.id === activeSessionId && page === 'chat';
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectSession?.(s.id);
                      if (page !== 'chat') onNavigate('chat');
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                      background: isActive ? 'var(--glass-border-subtle)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--glass-bg-subtle)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16 }}>
                      {icons.session}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                      <div style={{ fontSize: 13, fontWeight: isActive ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {s.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Settings */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--card-border)' }}>
          <div
            onClick={() => onNavigate('settings')}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', cursor: 'pointer', borderRadius: 8,
              color: page === 'settings' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: page === 'settings' ? 'rgba(249,115,22,0.1)' : 'transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { if (page !== 'settings') e.currentTarget.style.background = 'var(--glass-bg-subtle)'; }}
            onMouseLeave={e => { if (page !== 'settings') e.currentTarget.style.background = 'transparent'; }}
          >
            {icons.settings}
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>Settings</span>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
