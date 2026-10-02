import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, CreditCard, Cloud, FileText, X } from 'lucide-react';
import { updateCompany } from '../api/oryn';

export default function AddOrganizationPage({ onComplete }: { onComplete?: (data: any) => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orgData, setOrgData] = useState({ name: '', industry: '', website: '', logo: '', integrations: [] as string[] });
  const [teamInvites, setTeamInvites] = useState<string[]>(['', '']);

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

  const handleFinish = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await updateCompany({
        name: orgData.name || 'New Organization',
        industry: orgData.industry || 'Technology & AI',
        location: orgData.website ? `HQ: ${orgData.website}` : 'Global Remote',
      });
      if (onComplete) onComplete({ ...orgData, name: orgData.name || 'New Organization', teamInvites: teamInvites.filter(Boolean) });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to persist organization configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      flex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '24px', position: 'relative'
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44, borderRadius: 10,
            background: '#141519', border: '1px solid #222328', marginBottom: 16
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            Set up your workspace
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Configure your organization profile to start automating workflows.
          </p>
        </div>

        {/* Setup Card */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: 16, padding: '32px 28px', boxShadow: 'var(--shadow-subtle)'
        }}>
          
          {/* Step Progress Pills */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i <= step ? 'var(--accent-primary)' : 'var(--glass-bg-strong)',
                  transition: 'background 0.3s ease'
                }} 
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Profile */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
                  1. Organization Profile
                </div>
                
                {/* Logo Uploader */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ 
                    width: 56, height: 56, borderRadius: 12, background: 'var(--glass-bg-subtle)', 
                    border: '1px dashed var(--card-border)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', overflow: 'hidden', position: 'relative', flexShrink: 0 
                  }}>
                    {orgData.logo ? (
                      <img src={orgData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    )}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Company Logo</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PNG or JPG (click box to upload)</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Input label="Organization Name" placeholder="Acme Corp" value={orgData.name} onChange={(v: string) => setOrgData({ ...orgData, name: v })} />
                  <Input label="Industry Sector" placeholder="Enterprise Software, Fintech, Healthcare" value={orgData.industry} onChange={(v: string) => setOrgData({ ...orgData, industry: v })} />
                  <Input label="Website Domain / URL" placeholder="https://acmecorp.com" value={orgData.website} onChange={(v: string) => setOrgData({ ...orgData, website: v })} />
                </div>
              </motion.div>
            )}

            {/* Step 2: Data Sources */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  2. Connect Data Sources
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                  Select services to monitor. You can configure credentials later in Settings.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {['Google Analytics', 'Stripe', 'Salesforce', 'Notion'].map(name => (
                    <IntegrationCard 
                      key={name}
                      icon={
                        name === 'Google Analytics' ? <BarChart3 size={18} color="var(--accent-primary)" /> :
                        name === 'Stripe' ? <CreditCard size={18} color="var(--accent-primary)" /> :
                        name === 'Salesforce' ? <Cloud size={18} color="var(--accent-primary)" /> :
                        <FileText size={18} color="var(--accent-primary)" />
                      }
                      name={name}
                      selected={orgData.integrations.includes(name)}
                      onToggle={() => setOrgData(prev => ({
                        ...prev, 
                        integrations: prev.integrations.includes(name) ? prev.integrations.filter(i => i !== name) : [...prev.integrations, name]
                      }))}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Invite Team */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  3. Invite Your Team
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                  Add team members who will have access to this operational workspace.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {teamInvites.map((email, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        placeholder={`colleague_${idx + 1}@company.com`}
                        value={email}
                        onChange={e => {
                          const updated = [...teamInvites];
                          updated[idx] = e.target.value;
                          setTeamInvites(updated);
                        }}
                        style={{
                          width: '100%', padding: '10px 14px', background: 'var(--glass-bg-subtle)',
                          border: '1px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)',
                          outline: 'none', fontSize: 13
                        }}
                      />
                      {teamInvites.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setTeamInvites(teamInvites.filter((_, i) => i !== idx))}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => setTeamInvites([...teamInvites, ''])}
                    style={{
                      background: 'transparent', border: '1px dashed var(--card-border)',
                      color: 'var(--text-secondary)', padding: '10px', borderRadius: 8,
                      cursor: 'pointer', fontSize: 12, fontWeight: 500, marginTop: 4
                    }} 
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'} 
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}
                  >
                    + Add another invitee
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {errorMsg && (
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--danger)', fontSize: 12, marginTop: 16
            }}>
              {errorMsg}
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--card-border)' }}>
            <button 
              onClick={prevStep}
              style={{
                padding: '8px 16px', background: 'transparent', border: '1px solid var(--card-border)',
                color: 'var(--text-secondary)', borderRadius: 8, fontSize: 13, fontWeight: 500,
                cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0 : 1, transition: 'all 0.15s'
              }}
            >
              Back
            </button>
            <button 
              onClick={step === 3 ? handleFinish : nextStep}
              disabled={loading || (step === 1 && !orgData.name)}
              style={{
                padding: '9px 24px', background: 'var(--accent-primary)', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: (loading || (step === 1 && !orgData.name)) ? 'not-allowed' : 'pointer',
                opacity: (loading || (step === 1 && !orgData.name)) ? 0.6 : 1,
                transition: 'opacity 0.15s'
              }}
            >
              {loading ? 'Saving...' : step === 3 ? 'Complete Setup' : 'Continue'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function Input({ label, placeholder, value, onChange }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <input 
        value={value} 
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px', background: 'var(--glass-bg-subtle)',
          border: '1px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)',
          fontSize: 13, outline: 'none', transition: 'border-color 0.15s'
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
        onBlur={e => e.target.style.borderColor = 'var(--card-border)'}
      />
    </div>
  );
}

function IntegrationCard({ icon, name, selected, onToggle }: any) {
  return (
    <div 
      onClick={onToggle}
      style={{ 
        padding: '12px 14px', borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s',
        background: 'var(--glass-bg-subtle)',
        border: `1px solid ${selected ? 'var(--accent-primary)' : 'var(--card-border)'}`,
        display: 'flex', alignItems: 'center', gap: 10
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: selected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{name}</div>
      <div style={{
        width: 16, height: 16, borderRadius: 4,
        border: `1px solid ${selected ? 'var(--accent-primary)' : 'var(--card-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? 'var(--accent-primary)' : 'transparent'
      }}>
        {selected && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
    </div>
  );
}
