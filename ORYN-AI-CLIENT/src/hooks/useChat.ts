import { useState, useCallback, useRef, useEffect } from 'react';
import { streamChat, analyzeFile } from '../api/oryn';
import type { Message, Task, SessionStats, ChatFeatures } from '../types';

function genId() {
  return Math.random().toString(36).slice(2);
}

function extractTasks(text: string): { clean: string; tasks: string[] } {
  const match = text.match(/(?:\n|^)?(?:\**Tasks?:?\**\s*)?(?:```(?:json)?\s*)?\{"tasks":\s*\[(.*?)\]\}(?:\s*```)?/is);
  if (!match) return { clean: text, tasks: [] };
  try {
    const jsonMatch = match[0].match(/\{"tasks":\s*\[(.*?)\]\}/is);
    if (!jsonMatch) return { clean: text, tasks: [] };
    const parsed = JSON.parse(jsonMatch[0]) as { tasks: string[] };
    return { clean: text.replace(match[0], '').trim(), tasks: parsed.tasks ?? [] };
  } catch {
    return { clean: text, tasks: [] };
  }
}

function extractEmailAction(text: string): { clean: string; email: any | null } {
  const match = text.match(/(?:\n|^)?(?:```(?:json)?\s*)?\{"email_action":\s*"send"[\s\S]*?\}(?:\s*```)?/is);
  if (!match) return { clean: text, email: null };
  try {
    const jsonStr = match[0].replace(/```json/ig, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    if (parsed.email_action === 'send') {
      return { clean: text.replace(match[0], '').trim(), email: parsed };
    }
    return { clean: text, email: null };
  } catch (e) {
    console.error("Failed to parse email action", e);
    return { clean: text, email: null };
  }
}

export function useChat() {
  const [sessions, setSessions] = useState<{ id: string, title: string, date: Date }[]>(() => {
    const saved = localStorage.getItem('oryn_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.forEach((s: any) => s.date = new Date(s.date));
        return parsed;
      } catch {}
    }
    return [{ id: '1', title: 'New Conversation', date: new Date() }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return localStorage.getItem('oryn_active_session') || '1';
  });

  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('oryn_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.values(parsed).forEach((msgs: any) => {
          msgs.forEach((m: any) => m.timestamp = new Date(m.timestamp));
        });
        return parsed;
      } catch {}
    }
    return {
      '1': []
    };
  });

  const messages = messagesMap[activeSessionId] || [];

  const setMessages = useCallback((updater: Message[] | ((prev: Message[]) => Message[])) => {
    setMessagesMap(prevMap => {
      const prevMsgs = prevMap[activeSessionId] || [];
      const newMsgs = typeof updater === 'function' ? updater(prevMsgs) : updater;
      return { ...prevMap, [activeSessionId]: newMsgs };
    });
  }, [activeSessionId]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: genId(), text: 'Review Q1 revenue report', done: true, createdAt: new Date() },
    { id: genId(), text: 'Enterprise upsell pipeline', done: false, createdAt: new Date() },
    { id: genId(), text: 'APAC expansion brief', done: false, createdAt: new Date() },
  ]);
  const [stats, setStats] = useState<SessionStats>({ messages: 1, tasks: 3, files: 0 });
  const [features, setFeatures] = useState<ChatFeatures>({ voice: true, taskExtract: true, webSearch: true });
  const [model, setModel] = useState<'fast' | 'pro'>('fast');
  const [language, setLanguage] = useState<string>('English');
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const abortRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('oryn_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('oryn_active_session', activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem('oryn_messages', JSON.stringify(messagesMap));
  }, [messagesMap]);

  const startNewSession = useCallback(() => {
    const newId = genId();
    setSessions(prev => {
      const updated = [{ id: newId, title: 'New Conversation', date: new Date() }, ...prev];
      // Enforce 30-session cap — auto-prune oldest
      if (updated.length > 30) {
        const removed = updated.slice(30);
        removed.forEach(s => {
          setMessagesMap(prevMap => {
            const copy = { ...prevMap };
            delete copy[s.id];
            return copy;
          });
        });
        return updated.slice(0, 30);
      }
      return updated;
    });
    setMessagesMap(prev => ({
      ...prev,
      [newId]: []
    }));
    setActiveSessionId(newId);
    setTasks([]);
    setPendingFiles([]);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      // If we deleted the active session, switch to the first remaining one or create a new one
      if (sessionId === activeSessionId) {
        if (filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        } else {
          const newId = genId();
          filtered.push({ id: newId, title: 'New Conversation', date: new Date() });
          setMessagesMap(prevMap => ({ ...prevMap, [newId]: [] }));
          setActiveSessionId(newId);
        }
      }
      return filtered;
    });
    // Clean up messages for deleted session
    setMessagesMap(prev => {
      const copy = { ...prev };
      delete copy[sessionId];
      return copy;
    });
  }, [activeSessionId]);

  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, title: newTitle } : s
    ));
  }, []);

  const addTask = useCallback((text: string) => {
    const t: Task = { id: genId(), text, done: false, createdAt: new Date() };
    setTasks(prev => [...prev, t]);
    setStats(prev => ({ ...prev, tasks: prev.tasks + 1 }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  const toggleFeature = useCallback((key: keyof ChatFeatures) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setTasks([
      { id: genId(), text: 'Review Q1 revenue report', done: true, createdAt: new Date() },
      { id: genId(), text: 'Enterprise upsell pipeline', done: false, createdAt: new Date() },
      { id: genId(), text: 'APAC expansion brief', done: false, createdAt: new Date() },
    ]);
    setStats({ messages: 1, tasks: 3, files: 0 });
    setPendingFiles([]);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (isStreaming) return;
    if (!text.trim() && pendingFiles.length === 0) return;

    const files = [...pendingFiles];
    setPendingFiles([]);

    // Rename session if it's new
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId && s.title === 'New Conversation') {
        const titleText = text.trim() || (files.length > 0 ? files[0].name : 'Untitled');
        const newTitle = titleText.length > 28 ? titleText.substring(0, 25) + '...' : titleText;
        return { ...s, title: newTitle };
      }
      return s;
    }));

    // Add user message
    const userMsg: Message = {
      id: genId(),
      role: 'user',
      content: text || (files.length > 0 && files.every(f => f.type.startsWith('image/')) ? '' : files.length > 0 ? `Analyze ${files.length} file(s)` : ''),
      timestamp: new Date(),
      attachedFiles: files.map(f => ({
        name: f.name,
        isImage: f.type.startsWith('image/'),
        url: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
      }))
    };
    setMessages(prev => [...prev, userMsg]);
    setStats(prev => ({ ...prev, messages: prev.messages + 1, files: prev.files + files.length }));

    // Add streaming assistant message
    const assistantId = genId();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);
    setIsStreaming(true);
    abortRef.current = false;

    try {
      let fullText = '';
      let retryCount = 0;
      const MAX_RETRIES = 2;

      while (retryCount <= MAX_RETRIES) {
        try {
          if (files.length > 0) {
            // File analysis route
            // We only analyze the first file for now if there are multiple, to match backend API limit
            const analysis = await analyzeFile(files[0], text || undefined, model, language);
            const { clean, tasks: extracted } = extractTasks(analysis);
            fullText = clean;
            if (features.taskExtract) extracted.forEach(addTask);
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, content: fullText } : m
            ));
          } else {
            // Streaming chat route
            const history = [...messages, userMsg]
              .filter(m => m.content)
              .map(m => ({ role: m.role, content: m.content }));

            const abortController = new AbortController();
            abortRef.current = false;
            // Hook up the global stop button to this fetch controller
            // Note: We use a hacky way to override the abortRef dynamically
            // because we need to cancel the actual fetch.
            (window as any).__abortChat = () => {
              abortRef.current = true;
              abortController.abort();
            };

            const stream = streamChat(history, features.webSearch, features.taskExtract, model, language, abortController.signal);
            let hasReceivedData = false;
            
            for await (const chunk of stream) {
              if (abortRef.current) break;
              if (chunk.type === 'text' && chunk.text) {
                if (!hasReceivedData) {
                  hasReceivedData = true;
                  fullText = ''; // Ensure text starts clean
                }
                fullText += chunk.text;
                setMessages(prev => prev.map(m =>
                  m.id === assistantId ? { ...m, content: fullText } : m
                ));
              } else if (chunk.type === 'status' && chunk.text) {
                 if (!hasReceivedData) {
                    setMessages(prev => prev.map(m =>
                      m.id === assistantId ? { ...m, content: `_${chunk.text}_` } : m
                    ));
                 }
              } else if (chunk.type === 'error') {
                throw new Error(chunk.message || 'Unknown stream error');
              }
            }
            const { clean, tasks: extracted } = extractTasks(fullText);
            if (features.taskExtract) extracted.forEach(addTask);
            
            const { clean: cleanEmail, email } = extractEmailAction(clean);
            let finalContent = cleanEmail;

            if (email) {
              try {
                const res = await fetch('/api/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(email)
                });
                if (res.ok) {
                  const data = await res.json();
                  if (data.previewUrl) {
                    finalContent += `\n\n📧 **Email successfully sent!** ([View Preview](${data.previewUrl}))`;
                  } else {
                    finalContent += '\n\n📧 **Email successfully sent!**';
                  }
                } else {
                  finalContent += '\n\n❌ **Failed to send email.**';
                }
              } catch (e) {
                finalContent += '\n\n❌ **Failed to send email.**';
              }
            }
            
            if (abortRef.current) {
              finalContent = finalContent ? `${finalContent}\n\n_[Request cancelled]_` : "_Request cancelled by the user._";
            }
            
            if (finalContent !== fullText || abortRef.current) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: finalContent } : m
              ));
            }
            fullText = finalContent;
          }
          break; // Success! Break out of the retry loop.
        } catch (error: any) {
          if (error.name === 'AbortError' || error.message?.includes('aborted')) {
            // Let the outer loop finish since we already handled abort logic
            let finalContent = fullText ? `${fullText}\n\n_[Request cancelled]_` : "_Request cancelled by the user._";
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, content: finalContent } : m
            ));
            return finalContent;
          }
          
          const errMsg = error.message || '';
          const isTransient = errMsg.includes('terminated') || errMsg.includes('Connection') || errMsg.includes('upstream') || errMsg.includes('fetch') || errMsg.toLowerCase().includes('time');
          
          if (isTransient && retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`[Chat] Transient error, retrying (${retryCount}/${MAX_RETRIES})...`);
            await new Promise(r => setTimeout(r, 1500 * retryCount)); // Backoff
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, content: '' } : m // Reset message content for retry
            ));
            continue;
          }
          throw error; // Rethrow if we exceeded retries or it's not transient
        }
      }

      setStats(prev => ({ ...prev, messages: prev.messages + 1 }));
      return fullText;
    } catch (err: any) {
      const isAuthError = err.message?.includes('API key not valid') || err.message?.includes('INVALID_ARGUMENT') || err.message?.includes('401');
      const isRateLimit = err.message?.includes('rate-limit') || err.message?.includes('429');
      
      let errorContent: string;
      if (isAuthError) {
        errorContent = '***⚠ API AUTHENTICATION ERROR***<br/><br/>NVIDIA NIM is reporting that your **API Key is invalid**. Please check your `.env` file in `ORYN-AI-SERVER`, ensure there are no trailing spaces, and **restart the server**.';
      } else if (isRateLimit) {
        errorContent = '***⏳ RATE LIMITED***<br/><br/>The free AI model is temporarily rate-limited. Please **wait 30 seconds** and try again. This is normal for free-tier models.';
      } else if (err.message?.includes('terminated')) {
        errorContent = '***⚠ CONNECTION DROPPED***<br/><br/>The connection to the AI provider was dropped unexpectedly after multiple retries. Please try sending your message again.';
      } else if (err.message && !err.message.includes('fetch')) {
        // Hide internal ReferenceErrors or server-side variable leaks from the user
        const isInternalError = err.message.includes('is not defined') || err.message.includes('Cannot read properties of') || err.message.includes('Unexpected token');
        
        if (isInternalError) {
          errorContent = `***⚠ SYSTEM ERROR***<br/><br/>An internal server error occurred while processing your request. Our engineering team has been notified. Please try again later.`;
        } else {
          errorContent = `***⚠ AI ERROR***<br/><br/>${err.message}`;
        }
      } else {
        errorContent = '***⚠ CONNECTION ERROR***<br/><br/>I am currently unable to reach my core servers. Please ensure that the **ORYN-AI-SERVER** is running on your local machine.';
      }

      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: errorContent } : m
      ));
      return errorContent;
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, messages, pendingFiles, features, addTask, activeSessionId, language]);

  const stopGeneration = useCallback(() => {
    abortRef.current = true;
    setIsStreaming(false);
    if ((window as any).__abortChat) {
      try {
        (window as any).__abortChat();
      } catch (e) {}
    }
  }, []);

  return {
    messages, tasks, stats, features, isStreaming, pendingFiles, sessions, activeSessionId, model, language,
    sendMessage, stopGeneration, toggleTask, toggleFeature, setPendingFiles, resetChat, startNewSession, setActiveSessionId,
    deleteSession, renameSession, setSessions, setModel, setLanguage
  };
}
