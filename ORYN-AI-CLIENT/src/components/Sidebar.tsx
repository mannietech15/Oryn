import React, { useState } from 'react';
import type { Page } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
  isOpen?: boolean;
  onClose?: () => void;
  sessions?: { id: string, title: string, date: Date }[];
  activeSessionId?: string;
  onNewChat?: () => void;
  onSelectSession?: (id: string) => void;
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
      { icon: icons.integrations, label: 'Integrations' },
      { icon: icons.documents, label: 'Documents' },
      { icon: icons.calendar, label: 'Calendar' },
    ],
  }
];

export default function Sidebar({ page, onNavigate, isOpen, onClose, sessions, activeSessionId, onNewChat, onSelectSession }: Props) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <>
      {isOpen && (
        <div 
          className="mobile-overlay hide-on-desktop" 
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}
        />
      )}

      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
        style={{
          width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--card-border)',
          background: 'rgba(9, 9, 11, 0.6)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          overflowY: 'auto',
          position: 'relative', zIndex: 110,
          ...(window.innerWidth <= 768 ? {
            position: 'fixed', top: 0, bottom: 0, left: 0,
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          } : {})
        }}
      >
        <div style={{ padding: '24px 20px 12px' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)',
            padding: '10px 14px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, background: 'var(--accent-primary)', borderRadius: 4, boxShadow: '0 0 10px rgba(249,115,22,0.3)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Acme Corp</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
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
                        background: isActive ? 'rgba(249,115,22,0.1)' : isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
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
                      background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
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
            onMouseEnter={e => { if (page !== 'settings') e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
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
