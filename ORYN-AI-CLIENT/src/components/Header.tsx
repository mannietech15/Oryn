import type { Page } from '../types';
import { motion } from 'framer-motion';

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
  onToggleSidebar?: () => void;
}

const tabs: { id: Page; label: string }[] = [];

export default function Header({ page, onNavigate, onToggleSidebar }: Props) {
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="glass-panel"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 80, padding: '0 20px', 
        borderBottom: '1px solid var(--card-border)', 
        position: 'relative', zIndex: 50,
        borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none'
      }}
    >
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onToggleSidebar}
        className="hide-on-desktop"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 40, height: 40, borderRadius: 8, background: 'rgba(0,240,255,0.05)',
          border: '1px solid rgba(0,240,255,0.2)', color: 'var(--accent-cyan)'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Logo */}
      <div onClick={() => onNavigate('chat')} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
        <svg width="42" height="42" viewBox="0 0 32 32" fill="none" style={{ animation: 'logoGlow 4s ease-in-out infinite' }}>
          <polygon points="16,1 31,9 31,23 16,31 1,23 1,9" stroke="var(--accent-cyan)" strokeWidth="1.2" fill="rgba(0,240,255,0.05)" />
          <polygon points="16,7 25,12 25,20 16,25 7,20 7,12" stroke="var(--info)" strokeWidth="0.8" fill="rgba(59,130,246,0.07)" />
          <circle cx="16" cy="16" r="3" fill="var(--accent-cyan)" />
          <line x1="16" y1="7" x2="16" y2="13" stroke="var(--accent-cyan)" strokeWidth="0.8" opacity="0.6" />
          <line x1="16" y1="19" x2="16" y2="25" stroke="var(--accent-cyan)" strokeWidth="0.8" opacity="0.6" />
          <line x1="7" y1="12" x2="13" y2="15" stroke="var(--accent-cyan)" strokeWidth="0.8" opacity="0.6" />
          <line x1="19" y1="17" x2="25" y2="20" stroke="var(--accent-cyan)" strokeWidth="0.8" opacity="0.6" />
          <line x1="25" y1="12" x2="19" y2="15" stroke="var(--accent-cyan)" strokeWidth="0.8" opacity="0.6" />
          <line x1="13" y1="17" x2="7" y2="20" stroke="var(--accent-cyan)" strokeWidth="0.8" opacity="0.6" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: 4, color: 'var(--text-primary)', textShadow: '0 0 15px rgba(255,255,255,0.4)', lineHeight: 1 }}>
            OR<span style={{ color: 'var(--accent-cyan)', textShadow: '0 0 15px var(--accent-cyan)' }}>YN</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent-cyan)', marginTop: 4, textShadow: '0 0 8px var(--accent-glow)' }}>
            Business AI · v2.0
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="hide-on-mobile" style={{ display: 'flex', gap: 8 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onNavigate(t.id)} style={{
            padding: '10px 24px', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
            color: page === t.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            border: 'none', background: 'none', cursor: 'pointer', transition: 'all 0.3s',
            position: 'relative', overflow: 'hidden', borderRadius: 6,
            boxShadow: page === t.id ? '0 0 15px var(--accent-glow)' : 'none',
          }}
          onMouseEnter={e => {
            if (page !== t.id) {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,240,255,0.08)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 10px var(--accent-glow)';
            }
          }}
          onMouseLeave={e => {
            if (page !== t.id) {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }
          }}>
            {t.label}
            {page === t.id && (
              <motion.div layoutId="nav-indicator" style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '80%', height: 3, background: 'var(--accent-cyan)', borderRadius: '2px 2px 0 0',
                boxShadow: '0 0 15px var(--accent-cyan)',
              }} />
            )}
          </button>
        ))}
      </nav>

      {/* Status & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--success-glow)', padding: '8px 16px', borderRadius: 24, border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 0 15px rgba(16,185,129,0.2) inset' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success), 0 0 5px white inset' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: 1, color: 'var(--success)', textTransform: 'uppercase', textShadow: '0 0 8px var(--success)' }}>Online</span>
        </div>
        <div className="hide-on-mobile" style={{ width: 1, height: 24, background: 'var(--card-border)' }} />
        <button style={{
          background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', padding: 8,
          borderRadius: 8
        }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-cyan)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,240,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 10px var(--accent-glow)'; }}
           onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>
        <button 
          className="hide-on-mobile"
          onClick={() => onNavigate('settings')}
          style={{
            border: 'none', color: page === 'settings' ? 'var(--accent-cyan)' : 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', padding: 8,
            borderRadius: 8,
            boxShadow: page === 'settings' ? '0 0 10px var(--accent-glow)' : 'none',
            background: page === 'settings' ? 'rgba(0,240,255,0.1)' : 'transparent'
          }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-cyan)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,240,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 10px var(--accent-glow)'; }}
             onMouseLeave={e => { 
               if (page !== 'settings') {
                 (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; 
               }
             }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: 1,
          boxShadow: '0 0 15px var(--accent-glow)', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)'
        }}>
          ME
        </div>
      </div>
    </motion.header>
  );
}
