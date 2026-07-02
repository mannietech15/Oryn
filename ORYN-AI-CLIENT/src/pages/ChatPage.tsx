import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import type { Message } from '../types';

function formatContent(text: string) {
  const codeBlocks: string[] = [];
  let processedText = text.replace(/```([\w-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const base64Code = btoa(encodeURIComponent(code));
    const block = `<div style="background: #000; border: 1px solid var(--card-border); border-radius: 12px; margin: 16px 0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
      <div style="background: #111; padding: 8px 16px; font-size: 12px; color: #888; font-family: monospace; border-bottom: 1px solid var(--card-border); display: flex; justify-content: space-between; align-items: center; text-transform: uppercase; font-weight: 600;">
        <span>${lang || 'CODE'}</span>
        <button onclick="navigator.clipboard.writeText(decodeURIComponent(atob('${base64Code}'))); this.innerText='Copied!'; setTimeout(() => this.innerText='Copy', 2000);" style="background: var(--glass-bg-subtle); border: 1px solid var(--card-border); color: #888; cursor: pointer; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 6px; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#888'">Copy</button>
      </div>
      <pre style="margin: 0; padding: 16px; overflow-x: auto; line-height: 1.5;"><code style="font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; color: #e5e5e5;">${escapedCode}</code></pre>
    </div>`;
    codeBlocks.push(block);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  processedText = processedText
    .replace(/`([^`]+)`/g, '<code style="background: var(--glass-bg-subtle); border: 1px solid var(--card-border); padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 13px; color: var(--accent-primary);">$1</code>')
    .replace(/\*\*ORYN\*\*/g, '<span style="font-family: var(--font-script); font-size: 1.3em; font-weight: 400; color: var(--accent-primary); padding-right: 2px;">Oryn</span>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary); font-weight: 600;">$1</strong>')
    .replace(/\n/g, '<br/>');

  codeBlocks.forEach((block, i) => {
    processedText = processedText.replace(`__CODE_BLOCK_${i}__`, block);
  });

  return processedText;
}

function Typewriter({ text, timestamp }: { text: string, timestamp: Date }) {
  // If the message is older than 5 seconds when mounted, skip animation (user navigated back)
  const isOld = Date.now() - timestamp.getTime() > 5000;
  const [displayed, setDisplayed] = useState(isOld ? text : '');
  const indexRef = useRef(isOld ? text.length : 0);

  useEffect(() => {
    if (isOld) {
      setDisplayed(text);
      return;
    }

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
  }, [text, isOld]);

  return <span dangerouslySetInnerHTML={{ __html: formatContent(displayed) }} />;
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
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg-hover)';
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
      {!isUser && (
        <div style={{ width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg-subtle)', borderRadius: '50%', border: '1px solid var(--card-border)' }}>
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
            <span style={{ fontFamily: 'var(--font-script)', fontSize: 20, color: 'var(--text-primary)', fontWeight: 400, marginTop: -2 }}>Oryn AI</span>
            <span style={{ fontSize: 10, background: 'var(--glass-bg-hover)', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>v2.0</span>
          </div>
        )}

        {msg.content ? (
          <Typewriter text={msg.content} timestamp={msg.timestamp} />
        ) : !isUser ? (
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
        ) : null}

        {msg.attachedFiles && msg.attachedFiles.length > 0 && (() => {
          const imageCount = msg.attachedFiles.filter(f => f.isImage && f.url).length;
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, maxWidth: imageCount > 1 ? 320 : 'auto' }}>
              {msg.attachedFiles.map((f, i) => f.isImage && f.url ? (
                <div key={i} style={{ 
                  borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-bg-strong)', 
                  width: imageCount > 1 ? 'calc(25% - 6px)' : '100%', 
                  maxWidth: 320, 
                  aspectRatio: imageCount > 1 ? '1 / 1' : 'auto'
                }}>
                  <img src={f.url} alt="Uploaded" style={{ width: '100%', height: '100%', display: 'block', objectFit: imageCount > 1 ? 'cover' : 'contain' }} />
                </div>
              ) : (
                <div key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: 13,
                  color: 'var(--text-primary)'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  {f.name}
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Copy button — AI only */}
      {!isUser && msg.content && <CopyButton text={msg.content} />}
    </div>
  );
}

export default function ChatPage({ 
  messages, isStreaming, pendingFiles, sessions, activeSessionId,
  sendMessage, setPendingFiles, startNewSession, setActiveSessionId 
}: ReturnType<typeof useChat>) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = windowWidth <= 768;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim() && pendingFiles.length === 0) return;
    sendMessage(input);
    setInput('');
  }, [input, pendingFiles, sendMessage]);

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
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPendingFiles(prev => {
        const newFiles = [...prev, ...files];
        return newFiles.slice(0, 10);
      });
    }
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main Chat Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* Top Right Actions */}
        <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 10 }}>
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', 
              borderRadius: 20, background: isHistoryOpen ? 'var(--glass-border-subtle)' : 'var(--glass-bg-subtle)', 
              border: '1px solid', borderColor: isHistoryOpen ? 'var(--glass-border-subtle)' : 'var(--card-border)', 
              fontSize: 13, fontWeight: 500, 
              color: isHistoryOpen ? 'var(--text-primary)' : 'var(--text-secondary)', 
              cursor: 'pointer', transition: 'all 0.2s',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--glass-border-subtle)'; e.currentTarget.style.borderColor = 'var(--glass-border-subtle)'; }}
            onMouseLeave={e => { if (!isHistoryOpen) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--glass-bg-subtle)'; e.currentTarget.style.borderColor = 'var(--card-border)'; } }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Open History
          </button>
        </div>
        {/* Messages List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '24px 16px' : '32px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
            <div ref={messagesEndRef} style={{ height: 40, flexShrink: 0 }} />
          </div>
        </div>

        {/* Improved Input Area */}
        <div style={{ 
          padding: isMobile ? '0 16px 24px' : '0 48px 40px', 
          flexShrink: 0, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            width: '100%', 
            maxWidth: '850px', 
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 24, 
            border: '1px solid var(--card-border)',
            padding: '12px 16px', 
            boxShadow: 'var(--shadow-subtle)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 12,
            transition: 'border-color 0.3s'
          }}>
            {pendingFiles.length > 0 && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 4, alignSelf: 'flex-start' }}>
                {pendingFiles.map((pendingFile, index) => (
                  <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                    {pendingFile.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(pendingFile)} alt="preview" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 16, border: '1px solid var(--card-border)' }} />
                    ) : (
                      <div style={{ width: 72, height: 72, background: 'var(--glass-bg-hover)', borderRadius: 16, border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                           {pendingFile.name.split('.').pop()?.substring(0, 4) || 'FILE'}
                        </span>
                      </div>
                    )}
                    <button onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== index))} style={{ position: 'absolute', top: -6, right: -6, background: '#fff', color: '#000', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--card-border)', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', padding: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                ))}
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
                    background: isMenuOpen ? 'var(--glass-bg-strong)' : 'var(--glass-bg-subtle)',
                    transition: 'all 0.2s', 
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-border-subtle)'}
                  onMouseLeave={e => { if (!isMenuOpen) e.currentTarget.style.background = 'var(--glass-bg-subtle)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                
                {isMenuOpen && (
                  <div style={{
                    position: 'absolute', bottom: '100%', left: 0,
                    marginBottom: 12, width: 200, background: 'var(--card-bg)', 
                    backdropFilter: 'blur(20px)', borderRadius: 12, border: '1px solid var(--card-border)',
                    boxShadow: 'var(--shadow-subtle)', overflow: 'hidden', zIndex: 100,
                    animation: 'rise 0.2s ease-out'
                  }}>
                    <div 
                      onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }}
                      style={{
                        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', transition: 'all 0.2s', fontSize: 13, fontWeight: 500,
                        color: 'var(--text-primary)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
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
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
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
                disabled={isStreaming || (!input.trim() && pendingFiles.length === 0)} 
                style={{
                  width: 44, height: 44, flexShrink: 0, borderRadius: 12,
                  background: (!input.trim() && pendingFiles.length === 0) ? 'var(--glass-bg-hover)' : 'var(--accent-primary)',
                  color: (!input.trim() && pendingFiles.length === 0) ? 'var(--text-secondary)' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: isStreaming ? 0.6 : 1, 
                  transition: 'all 0.2s', 
                  boxShadow: (!input.trim() && pendingFiles.length === 0) ? 'none' : '0 0 20px rgba(249,115,22,0.4)',
                  cursor: isStreaming || (!input.trim() && pendingFiles.length === 0) ? 'default' : 'pointer',
                  border: 'none'
                }}
                onMouseEnter={e => {
                  if (input.trim() || pendingFiles.length > 0) {
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
            
            {!isMobile && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                  ORYN can make mistakes. Consider verifying important information.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <input ref={fileInputRef} id="fileInput" type="file" multiple style={{ display: 'none' }} onChange={handleFile} />
      
      {/* History Sidebar */}
      {isHistoryOpen && (
        <div style={{
          width: 320, background: 'var(--card-bg)', borderLeft: '1px solid var(--card-border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', backdropFilter: 'blur(20px)',
          animation: 'slideInRight 0.3s ease', boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>Chat History</h3>
            <button onClick={() => setIsHistoryOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
            <button 
              onClick={() => { startNewSession(); setIsHistoryOpen(false); }}
              style={{
                width: '100%', padding: '14px 16px', background: 'var(--accent-primary)', color: '#fff',
                border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32,
                boxShadow: '0 4px 16px rgba(249, 115, 22, 0.25)', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Conversation
            </button>
            
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Recent</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sessions.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => { setActiveSessionId(s.id); setIsHistoryOpen(false); }}
                  style={{
                    padding: '16px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                    background: activeSessionId === s.id ? 'rgba(249,115,22,0.1)' : 'var(--glass-bg-subtle)',
                    border: '1px solid',
                    borderColor: activeSessionId === s.id ? 'rgba(249,115,22,0.3)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (activeSessionId !== s.id) e.currentTarget.style.background = 'var(--glass-bg-hover)'; }}
                  onMouseLeave={e => { if (activeSessionId !== s.id) e.currentTarget.style.background = 'var(--glass-bg-subtle)'; }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500, color: activeSessionId === s.id ? 'var(--text-primary)' : 'var(--text-secondary)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 12, color: activeSessionId === s.id ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
                    {s.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
