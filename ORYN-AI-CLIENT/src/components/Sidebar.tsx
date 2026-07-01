import React from 'react';
import type { Page } from '../types';

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
  icon: string | React.ReactNode;
  label: string;
  page?: Page;
  badge?: string;
}

const sections: { label: string; items: SideItem[] }[] = [
  {
    label: 'Workspace',
    items: [
      { icon: <i className="fas fa-comment" style={{ color: 'rgb(116, 192, 252)' }}></i>, label: 'Chat', page: 'chat', badge: '1' },
      { icon: <i className="fas fa-chart-line" style={{ color: 'rgba(139,18,59,1)' }}></i>, label: 'Dashboard', page: 'dashboard' },
      { icon: <i className="fas fa-chart-bar" style={{ color: 'rgb(255, 212, 59)' }}></i>, label: 'Analytics', page: 'analytics' },
      { icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA33F7">
          <path d="M80-320v-112q0-34 17.5-62.5T144-538q62-31 126-46.5T400-600q45 0 89 7t88 22q-17 14-31 30.5T521-505q-30-8-60-11.5t-61-3.5q-56 0-111 13.5T180-466q-9 5-14.5 14t-5.5 20v32h323q-2 20-2 40t2 40H80Zm320-80ZM287-687q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm169.5-56.5Q480-767 480-800t-23.5-56.5Q433-880 400-880t-56.5 23.5Q320-833 320-800t23.5 56.5Q367-720 400-720t56.5-23.5ZM400-800Zm353 113q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T584-952q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113Zm7 527q-83 0-141.5-58.5T560-360q0-84 58.5-142T760-560q84 0 142 58t58 142q0 83-58 141.5T760-160Zm-28-110 141-142-28-28-113 113-57-57-28 29 85 85Z"/>
        </svg>
      ), label: 'Organization', page: 'organization' },
      { icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#75FB4C">
          <path d="M320-414v-306h120v306l-60-56-60 56Zm200 60v-526h120v406L520-354ZM120-216v-344h120v224L120-216Zm0 98 258-258 142 122 224-224h-64v-80h200v200h-80v-64L524-146 382-268 232-118H120Z"/>
        </svg>
      ), label: 'Financials', page: 'financials' },
      { icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#F19E39">
          <path d="m300-300 280-80 80-280-280 80-80 280Zm180-120q-25 0-42.5-17.5T420-480q0-25 17.5-42.5T480-540q25 0 42.5 17.5T540-480q0 25-17.5 42.5T480-420Zm0 340q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Zm0-320Z"/>
        </svg>
      ), label: 'Explore', page: 'explore' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EFEFEF">
          <path d="M296-270q-42 35-87.5 32T129-269q-34-28-46.5-73.5T99-436l75-124q-25-22-39.5-53T120-680q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47q-9 0-18-1t-17-3l-77 130q-11 18-7 35.5t17 28.5q13 11 31 12.5t35-12.5l420-361q42-35 88-31.5t80 31.5q34 28 46 73.5T861-524l-75 124q25 22 39.5 53t14.5 67q0 66-47 113t-113 47q-66 0-113-47t-47-113q0-66 47-113t113-47q9 0 17.5 1t16.5 3l78-130q11-18 7-35.5T782-630q-13-11-31-12.5T716-630L296-270Zm40.5-353.5Q360-647 360-680t-23.5-56.5Q313-760 280-760t-56.5 23.5Q200-713 200-680t23.5 56.5Q247-600 280-600t56.5-23.5Zm400 400Q760-247 760-280t-23.5-56.5Q713-360 680-360t-56.5 23.5Q600-313 600-280t23.5 56.5Q647-200 680-200t56.5-23.5ZM280-680Zm400 400Z"/>
        </svg>
      ), label: 'Automation', page: 'automation' },
      { icon: '◬', label: 'Integrations' },
      { icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#0000F5">
          <path d="M560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm300-263-37-37 37 37ZM620-140h38l121-122-18-19-19-18-122 121v38ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v120h-80v-80H520v-200H240v640h240v80H240Zm280-400Zm241 199-19-18 37 37-18-19Z"/>
        </svg>
      ), label: 'Documents' },
      { icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#46152F">
          <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-188.5-11.5Q280-423 280-440t11.5-28.5Q303-480 320-480t28.5 11.5Q360-457 360-440t-11.5 28.5Q337-400 320-400t-28.5-11.5ZM640-400q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-188.5-11.5Q280-263 280-280t11.5-28.5Q303-320 320-320t28.5 11.5Q360-297 360-280t-11.5 28.5Q337-240 320-240t-28.5-11.5ZM640-240q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/>
        </svg>
      ), label: 'Calendar' },
    ],
  },
  {
    label: 'Recent',
    items: [
      { icon: '·', label: 'Q1 Strategy' },
      { icon: '·', label: 'Market Report' },
      { icon: '·', label: 'Team Briefing' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: <i className="fas fa-cog" style={{ color: 'var(--muted)' }}></i>, label: 'Settings', page: 'settings' },
    ],
  },
];

export default function Sidebar({ page, onNavigate, isOpen, onClose, sessions, activeSessionId, onNewChat, onSelectSession }: Props) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="mobile-overlay hide-on-desktop" 
          onClick={onClose}
          style={{ opacity: isOpen ? 1 : 0 }}
        />
      )}

      <aside style={{
        width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'rgba(4,14,31,0.9)', borderRight: '1px solid var(--border)',
        backdropFilter: 'blur(20px)', overflowY: 'auto', padding: '24px 0',
        boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 110,
        transition: 'transform 0.3s ease',
        /* Responsive override */
        ...(window.innerWidth <= 768 ? {
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        } : {})
      }}>
        {/* Mobile Close Button */}
        <div className="hide-on-desktop" style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{ 
              width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,51,102,0.1)', 
              color: 'var(--danger)', border: '1px solid rgba(255,51,102,0.2)' 
            }}
          >
            ✕
          </button>
        </div>

        {sections.map(sec => (
          <div key={sec.label}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', padding: '16px 20px 8px' }}>
              {sec.label === 'Recent' ? 'Intelligence History' : sec.label}
            </div>
            {sec.label === 'Recent' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
                {sessions?.map(s => {
                  const isActive = s.id === activeSessionId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => onSelectSession?.(s.id)}
                      style={{
                        padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                        background: isActive ? 'rgba(0,240,255,0.08)' : 'transparent',
                        border: `1px solid ${isActive ? 'rgba(0,240,255,0.2)' : 'transparent'}`,
                        transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', gap: 4
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? 'var(--cyan)' : 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 0.5 }}>
                        {s.date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              sec.items.map(item => {
                const isActive = item.page === page;
                return (
                  <div
                    key={item.label}
                    onClick={() => item.page && onNavigate(item.page)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 24px', cursor: item.page ? 'pointer' : 'default',
                      fontSize: 16, fontWeight: 500,
                      color: isActive ? 'var(--cyan)' : 'var(--muted)',
                      background: isActive ? 'linear-gradient(90deg, rgba(0,240,255,0.15), transparent)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? 'var(--cyan)' : 'transparent'}`,
                      transition: 'all 0.3s',
                      boxShadow: isActive ? '-10px 0 20px rgba(0,240,255,0.2) inset' : 'none',
                    }}
                    onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLDivElement).style.color = 'var(--white)'; (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(90deg, rgba(0,149,255,0.1), transparent)'; (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'rgba(0,149,255,0.5)'; } }}
                    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLDivElement).style.color = 'var(--muted)'; (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'transparent'; } }}
                  >
                    <span style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, width: 24, height: 24, textAlign: 'center', 
                      textShadow: isActive ? '0 0 10px rgba(0,240,255,0.8)' : 'none' 
                    }}>{item.icon}</span>
                    {item.label}
                    {item.badge && (
                      <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', fontSize: 12, padding: '3px 8px', borderRadius: 12, fontWeight: 700, boxShadow: '0 0 10px rgba(0,136,255,0.5)' }}>
                        {item.badge}
                      </span>
                    )}
                    {item.label === 'Chat' && (
                      <div 
                        style={{ 
                          marginLeft: item.badge ? 10 : 'auto', 
                          color: 'var(--muted)', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          width: 28, height: 28, 
                          borderRadius: '50%', 
                          transition: 'all 0.2s',
                          fontSize: 14
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--white)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
                        onClick={(e) => { e.stopPropagation(); }}
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ))}
      </aside>
    </>
  );
}
