import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import { fetchCalendarEvents, addCalendarEvent, deleteCalendarEvent, fetchFinancials, fetchWorkflows } from '../api/oryn';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'internal' | 'external' | 'automation';
  attendees: string[];
  aiBrief: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [finSummary, setFinSummary] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '11:00 AM - 11:30 AM',
    type: 'internal' as 'internal' | 'external' | 'automation',
    attendees: '',
    aiBrief: ''
  });

  const loadData = async () => {
    try {
      const [eventsData, finResult, wfResult] = await Promise.allSettled([
        fetchCalendarEvents(),
        fetchFinancials(),
        fetchWorkflows(),
      ]);

      if (eventsData.status === 'fulfilled' && Array.isArray(eventsData.value)) {
        setEvents(eventsData.value);
      }

      let finText = '';
      if (finResult.status === 'fulfilled' && finResult.value?.metrics) {
        const fin = finResult.value.metrics;
        finText = `Volume: ${fin.totalRevenue >= 1000 ? `$${(fin.totalRevenue / 1000).toFixed(1)}K` : `$${fin.totalRevenue.toLocaleString()}`} (Margin: ${fin.margin}%)`;
      }

      let wfText = '';
      if (wfResult.status === 'fulfilled' && wfResult.value?.stats) {
        wfText = ` · ${wfResult.value.stats.activeWorkflows} active daemons synchronized`;
      }

      setFinSummary(`${finText}${wfText}`);
    } catch (err) {
      console.error('Failed to load operational schedule', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.time.trim()) return;

    setIsSubmitting(true);
    try {
      const attendeesList = newEvent.attendees
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);

      const created = await addCalendarEvent({
        title: newEvent.title,
        time: newEvent.time,
        type: newEvent.type,
        attendees: attendeesList.length ? attendeesList : ['Operations Team'],
        aiBrief: newEvent.aiBrief || 'Meeting notes and agenda items.'
      });

      setEvents(prev => [created, ...prev]);
      setNewEvent({
        title: '',
        time: '11:00 AM - 11:30 AM',
        type: 'internal',
        attendees: '',
        aiBrief: ''
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to schedule event', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteCalendarEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to remove event', err);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'transparent' }}>
      {/* Header */}
      <div style={{ padding: '32px 40px 20px', borderBottom: '1px solid var(--card-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Team & Operations Calendar
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '8px 16px', background: 'var(--accent-primary)', color: '#fff',
                border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <Plus size={15} /> Schedule Event
            </button>
            <button style={{ padding: '8px 16px', background: 'var(--glass-bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--card-border)', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarIcon size={14} color="var(--accent-primary)" />
              Today, {todayStr}
            </button>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
          Manage upcoming meetings, deadlines, and team schedule.
        </p>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 32 }}>
          
          {/* Main Schedule */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loading ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
                Loading schedule...
              </div>
            ) : events.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--card-border)' }}>
                No events scheduled. Click "+ Schedule Event" to add a meeting or deadline.
              </div>
            ) : (
              events.map((event, i) => (
                <React.Fragment key={event.id}>
                  <EventCard event={event} onDelete={() => handleDeleteEvent(event.id)} />
                  {i < events.length - 1 && (
                    <div style={{ width: 2, height: 24, background: 'var(--card-border)', marginLeft: 32 }} />
                  )}
                </React.Fragment>
              ))
            )}
          </div>

          {/* Right Sidebar */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ padding: '24px', background: 'rgba(249, 115, 22, 0.05)', border: '1px solid var(--accent-primary)', borderRadius: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-primary)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7"></polygon></svg>
                Schedule Summary
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
                Team events and operational milestones {finSummary ? `(Volume: ${finSummary})` : ''} are synchronized to your calendar.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Schedule Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            borderRadius: 20, padding: 32, width: '100%', maxWidth: 480,
            boxShadow: 'var(--shadow-subtle)', display: 'flex', flexDirection: 'column', gap: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Schedule Operational Event</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Event Title</label>
                <input
                  required
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. Inference Architecture Sync"
                  style={{ width: '100%', padding: '10px 14px', marginTop: 6, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Time Slot</label>
                  <input
                    required
                    value={newEvent.time}
                    onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                    placeholder="10:00 AM - 10:45 AM"
                    style={{ width: '100%', padding: '10px 14px', marginTop: 6, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Type</label>
                  <select
                    value={newEvent.type}
                    onChange={e => setNewEvent({ ...newEvent, type: e.target.value as any })}
                    style={{ width: '100%', padding: '10px 14px', marginTop: 6, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)' }}
                  >
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                    <option value="automation">Automation</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Attendees (comma separated)</label>
                <input
                  value={newEvent.attendees}
                  onChange={e => setNewEvent({ ...newEvent, attendees: e.target.value })}
                  placeholder="Chukwudi Okafor, Babatunde Adeyemi"
                  style={{ width: '100%', padding: '10px 14px', marginTop: 6, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>AI Brief / Agenda</label>
                <textarea
                  rows={3}
                  value={newEvent.aiBrief}
                  onChange={e => setNewEvent({ ...newEvent, aiBrief: e.target.value })}
                  placeholder="AI operational preparation brief for participants..."
                  style={{ width: '100%', padding: '10px 14px', marginTop: 6, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--card-border)', borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '8px 20px', background: 'var(--accent-primary)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, onDelete }: { event: CalendarEvent; onDelete: () => void }) {
  const { title, time, type, attendees, aiBrief } = event;
  const isExternal = type === 'external';
  const isAuto = type === 'automation';
  
  return (
    <div style={{ 
      display: 'flex', padding: '20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', 
      borderRadius: 16, transition: 'all 0.3s', boxShadow: 'var(--shadow-subtle)', gap: 20, position: 'relative'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 74, flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>{time.split(' - ')[0]}</div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center' }}>{time.split(' - ')[1] || ''}</div>
      </div>
      
      <div style={{ width: 1, background: 'var(--card-border)' }} />
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
            <span style={{
              padding: '2px 8px',
              background: isAuto ? 'rgba(249, 115, 22, 0.1)' : isExternal ? 'rgba(59, 130, 246, 0.1)' : 'var(--glass-bg-strong)',
              color: isAuto ? 'var(--accent-primary)' : isExternal ? '#3b82f6' : 'var(--text-secondary)',
              fontSize: 10, fontWeight: 700, borderRadius: 12, textTransform: 'uppercase'
            }}>
              {type}
            </span>
          </div>

          <button
            onClick={onDelete}
            title="Delete event"
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: '4px 6px', borderRadius: 4, display: 'flex', alignItems: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={14} />
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          {Array.isArray(attendees) ? attendees.join(', ') : attendees}
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
