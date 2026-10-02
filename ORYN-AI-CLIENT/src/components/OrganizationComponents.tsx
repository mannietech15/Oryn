import React from 'react';
import { motion } from 'framer-motion';

export interface OrgCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  colSpan?: number;
  style?: React.CSSProperties;
  delay?: number;
}

export function OrgCard({ title, subtitle, children, colSpan, style, delay = 0 }: OrgCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      style={{ 
        background: 'var(--card-bg)', 
        border: '1px solid var(--card-border)', 
        borderRadius: 20, 
        padding: '28px', 
        boxShadow: 'var(--shadow-subtle)', 
        gridColumn: colSpan ? `span ${colSpan}` : undefined,
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 12, 
          fontWeight: 700, 
          letterSpacing: 1.5, 
          color: 'var(--text-secondary)', 
          textTransform: 'uppercase', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10 
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
}
