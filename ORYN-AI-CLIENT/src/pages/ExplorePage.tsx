import { useState } from 'react';

interface Community {
  id: string;
  name: string;
  members: string;
  tags: string[];
  description: string;
  icon: string;
}

interface Business {
  id: string;
  name: string;
  industry: string;
  location: string;
  product: string;
  matchType: 'same' | 'complementary';
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

const COMMUNITIES: Community[] = [
  { id: '1', name: 'AI SaaS Builders', members: '12.4k', tags: ['AI', 'SaaS', 'Dev'], description: 'A community for founders building the next generation of AI-native SaaS.', icon: '🤖' },
  { id: '2', name: 'Growth Hackers Hub', members: '8.2k', tags: ['Marketing', 'B2B'], description: 'Strategies and tools for hyper-growth in the enterprise space.', icon: '🚀' },
  { id: '3', name: 'Sustainable Fintech', members: '5.1k', tags: ['Finance', 'ESG'], description: 'Ethical finance and green technology innovators.', icon: '🌿' },
];

const BUSINESSES: Business[] = [
  { id: '1', name: 'Nexus Logistics', industry: 'Supply Chain', location: 'Berlin', product: 'Cloud Fleet Mgmt', matchType: 'same' },
  { id: '2', name: 'EcoPack Solutions', industry: 'Packaging', location: 'Denver', product: 'Bio-degradable Materials', matchType: 'complementary' },
  { id: '3', name: 'Zenith CRM', industry: 'Software', location: 'Austin', product: 'Enterprise CRM', matchType: 'same' },
  { id: '4', name: 'SwiftPay Systems', industry: 'Fintech', location: 'London', product: 'B2B Payments', matchType: 'complementary' },
  { id: '5', name: 'Quantum Core', industry: 'Computing', location: 'San Francisco', product: 'Quantum Processors', matchType: 'same' },
  { id: '6', name: 'Atlas Biotech', industry: 'Healthcare', location: 'Boston', product: 'Gene Therapy Kits', matchType: 'complementary' },
  { id: '7', name: 'Silverline Robotics', industry: 'Manufacturing', location: 'Tokyo', product: 'Industrial Arms', matchType: 'same' },
  { id: '8', name: 'Nova Energy', industry: 'Renewables', location: 'Oslo', product: 'Fusion Modules', matchType: 'complementary' },
];

const TRENDS: Trend[] = [
  { id: '1', topic: 'Generative Supply Chains', growth: '+142%', category: 'AI/Logistics', sentiment: 'positive' },
  { id: '2', topic: 'Decentralized Workforce', growth: '+24%', category: 'HR Tech', sentiment: 'neutral' },
  { id: '3', topic: 'Hyper-Personalized CRM', growth: '+89%', category: 'SaaS', sentiment: 'positive' },
];

const CASE_STUDIES: CaseStudy[] = [
  { id: '1', company: 'CloudScale Inc.', result: '320% Revenue growth', summary: 'Implemented ORYN-AI to automate decision-making across 4 global offices.', image: '🏢' },
  { id: '2', company: 'Velocity Retail', result: '45% Cost Reduction', summary: 'Optimized inventory using our predictive analytics engine.', image: '🛒' },
];

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'communities' | 'networking' | 'trends'>('communities');

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'transparent', perspective: '1000px' }}>
      {/* Hero / Header */}
      <div style={{
        padding: '60px 40px',
        background: 'linear-gradient(180deg, rgba(249, 115, 22,0.05) 0%, transparent 100%)',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, background: 'radial-gradient(circle, rgba(249, 115, 22,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, marginBottom: 16, letterSpacing: -1 }}>
          Explore the <span style={{ color: 'var(--cyan)' }}>Ecosystem</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 18, maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
          Discover communities, connect with partners, and stay ahead of industrial shifts with AI-powered networking.
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search for communities, businesses, or trends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '20px 30px', borderRadius: 40, border: '1px solid var(--border)',
              background: 'rgba(10,29,58,0.7)', backdropFilter: 'blur(20px)', color: 'var(--white)',
              fontSize: 16, outline: 'none', transition: 'all 0.3s',
              boxShadow: 'var(--shadow-subtle), 0 0 15px rgba(249, 115, 22,0.05)'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.boxShadow = 'var(--shadow-subtle), 0 0 25px rgba(249, 115, 22,0.2)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'var(--shadow-subtle), 0 0 15px rgba(249, 115, 22,0.05)'; }}
          />
          <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 20 }}>🔍</div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div style={{ padding: '40px', maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          {(['communities', 'networking', 'trends'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', padding: '8px 4px', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: 2,
                textTransform: 'uppercase', color: activeTab === tab ? 'var(--cyan)' : 'var(--muted)',
                position: 'relative', transition: 'all 0.3s'
              }}
            >
              {tab}
              {activeTab === tab && (
                <div style={{ position: 'absolute', bottom: -17, left: 0, right: 0, height: 2, background: 'var(--cyan)', boxShadow: '0 0 10px var(--cyan)' }} />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Section Rendering */}
        <div style={{ animation: 'rise 0.5s ease-out' }}>
          {activeTab === 'communities' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
              {COMMUNITIES.map(c => (
                <div key={c.id} style={{
                  padding: 32, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 20,
                  backdropFilter: 'blur(10px)', transition: 'all 0.3s', cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.borderColor = 'rgba(249, 115, 22,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ fontSize: 40, marginBottom: 20 }}>{c.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>{c.name}</h3>
                  <div style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 700, marginBottom: 16 }}>{c.members} Members</div>
                  <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{c.description}</p>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {c.tags.map(tag => (
                      <span key={tag} style={{ padding: '4px 10px', background: 'rgba(249, 115, 22,0.05)', border: '1px solid rgba(249, 115, 22,0.1)', borderRadius: 4, fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>#{tag}</span>
                    ))}
                  </div>
                  <button style={{ width: '100%', padding: '12px', background: 'rgba(249, 115, 22,0.08)', border: '1px solid var(--cyan)', borderRadius: 10, color: 'var(--cyan)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                    Join Community
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'networking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Recommended Connections</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Filter by Sector:</span>
                  <select style={{ background: 'rgba(10,29,58,0.7)', border: '1px solid var(--border)', color: 'var(--white)', padding: '4px 12px', borderRadius: 8 }}>
                    <option>All Sectors</option>
                    <option>Logistics</option>
                    <option>Software</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {BUSINESSES.map(b => (
                  <div key={b.id} style={{
                    padding: 24, background: 'rgba(10,29,58,0.5)', border: '1px solid var(--border)', borderRadius: 16,
                    borderLeft: `4px solid ${b.matchType === 'same' ? 'var(--cyan)' : 'var(--violet)'}`
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: b.matchType === 'same' ? 'var(--cyan)' : 'var(--violet)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                      {b.matchType === 'same' ? 'Direct Competitor / Peer' : 'Strategic Partner'}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{b.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>{b.industry} · {b.location}</div>
                    <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: 12, marginBottom: 20 }}>
                      <span style={{ color: 'var(--muted)' }}>Keys Products:</span> {b.product}
                    </div>
                    <button style={{ width: '100%', padding: '10px', background: 'white', color: 'black', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Emerging Shifts</h2>
                {TRENDS.map(t => (
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
                <div style={{ fontSize: 40 }}>📊</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Detailed Trend Analysis</div>
                <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center' }}>Connect your LinkedIn or Market data source to unlock deep trend forecasting.</p>
                <button style={{ padding: '12px 24px', background: 'var(--cyan)', color: 'black', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Connect Data Source</button>
              </div>
            </div>
          )}
        </div>

        {/* Case Studies Section - Always visible at bottom */}
        <div style={{ marginTop: 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Success Stories</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800 }}>The ORYN Impact</h2>
            </div>
            <button style={{ color: 'var(--cyan)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View All Case Studies →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {CASE_STUDIES.map(cs => (
              <div key={cs.id} style={{
                display: 'flex', gap: 24, padding: 40, background: 'rgba(10,29,58,0.7)', borderRadius: 24, border: '1px solid var(--border)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249, 115, 22,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: 100, height: 100, background: 'rgba(249, 115, 22,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, flexShrink: 0 }}>
                  {cs.image}
                </div>
                <div>
                  <h3 style={{ fontSize: 24, marginBottom: 12 }}>{cs.company}</h3>
                  <div style={{ padding: '4px 12px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 4, display: 'inline-block', fontSize: 12, color: '#4ade80', fontWeight: 700, marginBottom: 16 }}>
                    {cs.result}
                  </div>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.6, fontSize: 15 }}>{cs.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Accent */}
        <div style={{ 
          marginTop: 100, padding: 60, background: 'linear-gradient(135deg, rgba(249, 115, 22,0.1), rgba(108,47,255,0.1))',
          borderRadius: 32, textAlign: 'center', border: '1px solid rgba(249, 115, 22,0.1)'
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 16 }}>Ready to expand your footprint?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>AI-driven networking is just the beginning. Join the Oryn ecosystem and transform your business strategy today.</p>
          <button style={{ padding: '16px 40px', background: 'var(--cyan)', color: 'black', border: 'none', borderRadius: 40, fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 10px 30px rgba(249, 115, 22,0.4)' }}>Get Started Now</button>
        </div>
      </div>
    </div>
  );
}
