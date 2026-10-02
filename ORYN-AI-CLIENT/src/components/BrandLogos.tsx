import React from 'react';

export interface LogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function GmailLogo({ size = 20, style }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" fill="#202124" />
      <path d="M2 6l10 7 10-7v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" fill="#222" opacity="0.4" />
      <path d="M20 4H4C2.9 4 2 4.9 2 6l10 7 10-7c0-1.1-.9-2-2-2z" fill="#EA4335" />
      <path d="M2 6v12c0 1.1.9 2 2 2h3V9.5L2 6z" fill="#4285F4" />
      <path d="M22 6v12c0 1.1-.9 2-2 2h-3V9.5L22 6z" fill="#34A853" />
      <path d="M17 9.5V20h3c1.1 0 2-.9 2-2V8.5l-5 1z" fill="#FBBC04" opacity="0.9" />
      <path d="M7 9.5V20H4c-1.1 0-2-.9-2-2V8.5l5 1z" fill="#C5221F" opacity="0.9" />
      <path d="M2 6.5l10 7 10-7" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
