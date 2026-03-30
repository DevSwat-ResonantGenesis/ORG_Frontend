import React, { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '../HomeNew.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';
import { sendResonantMessage } from '@/api/resonantChat';

// Lazy load Vision Pro aesthetic particle sphere
const ThreeParticleSphere = React.lazy(() => import('@/components/features/landing/ThreeParticleSphere'));

interface ChatMsg {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const HeroSection = () => {
    const navigate = useNavigate();
    const isLoggedIn = isAuthenticated();
    const [query, setQuery] = useState('');
    const [chatActive, setChatActive] = useState(false);
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatIdRef = useRef<string>(`guest-${Date.now()}`);

    if (isLoggedIn) return null;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (chatActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [chatActive]);

    const handleSend = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        const userMsg: ChatMsg = {
            id: `u-${Date.now()}`,
            role: 'user',
            content: trimmed,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setLoading(true);

        try {
            const res = await sendResonantMessage({
                message: trimmed,
                chatId: chatIdRef.current,
                context: {
                    previousMessages: messages.slice(-10).map(m => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                        timestamp: m.timestamp.toISOString(),
                    })),
                },
            });

            const assistantMsg: ChatMsg = {
                id: `a-${Date.now()}`,
                role: 'assistant',
                content: res.message?.content || 'Sorry, I could not generate a response.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMsg]);
            if (res.chatId) chatIdRef.current = res.chatId;
        } catch (err: any) {
            const errMsg: ChatMsg = {
                id: `e-${Date.now()}`,
                role: 'assistant',
                content: err?.message || 'Something went wrong. Please try again.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setLoading(false);
        }
    }, [loading, messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatActive) {
            setChatActive(true);
            if (query.trim()) handleSend(query);
            return;
        }
        handleSend(query);
    };

    const handleInputFocus = () => {
        if (!chatActive) setChatActive(true);
    };

    const handleCloseChat = () => {
        setChatActive(false);
    };

    const isReactSnap = typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap';

    return (
        <section className={styles.hero}>
            {/* Parallax Background - Behind Content */}
            <div className={styles.heroParallax} aria-hidden="true">
                <Suspense fallback={<div className={styles.parallaxPlaceholder} />}>
                    <div className={styles.heroParallaxInner}>
                        {isReactSnap ? <div className={styles.parallaxPlaceholder} /> : <ThreeParticleSphere />}
                    </div>
                </Suspense>
            </div>

            {/* Hero Content — fades when chat is active */}
            <div className={`${styles.heroContent} ${chatActive ? styles.heroContentFaded : ''}`}>
                <div className={styles.heroIntro}>
                    <button
                        type="button"
                        className={styles.byokHeroAlert}
                        onClick={() => navigate('/signup')}
                    >
                        <span className={styles.byokHeroText}>Bring Your Own Keys to unlock functions</span>
                        <span className={styles.byokHeroArrow}>→ Create or Bring your AI Agents</span>
                    </button>

                    <h1 className={heroTitleStyles.heroTitle}>
                        Own Your Intelligence.
                        <span className={heroTitleStyles.heroTitleTagline}>
                            Your AI that you can trust now !
                        </span>
                    </h1>
                    <p className={heroTitleStyles.heroSubtitle}>
                        The first sovereign AI ecosystem with Resonant memory. Encrypted, autonomous, and fully self-hosted. No black boxes—just pure governed enforced control with decentralized logging.
                    </p>
                    
                    {/* Hero CTAs */}
                    <div className={styles.heroNavLinks}>
                        <div className={styles.heroNavRow}>
                            <button className={`${styles.heroNavItem} ${styles.heroNavItemPrimary}`} onClick={() => navigate('/signup')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                </svg>
                                <span>Get Started</span>
                            </button>
                        </div>
                    </div>

                    {/* Inline Chat Input (hero position — before chat activates) */}
                    {!chatActive && (
                        <form className={styles.heroChatBar} onSubmit={handleSubmit}>
                            <input
                                className={styles.heroChatInput}
                                type="text"
                                placeholder="Ask anything — try the AI assistant..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={handleInputFocus}
                                autoComplete="off"
                            />
                            <button type="submit" className={styles.heroChatSend} aria-label="Send">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </button>
                        </form>
                    )}
                    {!chatActive && <div className={styles.heroChatHint}>Guest mode · 3 tools · Low-reasoning model</div>}
                </div>
            </div>

            {/* ===== Chat Overlay — glassmorphism fullscreen ===== */}
            {chatActive && (
                <div className={styles.chatOverlay}>
                    {/* Close button */}
                    <button className={styles.chatOverlayClose} onClick={handleCloseChat} aria-label="Close chat">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>

                    {/* Messages */}
                    <div className={styles.chatOverlayMessages}>
                        {messages.length === 0 && (
                            <div className={styles.chatOverlayEmpty}>
                                <span>Ask me anything</span>
                                <span className={styles.chatOverlayEmptySub}>Guest mode · 3 tools · Low-reasoning model</span>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`${styles.chatOverlayMsg} ${msg.role === 'user' ? styles.chatOverlayMsgUser : styles.chatOverlayMsgAssistant}`}
                            >
                                <div className={styles.chatOverlayMsgContent}>{msg.content}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className={`${styles.chatOverlayMsg} ${styles.chatOverlayMsgAssistant}`}>
                                <div className={styles.chatOverlayMsgContent}>
                                    <span className={styles.chatOverlayTyping}>
                                        <span /><span /><span />
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Bottom input bar */}
                    <form className={styles.chatOverlayInputBar} onSubmit={handleSubmit}>
                        <input
                            ref={inputRef}
                            className={styles.chatOverlayInput}
                            type="text"
                            placeholder="Type a message..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoComplete="off"
                        />
                        <button type="submit" className={styles.chatOverlaySendBtn} disabled={loading} aria-label="Send">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </section>
    );
};
