import { useState } from 'react';
import type { Page } from '../types';
import { motion } from 'framer-motion';


interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
  onToggleSidebar?: () => void;
}

export default function Header({ page, onNavigate, onToggleSidebar }: Props) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="glass-panel"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 72, padding: '0 24px', 
        borderBottom: '1px solid var(--card-border)', 
        position: 'relative', zIndex: 50,
        borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        background: 'var(--card-bg)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      {/* Left: Logo Icon & Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div onClick={() => onNavigate('chat')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 4 }}>
          {/* Hexagon Logo Icon */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)">
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
          <div style={{ fontFamily: 'var(--font-script)', fontSize: 32, color: 'var(--text-primary)', marginLeft: 0, paddingBottom: 6 }}>
            Oryn
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hide-on-mobile" style={{ flex: 1, maxWidth: 480, margin: '0 24px', position: 'relative' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', 
          background: isFocused ? 'var(--glass-border-subtle)' : 'var(--glass-bg-subtle)', 
          border: `1px solid ${isFocused ? 'var(--accent-primary)' : 'var(--card-border)'}`, 
          borderRadius: 8, padding: '8px 16px', gap: 12, transition: 'all 0.2s',
          boxShadow: isFocused ? '0 0 0 3px rgba(249,115,22,0.15)' : 'none'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isFocused ? 'var(--accent-primary)' : 'var(--text-secondary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search commands, reports, or contacts..." 
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ 
              background: 'transparent', border: 'none', outline: 'none', 
              color: 'var(--text-primary)', fontSize: 14, width: '100%',
              fontFamily: 'var(--font-body)'
            }} 
          />
          <div style={{ display: 'flex', gap: 4 }}>
            <kbd style={{ background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-bg-strong)', borderRadius: 4, padding: '2px 6px', fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>⌘</kbd>
            <kbd style={{ background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-bg-strong)', borderRadius: 4, padding: '2px 6px', fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>K</kbd>
          </div>
        </div>
      </div>

      {/* Right: Status, User & Mobile Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{
          background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-secondary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: 8,
          borderRadius: 8
        }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg-hover)'; }}
           onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>
        <button 
          onClick={() => onNavigate('settings')}
          style={{
            border: `1px solid ${page === 'settings' ? 'var(--accent-primary)' : 'var(--card-border)'}`, 
            color: page === 'settings' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: 8,
            borderRadius: 8,
            background: page === 'settings' ? 'rgba(249,115,22,0.1)' : 'transparent'
          }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(249,115,22,0.05)'; }}
             onMouseLeave={e => { 
               if (page !== 'settings') {
                 (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; 
               }
             }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
        <button 
          onClick={onToggleSidebar}
          className="hide-on-desktop"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 8, background: 'rgba(249, 115, 22,0.05)',
            border: '1px solid rgba(249, 115, 22,0.2)', color: 'var(--accent-primary)',
            marginLeft: 8
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </motion.header>
  );
}
