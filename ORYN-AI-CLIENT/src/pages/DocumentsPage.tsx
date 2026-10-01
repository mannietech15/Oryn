import React, { useState, useEffect, useRef } from 'react';
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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = async () => {
    try {
      const data = await fetchDocuments();
      setDocuments(data || []);
    } catch (err: any) {
      setErrorMsg(`Failed to retrieve documents: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', background: 'var(--bg)', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 6,
                background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)',
                fontSize: 11, fontWeight: 600, color: 'var(--success)', fontFamily: 'monospace'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                MULTIMODAL VISION & DOCUMENT ENGINE
              </div>
              <div style={{
                padding: '3px 10px', borderRadius: 6,
                background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)',
                fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace'
              }}>
                VERIFIED EXTRACTION PIPELINE
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
              Document Intelligence & Repository
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              Upload enterprise reports, spreadsheets, PDFs, or images for AI synthesis and contextual ledger extraction.
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
                  Analyzing Multimodal Document...
                </>
              ) : (
                <>
                  <span>📄</span>
                  Upload & Analyze
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            padding: '12px 18px', borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--danger)', fontSize: 13
          }}>
            {errorMsg}
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
            <div style={{ fontSize: 36 }}>📂</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              No Documents Analyzed Yet
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 450, lineHeight: 1.5 }}>
              Upload your first financial statement, contract, or spreadsheet above. ORYN will process it via NVIDIA Llama 3.2 Vision and generate a verified operational summary.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {documents.map(doc => (
              <div key={doc.id} style={{
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                borderRadius: 14, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14,
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'monospace'
                    }}>
                      {doc.type}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Size: {doc.size} · Ingested: {doc.date}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{
                      background: 'transparent', border: '1px solid var(--card-border)',
                      color: 'var(--text-muted)', borderRadius: 6, padding: '4px 10px',
                      fontSize: 11, cursor: 'pointer'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
                  >
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
