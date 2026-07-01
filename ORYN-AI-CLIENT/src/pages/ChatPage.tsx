import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import type { Message } from '../types';

function formatContent(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent-primary)">$1</strong>')
    .replace(/\n/g, '<br/>');
}

function Typewriter({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    if (text.length < indexRef.current) indexRef.current = 0;

    let timer: number;
    const tick = () => {
      if (indexRef.current < text.length) {
        indexRef.current = Math.min(indexRef.current + 3, text.length);
        setDisplayed(text.slice(0, indexRef.current));
        timer = requestAnimationFrame(tick);
      }
    };
    timer = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(timer);
  }, [text]);

  return (
    <>
      <span dangerouslySetInnerHTML={{ __html: formatContent(displayed) }} />
    </>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy'}
      style={{
        flexShrink: 0, alignSelf: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
        background: 'none', border: '1px solid transparent',
        color: copied ? 'var(--success)' : 'var(--text-secondary)',
        transition: 'all 0.2s', padding: 0,
      }}
      onMouseEnter={e => {
        if (!copied) {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--card-border)';
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
        }
      }}
      onMouseLeave={e => {
        if (!copied) {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.background = 'none';
        }
      }}
    >
      {copied
        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
      }
    </button>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 16, flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      animation: 'rise 0.3s ease both',
    }}>
      {/* Avatar */}
      {isUser ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
            background: 'var(--accent-primary)', color: 'white',
            boxShadow: '0 0 15px rgba(249,115,22,0.3)', border: '2px solid rgba(255,255,255,0.1)'
          }}>
            Me
          </div>
          {msg.content && <CopyButton text={msg.content} />}
        </div>
      ) : (
        <div style={{ width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', border: '1px solid var(--card-border)' }}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <polygon points="16,1 31,9 31,23 16,31 1,23 1,9" stroke="var(--accent-primary)" strokeWidth="1.2" fill="rgba(249, 115, 22,0.1)" />
            <circle cx="16" cy="16" r="3" fill="var(--accent-primary)" />
            <line x1="16" y1="7" x2="16" y2="13" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.6" />
            <line x1="16" y1="19" x2="16" y2="25" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.6" />
            <line x1="7" y1="12" x2="13" y2="15" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.6" />
            <line x1="19" y1="17" x2="25" y2="20" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.6" />
            <line x1="25" y1="12" x2="19" y2="15" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.6" />
            <line x1="13" y1="17" x2="7" y2="20" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.6" />
          </svg>
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: '80%', padding: isUser ? '16px 24px' : '8px 0', fontSize: 16, fontWeight: 400, lineHeight: 1.7, color: 'var(--text-primary)',
        borderRadius: isUser ? '16px 16px 4px 16px' : 0,
        background: isUser ? 'rgba(249, 115, 22, 0.12)' : 'transparent',
        border: isUser ? '1px solid rgba(249, 115, 22, 0.2)' : 'none',
        textAlign: 'left',
      }}>
        {!isUser && (
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            Oryn AI
            <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>v2.0</span>
          </div>
        )}

        {msg.content ? (
          isUser ? (
            <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
          ) : (
            <div style={{ wordBreak: 'break-word', color: 'var(--text-primary)' }}><Typewriter text={msg.content} /></div>
          )
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 0.15, 0.3].map((d, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)',
                  animation: `tdBounce 1s ease ${d}s infinite`,
                }} />
              ))}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600,
              color: 'var(--text-secondary)', animation: 'pulse 2s ease infinite',
            }}>
              Analyzing...
            </div>
          </div>
        )}

        {msg.file && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginTop: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: 13,
            color: 'var(--text-primary)'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            {msg.file}
          </div>
        )}
      </div>

      {/* Copy button — AI only */}
      {!isUser && msg.content && <CopyButton text={msg.content} />}
    </div>
  );
}

export default function ChatPage({ 
  messages, isStreaming, pendingFile, sendMessage, setPendingFile 
}: ReturnType<typeof useChat>) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim() && !pendingFile) return;
    sendMessage(input);
    setInput('');
  }, [input, pendingFile, sendMessage]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleMic = () => {
    setIsRecording(r => {
      if (!r) {
        setTimeout(() => {
          setIsRecording(false);
          setInput('Summarize the top business priorities for this week');
        }, 500);
        return true;
      }
      return false;
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPendingFile(f);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main Chat Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* Messages List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
          <div ref={messagesEndRef} style={{ height: 40, flexShrink: 0 }} />
        </div>

        {/* Improved Input Area */}
        <div style={{ 
          padding: '0 48px 40px', 
          flexShrink: 0, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            width: '100%', 
            maxWidth: '850px', 
            background: 'rgba(9, 9, 11, 0.7)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 24, 
            border: '1px solid var(--card-border)',
            padding: '12px 16px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 12,
            transition: 'border-color 0.3s'
          }}>
            {pendingFile && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', 
                borderRadius: 12, background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--card-border)', fontSize: 13, fontWeight: 500, 
                color: 'var(--text-primary)' 
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span style={{ flex: 1 }}>{pendingFile.name}</span>
                <button onClick={() => setPendingFile(null)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  style={{
                    width: 44, height: 44, borderRadius: 12, 
                    border: '1px solid var(--card-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isMenuOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                    transition: 'all 0.2s', 
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => { if (!isMenuOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                
                {isMenuOpen && (
                  <div style={{
                    position: 'absolute', bottom: '100%', left: 0,
                    marginBottom: 12, width: 200, background: 'rgba(9, 9, 11, 0.95)', 
                    backdropFilter: 'blur(20px)', borderRadius: 12, border: '1px solid var(--card-border)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100,
                    animation: 'rise 0.2s ease-out'
                  }}>
                    <div 
                      onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }}
                      style={{
                        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', transition: 'all 0.2s', fontSize: 13, fontWeight: 500,
                        color: 'var(--text-primary)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8m8.7-1.6V21"/><path d="M16 16l-4-4-4 4"/></svg>
                      <span>Upload Document</span>
                    </div>
                    <div 
                      onClick={() => { handleMic(); setIsMenuOpen(false); }}
                      style={{
                        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', transition: 'all 0.2s', fontSize: 13, fontWeight: 500,
                        color: isRecording ? 'var(--danger)' : 'var(--text-primary)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                      <span>{isRecording ? 'Stop Recording' : 'Voice Input'}</span>
                    </div>
                  </div>
                )}
              </div>

              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask ORYN to analyze data, write code, or search the web..."
                style={{
                  flex: 1, 
                  height: 44, 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-primary)', 
                  fontFamily: 'var(--font-body)', 
                  fontSize: 15, 
                  padding: '10px 4px',
                  resize: 'none', 
                  outline: 'none', 
                  lineHeight: 1.5
                }}
              />

              <button 
                onClick={handleSend} 
                disabled={isStreaming || (!input.trim() && !pendingFile)} 
                style={{
                  width: 44, height: 44, flexShrink: 0, borderRadius: 12,
                  background: (!input.trim() && !pendingFile) ? 'rgba(255,255,255,0.05)' : 'var(--accent-primary)',
                  color: (!input.trim() && !pendingFile) ? 'var(--text-secondary)' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: isStreaming ? 0.6 : 1, 
                  transition: 'all 0.2s', 
                  boxShadow: (!input.trim() && !pendingFile) ? 'none' : '0 0 20px rgba(249,115,22,0.4)',
                  cursor: isStreaming || (!input.trim() && !pendingFile) ? 'default' : 'pointer',
                  border: 'none'
                }}
                onMouseEnter={e => {
                  if (input.trim() || pendingFile) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateX(-1px)' }}>
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                ORYN can make mistakes. Consider verifying important information.
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <input ref={fileInputRef} id="fileInput" type="file" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}
