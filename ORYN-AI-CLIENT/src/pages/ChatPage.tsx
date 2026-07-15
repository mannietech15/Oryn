import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import type { Message } from '../types';
import { ConversationalMode } from '../components/ConversationalMode';

function formatContent(text: string) {
  const codeBlocks: string[] = [];

  // Extract all code blocks to build a unified preview payload
  let combinedHtml = '';
  let combinedCss = '';
  let combinedJs = '';
  
  const matches = [...text.matchAll(/```([\w-]*)\n([\s\S]*?)```/g)];
  matches.forEach(match => {
    const lang = match[1].toLowerCase();
    const code = match[2];
    if (lang === 'html' || lang === 'svg' || code.includes('<html') || code.includes('<div')) {
      combinedHtml += code + '\n';
    } else if (lang === 'css') {
      combinedCss += code + '\n';
    } else if (lang === 'javascript' || lang === 'js') {
      combinedJs += code + '\n';
    }
  });

  // Create a merged document with a peak environment
  let mergedDoc = '';
  const isFullHtml = combinedHtml.toLowerCase().includes('<html');

  if (isFullHtml) {
    mergedDoc = combinedHtml;
    if (combinedCss) mergedDoc = mergedDoc.replace('</head>', `\n<style>\n${combinedCss}\n</style>\n</head>`);
    if (combinedJs) mergedDoc = mergedDoc.replace('</body>', `\n<script>\n${combinedJs}\n</script>\n</body>`);
  } else {
    mergedDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = { theme: { extend: { fontFamily: { sans: ['Inter', 'sans-serif'] } } } }
  </script>
  <style>
    body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
    ${combinedCss}
  </style>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen">
  ${combinedHtml || '<div id="root"></div>'}
`;

    if (combinedJs) {
      if (combinedJs.includes('import ') || combinedJs.includes('export ') || combinedJs.includes('/>') || combinedJs.includes('</') || combinedJs.includes('React')) {
        let cleanJs = combinedJs.replace(/import\s+.*?['"].*?['"];?/g, '').replace(/export\s+default\s+/g, 'const App = ').replace(/export\s+/g, '');
        mergedDoc += `\n<script type="text/babel">\n${cleanJs}
\nif (document.getElementById('root') && !cleanJs.includes('createRoot') && typeof App !== 'undefined') {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
}
</script>`;
      } else {
        mergedDoc += `\n<script>\n${combinedJs}\n</script>`;
      }
    }
    
    mergedDoc += `\n<script>lucide.createIcons();</script>\n</body>\n</html>`;
  }
  
  const mergedBase64 = btoa(encodeURIComponent(mergedDoc));

  let processedText = text.replace(/```([\w-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const blockBase64 = btoa(encodeURIComponent(code));
    const isPreviewable = ['html', 'svg', 'xml', 'javascript', 'js', 'css'].includes(lang.toLowerCase()) || code.includes('<html') || code.includes('<svg') || code.includes('<div');
    
    // Instead of previewing just this block, we preview the unified mergedDoc!
    const previewBtn = isPreviewable ? `<button onclick="window.dispatchEvent(new CustomEvent('preview-code', {detail: { code: '${mergedBase64}', lang: 'Combined App' }})); this.innerText='Opening...'; setTimeout(() => this.innerText='Preview UI', 1000);" style="background: var(--accent-primary); border: none; color: white; cursor: pointer; font-family: var(--font-body); font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 6px; transition: all 0.2s; box-shadow: 0 0 10px rgba(249,115,22,0.3);" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">Preview UI</button>` : '';

    const block = `<div style="background: #000; border: 1px solid var(--card-border); border-radius: 12px; margin: 16px 0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
      <div style="background: #111; padding: 8px 16px; font-size: 12px; color: #888; font-family: monospace; border-bottom: 1px solid var(--card-border); display: flex; justify-content: space-between; align-items: center; text-transform: uppercase; font-weight: 600;">
        <span>${lang || 'CODE'}</span>
        <div style="display: flex; gap: 8px;">
          ${previewBtn}
          <button onclick="navigator.clipboard.writeText(decodeURIComponent(atob('${blockBase64}'))); this.innerText='Copied!'; setTimeout(() => this.innerText='Copy', 2000);" style="background: var(--glass-bg-subtle); border: 1px solid var(--card-border); color: #888; cursor: pointer; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 6px; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#888'">Copy</button>
        </div>
      </div>
      <pre style="margin: 0; padding: 16px; overflow-x: auto; line-height: 1.5;"><code style="font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; color: #e5e5e5;">${escapedCode}</code></pre>
    </div>`;
    codeBlocks.push(block);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  processedText = processedText
    .replace(/`([^`]+)`/g, '<code style="background: var(--glass-bg-subtle); border: 1px solid var(--card-border); padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 13px; color: var(--accent-primary);">$1</code>')
    .replace(/\b(ORYN|Oryn)\b/g, '__ORYN_PLACEHOLDER__')
    .replace(/\*\*([^*]+)\*\*(:?)/g, (match, p1, p2) => {
      const text = p1.trim();
      const hasColon = p2 === ':' || text.endsWith(':');
      if (hasColon) {
        return `<strong style="color: var(--accent-primary); font-weight: 700;">${p1}${p2}</strong>`;
      }
      return `<strong style="color: var(--text-primary); font-weight: 600;">${p1}</strong>`;
    })
    .replace(/__ORYN_PLACEHOLDER__/g, '<span style="font-family: var(--font-script); font-size: 1.35em; font-weight: bold; color: var(--accent-primary); padding-right: 2px;">Oryn</span>')
    .replace(/### (.*?)(<br\/>|\n|$)/g, '<h3 style="color: var(--accent-primary); font-weight: 700; margin: 16px 0 8px;">$1</h3>$2')
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

function SpeakButton({ text, language }: { text: string, language?: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
  };

  const handleSpeak = async () => {
    if (isSpeaking || isLoading) {
      stopSpeaking();
      return;
    }

    setIsLoading(true);
    // Remove markdown formatting for cleaner reading
    const cleanText = text.replace(/[*#`]/g, '').replace(/__CODE_BLOCK_\d+__/g, 'Code block snippet.');
    const voiceId = "UgBBYS2sOqTuMpoF3BR0"; // Requested ElevenLabs Voice ID
    // Try ElevenLabs API if the environment variable is configured
    const apiKey = (import.meta as any).env.VITE_ELEVENLABS_API_KEY || '';

    if (apiKey) {
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: "eleven_monolingual_v1",
            voice_settings: { stability: 0.5, similarity_boost: 0.5 }
          })
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => setIsSpeaking(false);
          audio.play();
          setIsSpeaking(true);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error("ElevenLabs TTS failed", e);
      }
    }

    // Fallback to native SpeechSynthesis
    const langMap: Record<string, string> = {
      'Spanish': 'es-ES', 'French': 'fr-FR', 'Yoruba': 'yo-NG',
      'Igbo': 'ig-NG', 'Hausa': 'ha-NG', 'Pidgin': 'en-NG', 'English': 'en-US'
    };
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = (language && langMap[language]) || 'en-US';
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsLoading(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsLoading(false);
    };
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleSpeak}
      title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
      style={{
        flexShrink: 0, alignSelf: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
        background: 'none', border: '1px solid transparent',
        color: isSpeaking ? 'var(--accent-primary)' : 'var(--text-secondary)',
        transition: 'all 0.2s', padding: 0,
        opacity: isLoading ? 0.5 : 1
      }}
      onMouseEnter={e => {
        if (!isSpeaking) {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--card-border)';
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg-hover)';
        }
      }}
      onMouseLeave={e => {
        if (!isSpeaking) {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.background = 'none';
        }
      }}
    >
      {isSpeaking ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      )}
    </button>
  );
}

function MessageBubble({ msg, isMobile, onImageClick, language }: { msg: Message, isMobile?: boolean, onImageClick?: (url: string) => void, language?: string }) {
  const isUser = msg.role === 'user';
  
  if (isUser) {
    return (
      <div style={{
        display: 'flex', gap: 16, flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        animation: 'rise 0.3s ease both',
      }}>
        {/* User Bubble */}
        <div style={{
          maxWidth: isMobile ? '95%' : '80%', padding: '16px 24px', fontSize: 16, fontWeight: 400, lineHeight: 1.7, color: 'var(--text-primary)',
          borderRadius: '16px 16px 4px 16px',
          background: 'rgba(249, 115, 22, 0.12)',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          textAlign: 'left',
        }}>
          <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
          
          {msg.attachedFiles && msg.attachedFiles.length > 0 && (() => {
            const imageCount = msg.attachedFiles.filter(f => f.isImage && f.url).length;
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, maxWidth: imageCount > 1 ? 320 : 'auto' }}>
                {msg.attachedFiles.map((f, i) => f.isImage && f.url ? (
                  <div key={i} style={{ 
                    borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(249,115,22,0.3)', 
                    width: imageCount > 1 ? 'calc(25% - 6px)' : '100%', 
                    maxWidth: 320, 
                    aspectRatio: imageCount > 1 ? '1 / 1' : 'auto'
                  }}>
                    <img onClick={() => onImageClick?.(f.url!)} src={f.url} alt="Uploaded" style={{ width: '100%', height: '100%', display: 'block', objectFit: imageCount > 1 ? 'cover' : 'contain', cursor: 'pointer' }} />
                  </div>
                ) : (
                  <div key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                    background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 8, fontSize: 13,
                    color: 'var(--text-primary)'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    {f.name}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // AI Bubble
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      alignItems: 'flex-start', width: '100%',
      animation: 'rise 0.3s ease both',
    }}>
      {/* Header: Avatar + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg-subtle)', borderRadius: '50%', border: '1px solid var(--card-border)' }}>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-script)', fontSize: 20, color: 'var(--text-primary)', fontWeight: 400, marginTop: -2 }}>Oryn AI</span>
          <span style={{ fontSize: 10, background: 'var(--glass-bg-hover)', padding: '2px 6px', borderRadius: 4, fontWeight: 500, color: 'var(--text-secondary)' }}>v2.0</span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        width: '100%', padding: '4px 0', fontSize: 16, fontWeight: 400, lineHeight: 1.7, color: 'var(--text-primary)',
        textAlign: 'left',
      }}>
        {msg.content ? (
          <Typewriter text={msg.content} timestamp={msg.timestamp} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
            <style>
              {`
                @keyframes geminiWave {
                  0% {
                    transform: scale(0.4) translateY(0px);
                    opacity: 0.2;
                  }
                  50% {
                    transform: scale(1) translateY(-3px);
                    opacity: 1;
                    box-shadow: 0 0 10px rgba(249, 115, 22, 0.6);
                    background: linear-gradient(135deg, var(--accent-primary), #ffb84d);
                  }
                  100% {
                    transform: scale(0.4) translateY(0px);
                    opacity: 0.2;
                  }
                }
              `}
            </style>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 4 }}>
              {[0, 0.15, 0.3].map((d, i) => (
                <div key={i} style={{ 
                  width: 8, height: 8, borderRadius: '50%', 
                  background: 'var(--accent-primary)', 
                  animation: `geminiWave 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${d}s infinite` 
                }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', animation: 'pulse 2s ease infinite' }}>
              Analyzing...
            </div>
          </div>
        )}
      </div>

      {/* Footer: Actions */}
      {msg.content && (
        <div style={{ alignSelf: 'flex-start', marginTop: 4, display: 'flex', gap: 4 }}>
          <SpeakButton text={msg.content} language={language} />
          <CopyButton text={msg.content} />
        </div>
      )}
    </div>
  );
}

export default function ChatPage({ 
  messages, isStreaming, pendingFiles, sessions, activeSessionId, model, language,
  sendMessage, stopGeneration, setPendingFiles, startNewSession, setActiveSessionId,
  deleteSession, renameSession, setModel, setLanguage
}: ReturnType<typeof useChat>) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeCodePreview, setActiveCodePreview] = useState<{code: string, lang: string} | null>(null);
  const [isConversationalMode, setIsConversationalMode] = useState(false);

  // History menu & dialog state
  const [historyMenuId, setHistoryMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const historyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePreview = (e: any) => {
      const decodedCode = decodeURIComponent(atob(e.detail.code));
      setActiveCodePreview({ code: decodedCode, lang: e.detail.lang });
    };
    window.addEventListener('preview-code', handlePreview);
    return () => window.removeEventListener('preview-code', handlePreview);
  }, []);

  // Close history menu on outside click
  useEffect(() => {
    if (!historyMenuId) return;
    const handleClick = (e: MouseEvent) => {
      if (historyMenuRef.current && !historyMenuRef.current.contains(e.target as Node)) {
        setHistoryMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [historyMenuId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

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
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please try using Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    let sessionTranscript = '';
    const startingInput = input.trim() ? input.trim() + ' ' : '';

    recognition.onstart = () => setIsRecording(true);
    
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      sessionTranscript += final;
      setInput(startingInput + sessionTranscript + interim);
    };

    recognition.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error);
      setIsRecording(false);
    };
    
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
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

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length > 0) {
      e.preventDefault();
      setPendingFiles(prev => {
        const newFiles = [...prev, ...files];
        return newFiles.slice(0, 10);
      });
    }
  };

  return (
    <>
      {isConversationalMode && <ConversationalMode onClose={() => setIsConversationalMode(false)} onSendMessage={sendMessage} onStopGeneration={stopGeneration} language={language} />}
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
        {/* Top Spacer for Centered Empty State */}
        {messages.length === 0 && <div style={{ flex: 1 }} />}

        {/* Messages List (Hidden if empty) */}
        {messages.length > 0 && (
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '24px 16px' : '32px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: 32 }}>
              {messages.map(m => <MessageBubble key={m.id} msg={m} isMobile={isMobile} onImageClick={setPreviewImage} language={language} />)}
              <div ref={messagesEndRef} style={{ height: 40, flexShrink: 0 }} />
            </div>
          </div>
        )}

        {/* Empty State Title */}
        {messages.length === 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <h1 style={{ fontFamily: 'var(--font-script)', fontSize: isMobile ? 36 : 48, color: 'var(--text-primary)', margin: 0, fontWeight: 400, display: 'flex', alignItems: 'center', gap: 16 }}>
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                <polygon points="16,1 31,9 31,23 16,31 1,23 1,9" stroke="var(--accent-primary)" strokeWidth="1.2" fill="rgba(249, 115, 22,0.1)" />
                <circle cx="16" cy="16" r="3" fill="var(--accent-primary)" />
                <line x1="16" y1="7" x2="16" y2="13" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.6" />
                <line x1="16" y1="19" x2="16" y2="25" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.6" />
                <line x1="7" y1="12" x2="13" y2="15" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.6" />
                <line x1="19" y1="17" x2="25" y2="20" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.6" />
                <line x1="25" y1="12" x2="19" y2="15" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.6" />
                <line x1="13" y1="17" x2="7" y2="20" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.6" />
              </svg>
              What shall we think through?
            </h1>
          </div>
        )}

        {/* Improved Input Area */}
        <div style={{ 
          padding: isMobile ? '0 16px 24px' : '0 48px 40px', 
          flexShrink: 0, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
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
                      <img onClick={() => setPreviewImage(URL.createObjectURL(pendingFile))} src={URL.createObjectURL(pendingFile)} alt="preview" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 16, border: '1px solid var(--card-border)', cursor: 'pointer' }} />
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
            
            {/* Main Textarea */}
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              onPaste={handlePaste}
              placeholder="Ask ORYN to analyze data, write code, or search the web..."
              style={{
                width: '100%', 
                minHeight: 60, 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-primary)', 
                fontFamily: 'var(--font-body)', 
                fontSize: 15, 
                padding: '4px',
                resize: 'none', 
                outline: 'none', 
                lineHeight: 1.5
              }}
            />

            {/* Bottom Controls Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              {/* Left Side: Upload Menu Button */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  style={{
                    width: 36, height: 36, borderRadius: 18, 
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isMenuOpen ? 'var(--glass-bg-strong)' : 'transparent',
                    transition: 'all 0.2s', 
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => { if (!isMenuOpen) e.currentTarget.style.color = 'var(--text-secondary)' }}
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
                  </div>
                )}
              </div>

              {/* Right Side: Lang, Model, Mic, Send */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => { setIsLangMenuOpen(!isLangMenuOpen); setIsModelMenuOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', padding: '4px 8px', borderRadius: 8, background: isLangMenuOpen ? 'var(--glass-bg-strong)' : 'transparent', transition: 'all 0.2s' }} 
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} 
                    onMouseLeave={e => { if (!isLangMenuOpen) e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    <span>{language}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  
                  {isLangMenuOpen && (
                    <div style={{
                      position: 'absolute', bottom: '100%', right: 0,
                      marginBottom: 12, width: 140, background: 'var(--card-bg)', 
                      backdropFilter: 'blur(20px)', borderRadius: 12, border: '1px solid var(--card-border)',
                      boxShadow: 'var(--shadow-subtle)', overflowY: 'auto', maxHeight: 200, zIndex: 100,
                      animation: 'rise 0.2s ease-out', display: 'flex', flexDirection: 'column'
                    }}>
                      {['English', 'Spanish', 'French', 'Yoruba', 'Hausa', 'Igbo', 'Pidgin', 'Portuguese'].map(lang => (
                        <div 
                          key={lang}
                          onClick={() => { setLanguage(lang); setIsLangMenuOpen(false); }}
                          style={{ padding: '8px 12px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: language === lang ? 'var(--glass-bg-strong)' : 'transparent', borderBottom: '1px solid var(--card-border)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
                          onMouseLeave={e => { if(language !== lang) e.currentTarget.style.background = 'transparent'; else e.currentTarget.style.background = 'var(--glass-bg-strong)'; }}
                        >
                          <span style={{ fontWeight: language === lang ? 600 : 400, color: language === lang ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{lang}</span>
                          {language === lang && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => { setIsModelMenuOpen(!isModelMenuOpen); setIsLangMenuOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', padding: '4px 8px', borderRadius: 8, background: isModelMenuOpen ? 'var(--glass-bg-strong)' : 'transparent', transition: 'all 0.2s' }} 
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} 
                    onMouseLeave={e => { if (!isModelMenuOpen) e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    <span>ORYN 1.0 <span style={{ opacity: 0.6 }}>{model === 'fast' ? 'Fast' : model === 'pro' ? 'Pro' : model === 'apex' ? 'Apex' : 'Logic'}</span></span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  
                  {isModelMenuOpen && (
                    <div style={{
                      position: 'absolute', bottom: '100%', right: 0,
                      marginBottom: 12, width: 220, background: 'var(--card-bg)', 
                      backdropFilter: 'blur(20px)', borderRadius: 12, border: '1px solid var(--card-border)',
                      boxShadow: 'var(--shadow-subtle)', overflow: 'hidden', zIndex: 100,
                      animation: 'rise 0.2s ease-out', display: 'flex', flexDirection: 'column'
                    }}>
                      <div 
                        onClick={() => { setModel('fast'); setIsModelMenuOpen(false); }}
                        style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: model === 'fast' ? 'var(--glass-bg-strong)' : 'transparent', borderBottom: '1px solid var(--card-border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
                        onMouseLeave={e => { if(model !== 'fast') e.currentTarget.style.background = 'transparent'; else e.currentTarget.style.background = 'var(--glass-bg-strong)'; }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>ORYN 1.0 Fast</span>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Text based • Instant</span>
                        </div>
                        {model === 'fast' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <div 
                        onClick={() => { setModel('pro'); setIsModelMenuOpen(false); }}
                        style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: model === 'pro' ? 'var(--glass-bg-strong)' : 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
                        onMouseLeave={e => { if(model !== 'pro') e.currentTarget.style.background = 'transparent'; else e.currentTarget.style.background = 'var(--glass-bg-strong)'; }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>ORYN 1.0 Pro</span>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Vision enabled • Deep Think</span>
                        </div>
                        {model === 'pro' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <div 
                        onClick={() => { setModel('logic'); setIsModelMenuOpen(false); }}
                        style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: model === 'logic' ? 'var(--glass-bg-strong)' : 'transparent', borderTop: '1px solid var(--card-border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
                        onMouseLeave={e => { if(model !== 'logic') e.currentTarget.style.background = 'transparent'; else e.currentTarget.style.background = 'var(--glass-bg-strong)'; }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>ORYN 1.0 Logic</span>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Reasoning • Code • Analytics</span>
                        </div>
                        {model === 'logic' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <div 
                        onClick={() => { setModel('apex'); setIsModelMenuOpen(false); }}
                        style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: model === 'apex' ? 'var(--glass-bg-strong)' : 'transparent', borderTop: '1px solid var(--card-border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
                        onMouseLeave={e => { if(model !== 'apex') e.currentTarget.style.background = 'transparent'; else e.currentTarget.style.background = 'var(--glass-bg-strong)'; }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>ORYN Apex</span>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Mythos Nano • Fallback Safe</span>
                        </div>
                        {model === 'apex' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleMic}
                  style={{
                    width: 36, height: 36, borderRadius: 18, 
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                    transition: 'all 0.2s', 
                    cursor: 'pointer',
                    color: isRecording ? 'var(--danger)' : 'var(--text-secondary)'
                  }}
                  onMouseEnter={e => { if (!isRecording) e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { if (!isRecording) e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                </button>

                {/* Voice Mode Button */}
                <button 
                  onClick={() => setIsConversationalMode(true)}
                  style={{
                    width: 36, height: 36, borderRadius: 18, 
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent',
                    transition: 'all 0.2s', 
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  title="Conversational Voice Mode"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 10v4"></path>
                    <path d="M6 6v12"></path>
                    <path d="M10 3v18"></path>
                    <path d="M14 8v8"></path>
                    <path d="M18 5v14"></path>
                    <path d="M22 10v4"></path>
                  </svg>
                </button>

                {/* Send/Stop Button */}
                <button 
                  onClick={isStreaming ? stopGeneration : handleSend} 
                  disabled={!isStreaming && !input.trim() && pendingFiles.length === 0} 
                  style={{
                    width: 36, height: 36, flexShrink: 0, borderRadius: 18,
                    background: (!isStreaming && !input.trim() && pendingFiles.length === 0) ? 'transparent' : 'var(--accent-primary)',
                    color: (!isStreaming && !input.trim() && pendingFiles.length === 0) ? 'transparent' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: (!isStreaming && !input.trim() && pendingFiles.length === 0) ? 0 : 1, 
                    transition: 'all 0.2s', 
                    boxShadow: (!isStreaming && !input.trim() && pendingFiles.length === 0) ? 'none' : '0 0 15px rgba(249,115,22,0.3)',
                    cursor: (!isStreaming && !input.trim() && pendingFiles.length === 0) ? 'default' : 'pointer',
                    border: 'none',
                    transform: (!isStreaming && !input.trim() && pendingFiles.length === 0) ? 'scale(0.8)' : 'scale(1)'
                  }}
                  onMouseEnter={e => {
                    if (isStreaming || input.trim() || pendingFiles.length > 0) {
                      e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (isStreaming || input.trim() || pendingFiles.length > 0) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    }
                  }}
                >
                  {isStreaming ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="7" y="7" width="10" height="10" rx="1" ry="1"></rect>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateX(-1px)' }}>
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {!isMobile && messages.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                  ORYN can make mistakes. Consider verifying important information.
                </span>
              </div>
            )}
          </div>

          {/* Pills for Empty State */}
          {messages.length === 0 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '850px', width: '100%' }}>
              {[
                { icon: '📊', label: 'Analyze Data', prompt: 'Analyze the recent sales trends and identify key growth opportunities...' },
                { icon: '📈', label: 'Strategy', prompt: 'Help me outline a go-to-market strategy for a new product...' },
                { icon: '✏️', label: 'Draft Email', prompt: 'Draft a professional email to stakeholders regarding Q3 performance...' },
                { icon: '</>', label: 'Code', prompt: 'Write a Python script to extract and summarize customer feedback...' },
                { icon: '💡', label: "ORYN's choice", prompt: 'Generate a summary of the top emerging trends in AI for business...' }
              ].map(item => (
                <button 
                  key={item.label}
                  onClick={() => setInput(item.prompt)}
                  style={{
                    background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Spacer for Centered Empty State */}
        {messages.length === 0 && <div style={{ flex: 1.5 }} />}
      </div>
      
      <input ref={fileInputRef} id="fileInput" type="file" multiple style={{ display: 'none' }} onChange={handleFile} />
      
      {/* Code Preview Pane (Artifacts) */}
      {activeCodePreview && (
        <div style={{
          width: isMobile ? '100%' : '50%',
          maxWidth: isMobile ? '100%' : '800px',
          background: 'var(--bg-primary)',
          borderLeft: '1px solid var(--card-border)',
          display: 'flex', flexDirection: 'column',
          zIndex: isMobile ? 1000 : 10,
          position: isMobile ? 'absolute' : 'relative',
          top: 0, bottom: 0, right: 0,
          boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '16px 24px', 
            borderBottom: '1px solid var(--card-border)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Artifact Preview</h3>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>{activeCodePreview.lang || 'HTML'} • Live Rendering</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={() => {
                  const blob = new Blob([activeCodePreview.code], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                }}
                style={{
                  background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)',
                  color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: 8, fontSize: 12,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--glass-bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--glass-bg-subtle)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                Open Tab
              </button>
              <button 
                onClick={() => setActiveCodePreview(null)}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'var(--text-secondary)', padding: 6, borderRadius: 8,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--glass-bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
          
          <div style={{ flex: 1, background: '#fff', position: 'relative' }}>
            <iframe 
               srcDoc={activeCodePreview.code} 
               style={{ width: '100%', height: '100%', border: 'none', background: '#fff', display: 'block' }} 
               sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
               title="Code Preview"
            />
          </div>
        </div>
      )}

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
          <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
            <button 
              onClick={() => { startNewSession(); setIsHistoryOpen(false); }}
              style={{
                width: '100%', padding: '10px 16px', background: 'var(--accent-primary)', color: '#fff',
                border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20,
                boxShadow: '0 4px 16px rgba(249, 115, 22, 0.25)', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Conversation
            </button>
            
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Recent ({sessions.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sessions.map(s => (
                <div 
                  key={s.id} 
                  style={{
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                    background: activeSessionId === s.id ? 'rgba(249,115,22,0.1)' : 'transparent',
                    border: '1px solid',
                    borderColor: activeSessionId === s.id ? 'rgba(249,115,22,0.2)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'relative'
                  }}
                  onMouseEnter={e => { if (activeSessionId !== s.id) e.currentTarget.style.background = 'var(--glass-bg-subtle)'; }}
                  onMouseLeave={e => { if (activeSessionId !== s.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Session info - clickable area */}
                  <div 
                    onClick={() => { setActiveSessionId(s.id); setIsHistoryOpen(false); }}
                    style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}
                  >
                    {renameId === s.id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { renameSession(s.id, renameValue.trim() || s.title); setRenameId(null); }
                          if (e.key === 'Escape') setRenameId(null);
                        }}
                        onBlur={() => { renameSession(s.id, renameValue.trim() || s.title); setRenameId(null); }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          width: '100%', background: 'var(--glass-bg-subtle)', border: '1px solid var(--accent-primary)',
                          borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', fontSize: 13,
                          fontFamily: 'var(--font-body)', outline: 'none'
                        }}
                      />
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 500, color: activeSessionId === s.id ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
                          {s.title}
                        </div>
                        <div style={{ fontSize: 11, color: activeSessionId === s.id ? 'var(--accent-primary)' : 'var(--text-tertiary)', lineHeight: 1.3, marginTop: 2 }}>
                          {s.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Three-dot menu trigger */}
                  <button
                    onClick={e => { e.stopPropagation(); setHistoryMenuId(historyMenuId === s.id ? null : s.id); }}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer',
                      padding: '4px', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', flexShrink: 0, opacity: historyMenuId === s.id ? 1 : 0.4
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-subtle)'; e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.opacity = historyMenuId === s.id ? '1' : '0.4'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                  </button>

                  {/* Dropdown menu */}
                  {historyMenuId === s.id && (
                    <div
                      ref={historyMenuRef}
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: 'absolute', top: '100%', right: 0, zIndex: 100,
                        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                        borderRadius: 10, padding: '4px', minWidth: 160,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)',
                        animation: 'fadeIn 0.15s ease'
                      }}
                    >
                      {[
                        { label: 'Rename', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', action: () => { setRenameId(s.id); setRenameValue(s.title); setHistoryMenuId(null); } },
                        { label: 'Pin to Top', icon: 'M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1z', action: () => { setHistoryMenuId(null); } },
                        { label: 'Archive', icon: 'M21 8v13H3V8M1 3h22v5H1zM10 12h4', action: () => { setHistoryMenuId(null); } },
                        { label: 'Delete', icon: 'M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2', action: () => { setDeleteConfirmId(s.id); setHistoryMenuId(null); }, danger: true },
                      ].map(item => (
                        <button
                          key={item.label}
                          onClick={item.action}
                          style={{
                            width: '100%', padding: '8px 12px', background: 'none', border: 'none',
                            color: (item as any).danger ? '#ef4444' : 'var(--text-secondary)',
                            cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)',
                            display: 'flex', alignItems: 'center', gap: 10, borderRadius: 8,
                            transition: 'all 0.1s', textAlign: 'left'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = (item as any).danger ? 'rgba(239,68,68,0.1)' : 'var(--glass-bg-subtle)'; e.currentTarget.style.color = (item as any).danger ? '#ef4444' : 'var(--text-primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = (item as any).danger ? '#ef4444' : 'var(--text-secondary)'; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}></path></svg>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog (shadcn-style) */}
      {deleteConfirmId && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.15s ease'
          }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: 16, padding: '28px', maxWidth: 400, width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              animation: 'slideUp 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Delete Conversation</h4>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-tertiary)' }}>This action cannot be undone.</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 24px' }}>
              Are you sure you want to permanently delete <strong style={{ color: 'var(--text-primary)' }}>"{ sessions.find(s => s.id === deleteConfirmId)?.title || 'this conversation' }"</strong>? All messages will be lost.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: 'var(--glass-bg-subtle)', color: 'var(--text-secondary)',
                  border: '1px solid var(--card-border)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteSession(deleteConfirmId); setDeleteConfirmId(null); }}
                style={{
                  padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: '#ef4444', color: '#fff',
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  boxShadow: '0 4px 14px rgba(239,68,68,0.3)', transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      
      {/* Fullscreen Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: 40, cursor: 'zoom-out', animation: 'fadeIn 0.2s ease-out' }}
        >
          <img src={previewImage} alt="Fullscreen Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', cursor: 'default' }} onClick={e => e.stopPropagation()} />
          <button 
            onClick={() => setPreviewImage(null)}
            style={{ position: 'absolute', top: 24, right: 32, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
    </>
  );
}
