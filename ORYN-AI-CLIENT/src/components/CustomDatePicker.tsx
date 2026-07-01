import React, { useState, useRef, useEffect } from 'react';

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CustomDatePicker({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value || new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const selectedDate = value ? new Date(value) : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectDate = (d: number) => {
    const newDate = new Date(year, month, d);
    // Format to YYYY-MM-DD local
    const offset = newDate.getTimezoneOffset();
    const adjustedDate = new Date(newDate.getTime() - (offset * 60 * 1000));
    onChange(adjustedDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const isToday = (d: number) => {
    const today = new Date();
    return today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (d: number) => {
    return selectedDate?.getDate() === d && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.04)', 
          border: `1px solid ${isOpen ? 'var(--cyan)' : 'rgba(255,255,255,0.1)'}`, 
          borderRadius: 12, color: value ? 'white' : 'var(--muted)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'all 0.2s', boxShadow: isOpen ? '0 0 15px rgba(0,240,255,0.1)' : 'none'
        }}
      >
        <span>{value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Select Date'}</span>
        <i className="fas fa-calendar-alt" style={{ color: isOpen ? 'var(--cyan)' : 'var(--muted)', fontSize: 14 }}></i>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 12px)', left: 0, zIndex: 1000,
          width: 340, background: 'rgba(6, 17, 36, 0.95)', border: '1px solid var(--border)',
          borderRadius: 20, padding: 24, backdropFilter: 'blur(30px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(0,240,255,0.05)',
          animation: 'scale-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          transformOrigin: 'top left'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={prevMonth} style={{ color: 'var(--muted)', padding: 8, borderRadius: 8, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'white' }}>{MONTHS[month]}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{year}</div>
            </div>
            <button onClick={nextMonth} style={{ color: 'var(--muted)', padding: 8, borderRadius: 8, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {DAYS_OF_WEEK.map(d => (
              <div key={d} style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textAlign: 'center', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {/* Empty slots */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const active = isSelected(d);
              const today = isToday(d);
              return (
                <button
                  key={d}
                  onClick={() => selectDate(d)}
                  style={{
                    height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 10, fontSize: 13, fontWeight: active ? 800 : 500,
                    background: active ? 'var(--cyan)' : today ? 'rgba(0,240,255,0.1)' : 'transparent',
                    color: active ? 'black' : today ? 'var(--cyan)' : 'var(--text)',
                    border: today && !active ? '1px solid var(--cyan)' : 'none',
                    transition: 'all 0.2s', cursor: 'pointer'
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = today ? 'rgba(0,240,255,0.1)' : 'transparent'; }}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                const today = new Date();
                const offset = today.getTimezoneOffset();
                const adjustedDate = new Date(today.getTime() - (offset * 60 * 1000));
                onChange(adjustedDate.toISOString().split('T')[0]);
                setIsOpen(false);
              }}
              style={{ fontSize: 11, fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 1 }}
            >
              Go to Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
