import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddOrganizationPage({ onComplete }: { onComplete?: (name: string, logo?: string) => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orgData, setOrgData] = useState({ name: '', industry: '', website: '', logo: '' });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrgData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => setStep(s => Math.min(3, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onComplete) onComplete(orgData.name || 'New Organization', orgData.logo);
    }, 1500);
  };

  const orbVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      rotate: [0, 90, 0],
      transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' }
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Background Elements ── */}
      <motion.div variants={orbVariants} animate="animate" style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 60%)', filter: 'blur(120px)', opacity: 0.1, pointerEvents: 'none', zIndex: 0 }} />
      <motion.div variants={orbVariants} animate="animate" style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, #8b5cf6 0%, transparent 60%)', filter: 'blur(150px)', opacity: 0.08, pointerEvents: 'none', zIndex: 0, animationDelay: '-4s' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--glass-border) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5, pointerEvents: 'none', zIndex: 0 }} />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        style={{ width: '100%', maxWidth: 540, position: 'relative', zIndex: 10, padding: 20 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.05))', border: '1px solid rgba(249,115,22,0.2)', marginBottom: 24, boxShadow: '0 0 30px rgba(249,115,22,0.2)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: -0.5 }}>Setup Workspace</h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Configure ORYN for your organization.</p>
        </div>

        <div style={{ 
          background: 'var(--card-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--card-border)', borderRadius: 24, padding: 40, boxShadow: 'var(--shadow-subtle)',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Progress Bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? 'var(--accent-primary)' : 'var(--glass-bg-hover)', transition: 'background 0.4s ease' }} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>1. Organization Profile</h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                  <div style={{ 
                    width: 80, height: 80, borderRadius: '50%', background: 'var(--glass-bg-subtle)', 
                    border: '1px dashed var(--card-border)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', overflow: 'hidden', position: 'relative', flexShrink: 0 
                  }}>
                    {orgData.logo ? (
                      <img src={orgData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    )}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Company Logo</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Upload a circular logo (PNG, JPG).</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Input label="Organization Name" placeholder="e.g. Acme Corp" value={orgData.name} onChange={(v: string) => setOrgData({ ...orgData, name: v })} />
                  <Input label="Industry" placeholder="e.g. Technology, Finance, Healthcare" value={orgData.industry} onChange={(v: string) => setOrgData({ ...orgData, industry: v })} />
                  <Input label="Website URL" placeholder="https://example.com" value={orgData.website} onChange={(v: string) => setOrgData({ ...orgData, website: v })} />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>2. Connect Data Sources</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>ORYN needs data to provide insights. You can connect these later.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <IntegrationCard icon="📊" name="Google Analytics" />
                  <IntegrationCard icon="💳" name="Stripe" />
                  <IntegrationCard icon="☁️" name="Salesforce" />
                  <IntegrationCard icon="📝" name="Notion" />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>3. Invite Your Team</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Add members who will have access to this workspace.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  <Input placeholder="colleague@acmecorp.com" />
                  <Input placeholder="manager@acmecorp.com" />
                  <button style={{ background: 'transparent', border: '1px dashed var(--glass-border)', color: 'var(--text-secondary)', padding: '12px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', fontSize: 13, fontWeight: 500 }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>+ Add another</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
            <button 
              onClick={prevStep}
              style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-primary)', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0 : 1, transition: 'all 0.2s' }}
            >
              Back
            </button>
            <button 
              onClick={step === 3 ? handleFinish : nextStep}
              disabled={loading || (step === 1 && !orgData.name)}
              style={{ padding: '12px 32px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: (loading || (step === 1 && !orgData.name)) ? 'not-allowed' : 'pointer', opacity: (loading || (step === 1 && !orgData.name)) ? 0.7 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(249,115,22,0.3)' }}
            >
              {loading ? (
                <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Processing</>
              ) : step === 3 ? 'Complete Setup' : 'Continue'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Input({ label, placeholder, value, onChange }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>}
      <input 
        value={value} onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '14px 16px', background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 15, outline: 'none', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

function IntegrationCard({ icon, name }: any) {
  const [selected, setSelected] = useState(false);
  return (
    <div 
      onClick={() => setSelected(!selected)}
      style={{ 
        padding: '16px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
        background: selected ? 'rgba(249,115,22,0.05)' : 'var(--glass-bg-subtle)',
        border: `1px solid ${selected ? 'var(--accent-primary)' : 'var(--card-border)'}`,
        display: 'flex', alignItems: 'center', gap: 12
      }}
    >
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: selected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{name}</div>
      <div style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${selected ? 'var(--accent-primary)' : 'var(--text-muted)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selected ? 'var(--accent-primary)' : 'transparent' }}>
        {selected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
      </div>
    </div>
  );
}
