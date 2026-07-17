import React, { useState } from 'react';

const mockEvents = [
  { id: '1', title: 'Q3 Roadmap Planning', time: '10:00 AM - 11:30 AM', type: 'internal', attendees: ['Alex Chen', 'Jordan Lee'], aiBrief: 'Focus on enterprise features. Alex wants to discuss SSO integration.' },
  { id: '2', title: 'Client Pitch: Acme Corp', time: '1:00 PM - 2:00 PM', type: 'external', attendees: ['Sarah Jenkins (Acme)'], aiBrief: 'Acme recently raised $5M. Focus pitch on scalability and cost reduction.' },
  { id: '3', title: 'Engineering Sync', time: '3:00 PM - 3:30 PM', type: 'internal', attendees: ['Engineering Team'], aiBrief: 'Review sprint velocity. Backend migration is 2 days behind schedule.' },
  { id: '4', title: 'Investor Update Call', time: '4:30 PM - 5:15 PM', type: 'external', attendees: ['Sequoia Capital'], aiBrief: 'Prepare Q2 revenue numbers ($284K MTD, +18.4%).' },
];

export default function CalendarPage() {
  const [events] = useState(mockEvents);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'transparent' }}>
      {/* Header */}
      <div style={{ padding: '40px 48px 24px', borderBottom: '1px solid var(--card-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Smart
            </h1>
            <span style={{ fontFamily: 'var(--font-script)', fontSize: 36, color: 'var(--accent-primary)', lineHeight: 0.8, transform: 'translateY(-4px)' }}>
              Calendar
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ padding: '8px 16px', background: 'var(--glass-bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--card-border)', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Today, Jul 17
            </button>
            <button style={{ padding: '10px 20px', background: 'var(--text-primary)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Event
            </button>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
          Your schedule enhanced with Oryn AI meeting prep and insights.
        </p>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 32 }}>
          
          {/* Main Schedule */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {events.map((event, i) => (
              <React.Fragment key={event.id}>
                <EventCard {...event} />
                {i < events.length - 1 && (
                  <div style={{ width: 2, height: 24, background: 'var(--card-border)', marginLeft: 32 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Right Sidebar */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ padding: '24px', background: 'rgba(249, 115, 22, 0.05)', border: '1px solid var(--accent-primary)', borderRadius: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-primary)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7"></polygon></svg>
                Oryn Daily Brief
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
                You have 4 meetings today. The 1:00 PM pitch with Acme Corp is critical — I've prepared a customized slide deck in your Documents. Make sure to review Q2 numbers before the 4:30 PM Investor call.
              </p>
              <button style={{ marginTop: 16, width: '100%', padding: '8px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Generate Full Prep Doc
              </button>
            </div>

            <div style={{ padding: '24px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Upcoming Tasks</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <input type="checkbox" style={{ marginTop: 4, accentColor: 'var(--accent-primary)' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Review Q2 Deck</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Due 12:00 PM</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <input type="checkbox" style={{ marginTop: 4, accentColor: 'var(--accent-primary)' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Approve API Keys</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Due 2:00 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function EventCard({ title, time, type, attendees, aiBrief }: { title: string, time: string, type: string, attendees: string[], aiBrief: string }) {
  const isExternal = type === 'external';
  
  return (
    <div style={{ 
      display: 'flex', padding: '20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', 
      borderRadius: 16, transition: 'all 0.3s', boxShadow: 'var(--shadow-subtle)', gap: 20
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 64, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>{time.split(' - ')[0]}</div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center' }}>{time.split(' - ')[1]}</div>
      </div>
      
      <div style={{ width: 1, background: 'var(--card-border)' }} />
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
          <span style={{ padding: '2px 8px', background: isExternal ? 'rgba(59, 130, 246, 0.1)' : 'var(--glass-bg-strong)', color: isExternal ? '#3b82f6' : 'var(--text-secondary)', fontSize: 10, fontWeight: 700, borderRadius: 12, textTransform: 'uppercase' }}>
            {type}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          {attendees.join(', ')}
        </div>
        
        <div style={{ padding: '10px 14px', background: 'var(--glass-bg-subtle)', borderRadius: 8, border: '1px solid var(--card-border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7"></polygon></svg>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600 }}>AI Prep: </span>{aiBrief}
          </div>
        </div>
      </div>
    </div>
  );
}
