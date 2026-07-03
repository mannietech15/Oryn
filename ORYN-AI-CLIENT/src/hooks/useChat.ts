import { useState, useCallback, useRef, useEffect } from 'react';
import { streamChat, analyzeFile } from '../api/oryn';
import type { Message, Task, SessionStats, ChatFeatures } from '../types';

function genId() {
  return Math.random().toString(36).slice(2);
}

function extractTasks(text: string): { clean: string; tasks: string[] } {
  const match = text.match(/\{"tasks":\s*\[([^\]]*)\]\}/);
  if (!match) return { clean: text, tasks: [] };
  try {
    const parsed = JSON.parse(match[0]) as { tasks: string[] };
    return { clean: text.replace(match[0], '').trim(), tasks: parsed.tasks ?? [] };
  } catch {
    return { clean: text, tasks: [] };
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
    setSessions(prev => [{ id: newId, title: 'New Conversation', date: new Date() }, ...prev]);
    setMessagesMap(prev => ({
      ...prev,
      [newId]: []
    }));
    setActiveSessionId(newId);
    setTasks([]);
    setPendingFiles([]);
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
            const analysis = await analyzeFile(files[0], text || undefined);
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

            const stream = streamChat(history, features.webSearch, features.taskExtract);
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
              } else if (chunk.type === 'error') {
                throw new Error(chunk.message || 'Unknown stream error');
              }
            }
            const { clean, tasks: extracted } = extractTasks(fullText);
            if (features.taskExtract) extracted.forEach(addTask);
            if (clean !== fullText) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: clean } : m
              ));
            }
          }
          break; // Success! Break out of the retry loop.
        } catch (error: any) {
          const errMsg = error.message || '';
          const isTransient = errMsg.includes('terminated') || errMsg.includes('Connection') || errMsg.includes('upstream') || errMsg.includes('fetch');
          
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
        errorContent = '***⚠ API AUTHENTICATION ERROR***<br/><br/>OpenRouter is reporting that your **API Key is invalid**. Please check your `.env` file in `ORYN-AI-SERVER`, ensure there are no trailing spaces, and **restart the server**.';
      } else if (isRateLimit) {
        errorContent = '***⏳ RATE LIMITED***<br/><br/>The free AI model is temporarily rate-limited. Please **wait 30 seconds** and try again. This is normal for free-tier models.';
      } else if (err.message?.includes('terminated')) {
        errorContent = '***⚠ CONNECTION DROPPED***<br/><br/>The connection to the AI provider was dropped unexpectedly after multiple retries. Please try sending your message again.';
      } else if (err.message && !err.message.includes('fetch')) {
        errorContent = `***⚠ AI ERROR***<br/><br/>${err.message}`;
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
  }, [isStreaming, messages, pendingFiles, features, addTask, activeSessionId]);

  const stopGeneration = useCallback(() => {
    abortRef.current = true;
    setIsStreaming(false);
  }, []);

  return {
    messages, tasks, stats, features, isStreaming, pendingFiles, sessions, activeSessionId,
    sendMessage, stopGeneration, toggleTask, toggleFeature, setPendingFiles, resetChat, startNewSession, setActiveSessionId
  };
}
