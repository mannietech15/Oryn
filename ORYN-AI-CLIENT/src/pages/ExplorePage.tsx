import { useState, useEffect } from 'react';
import { Search, X, Check, BarChart3, Bot, Zap, Globe, Rocket, Lightbulb, Activity, Package, ShieldCheck, Building2, Users } from 'lucide-react';
import { fetchEcosystem, joinEcosystemCommunity, connectEcosystemBusiness, createEcosystemCommunity } from '../api/oryn';

interface Community {
  id: string;
  name: string;
  members: string;
  memberCount: number;
  tags: string[];
  description: string;
  icon: string;
  joined?: boolean;
}

interface Business {
  id: string;
  name: string;
  industry: string;
  location: string;
  product: string;
  matchType: 'same' | 'complementary';
  connected?: boolean;
}

interface Trend {
  id: string;
  topic: string;
  growth: string;
  category: string;
  sentiment: 'positive' | 'neutral';
}

interface CaseStudy {
  id: string;
  company: string;
  result: string;
  summary: string;
  image: string;
}

function renderCommunityIcon(iconStr: string) {
  if (iconStr === '🤖' || iconStr === 'ai' || iconStr.includes('ai') || iconStr.includes('robot')) return <Bot size={24} color="var(--accent-primary)" />;
  if (iconStr === '⚡' || iconStr === 'energy' || iconStr.includes('power') || iconStr.includes('fintech')) return <Zap size={24} color="var(--accent-primary)" />;
  if (iconStr === '🌐' || iconStr === 'global' || iconStr.includes('net') || iconStr.includes('web')) return <Globe size={24} color="var(--accent-primary)" />;
  if (iconStr === '🚀' || iconStr === 'rocket' || iconStr.includes('start') || iconStr.includes('scale')) return <Rocket size={24} color="var(--accent-primary)" />;
  if (iconStr === '💡' || iconStr === 'idea' || iconStr.includes('innov')) return <Lightbulb size={24} color="var(--accent-primary)" />;
  if (iconStr === '🧬' || iconStr.includes('bio') || iconStr.includes('health')) return <Activity size={24} color="var(--accent-primary)" />;
  return <Users size={24} color="var(--accent-primary)" />;
}

function renderCaseStudyIcon(img: string) {
  if (img === '🏥' || img.includes('health') || img.includes('med')) return <Activity size={24} color="var(--accent-primary)" />;
  if (img === '⚡' || img.includes('energy') || img.includes('power')) return <Zap size={24} color="var(--accent-primary)" />;
  if (img === '📦' || img.includes('logistics') || img.includes('supply')) return <Package size={24} color="var(--accent-primary)" />;
  if (img === '🔒' || img.includes('security') || img.includes('sec')) return <ShieldCheck size={24} color="var(--accent-primary)" />;
  return <Building2 size={24} color="var(--accent-primary)" />;
}

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'communities' | 'networking' | 'trends'>('communities');
  const [sectorFilter, setSectorFilter] = useState('All');

  const [communities, setCommunities] = useState<Community[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // New Community Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newComm, setNewComm] = useState({ name: '', description: '', tags: '', icon: 'ai' });
  const [creatingComm, setCreatingComm] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchEcosystem();
      if (data.communities) setCommunities(data.communities);
      if (data.businesses) setBusinesses(data.businesses);
      if (data.trends) setTrends(data.trends);
      if (data.caseStudies) setCaseStudies(data.caseStudies);
    } catch (err) {
      console.error('Failed to load ecosystem data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJoin = async (id: string) => {
    setJoiningId(id);
    try {
      const updated = await joinEcosystemCommunity(id);
      setCommunities(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    } catch (err) {
      console.error('Failed to toggle community membership', err);
    } finally {
      setJoiningId(null);
    }
  };

  const handleConnect = async (id: string) => {
    setConnectingId(id);
    try {
      const updated = await connectEcosystemBusiness(id);
      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
    } catch (err) {
      console.error('Failed to connect with partner', err);
    } finally {
      setConnectingId(null);
    }
  };

  const handleCreateCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComm.name.trim() || !newComm.description.trim()) return;

    setCreatingComm(true);
    try {
      const tagsArray = newComm.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const created = await createEcosystemCommunity({
        name: newComm.name,
        description: newComm.description,
        tags: tagsArray.length ? tagsArray : ['Community'],
        icon: newComm.icon || 'rocket'
      });

      setCommunities(prev => [created, ...prev]);
      setNewComm({ name: '', description: '', tags: '', icon: 'ai' });
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create community', err);
    } finally {
      setCreatingComm(false);
    }
  };

  // Filtered lists
  const query = search.toLowerCase().trim();

  const filteredCommunities = communities.filter(c => {
    const matchName = c.name.toLowerCase().includes(query);
    const matchDesc = c.description.toLowerCase().includes(query);
    const matchTags = c.tags?.some(t => t.toLowerCase().includes(query));
    return matchName || matchDesc || matchTags;
  });

  const filteredBusinesses = businesses.filter(b => {
    const matchSector = sectorFilter === 'All' || b.industry.toLowerCase().includes(sectorFilter.toLowerCase());
    const matchName = b.name.toLowerCase().includes(query);
    const matchLoc = b.location.toLowerCase().includes(query);
    const matchProd = b.product.toLowerCase().includes(query);
    return matchSector && (matchName || matchLoc || matchProd);
  });

  const filteredTrends = trends.filter(t => {
    const matchTopic = t.topic.toLowerCase().includes(query);
    const matchCat = t.category.toLowerCase().includes(query);
    return matchTopic || matchCat;
  });

  const allSectors = ['All', ...Array.from(new Set(businesses.map(b => b.industry)))];

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'transparent', perspective: '1000px' }}>
      {/* Hero / Header */}
      <div style={{
        padding: '48px 40px',
        background: 'var(--surface)',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
        position: 'relative'
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Explore the Ecosystem
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 640, margin: '0 auto 28px', lineHeight: 1.6 }}>
          Discover verified business networks, connect with enterprise peers, and observe industrial shifts in real time.
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search communities, partners, or market trends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '14px 24px', borderRadius: 12, border: '1px solid var(--border)',
              background: 'var(--card-bg)', color: 'var(--text-primary)',
              fontSize: 14, outline: 'none', transition: 'all 0.2s',
              boxShadow: 'var(--shadow-subtle)'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
          />
          <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            {search ? (
              <span onClick={() => setSearch('')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--muted)' }}><X size={16} /></span>
            ) : <Search size={16} color="var(--muted)" />}
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div style={{ padding: '36px 40px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Navigation Tabs and Create Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 16, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 32 }}>
            {(['communities', 'networking', 'trends'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none', border: 'none', padding: '8px 4px', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: 2,
                  textTransform: 'uppercase', color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-muted)',
                  position: 'relative', transition: 'all 0.3s'
                }}
              >
                {tab} ({tab === 'communities' ? communities.length : tab === 'networking' ? businesses.length : trends.length})
                {activeTab === tab && (
                  <div style={{ position: 'absolute', bottom: -17, left: 0, right: 0, height: 2, background: 'var(--accent-primary)', boxShadow: '0 0 10px rgba(249, 115, 22, 0.4)' }} />
                )}
              </button>
            ))}
          </div>

          {activeTab === 'communities' && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '8px 18px', background: 'var(--accent-primary)', color: '#fff',
                border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
              }}
            >
              + Create Community
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
            Loading ecosystem directory...
          </div>
        ) : (
          <div style={{ animation: 'rise 0.5s ease-out' }}>
            {/* --- Communities Section --- */}
            {activeTab === 'communities' && (
              <div>
                {filteredCommunities.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)' }}>
                    No communities match your search query. Try broadening your terms or click "+ Create Community".
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
                    {filteredCommunities.map(c => {
                      const isJoining = joiningId === c.id;
                      return (
                        <div key={c.id} style={{
                          padding: 32, background: 'var(--card-bg)', border: `1px solid ${c.joined ? 'rgba(34, 197, 94, 0.4)' : 'var(--border)'}`, borderRadius: 20,
                          backdropFilter: 'blur(10px)', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = c.joined ? 'var(--success)' : 'rgba(249, 115, 22,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = c.joined ? 'rgba(34, 197, 94, 0.4)' : 'var(--border)'; }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--surface-hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {renderCommunityIcon(c.icon)}
                              </div>
                              {c.joined && (
                                <span style={{
                                  padding: '3px 10px', borderRadius: 12,
                                  background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)',
                                  fontSize: 10, fontWeight: 700, border: '1px solid rgba(34, 197, 94, 0.3)',
                                  display: 'inline-flex', alignItems: 'center', gap: 4
                                }}>
                                  <Check size={11} /> MEMBER
                                </span>
                              )}
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>{c.name}</h3>
                            <div style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 700, marginBottom: 16 }}>
                              {c.members.toLowerCase().includes('member') ? c.members : `${c.members} Members`}
                            </div>
                            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{c.description}</p>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                              {c.tags.map(tag => (
                                <span key={tag} style={{ padding: '4px 10px', background: 'rgba(249, 115, 22,0.05)', border: '1px solid rgba(249, 115, 22,0.1)', borderRadius: 4, fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>#{tag}</span>
                              ))}
                            </div>
                          </div>

                          <button 
                            onClick={() => handleJoin(c.id)}
                            disabled={isJoining}
                            style={{
                              width: '100%', padding: '12px',
                              background: c.joined ? 'rgba(34, 197, 94, 0.12)' : 'rgba(249, 115, 22,0.08)',
                              border: `1px solid ${c.joined ? 'var(--success)' : 'var(--accent-primary)'}`,
                              borderRadius: 10, color: c.joined ? 'var(--success)' : 'var(--accent-primary)',
                              fontWeight: 700, cursor: isJoining ? 'wait' : 'pointer', transition: 'all 0.2s'
                            }}
                          >
                            {isJoining ? 'Updating Membership...' : c.joined ? 'Leave Community' : 'Join Community'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* --- Networking / Businesses Section --- */}
            {activeTab === 'networking' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: 0 }}>Recommended Connections</h2>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Showing {filteredBusinesses.length} operational entities ready for collaboration</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>Filter by Sector:</span>
                    <select 
                      value={sectorFilter}
                      onChange={(e) => setSectorFilter(e.target.value)}
                      style={{ background: 'rgba(10,29,58,0.7)', border: '1px solid var(--border)', color: 'var(--white)', padding: '6px 14px', borderRadius: 8, outline: 'none' }}
                    >
                      {allSectors.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredBusinesses.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)' }}>
                    No businesses match the selected sector or search criteria.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {filteredBusinesses.map(b => {
                      const isConnecting = connectingId === b.id;
                      return (
                        <div key={b.id} style={{
                          padding: 24, background: 'rgba(10,29,58,0.5)', border: '1px solid var(--border)', borderRadius: 16,
                          borderLeft: `4px solid ${b.connected ? 'var(--success)' : b.matchType === 'same' ? 'var(--cyan)' : 'var(--violet)'}`,
                          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: b.matchType === 'same' ? 'var(--cyan)' : 'var(--violet)', textTransform: 'uppercase', letterSpacing: 1 }}>
                                {b.matchType === 'same' ? 'Direct Peer' : 'Strategic Partner'}
                              </div>
                              {b.connected && (
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: 10 }}>
                                  CONNECTED
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{b.name}</div>
                            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>{b.industry} · {b.location}</div>
                            <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: 12, marginBottom: 20 }}>
                              <span style={{ color: 'var(--muted)' }}>Key Offerings:</span> {b.product}
                            </div>
                          </div>

                          <button 
                            onClick={() => handleConnect(b.id)}
                            disabled={isConnecting}
                            style={{
                              width: '100%', padding: '10px',
                              background: b.connected ? 'rgba(34, 197, 94, 0.2)' : 'white',
                              color: b.connected ? 'var(--success)' : 'black',
                              border: b.connected ? '1px solid var(--success)' : 'none',
                              borderRadius: 8, fontWeight: 700, cursor: isConnecting ? 'wait' : 'pointer', transition: 'all 0.2s'
                            }}
                          >
                            {isConnecting ? 'Updating...' : b.connected ? 'Disconnect Partner' : 'Connect'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* --- Emerging Shifts / Trends Section --- */}
            {activeTab === 'trends' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: 0 }}>Emerging Shifts & Signals</h2>
                  {filteredTrends.map(t => (
                    <div key={t.id} style={{ padding: 24, background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{t.category}</div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>{t.topic}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: t.sentiment === 'positive' ? 'var(--success)' : 'var(--white)', fontSize: 20, fontWeight: 800 }}>{t.growth}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>Annual Momentum</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(249, 115, 22,0.03)', border: '1px dashed rgba(249, 115, 22,0.2)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--surface-hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart3 size={32} color="var(--accent-primary)" />
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Detailed Trend Telemetry</div>
                  <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', maxWidth: 360, lineHeight: 1.5 }}>
                    Real-time cross-industry signals are synthesized automatically from connected enterprise pipelines and ecosystem nodes.
                  </p>
                  <div style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>
                    Telemetry Model: Active Autonomous Synthesis
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Case Studies Section - Always visible at bottom */}
        <div style={{ marginTop: 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Success Stories</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800 }}>The ORYN Impact</h2>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Verified Enterprise Case Studies</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {caseStudies.map(cs => (
              <div key={cs.id} style={{
                display: 'flex', gap: 24, padding: 32, background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)',
                transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: 'var(--shadow-subtle)'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: 64, height: 64, background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {renderCaseStudyIcon(cs.image)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{cs.company}</h3>
                  <div style={{ padding: '3px 10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 6, display: 'inline-block', fontSize: 12, color: 'var(--success)', fontWeight: 600, marginBottom: 12 }}>
                    {cs.result}
                  </div>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.6, fontSize: 14 }}>{cs.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Enterprise CTA */}
        <div style={{ 
          marginTop: 64, padding: '48px 40px', background: 'var(--card-bg)',
          borderRadius: 16, textAlign: 'center', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Ready to expand your footprint?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 520, margin: '0 auto 24px', fontSize: 14 }}>AI-driven networking is just the beginning. Join the Oryn ecosystem and transform your business strategy today.</p>
          <button onClick={() => { setActiveTab('communities'); setShowCreateModal(true); }} style={{ padding: '12px 28px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-subtle)', transition: 'all 0.2s' }}>
            Register New Community
          </button>
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 32, width: '100%', maxWidth: 480,
            boxShadow: 'var(--shadow-subtle)', display: 'flex', flexDirection: 'column', gap: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--white)' }}>Create Ecosystem Community</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCommunitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Community Name</label>
                <input
                  required
                  value={newComm.name}
                  onChange={e => setNewComm({ ...newComm, name: e.target.value })}
                  placeholder="e.g. Enterprise AI Founders"
                  style={{ width: '100%', padding: '10px 14px', marginTop: 6, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Icon Category</label>
                <select
                  value={newComm.icon}
                  onChange={e => setNewComm({ ...newComm, icon: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', marginTop: 6, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, color: '#fff', outline: 'none' }}
                >
                  <option value="ai">AI & Robotics</option>
                  <option value="energy">Fintech & Energy</option>
                  <option value="global">Global Networks</option>
                  <option value="rocket">Startups & Scaleups</option>
                  <option value="idea">Innovation</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Tags (comma separated)</label>
                <input
                  value={newComm.tags}
                  onChange={e => setNewComm({ ...newComm, tags: e.target.value })}
                  placeholder="AI, Infra, Founders"
                  style={{ width: '100%', padding: '10px 14px', marginTop: 6, background: 'rgba(10,29,58,0.7)', border: '1px solid var(--border)', borderRadius: 10, color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Mission & Description</label>
                <textarea
                  rows={3}
                  required
                  value={newComm.description}
                  onChange={e => setNewComm({ ...newComm, description: e.target.value })}
                  placeholder="Describe the mission and who should join this community..."
                  style={{ width: '100%', padding: '10px 14px', marginTop: 6, background: 'rgba(10,29,58,0.7)', border: '1px solid var(--border)', borderRadius: 10, color: '#fff', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingComm}
                  style={{ padding: '8px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, cursor: 'pointer' }}
                >
                  {creatingComm ? 'Creating...' : 'Create Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
