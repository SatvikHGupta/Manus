import { useCallback, useEffect, useRef, useState } from 'react';

const SpeechRecognitionCtor = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

// Only committed (isFinal) speech segments are surfaced - no interim/ghost
// preview - so the caller only ever inserts confirmed text, keeping this
// simple to wire into an existing cursor-insertion flow (see TextEditor's
// insertTag for the same pattern).
export function useSpeechToText(onFinalResult) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  const supported = !!SpeechRecognitionCtor;

  useEffect(() => {
    if (!supported) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

    recognition.onresult = (e) => {
      let finalChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalChunk += e.results[i][0].transcript;
      }
      if (finalChunk.trim()) onFinalResultRef.current?.(finalChunk.trim());
    };
    recognition.onerror = (e) => {
      const messages = {
        'not-allowed': 'Microphone access was blocked - allow it in your browser settings to dictate.',
        'service-not-allowed': 'Microphone access was blocked - allow it in your browser settings to dictate.',
        'no-speech': 'No speech detected.',
        'audio-capture': 'No microphone was found.',
        'network': 'Dictation needs an internet connection.',
      };
      setError(messages[e.error] || 'Dictation stopped unexpectedly.');
      setListening(false);
    };
    recognition.onend   = () => setListening(false);

    recognitionRef.current = recognition;
    return () => { try { recognition.stop(); } catch { /* ignore */ } };
  }, [supported]);

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    setError(null);
    try { recognitionRef.current.start(); setListening(true); } catch { /* already running */ }
  }, [listening]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch { /* ignore */ }
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop(); else start();
  }, [listening, start, stop]);

  return { supported, listening, start, stop, toggle, error };
}
