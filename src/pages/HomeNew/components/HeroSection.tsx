import React, { Suspense, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '../HomeNew.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';
import ChatInputBar from '@/components/ResonantChat/ChatInputBar/ChatInputBar';
import { sendResonantMessage } from '@/api/resonantChat';

// Lazy load Vision Pro aesthetic particle sphere
const ThreeParticleSphere = React.lazy(() => import('@/components/features/landing/ThreeParticleSphere'));

export const HeroSection = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isChatFocused, setIsChatFocused] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
    const messagesRef = useRef<HTMLDivElement | null>(null);
    
    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
    }, []);

    const isChatActive = useMemo(() => isChatFocused || messages.length > 0, [isChatFocused, messages.length]);

    useEffect(() => {
        const el = messagesRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, [messages.length]);

    useEffect(() => {
        document.body.classList.toggle('landing-chat-active', isChatActive);
        window.dispatchEvent(new CustomEvent('rg:landing-chat-active', { detail: isChatActive }));
        return () => {
            document.body.classList.remove('landing-chat-active');
            window.dispatchEvent(new CustomEvent('rg:landing-chat-active', { detail: false }));
        };
    }, [isChatActive]);

    const handleSend = useCallback(async () => {
        const trimmed = chatInput.trim();
        if (!trimmed || isSending) return;

        const userMessage = {
            id: (globalThis.crypto?.randomUUID?.() || `msg-${Date.now()}-${Math.random()}`),
            role: 'user' as const,
            content: trimmed,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsSending(true);

        try {
            const response = await sendResonantMessage({
                message: trimmed,
                chatId: chatId || undefined,
                context: {
                    previousMessages: messages.slice(-15).map(m => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                        timestamp: m.timestamp.toISOString(),
                    })),
                },
            });

            if (response.chatId && !chatId) {
                setChatId(response.chatId);
            }

            const responseContent =
                typeof (response as any)?.message === 'string'
                    ? (response as any).message
                    : (response as any)?.message?.content || '';

            const assistantMessage = {
                id: (response as any)?.message?.id || (globalThis.crypto?.randomUUID?.() || `msg-${Date.now()}-${Math.random()}`),
                role: 'assistant' as const,
                content: responseContent || 'No response received.',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err: any) {
            const assistantMessage = {
                id: (globalThis.crypto?.randomUUID?.() || `msg-${Date.now()}-${Math.random()}`),
                role: 'assistant' as const,
                content: err?.message || 'Failed to send message.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
        } finally {
            setIsSending(false);
        }
    }, [chatInput, isSending, chatId, messages]);

    return (
        <section className={`${styles.hero} ${isChatActive ? styles.heroChatActive : ''}`}>
            {/* Parallax Background - Behind Content */}
            <div className={styles.heroParallax} aria-hidden="true">
                <Suspense fallback={<div className={styles.parallaxPlaceholder} />}>
                    <ThreeParticleSphere />
                </Suspense>
            </div>

            {isChatActive && <div className={styles.heroGlassOverlay} aria-hidden="true" />}

            <div className={styles.heroContent}>
                <div className={styles.heroIntro}>
                    <button
                        type="button"
                        className={styles.byokHeroAlert}
                        onClick={() => navigate(isLoggedIn ? '/profile?tab=api-keys' : '/signup')}
                    >
                        <span className={styles.byokHeroText}>Bring Your Own Keys to unlock functions</span>
                        <span className={styles.byokHeroArrow}>→</span>
                    </button>
                    <h1 className={heroTitleStyles.heroTitle}>
                        Own Your Intelligence.
                    </h1>
                    <p className={heroTitleStyles.heroSubtitle}>
                        The first sovereign AI ecosystem with somatic-magnetic memory. Encrypted, autonomous, and fully self-hosted. No black boxes—just pure control.
                    </p>
                    
                    {/* Hero CTAs - Conditional based on login state */}
                    <div className={styles.heroNavLinks}>
                        {!isLoggedIn && (
                            /* Non-logged-in users: Get Started Free */
                            <div className={styles.heroNavRow}>
                                <button className={`${styles.heroNavItem} ${styles.heroNavItemPrimary}`} onClick={() => navigate('/signup')}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                    </svg>
                                    <span>Get Started Free</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resonant Chat Input Bar */}
                <div
                    className={styles.heroChatWrapper}
                    onFocusCapture={() => setIsChatFocused(true)}
                    onBlurCapture={() => setIsChatFocused(false)}
                >
                    {messages.length > 0 && (
                        <div className={styles.heroChatMessages} ref={messagesRef}>
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`${styles.heroChatMessageRow} ${m.role === 'user' ? styles.heroChatMessageRowUser : styles.heroChatMessageRowAssistant}`}
                                >
                                    <div
                                        className={`${styles.heroChatMessage} ${m.role === 'user' ? styles.heroChatMessageUser : styles.heroChatMessageAssistant}`}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <ChatInputBar
                        value={chatInput}
                        onChange={setChatInput}
                        onSend={handleSend}
                        embedded={true}
                        hideProviderSelector={true}
                        voiceInInput={true}
                        voiceIconSize={22}
                        placeholder="Start typing..."
                        isLoading={isSending}
                        disabled={false}
                    />
                </div>

            </div>
        </section>
    );
};
