import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { updateCompany, fetchOrganization } from '../api/oryn';
import { toast } from '../components/ui/use-toast';

interface EditOrganizationPageProps {
  currentProfile?: any;
  userOrganization?: string;
  onSave: (updatedProfile: any) => void;
  onCancel: () => void;
}

export default function EditOrganizationPage({
  currentProfile,
  userOrganization,
  onSave,
  onCancel
}: EditOrganizationPageProps) {
  const [name, setName] = useState(currentProfile?.name || userOrganization || '');
  const [industry, setIndustry] = useState(currentProfile?.industry || 'Enterprise AI & Workflow Systems');
  const [location, setLocation] = useState(currentProfile?.location || 'HQ: Global Remote');
  const [website, setWebsite] = useState(currentProfile?.website || '');
  const [tagline, setTagline] = useState(currentProfile?.tagline || 'Autonomous enterprise intelligence hub');
  const [logo, setLogo] = useState<string | null>(currentProfile?.logo || null);

  const [isLoading, setIsLoading] = useState(false);

  // Sync with server if fresh data is available
  useEffect(() => {
    fetchOrganization()
      .then(res => {
        if (res?.company) {
          if (!name && res.company.name) setName(res.company.name);
          if (res.company.industry) setIndustry(res.company.industry);
          if (res.company.location) setLocation(res.company.location);
        }
      })
      .catch(() => {
        // Fall back to local props
      });
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Profile picture must be under 5MB.'
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        toast({
          title: 'Logo Selected',
          description: 'Click "Save Changes" to apply your new profile picture.'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    toast({
      title: 'Logo Removed',
      description: 'Profile picture will revert to the default workspace badge.'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: 'Validation Error',
        description: 'Organization name cannot be empty.'
      });
      return;
    }

    setIsLoading(true);

    const updatedProfile = {
      ...(currentProfile || {}),
      name: trimmedName,
      industry: industry.trim(),
      location: location.trim(),
      website: website.trim(),
      tagline: tagline.trim(),
      logo: logo
    };

    try {
      await updateCompany({
        name: trimmedName,
        industry: industry.trim() || 'Enterprise AI & Workflow Systems',
        location: location.trim() || 'Global Remote'
      });
    } catch (err) {
      console.warn('Backend persistence fallback to local session:', err);
    }

    onSave(updatedProfile);
    setIsLoading(false);

    toast({
      title: 'Organization Updated',
      description: `Successfully updated profile for "${trimmedName}".`
    });
  };

  return (
    <div style={{
      flex: 1,
      height: '100%',
      overflowY: 'auto',
      background: 'radial-gradient(circle at 50% 10%, rgba(249, 115, 22, 0.05) 0%, transparent 60%), var(--bg)',
      padding: '36px 28px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%', maxWidth: 640 }}
      >
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span onClick={onCancel} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            Workspace
          </span>
          <span>/</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Edit Organization Profile</span>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 8px 0'
          }}>
            Organization Profile & Identity
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Customize your corporate workspace branding, logo, company details, and telemetry settings.
          </p>
        </div>

        {/* Edit Form Card */}
        <form onSubmit={handleSubmit} style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 18,
          padding: '32px 28px',
          boxShadow: 'var(--shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 26
        }}>
          {/* Section: Profile Picture / Logo */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 11.5,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: 12,
              fontFamily: 'monospace'
            }}>
              Workspace Profile Picture & Brand Logo
            </label>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '18px 20px',
              background: 'var(--glass-bg-subtle)',
              border: '1px solid var(--card-border)',
              borderRadius: 14
            }}>
              {/* Picture Preview */}
              <div style={{
                position: 'relative',
                width: 72,
                height: 72,
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'rgba(249, 115, 22, 0.1)',
                border: '2px solid rgba(249, 115, 22, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}>
                {logo ? (
                  <img
                    src={logo}
                    alt="Organization Profile Picture"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, var(--accent-primary), #ea580c)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 22
                  }}>
                    {name ? name.slice(0, 2).toUpperCase() : 'OR'}
                  </div>
                )}
              </div>

              {/* Upload & Remove Controls */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(249, 115, 22, 0.3)',
                    transition: 'all 0.2s'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload Picture
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {logo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#f87171',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Recommended: Square JPG, PNG, or WebP. Max size: 5MB.
                </div>
              </div>
            </div>
          </div>

          {/* Section: Organization Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                marginBottom: 6,
                fontFamily: 'monospace'
              }}>
                Organization Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Acme Innovations"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: 'var(--glass-bg-subtle)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontSize: 13.5,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--card-border)'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 6,
                  fontFamily: 'monospace'
                }}>
                  Industry Sector
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  placeholder="e.g. Enterprise AI & Workflow"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'var(--glass-bg-subtle)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 10,
                    color: 'var(--text-primary)',
                    fontSize: 13.5,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--card-border)'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 6,
                  fontFamily: 'monospace'
                }}>
                  Headquarters / Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'var(--glass-bg-subtle)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 10,
                    color: 'var(--text-primary)',
                    fontSize: 13.5,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--card-border)'}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 6,
                  fontFamily: 'monospace'
                }}>
                  Corporate Website URL
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://acme.org"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'var(--glass-bg-subtle)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 10,
                    color: 'var(--text-primary)',
                    fontSize: 13.5,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--card-border)'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 6,
                  fontFamily: 'monospace'
                }}>
                  Tagline / Mission
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="Enterprise Intelligence Core"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'var(--glass-bg-subtle)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 10,
                    color: 'var(--text-primary)',
                    fontSize: 13.5,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--card-border)'}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
            borderTop: '1px solid var(--card-border)',
            paddingTop: 20
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 18px',
                background: 'var(--glass-bg-subtle)',
                border: '1px solid var(--card-border)',
                borderRadius: 10,
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--card-border)';
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '10px 22px',
                background: 'linear-gradient(135deg, var(--accent-primary, #f97316), #ea580c)',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: isLoading ? 'wait' : 'pointer',
                boxShadow: '0 4px 16px rgba(249, 115, 22, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'opacity 0.2s'
              }}
            >
              {isLoading ? (
                <span>Saving Profile...</span>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
