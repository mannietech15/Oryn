import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService, UserProfile } from '../services/auth.service';

interface AuthPageProps {
  onLogin: (user: UserProfile) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('mannietech@oryn.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [organization, setOrganization] = useState('Skillbridge Global');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'signin') {
        const session = await authService.login(
          email,
          password === '••••••••••••' ? 'password123' : password
        );
        onLogin(session.user);
      } else {
        const session = await authService.register({
          name: name.trim() || 'New User',
          email,
          password: password === '••••••••••••' ? 'password123' : password,
          organization: organization.trim() || 'Oryn Enterprise'
        });
        onLogin(session.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'analyst') => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const demoEmail = role === 'admin' ? 'mannietech@oryn.ai' : 'analyst@oryn.ai';
      const session = await authService.login(demoEmail, 'password123');
      onLogin(session.user);
    } catch {
      // Local fallback
      const fallbackUser: UserProfile = role === 'admin'
        ? { id: 'usr_demo_1', name: 'Mannie Tech', email: 'mannietech@oryn.ai', role: 'Verified Administrator', organization: 'Skillbridge Global' }
        : { id: 'usr_demo_2', name: 'Amara Nwosu', email: 'analyst@oryn.ai', role: 'Quantitative Analyst', organization: 'Skillbridge Global' };
      authService.setSession('demo_token', fallbackUser);
      onLogin(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 25%, rgba(249, 115, 22, 0.09) 0%, transparent 65%), var(--bg-primary, #0a0a0c)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative ambient background glows */}
      <div style={{
        position: 'absolute',
        top: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--card-bg, #121316)',
          border: '1px solid var(--card-border, rgba(255, 255, 255, 0.08))',
          borderRadius: 20,
          padding: '34px 30px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(249, 115, 22, 0.25)',
          position: 'relative',
          zIndex: 10,
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'rgba(249, 115, 22, 0.12)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            boxShadow: '0 0 24px rgba(249, 115, 22, 0.25)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #f97326)">
              <polygon points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2.5" fill="var(--accent-primary, #f97326)" stroke="none" />
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

          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0'
          }}>
            {mode === 'signin' ? 'Sign In to Oryn' : 'Create Workspace Identity'}
          </h1>
          <p style={{
            fontSize: 12.5,
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.45
          }}>
            Autonomous Enterprise AI & Workflow Intelligence Gateway
          </p>

          {/* Mode Tabs */}
          <div style={{
            display: 'flex',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--card-border)',
            borderRadius: 10,
            padding: 3,
            marginTop: 18
          }}>
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              style={{
                flex: 1,
                padding: '7px 0',
                background: mode === 'signin' ? 'var(--card-bg)' : 'transparent',
                color: mode === 'signin' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: mode === 'signin' ? '1px solid var(--card-border)' : 'none',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(null); }}
              style={{
                flex: 1,
                padding: '7px 0',
                background: mode === 'register' ? 'var(--card-bg)' : 'transparent',
                color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: mode === 'register' ? '1px solid var(--card-border)' : 'none',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
                color: '#f87171',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted, #888)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 6,
                  fontFamily: 'monospace'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Mannie Tech"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--glass-bg-subtle, rgba(255, 255, 255, 0.03))',
                    border: '1px solid var(--card-border, rgba(255, 255, 255, 0.1))',
                    borderRadius: 8,
                    color: 'var(--text-primary, #fff)',
                    fontSize: 13.5,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent-primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--card-border)')}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted, #888)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 6,
                  fontFamily: 'monospace'
                }}>
                  Organization Name
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  placeholder="Skillbridge Global"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--glass-bg-subtle, rgba(255, 255, 255, 0.03))',
                    border: '1px solid var(--card-border, rgba(255, 255, 255, 0.1))',
                    borderRadius: 8,
                    color: 'var(--text-primary, #fff)',
                    fontSize: 13.5,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent-primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--card-border)')}
                />
              </div>
            </>
          )}

          <div>
            <label style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted, #888)',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: 6,
              fontFamily: 'monospace'
            }}>
              Corporate Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="mannietech@oryn.ai"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--glass-bg-subtle, rgba(255, 255, 255, 0.03))',
                border: '1px solid var(--card-border, rgba(255, 255, 255, 0.1))',
                borderRadius: 8,
                color: 'var(--text-primary, #fff)',
                fontSize: 13.5,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--card-border)')}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted, #888)',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                fontFamily: 'monospace'
              }}>
                Security Credentials
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: 11,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--glass-bg-subtle, rgba(255, 255, 255, 0.03))',
                border: '1px solid var(--card-border, rgba(255, 255, 255, 0.1))',
                borderRadius: 8,
                color: 'var(--text-primary, #fff)',
                fontSize: 13.5,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--card-border)')}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              Remember session
            </label>
            <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontSize: 11.5 }}>
              Enterprise SSO
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: 4,
              background: 'linear-gradient(135deg, var(--accent-primary, #f97316), #ea580c)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: isLoading ? 'wait' : 'pointer',
              boxShadow: '0 4px 16px rgba(249, 115, 22, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.2s'
            }}
          >
            {isLoading ? (
              <span>Authenticating with IAM...</span>
            ) : (
              <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Create & Launch Workspace'}</span>
            )}
          </button>
        </form>

        {/* Quick Enterprise Access */}
        <div style={{ marginTop: 20, borderTop: '1px solid var(--card-border)', paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, textAlign: 'center' }}>
            Instant Access Quick Switch
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={isLoading}
              style={{
                padding: '9px 8px',
                background: 'var(--glass-bg-subtle)',
                border: '1px solid var(--card-border)',
                borderRadius: 8,
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--card-border)';
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
              Mannie Tech (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('analyst')}
              disabled={isLoading}
              style={{
                padding: '9px 8px',
                background: 'var(--glass-bg-subtle)',
                border: '1px solid var(--card-border)',
                borderRadius: 8,
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--card-border)';
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6' }} />
              Amara (Analyst)
            </button>
          </div>

          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 14, textAlign: 'center' }}>
            NVIDIA NIM IAM Cluster · 256-bit TLS Encrypted
          </div>
        </div>
      </motion.div>
    </div>
  );
}
