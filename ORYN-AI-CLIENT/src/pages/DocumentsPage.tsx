import React, { useState, useEffect, useRef } from 'react';
import { FileUp, FolderOpen, Trash2, Search, X } from 'lucide-react';
import { fetchDocuments, uploadDocument, deleteDocument } from '../api/oryn';

interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  tags: string[];
  aiSummary: string;
}

const getFormatBadgeStyle = (type: string) => {
  const t = type.toUpperCase();
  if (t.includes('PDF')) return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)', color: '#EF4444' };
  if (t.includes('CSV') || t.includes('XLS')) return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)', color: '#10B981' };
  if (t.includes('DOC')) return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.25)', color: '#3B82F6' };
  if (t.includes('PNG') || t.includes('JPG') || t.includes('IMAGE')) return { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.25)', color: '#A855F7' };
  return { bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.25)', color: 'var(--accent-primary)' };
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = async (silent = false) => {
    try {
      if (!silent && documents.length === 0) setLoading(true);
      const data = await fetchDocuments();
      setDocuments(data || []);
    } catch (err: any) {
      if (!silent) setErrorMsg(`Failed to retrieve documents: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs(false);
    const interval = setInterval(() => {
      loadDocs(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(`File size exceeds 25MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller document.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadProgress(`Analyzing ${file.name} (${file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : Math.round(file.size / 1024) + ' KB'})...`);
    setErrorMsg(null);

    try {
      const newDoc = await uploadDocument(
        file,
        'Analyze this document and extract concise business insights, metrics, and actionable items.'
      );
      setDocuments(prev => [newDoc, ...prev]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to upload and analyze document.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete document.');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query === '' ||
      doc.name.toLowerCase().includes(query) ||
      doc.aiSummary.toLowerCase().includes(query) ||
      doc.tags.some(t => t.toLowerCase().includes(query));

    const matchesTag = selectedTag === 'ALL' ||
      doc.type.toUpperCase() === selectedTag.toUpperCase() ||
      doc.tags.some(t => t.toUpperCase() === selectedTag.toUpperCase());

    return matchesSearch && matchesTag;
  });

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', background: 'var(--bg)', position: 'relative' }}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 28 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
              Document Management & Intelligence
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              Upload enterprise reports, spreadsheets, PDFs, or images for analysis and extraction.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.csv,.docx,.txt,.png,.jpg,.jpeg"
            />
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              style={{
                padding: '10px 20px', borderRadius: 8,
                background: 'var(--accent-primary)', color: 'white',
                border: 'none', fontSize: 13, fontWeight: 600,
                cursor: isUploading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
              }}
            >
              {isUploading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  {uploadProgress || 'Analyzing Multimodal Document...'}
                </>
              ) : (
                <>
                  <FileUp size={16} />
                  Upload & Analyze
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Repository Telemetry Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16
        }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Indexed Documents
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {documents.length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {documents.length === 1 ? '1 enterprise file synced' : `${documents.length} enterprise files synced`}
            </div>
          </div>

          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Unique Formats
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {new Set(documents.map(d => d.type)).size}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {new Set(documents.map(d => d.type)).size === 0 ? 'No extensions' : Array.from(new Set(documents.map(d => d.type))).join(', ')}
            </div>
          </div>

          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Multimodal Ingestion
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-display)' }}>
              Active
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              NVIDIA Vision & Groq Llama 3.3
            </div>
          </div>
        </div>

        {/* Search & Tag Filter Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 12,
          padding: '12px 18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 240 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search documents by name, summary or tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: 13,
                width: '100%'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {['ALL', 'PDF', 'CSV', 'DOCX', 'TXT', 'PNG', 'JPG'].map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedTag === tag ? 'var(--accent-primary)' : 'var(--card-border)',
                  background: selectedTag === tag ? 'rgba(249, 115, 22, 0.12)' : 'transparent',
                  color: selectedTag === tag ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div style={{
            padding: '12px 18px', borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--danger)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Documents List */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Querying document repository...
          </div>
        ) : documents.length === 0 ? (
          <div style={{
            padding: '60px 40px', textAlign: 'center',
            background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--surface-hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderOpen size={28} color="var(--accent-primary)" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              No Documents Analyzed Yet
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.5 }}>
              Upload your first financial statement, contract, or spreadsheet above. ORYN will process it via NVIDIA Llama 3.2 Vision and generate a verified operational summary.
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div style={{
            padding: '48px 30px', textAlign: 'center',
            background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)',
            color: 'var(--text-secondary)', fontSize: 14
          }}>
            No documents match the filter "{selectedTag !== 'ALL' ? selectedTag : searchQuery}".
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredDocuments.map(doc => (
              <div key={doc.id} style={{
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                borderRadius: 14, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14,
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {(() => {
                      const badgeStyle = getFormatBadgeStyle(doc.type);
                      return (
                        <div style={{
                          width: 46, height: 46, borderRadius: 10,
                          background: badgeStyle.bg, border: `1px solid ${badgeStyle.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, color: badgeStyle.color, fontFamily: 'monospace'
                        }}>
                          {doc.type}
                        </div>
                      );
                    })()}
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Size: {doc.size} · Ingested: {doc.date}
                      </div>
                      {doc.tags && doc.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 5 }}>
                          {doc.tags.map(t => (
                            <span key={t} style={{
                              padding: '2px 8px', borderRadius: 4,
                              background: 'var(--surface-hover)', border: '1px solid var(--border)',
                              fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)'
                            }}>
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{
                      background: 'transparent', border: '1px solid var(--card-border)',
                      color: 'var(--text-muted)', borderRadius: 6, padding: '5px 10px',
                      fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>

                <div style={{
                  padding: '14px 18px', background: 'var(--glass-bg-subtle)',
                  borderRadius: 10, border: '1px solid var(--card-border)',
                  fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 4, letterSpacing: '0.4px' }}>
                    AI MULTIMODAL SYNTHESIS:
                  </div>
                  {doc.aiSummary}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
