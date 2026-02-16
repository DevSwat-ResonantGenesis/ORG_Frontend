import React, { Suspense, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '../HomeNew.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';
import ChatInputBar from '@/components/ResonantChat/ChatInputBar/ChatInputBar';
import { SplitViewModule } from '@/components/ResonantChat/SplitView/SplitViewModule';
import { sendResonantMessage } from '@/api/resonantChat';
import { getChatHistory } from '@/api/resonantChat';
import { listMemories, uploadFile, type MemoryResponse } from '@/api/rag';

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
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [uploadedFileIds, setUploadedFileIds] = useState<Map<File, string>>(new Map());
    const [showMemoryLibrary, setShowMemoryLibrary] = useState(false);
    const [memories, setMemories] = useState<Array<{ id: string; name?: string; content?: string }>>([]);
    const [showConversations, setShowConversations] = useState(false);
    const [conversations, setConversations] = useState<Array<{ id: string; title?: string; created_at?: string }>>([]);
    const [splitViewEnabled, setSplitViewEnabled] = useState(false);
    const [splitViewWidth, setSplitViewWidth] = useState(55);
    const [selectedCodeMessage, setSelectedCodeMessage] = useState<string | null>(null);
    const [autoOpenRequest, setAutoOpenRequest] = useState<{ requestId: number; tab: 'code' | 'preview' | 'terminal'; previewUrl?: string | null } | null>(null);
    const autoOpenRequestIdRef = useRef(0);
    
    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
    }, []);

    const loadMemories = useCallback(async () => {
        if (!isLoggedIn) {
            setMemories([]);
            return;
        }
        try {
            const apiMemories: MemoryResponse[] = await listMemories(50);
            const formatted = (apiMemories || []).map((m: any) => ({
                id: m.id,
                name: m.name || (typeof m.content === 'string' ? m.content.substring(0, 30) : 'Memory'),
                content: m.content,
            }));
            setMemories(formatted);
        } catch {
            setMemories([]);
        }
    }, [isLoggedIn]);

    const loadConversations = useCallback(async () => {
        if (!isLoggedIn) {
            setConversations([]);
            return;
        }
        try {
            const data = await getChatHistory();
            const chatList = Array.isArray(data) ? data : [];
            const formatted = chatList.map((chat: any) => {
                if (typeof chat === 'string') return { id: chat, title: 'Untitled Chat' };
                return {
                    id: chat.id,
                    title: chat.title || 'Untitled Chat',
                    created_at: chat.created_at,
                };
            });
            setConversations(formatted);
        } catch {
            setConversations([]);
        }
    }, [isLoggedIn]);

    const handleLoadConversation = useCallback(async (conversationId: string) => {
        try {
            const data = await getChatHistory(conversationId);
            let messagesArray: any[] = [];
            if (Array.isArray(data)) {
                messagesArray = data;
            } else if ((data as any)?.messages && Array.isArray((data as any).messages)) {
                messagesArray = (data as any).messages;
            }

            const conversationMessages = messagesArray
                .filter((msg: any) => msg?.role === 'user' || msg?.role === 'assistant')
                .map((msg: any) => ({
                    id: msg.id || (globalThis.crypto?.randomUUID?.() || `msg-${Date.now()}-${Math.random()}`),
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content || '',
                    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                }));

            setMessages(conversationMessages);
            setChatId(conversationId);

            const firstWithPreview = conversationMessages.find(m => m.role === 'assistant' && (messageWantsPreview(m.content).hasCode || messageWantsPreview(m.content).hasHtml || messageWantsPreview(m.content).hasImage));
            if (firstWithPreview) {
                const { hasCode, hasHtml, hasImage } = messageWantsPreview(firstWithPreview.content);
                if (hasCode) setSelectedCodeMessage(firstWithPreview.id);
                setSplitViewEnabled(true);
                autoOpenRequestIdRef.current += 1;
                const imageUrl = hasImage ? extractFirstImageUrl(firstWithPreview.content) : null;
                const html = hasHtml && !hasCode ? extractHtmlDocument(firstWithPreview.content) : null;
                const previewUrl = imageUrl || (html ? toDataHtmlUrl(html) : null);
                setAutoOpenRequest({ requestId: autoOpenRequestIdRef.current, tab: 'preview', previewUrl });
            }
        } catch {
            // ignore
        }
    }, []);

    const handleNewChat = useCallback(() => {
        setMessages([]);
        setChatId(null);
        setChatInput('');
        setAttachedFiles([]);
        setUploadedFileIds(new Map());
        setSplitViewEnabled(false);
        setSelectedCodeMessage(null);
        setAutoOpenRequest(null);
    }, []);

    const extractFirstImageUrl = (content: string): string | null => {
        const md = content.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/i);
        if (md?.[1]) return md[1];
        const url = content.match(/(https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp))(\?[^\s]+)?/i);
        if (url?.[1]) return url[1] + (url[3] || '');
        const dataImg = content.match(/data:image\/[a-zA-Z]+;base64,[a-zA-Z0-9+/=]+/);
        if (dataImg?.[0]) return dataImg[0];
        return null;
    };

    const extractHtmlDocument = (content: string): string | null => {
        const idx = content.search(/<!doctype\s+html|<html\b/i);
        if (idx === -1) return null;
        return content.slice(idx).trim();
    };

    const toDataHtmlUrl = (html: string) => {
        try {
            return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
        } catch {
            return null;
        }
    };

    const messageWantsPreview = (content: string) => {
        const hasCode = /```[\s\S]*?```/g.test(content);
        const hasHtml = /<!doctype\s+html|<html\b|<body\b|<style\b|<script\b/i.test(content);
        const hasImage = !!extractFirstImageUrl(content) || /<img\b/i.test(content);
        return { hasCode, hasHtml, hasImage };
    };

    const readTextFile = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setAttachedFiles(prev => [...prev, ...files]);

        if (isLoggedIn) {
            for (const file of files) {
                try {
                    const result = await uploadFile(file);
                    if (result?.id) {
                        setUploadedFileIds(prev => {
                            const next = new Map(prev);
                            next.set(file, result.id);
                            return next;
                        });
                    }
                } catch {
                    // ignore
                }
            }
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [isLoggedIn]);

    const isChatActive = useMemo(
        () => isLoggedIn || isChatFocused || messages.length > 0,
        [isLoggedIn, isChatFocused, messages.length]
    );

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
            let fileContext = '';
            if (attachedFiles.length > 0) {
                const fileContents = await Promise.all(
                    attachedFiles.map(async (file) => {
                        try {
                            if (file.type.startsWith('text/') || file.name.match(/\.(txt|md|json|js|ts|py|java|cpp|c|cs)$/i)) {
                                const content = await readTextFile(file);
                                return `\n\n[File: ${file.name}]\n${content}`;
                            }
                            const fileId = uploadedFileIds.get(file);
                            return `\n\n[File: ${file.name}${fileId ? ` (ID: ${fileId})` : ''}]`;
                        } catch {
                            return `\n\n[File: ${file.name} - Error reading content]`;
                        }
                    })
                );
                fileContext = fileContents.join('\n');
            }

            const attachedFilePaths = attachedFiles
                .map(file => uploadedFileIds.get(file) || (file.name.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|cs|go|rs|rb|php)$/i) ? file.name : undefined))
                .filter((p): p is string => !!p);

            const response = await sendResonantMessage({
                message: trimmed + fileContext,
                chatId: chatId || undefined,
                context: {
                    previousMessages: messages.slice(-15).map(m => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                        timestamp: m.timestamp.toISOString(),
                    })),
                },
                attached_files: attachedFilePaths.length > 0 ? attachedFilePaths : undefined,
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

            const { hasCode, hasHtml, hasImage } = messageWantsPreview(responseContent || '');
            if (hasCode || hasHtml || hasImage) {
                if (hasCode) setSelectedCodeMessage(assistantMessage.id);
                setSplitViewEnabled(true);
                autoOpenRequestIdRef.current += 1;
                const imageUrl = hasImage ? extractFirstImageUrl(responseContent || '') : null;
                const html = hasHtml && !hasCode ? extractHtmlDocument(responseContent || '') : null;
                const previewUrl = imageUrl || (html ? toDataHtmlUrl(html) : null);
                setAutoOpenRequest({ requestId: autoOpenRequestIdRef.current, tab: 'preview', previewUrl });
            }

            setAttachedFiles([]);
            setUploadedFileIds(new Map());
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
    }, [chatInput, isSending, chatId, messages, attachedFiles, uploadedFileIds]);

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
                {!isLoggedIn && (
                    <div className={styles.heroIntro}>
                        <button
                            type="button"
                            className={styles.byokHeroAlert}
                            onClick={() => navigate('/signup')}
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
                            <div className={styles.heroNavRow}>
                                <button className={`${styles.heroNavItem} ${styles.heroNavItemPrimary}`} onClick={() => navigate('/signup')}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                    </svg>
                                    <span>Get Started Free</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resonant Chat Input Bar */}
                <div
                    className={`${styles.heroChatWrapper} ${splitViewEnabled ? styles.heroChatWrapperSplit : ''}`}
                    onFocusCapture={() => setIsChatFocused(true)}
                    onBlurCapture={() => setIsChatFocused(false)}
                >
                    <SplitViewModule
                        enabled={splitViewEnabled && messages.length > 0}
                        onClose={() => setSplitViewEnabled(false)}
                        selectedMessageId={selectedCodeMessage}
                        messages={messages as any}
                        onCopyCode={(code) => {
                            try {
                                navigator.clipboard.writeText(code);
                            } catch {
                                // ignore
                            }
                        }}
                        initialWidth={splitViewWidth}
                        onWidthChange={setSplitViewWidth}
                        embedded={true}
                        autoOpenRequest={autoOpenRequest || undefined}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                            {messages.length > 0 && (
                                <div className={styles.heroChatMessages} ref={messagesRef}>
                                    {messages.map((m) => (
                                        <div
                                            key={m.id}
                                            className={`${styles.heroChatMessageRow} ${m.role === 'user' ? styles.heroChatMessageRowUser : styles.heroChatMessageRowAssistant}`}
                                            onClick={() => {
                                                if (m.role !== 'assistant') return;
                                                if (/```[\s\S]*?```/g.test(m.content)) {
                                                    setSelectedCodeMessage(m.id);
                                                }
                                            }}
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
                                onNewChat={handleNewChat}
                                onAttachFile={() => fileInputRef.current?.click()}
                                onToggleSplitView={() => setSplitViewEnabled(v => !v)}
                                splitViewEnabled={splitViewEnabled}
                                splitViewWidth={splitViewWidth}
                                attachedFiles={attachedFiles}
                                onRemoveFile={(index) => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                                memories={memories}
                                onShowMemoryLibrary={async () => {
                                    await loadMemories();
                                    setShowMemoryLibrary(true);
                                    setShowConversations(false);
                                }}
                                showMemoryLibrary={showMemoryLibrary}
                                onCloseMemoryLibrary={() => setShowMemoryLibrary(false)}
                                onMemoryClick={(memory) => {
                                    setChatInput(prev => prev + ` @${memory.name || memory.content?.substring(0, 20)} `);
                                    setShowMemoryLibrary(false);
                                }}
                                conversations={conversations}
                                onShowConversations={async () => {
                                    await loadConversations();
                                    setShowConversations(true);
                                    setShowMemoryLibrary(false);
                                }}
                                showConversations={showConversations}
                                onCloseConversations={() => setShowConversations(false)}
                                onConversationClick={(conv) => {
                                    handleLoadConversation(conv.id);
                                    setShowConversations(false);
                                }}
                                currentConversationId={chatId}
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                        </div>
                    </SplitViewModule>
                </div>

            </div>
        </section>
    );
};
