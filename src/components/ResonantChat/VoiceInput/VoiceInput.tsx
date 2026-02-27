import React, { useState, useRef, useEffect } from 'react';
import styles from './VoiceInput.module.css';

// Custom SVG Icons
const MicrophoneIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const MicrophoneOffIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const RecordingIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  onInterimTranscriptChange?: (text: string) => void;
  renderInterimTranscript?: boolean;
  iconSize?: number;
  disabled?: boolean;
  forceListening?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onListeningChange,
  onInterimTranscriptChange,
  renderInterimTranscript = true,
  iconSize = 18,
  disabled = false,
  forceListening,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(isListening);
  const prevForceListeningRef = useRef<boolean | undefined>(forceListening);
  
  // Store callbacks in refs to avoid stale closures
  const onTranscriptRef = useRef(onTranscript);
  const onListeningChangeRef = useRef(onListeningChange);
  const onInterimTranscriptChangeRef = useRef(onInterimTranscriptChange);
  
  // Keep refs in sync
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);
  
  useEffect(() => {
    onListeningChangeRef.current = onListeningChange;
  }, [onListeningChange]);
  
  useEffect(() => {
    onInterimTranscriptChangeRef.current = onInterimTranscriptChange;
  }, [onInterimTranscriptChange]);
  
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Initialize speech recognition only once
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('🎤 Speech recognition not supported in this browser');
      setIsSupported(false);
      return;
    }

    console.log('🎤 Initializing speech recognition...');
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

      console.log('🎤 Speech result - interim:', interim, 'final:', final);
      setInterimTranscript(interim);
      onInterimTranscriptChangeRef.current?.(interim);
      
      if (final) {
        console.log('🎤 Final transcript received:', final);
        // Use ref to get latest callback
        onTranscriptRef.current(final);
        setInterimTranscript('');
      onInterimTranscriptChangeRef.current?.('');
            onInterimTranscriptChangeRef.current?.('');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('🎤 Speech recognition error:', event.error);
      setIsListening(false);
      onListeningChangeRef.current?.(false);
    };

    recognition.onend = () => {
      console.log('🎤 Recognition ended, isListening:', isListeningRef.current);
      if (isListeningRef.current) {
        // Restart if still supposed to be listening
        try {
          console.log('🎤 Restarting recognition...');
          recognition.start();
        } catch (e) {
          console.error('🎤 Failed to restart:', e);
          setIsListening(false);
          onListeningChangeRef.current?.(false);
        }
      }
    };

    recognitionRef.current = recognition;
    console.log('🎤 Speech recognition initialized successfully');

    return () => {
      if (recognitionRef.current) {
        console.log('🎤 Cleaning up speech recognition');
        recognitionRef.current.stop();
      }
    };
  }, []); // Empty deps - only initialize once

  const toggleListening = async (targetState?: boolean) => {
    console.log('🎤 Toggle listening clicked, current state:', isListening);
    const shouldStart = typeof targetState === 'boolean' ? targetState : !isListening;
    
    if (!recognitionRef.current) {
      console.error('🎤 Speech recognition not initialized, trying to reinitialize...');
      // Try to reinitialize
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
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
          console.log('🎤 Speech result - interim:', interim, 'final:', final);
          setInterimTranscript(interim);
      onInterimTranscriptChangeRef.current?.(interim);
          if (final) {
            console.log('🎤 Final transcript received:', final);
            onTranscriptRef.current(final);
        setInterimTranscript('');
        onInterimTranscriptChangeRef.current?.('');
      }
        };
        
        recognition.onerror = (event: any) => {
          console.error('🎤 Speech recognition error:', event.error);
          setIsListening(false);
          onListeningChangeRef.current?.(false);
        };
        
        recognition.onend = () => {
          console.log('🎤 Recognition ended, isListening:', isListeningRef.current);
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch (e) {
              setIsListening(false);
              onListeningChangeRef.current?.(false);
            }
          }
        };
        
        recognitionRef.current = recognition;
        console.log('🎤 Speech recognition reinitialized');
      } else {
        alert('Speech recognition not supported in this browser');
        return;
      }
    }

    if (!shouldStart) {
      console.log('🎤 Stopping voice input...');
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('🎤 Stop error (ignored):', e);
      }
      setIsListening(false);
      isListeningRef.current = false;
      onListeningChangeRef.current?.(false);
      setInterimTranscript('');
            onInterimTranscriptChangeRef.current?.('');
    } else {
      try {
        // Request microphone permission first
        console.log('🎤 Requesting microphone permission...');
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('🎤 Microphone permission granted, starting recognition...');
        
        // Stop any existing recognition first
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore - might not be running
        }
        
        // Small delay before starting
        await new Promise(resolve => setTimeout(resolve, 100));
        
        recognitionRef.current.start();
        setIsListening(true);
        isListeningRef.current = true;
        onListeningChangeRef.current?.(true);
        console.log('🎤 Voice input started - speak now!');
      } catch (e: any) {
        console.error('🎤 Failed to start speech recognition:', e);
        if (e.name === 'NotAllowedError') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (e.name === 'NotFoundError') {
          alert('No microphone found. Please connect a microphone.');
        } else if (e.message?.includes('already started')) {
          // Already running, just update state
          setIsListening(true);
          isListeningRef.current = true;
        } else {
          alert('Failed to start voice input: ' + e.message);
        }
      }
    }
  };

  useEffect(() => {
    if (typeof forceListening !== 'boolean') return;
    if (prevForceListeningRef.current === forceListening) return;

    prevForceListeningRef.current = forceListening;

    if (disabled && forceListening) {
      return;
    }

    void toggleListening(forceListening);
  }, [forceListening, disabled]);

  if (!isSupported) {
    return (
      <button
        className={`${styles.voiceButton} ${styles.unsupported}`}
        disabled
        title="Voice input not supported in this browser"
      >
        <MicrophoneOffIcon size={iconSize} />
      </button>
    );
  }

  return (
    <div className={styles.container}>
      <button
        className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`}
        onClick={() => {
          void toggleListening();
        }}
        disabled={disabled}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? <RecordingIcon size={iconSize} /> : <MicrophoneIcon size={iconSize} />}
      </button>
      {renderInterimTranscript && interimTranscript && (
        <div className={styles.interimTranscript}>
          {interimTranscript}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
