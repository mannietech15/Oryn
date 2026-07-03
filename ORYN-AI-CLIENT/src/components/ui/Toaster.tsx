import React from 'react';
import { useToast } from './use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
      display: 'flex', flexDirection: 'column', gap: 12, pointerEvents: 'none'
    }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            style={{
              background: t.variant === 'destructive' ? 'var(--danger)' : 'var(--card-bg)',
              color: t.variant === 'destructive' ? '#fff' : 'var(--text-primary)',
              border: `1px solid ${t.variant === 'destructive' ? 'var(--danger)' : 'var(--card-border)'}`,
              padding: '16px 20px', borderRadius: 12, boxShadow: 'var(--shadow-subtle)',
              pointerEvents: 'auto', minWidth: 300, maxWidth: 400,
              fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden'
            }}
          >
            {t.title && <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.title}</div>}
            {t.description && <div style={{ fontSize: 13, opacity: 0.8 }}>{t.description}</div>}
            
            <button 
              onClick={() => dismiss(t.id)}
              style={{
                position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
                color: 'inherit', opacity: 0.5, cursor: 'pointer', padding: 0
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
