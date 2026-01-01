import React, { useState, useRef, useEffect } from 'react';
import styles from './VoiceInput.module.css';

// Custom SVG Icons
const MicrophoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const MicrophoneOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const RecordingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onListeningChange,
  disabled = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      
      if (final) {
        onTranscript(final);
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      onListeningChange?.(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart if still supposed to be listening
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
          onListeningChange?.(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, onListeningChange, isListening]);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      console.error('🎤 Speech recognition not initialized');
      return;
    }

    if (isListening) {
      console.log('🎤 Stopping voice input...');
      recognitionRef.current.stop();
      setIsListening(false);
      onListeningChange?.(false);
      setInterimTranscript('');
    } else {
      try {
        // Request microphone permission first
        console.log('🎤 Requesting microphone permission...');
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('🎤 Microphone permission granted, starting recognition...');
        
        recognitionRef.current.start();
        setIsListening(true);
        onListeningChange?.(true);
        console.log('🎤 Voice input started - speak now!');
      } catch (e: any) {
        console.error('🎤 Failed to start speech recognition:', e);
        if (e.name === 'NotAllowedError') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (e.name === 'NotFoundError') {
          alert('No microphone found. Please connect a microphone.');
        } else {
          alert('Failed to start voice input: ' + e.message);
        }
      }
    }
  };

  if (!isSupported) {
    return (
      <button
        className={`${styles.voiceButton} ${styles.unsupported}`}
        disabled
        title="Voice input not supported in this browser"
      >
        <MicrophoneOffIcon />
      </button>
    );
  }

  return (
    <div className={styles.container}>
      <button
        className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`}
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? <RecordingIcon /> : <MicrophoneIcon />}
      </button>
      {interimTranscript && (
        <div className={styles.interimTranscript}>
          {interimTranscript}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
