import React, { useState, useRef } from 'react';

const mockDocuments = [
  { id: '1', name: 'Q2_Financial_Report.pdf', type: 'PDF', size: '2.4 MB', date: 'Jul 12, 2026', tags: ['Finance', 'Quarterly'], aiSummary: 'Revenue increased 18.4% MTD. Major growth in enterprise sector.' },
  { id: '2', name: 'Enterprise_Upsell_Pipeline.csv', type: 'CSV', size: '845 KB', date: 'Jul 14, 2026', tags: ['Sales', 'Data'], aiSummary: 'Pipeline shows 4 late-stage enterprise deals totaling $120k ARR.' },
  { id: '3', name: 'APAC_Expansion_Brief.docx', type: 'DOCX', size: '1.2 MB', date: 'Jul 15, 2026', tags: ['Strategy'], aiSummary: 'Focuses on Tokyo and Singapore markets for Q3 launch.' },
  { id: '4', name: 'User_Interview_Transcripts.txt', type: 'TXT', size: '3.1 MB', date: 'Jul 16, 2026', tags: ['UX', 'Research'], aiSummary: 'Users strongly request more automated workflows and deeper integrations.' },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', 'Provide a concise 1-2 sentence business summary of this document.');

      const res = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      
      // Add to documents list
      const extMatch = file.name.match(/\.([a-z0-9]+)$/i);
      const ext = extMatch ? extMatch[1].toUpperCase() : 'FILE';
      
      const newDoc = {
        id: Date.now().toString(),
        name: file.name,
        type: ext,
        size: file.size > 1024 * 1024 ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : Math.round(file.size / 1024) + ' KB',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        tags: ['New'],
        aiSummary: data.analysis || 'No summary generated.'
      };

      setDocuments(prev => [newDoc, ...prev]);

    } catch (err) {
      console.error(err);
      alert('Failed to upload and analyze document.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'transparent' }}>
      {/* Header */}
      <div style={{ padding: '40px 48px 24px', borderBottom: '1px solid var(--card-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Intelligence
            </h1>
            <span style={{ fontFamily: 'var(--font-script)', fontSize: 36, color: 'var(--accent-primary)', lineHeight: 0.8, transform: 'translateY(-4px)' }}>
              Documents
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '8px 12px', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Search documents..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13, width: 180 }} />
            </div>
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
            <button 
              onClick={handleUploadClick}
              disabled={isUploading}
              style={{ padding: '10px 20px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: isUploading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(249,115,22,0.3)', opacity: isUploading ? 0.7 : 1 }} 
              onMouseEnter={e => { if(!isUploading) e.currentTarget.style.transform = 'translateY(-2px)'}} 
              onMouseLeave={e => { if(!isUploading) e.currentTarget.style.transform = 'translateY(0)'}}
            >
              {isUploading ? (
                <>
                  <style>
                    {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
                  </style>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Upload Document
                </>
              )}
            </button>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
          Manage your files and view AI-generated insights and summaries.
        </p>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            <div style={{ padding: '20px', background: 'var(--glass-bg-subtle)', borderRadius: 16, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Total Files</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>142</span>
            </div>
            <div style={{ padding: '20px', background: 'var(--glass-bg-subtle)', borderRadius: 16, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Storage Used</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>1.2 GB</span>
            </div>
            <div style={{ padding: '20px', background: 'var(--glass-bg-subtle)', borderRadius: 16, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>AI Insights Generated</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>384</span>
            </div>
            <div style={{ padding: '20px', background: 'var(--glass-bg-subtle)', borderRadius: 16, border: '1px dashed var(--accent-primary)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--glass-bg-subtle)'}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', gap: 8, fontWeight: 600 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                Scan Entire Library
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {documents.map(doc => (
              <DocumentCard key={doc.id} {...doc} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentCard({ name, type, size, date, tags, aiSummary }: { name: string, type: string, size: string, date: string, tags: string[], aiSummary: string }) {
  const isPdf = type === 'PDF';
  const isCsv = type === 'CSV';
  const isTxt = type === 'TXT';
  const color = isPdf ? '#ef4444' : isCsv ? '#10b981' : isTxt ? '#8b5cf6' : '#3b82f6';
  
  return (
    <div style={{ 
      display: 'flex', padding: '24px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', 
      borderRadius: 16, transition: 'all 0.3s', boxShadow: 'var(--shadow-subtle)', gap: 24, alignItems: 'center'
    }}>
      <div style={{ width: 64, height: 64, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, fontSize: 14, fontWeight: 800, border: `1px solid ${color}30` }}>
        {type}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{name}</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {tags.map(tag => (
              <span key={tag} style={{ padding: '2px 8px', background: 'var(--glass-bg-strong)', color: 'var(--text-secondary)', fontSize: 10, fontWeight: 600, borderRadius: 12, textTransform: 'uppercase' }}>{tag}</span>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 16, marginBottom: 12 }}>
          <span>Uploaded: {date}</span>
          <span>Size: {size}</span>
        </div>
        
        <div style={{ padding: '10px 14px', background: 'var(--glass-bg-subtle)', borderRadius: 8, border: '1px solid var(--card-border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><polygon points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7"></polygon></svg>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600 }}>AI Summary: </span>{aiSummary}
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--bg)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }} title="Chat with Document">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
        <button style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--bg)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }} title="Download">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
      </div>
    </div>
  );
}
