import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from './ui/use-toast';
import Orb from './Orb';

export function ConversationalMode({ 
  onClose,
  onSendMessage
}: { 
  onClose: () => void,
  onSendMessage: (text: string, files: any[]) => Promise<string | undefined>
}) {
  const [mode, setMode] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 1

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const aiAudioRef = useRef<HTMLAudioElement | null>(null);
  const aiSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const cleanupAudio = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
    }
    if (aiAudioRef.current) {
        aiAudioRef.current.pause();
        aiAudioRef.current.src = "";
    }
    // Cannot close context if we want to reuse it quickly, let's keep it open
    setAudioLevel(0);
  };

  useEffect(() => {
    toast({ title: "Conversational Mode", description: "Audio engine initialized." });
    return cleanupAudio;
  }, []);

  const updateAudioLevel = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) sum += dataArrayRef.current[i];
    const avg = sum / dataArrayRef.current.length;
    // Map avg (0-255) to 0-1
    const level = Math.min(avg / 128, 1);
    setAudioLevel(prev => prev * 0.8 + level * 0.2); // smooth easing
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const startListening = async () => {
    cleanupAudio();
    setMode('listening');
    setTranscript('');
    toast({ title: "Listening", description: "Speak now, Oryn is listening to you." });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      updateAudioLevel();
    } catch (err) {
      toast({ title: "Microphone Error", description: "Could not access microphone.", variant: 'destructive' });
      setMode('idle');
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTrans += event.results[i][0].transcript;
        }
        if (finalTrans) {
          setTranscript(finalTrans);
          clearTimeout((window as any).silenceTimeout);
          (window as any).silenceTimeout = setTimeout(() => {
            handleStopListeningAndThink(finalTrans);
          }, 1500);
        }
      };
      recognition.start();
    } else {
        toast({ title: "Not Supported", description: "Speech recognition not supported in this browser.", variant: 'destructive' });
        setTimeout(() => handleStopListeningAndThink("Hello ORYN, can you help me with my business model?"), 3000);
    }
  };

  const handleStopListeningAndThink = async (finalText: string) => {
    cleanupAudio();
    setMode('thinking');
    
    // Actually call the AI via onSendMessage
    try {
      const responseText = await onSendMessage(finalText, []);
      if (responseText) {
        startSpeaking(responseText);
      } else {
        startSpeaking("I'm sorry, I didn't get a valid response. Let's try again.");
      }
    } catch (error) {
      console.error(error);
      startSpeaking("I'm sorry, I'm having trouble connecting right now.");
    }
  };

  const startSpeaking = async (aiResponseText: string) => {
    setMode('speaking');
    setTranscript('');
    
    const aiResponse = aiResponseText.replace(/[*#`]/g, '').replace(/__CODE_BLOCK_\d+__/g, 'Code block snippet.');
    
    const voiceId = "UgBBYS2sOqTuMpoF3BR0";
    const apiKey = (import.meta as any).env.VITE_ELEVENLABS_API_KEY || '';

    try {
        let audioSrc = "";
        
        if (apiKey) {
            const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: { 'Accept': 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': apiKey },
                body: JSON.stringify({ text: aiResponse, model_id: "eleven_monolingual_v1", voice_settings: { stability: 0.5, similarity_boost: 0.5 } })
            });
            if (res.ok) {
                const blob = await res.blob();
                audioSrc = URL.createObjectURL(blob);
            }
        }
        
        if (!audioSrc) {
             simulateSpeakingVisuals(aiResponse);
             return;
        }

        const audio = new Audio(audioSrc);
        audio.crossOrigin = "anonymous";
        aiAudioRef.current = audio;

        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (!aiSourceNodeRef.current) {
             aiSourceNodeRef.current = audioContextRef.current.createMediaElementSource(audio);
        }
        
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        aiSourceNodeRef.current.disconnect();
        aiSourceNodeRef.current.connect(analyser);
        analyser.connect(audioContextRef.current.destination);
        
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        audio.onplay = () => updateAudioLevel();
        audio.onended = () => {
            cleanupAudio();
            startListening(); // seamlessly loop back into the conversation!
        };
        
        await audio.play();

    } catch (e) {
        console.error("AI Speak error", e);
        simulateSpeakingVisuals(aiResponse);
    }
  };

  const simulateSpeakingVisuals = (text: string) => {
     const utterance = new SpeechSynthesisUtterance(text);
     const interval = setInterval(() => {
         setAudioLevel(0.1 + Math.random() * 0.7);
     }, 100);
     utterance.onend = () => {
         clearInterval(interval);
         cleanupAudio();
         startListening(); // seamlessly loop back
     };
     window.speechSynthesis.speak(utterance);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(10,10,12,0.85)',
        zIndex: 9999, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', color: '#fff',
        fontFamily: 'var(--font-body)'
      }}
    >
      <button onClick={onClose} style={{
          position: 'absolute', top: 32, right: 32, width: 48, height: 48, 
          borderRadius: 24, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'
      }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      {/* Title */}
      <div style={{ position: 'absolute', top: 40, fontFamily: 'var(--font-script)', fontSize: 24, color: 'var(--accent-primary)' }}>
        Oryn AI
      </div>

      {/* The Central Orb Container */}
      <div style={{ position: 'relative', width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Orb 
          hoverIntensity={0.2 + audioLevel * 2.0} 
          rotateOnHover={true} 
          hue={mode === 'listening' ? -60 : mode === 'thinking' ? 0 : mode === 'speaking' ? 120 : 0} 
          forceHoverState={mode !== 'idle' || audioLevel > 0.1}
          backgroundColor="transparent"
        />
      </div>

      <div style={{ marginTop: 80, textAlign: 'center', minHeight: 120 }}>
        <h2 style={{ fontSize: 28, fontWeight: 500, opacity: 0.9, marginBottom: 16, letterSpacing: '-0.02em' }}>
            {mode === 'idle' && 'Tap the orb to start talking'}
            {mode === 'listening' && 'Listening...'}
            {mode === 'thinking' && 'Thinking...'}
            {mode === 'speaking' && 'Oryn AI'}
        </h2>
        <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.7, y: 0 }}
            key={transcript}
            style={{ fontSize: 20, maxWidth: 600, margin: '0 auto', lineHeight: 1.5 }}
        >
            {transcript || (mode === 'idle' && 'Experience a seamless voice conversation.')}
        </motion.p>
      </div>

      {mode === 'idle' && (
          <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startListening} 
              style={{
                  marginTop: 40, padding: '16px 48px', borderRadius: 32, fontSize: 18, fontWeight: 600,
                  background: '#fff', color: '#000', border: 'none', cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(255,255,255,0.2)'
              }}
          >
              Start Conversation
          </motion.button>
      )}
    </motion.div>
  );
}
