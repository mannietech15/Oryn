import { useState, useCallback, useRef } from 'react';
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
  const [sessions, setSessions] = useState<{ id: string, title: string, date: Date }[]>([
    { id: '1', title: 'Q1 Revenue Deep Dive', date: new Date() },
    { id: '2', title: 'Marketing Strategy APAC', date: new Date(Date.now() - 86400000) },
    { id: '3', title: 'Team Performance Analysis', date: new Date(Date.now() - 172800000) },
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('1');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: genId(),
      role: 'assistant',
      content: "Hello! I'm **ORYN**, your real-time business AI. I can answer questions, search the web, analyze files, and extract tasks automatically. What would you like to work on?",
      timestamp: new Date(),
    },
  ]);
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

  const startNewSession = useCallback(() => {
    const newId = genId();
    setSessions(prev => [{ id: newId, title: 'New Conversation', date: new Date() }, ...prev]);
    setActiveSessionId(newId);
    setMessages([
      {
        id: genId(),
        role: 'assistant',
        content: "New intelligence session started. How can I assist you?",
        timestamp: new Date(),
      },
    ]);
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
    setMessages([
      {
        id: genId(),
        role: 'assistant',
        content: "Hello! I'm **ORYN**, your real-time business AI. I can answer questions, search the web, analyze files, and extract tasks automatically. What would you like to work on?",
        timestamp: new Date(),
      },
    ]);
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

      setStats(prev => ({ ...prev, messages: prev.messages + 1 }));
    } catch (err: any) {
      const isAuthError = err.message?.includes('API key not valid') || err.message?.includes('INVALID_ARGUMENT') || err.message?.includes('401');
      const isRateLimit = err.message?.includes('rate-limit') || err.message?.includes('429');
      
      let errorContent: string;
      if (isAuthError) {
        errorContent = '***⚠ API AUTHENTICATION ERROR***<br/><br/>OpenRouter is reporting that your **API Key is invalid**. Please check your `.env` file in `ORYN-AI-SERVER`, ensure there are no trailing spaces, and **restart the server**.';
      } else if (isRateLimit) {
        errorContent = '***⏳ RATE LIMITED***<br/><br/>The free AI model is temporarily rate-limited. Please **wait 30 seconds** and try again. This is normal for free-tier models.';
      } else if (err.message && !err.message.includes('fetch')) {
        errorContent = `***⚠ AI ERROR***<br/><br/>${err.message}`;
      } else {
        errorContent = '***⚠ CONNECTION ERROR***<br/><br/>I am currently unable to reach my core servers. Please ensure that the **ORYN-AI-SERVER** is running on your local machine.';
      }

      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: errorContent } : m
      ));
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, messages, pendingFiles, features, addTask]);

  return {
    messages, tasks, stats, features, isStreaming, pendingFiles, sessions, activeSessionId,
    sendMessage, toggleTask, toggleFeature, setPendingFiles, resetChat, startNewSession, setActiveSessionId
  };
}
