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

export function SlackLogo({ size = 20, style }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M5.04 14.02a2.02 2.02 0 1 0-2.02 2.02h2.02v-2.02z" fill="#36C5F0" />
      <path d="M6.05 14.02a2.02 2.02 0 0 0 4.04 0V8.97a2.02 2.02 0 1 0-4.04 0v5.05z" fill="#36C5F0" />
      <path d="M9.98 5.04a2.02 2.02 0 1 0-2.02-2.02v2.02h2.02z" fill="#2EB67D" />
      <path d="M9.98 6.05a2.02 2.02 0 0 0 0 4.04h5.05a2.02 2.02 0 1 0 0-4.04H9.98z" fill="#2EB67D" />
      <path d="M18.96 9.98a2.02 2.02 0 1 0 2.02-2.02h-2.02v2.02z" fill="#E01E5A" />
      <path d="M17.95 9.98a2.02 2.02 0 0 0-4.04 0v5.05a2.02 2.02 0 1 0 4.04 0V9.98z" fill="#E01E5A" />
      <path d="M14.02 18.96a2.02 2.02 0 1 0 2.02 2.02v-2.02h-2.02z" fill="#ECB22E" />
      <path d="M14.02 17.95a2.02 2.02 0 0 0 0-4.04H8.97a2.02 2.02 0 1 0 0 4.04h5.05z" fill="#ECB22E" />
    </svg>
  );
}

export function NvidiaLogo({ size = 20, style }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect width="24" height="24" rx="5" fill="#76B900" opacity="0.1" />
      <path d="M7.74 9.17c1.39-1.28 3.09-1.8 4.79-1.55 1.5.22 2.89 1.05 3.86 2.27l1.79-1.42C16.8 6.78 14.94 5.7 12.87 5.4c-2.45-.36-4.9.4-6.84 2.19-2.02 1.86-3.03 4.46-2.83 7.15.02.26.23.46.49.46h2.29c.27 0 .49-.22.48-.49-.13-2.08.68-4.14 2.28-5.54z" fill="#76B900"/>
      <path d="M12.44 9.15c-1.24-.18-2.48.24-3.46 1.15-1.07.99-1.61 2.45-1.48 3.91.02.26.24.46.5.46h5.88c.28 0 .5-.23.5-.51 0-1.74-.75-3.32-2.1-4.32-.4-.32-.86-.56-1.34-.69zm.87 3.52h-3.3c.09-.76.43-1.44 1-1.92.51-.43 1.16-.62 1.8-.52.27.04.53.15.76.31.54.4.84 1.2.74 2.13z" fill="#76B900"/>
    </svg>
  );
}

export function StripeLogo({ size = 20, style }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect width="24" height="24" rx="5" fill="#635BFF" />
      <path d="M10.8 10.3c0-.64.53-.94 1.39-.94 1.25 0 2.82.42 4.07 1.14V6.76c-1.34-.53-2.68-.76-4.07-.76-3.33 0-5.55 1.73-5.55 4.63 0 4.52 6.22 3.8 6.22 5.75 0 .76-.66 1-1.58 1-1.37 0-3.14-.58-4.54-1.39v3.83c1.55.67 3.1 1 4.54 1 3.42 0 5.76-1.7 5.76-4.66 0-4.88-6.24-4.03-6.24-5.86z" fill="#fff"/>
    </svg>
  );
}

export function ZendeskLogo({ size = 20, style }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect width="24" height="24" rx="5" fill="#03363D" />
      <path d="M5 11.5A5.5 5.5 0 0 1 10.5 6V11.5H5z" fill="#00A656" />
      <path d="M19 6v5.5H13.5L19 6z" fill="#E8EBED" />
      <path d="M5 18v-5.5h5.5L5 18z" fill="#E8EBED" />
      <path d="M19 12.5A5.5 5.5 0 0 1 13.5 18V12.5H19z" fill="#00A656" />
    </svg>
  );
}

export function SalesforceLogo({ size = 20, style }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect width="24" height="24" rx="5" fill="#00A1E0" opacity="0.1" />
      <path d="M10 5.5a4.5 4.5 0 0 1 4.2 2.92A4.2 4.2 0 0 1 18.5 12a4.2 4.2 0 0 1-.36 1.7A3.8 3.8 0 0 1 20 17a3.8 3.8 0 0 1-3.8 3.8H7.5A4.5 4.5 0 0 1 3 16.3a4.5 4.5 0 0 1 1.25-3.12A4.8 4.8 0 0 1 4 11.5a4.5 4.5 0 0 1 4.5-4.5c.53 0 1.04.09 1.5.26z" fill="#00A1E0" />
    </svg>
  );
}

export function NotionLogo({ size = 20, style }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect width="24" height="24" rx="5" fill="#ffffff" opacity="0.1" />
      <path d="M4.22 4.45L16.2 3.53a1.5 1.5 0 0 1 1.6 1.48v13.54a1.5 1.5 0 0 1-1.38 1.49L7.4 20.97a1.5 1.5 0 0 1-1.6-1.48V5.94c0-.77.58-1.42 1.35-1.49l-2.93.01zm4.84 2.87v10.05l7.08-.55V6.78l-7.08.54zm1.8 1.9l3.47 5.76V9.06l1.32-.1v7.05l-1.52.12-3.48-5.76v5.88l-1.31.1V9.32l1.52-.1z" fill="#ffffff" />
    </svg>
  );
}
