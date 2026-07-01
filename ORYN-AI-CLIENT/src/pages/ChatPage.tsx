import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import type { Message, Task } from '../types';

function formatContent(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--cyan)">$1</strong>')
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
        width: 36, height: 36, borderRadius: 6, cursor: 'pointer',
        background: 'none', border: '1px solid transparent',
        color: copied ? 'var(--success)' : 'var(--muted)',
        transition: 'all 0.2s', padding: 0,
      }}
      onMouseEnter={e => {
        if (!copied) {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--cyan)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,240,255,0.3)';
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,240,255,0.08)';
        }
      }}
      onMouseLeave={e => {
        if (!copied) {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.background = 'none';
        }
      }}
    >
      {copied
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
      }
    </button>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 8, flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      animation: 'rise 0.35s ease both',
    }}>
      {/* Avatar */}
      {isUser ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, letterSpacing: 1.5,
            background: 'linear-gradient(135deg,#0055ff,#00f0ff)',
            color: 'white',
            boxShadow: '0 0 15px rgba(0,240,255,0.5)',
          }}>
            ME
          </div>
          {msg.content && <CopyButton text={msg.content} />}
        </div>
      ) : (
        <div style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="44" height="44" viewBox="0 0 32 32" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.7))' }}>
            <polygon points="16,1 31,9 31,23 16,31 1,23 1,9" stroke="#00d4ff" strokeWidth="1.2" fill="rgba(0,212,255,0.05)" />
            <polygon points="16,7 25,12 25,20 16,25 7,20 7,12" stroke="#0095ff" strokeWidth="0.8" fill="rgba(0,149,255,0.07)" />
            <circle cx="16" cy="16" r="3" fill="#00d4ff" />
            <line x1="16" y1="7" x2="16" y2="13" stroke="#00d4ff" strokeWidth="0.8" opacity="0.6" />
            <line x1="16" y1="19" x2="16" y2="25" stroke="#00d4ff" strokeWidth="0.8" opacity="0.6" />
            <line x1="7" y1="12" x2="13" y2="15" stroke="#00d4ff" strokeWidth="0.8" opacity="0.6" />
            <line x1="19" y1="17" x2="25" y2="20" stroke="#00d4ff" strokeWidth="0.8" opacity="0.6" />
            <line x1="25" y1="12" x2="19" y2="15" stroke="#00d4ff" strokeWidth="0.8" opacity="0.6" />
            <line x1="13" y1="17" x2="7" y2="20" stroke="#00d4ff" strokeWidth="0.8" opacity="0.6" />
          </svg>
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: '85%', padding: isUser ? '20px 28px' : '6px 0', fontSize: 17, fontWeight: 400, lineHeight: 1.7, color: 'var(--text)',
        borderRadius: isUser ? '20px 4px 20px 20px' : 0,
        background: isUser ? 'linear-gradient(135deg, rgba(0,136,255,0.15), rgba(0,240,255,0.25))' : 'transparent',
        border: isUser ? '1px solid rgba(0,240,255,0.4)' : 'none',
        borderRight: isUser ? '4px solid var(--cyan)' : 'none',
        boxShadow: isUser ? '0 8px 32px rgba(0,240,255,0.2), 0 0 20px rgba(0,240,255,0.1) inset' : 'none',
        backdropFilter: isUser ? 'blur(10px)' : 'none',
        textAlign: 'left',
      }}>
        {!isUser && (
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10, color: 'var(--violet)', textAlign: 'left' }}>
            Oryn · AI
          </div>
        )}

        {msg.content ? (
          isUser ? (
            <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
          ) : (
            <div style={{ wordBreak: 'break-word' }}><Typewriter text={msg.content} /></div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                  animation: `tdBounce 1.2s ease ${d}s infinite`,
                }} />
              ))}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)',
              animation: 'pulse 1.8s ease infinite',
            }}>
              ORYN is thinking…
            </div>
          </div>
        )}

        {msg.file && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 10px', marginTop: 6,
            background: 'rgba(108,47,255,0.09)', border: '1px solid rgba(108,47,255,0.28)', fontSize: 11,
          }}>
            📄 {msg.file}
          </div>
        )}
      </div>

      {/* Copy button — outside bubble, to the right (AI only) */}
      {!isUser && msg.content && <CopyButton text={msg.content} />}
    </div>
  );
}

// TaskPanel removed as per redesigned layout


// CHIPS removed for a cleaner aesthetic

export default function ChatPage({ 
  messages, tasks, isStreaming, pendingFile, sendMessage, toggleTask, setPendingFile, resetChat 
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
      {/* Left Column: Messages + Input Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Messages List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
          <div ref={messagesEndRef} style={{ height: 1, flexShrink: 0 }} />
        </div>

        {/* Refined Input Area */}
        {/* Floating Input Area */}
        <div style={{ 
          padding: '24px 32px 40px', 
          background: 'none', 
          flexShrink: 0, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16
        }}>
          {/* Centered Rounded Input Bar */}
          <div style={{
            width: '100%', 
            maxWidth: '800px', 
            background: 'rgba(12,25,50,0.85)', 
            borderRadius: 40, 
            border: '1px solid rgba(0,240,255,0.3)',
            padding: '8px 12px', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(0,240,255,0.1)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 8,
            transition: 'all 0.3s'
          }}>
            {pendingFile && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10, 
                padding: '8px 16px', 
                borderRadius: 20, 
                background: 'rgba(108,47,255,0.12)', 
                border: '1px solid rgba(108,47,255,0.4)', 
                fontSize: 13, 
                fontWeight: 500, 
                margin: '0 8px' 
              }}>
                <span>📄</span>
                <span style={{ flex: 1 }}>{pendingFile.name}</span>
                <button onClick={() => setPendingFile(null)} style={{ color: 'var(--muted)', fontSize: 16, cursor: 'pointer' }}>✕</button>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  style={{
                    width: 52, height: 52, flexShrink: 0, borderRadius: '50%', 
                    border: `1px solid ${isRecording ? 'rgba(255,51,102,0.8)' : 'rgba(0,240,255,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isRecording ? 'rgba(255,51,102,0.15)' : 'rgba(0,240,255,0.05)',
                    transition: 'all 0.3s', 
                    boxShadow: isRecording ? '0 0 20px rgba(255,51,102,0.4)' : 'none',
                    cursor: 'pointer',
                    color: isRecording ? 'var(--danger)' : 'var(--cyan)'
                  }}
                >
                  {isRecording ? '⏹' : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  )}
                </button>
                
                {isMenuOpen && (
                  <div style={{
                    position: 'absolute', bottom: '100%', left: 0,
                    marginBottom: 15, width: 180, background: 'rgba(10,29,58,0.95)', 
                    backdropFilter: 'blur(25px)', borderRadius: 16, border: '1px solid rgba(0,240,255,0.2)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100,
                    animation: 'rise 0.2s ease-out'
                  }}>
                    <div 
                      onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }}
                      style={{
                        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', transition: 'all 0.2s', fontSize: 13, fontWeight: 600,
                        color: 'var(--white)', borderBottom: '1px solid rgba(0,240,255,0.1)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,240,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: 18 }}>📄</span>
                      <span>File Upload</span>
                    </div>
                    <div 
                      onClick={() => { handleMic(); setIsMenuOpen(false); }}
                      style={{
                        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', transition: 'all 0.2s', fontSize: 13, fontWeight: 600,
                        color: isRecording ? 'var(--danger)' : 'var(--white)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,240,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: 18 }}>🎙</span>
                      <span>{isRecording ? 'Stop Recording' : 'Voice Input'}</span>
                    </div>
                  </div>
                )}
              </div>

              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask ORYN anything..."
                style={{
                  flex: 1, 
                  height: 52, 
                  background: 'transparent', 
                  borderRadius: 26,
                  border: 'none', 
                  color: 'var(--white)', 
                  fontFamily: 'var(--font-sans)', 
                  fontSize: 16, 
                  padding: '14px 16px',
                  resize: 'none', 
                  outline: 'none', 
                  transition: 'all 0.2s',
                  lineHeight: 1.5
                }}
              />

              <button 
                onClick={handleSend} 
                disabled={isStreaming} 
                style={{
                  width: 52, height: 52, flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                  opacity: isStreaming ? 0.6 : 1, 
                  transition: 'all 0.3s', 
                  boxShadow: '0 0 20px rgba(0,240,255,0.3)',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ transform: 'rotate(-90deg)' }}><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
              </button>
            </div>
          </div>

          {/* Template Chips removed for minimalist look */}
        </div>
      </div>

      {/* Right Sidebar removed */}

      <input ref={fileInputRef} id="fileInput" type="file" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}
