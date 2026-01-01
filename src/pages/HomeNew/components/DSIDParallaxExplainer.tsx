/**
 * DSID-P GOVERNED PARALLAX LEDGER
 * 
 * A governance system visualization that encodes real system constraints.
 * NOT a generic network or particle animation.
 * 
 * This animation represents how AI actions are governed, evaluated, 
 * and either PASSED, FLAGGED, or BLOCKED before execution.
 * 
 * Layout: Three vertical columns
 * - LEFT: Traditional Blockchain (linear, slow, no governance)
 * - CENTER: DSID-P Governed Ledger (5-layer governance flow)
 * - RIGHT: Traditional SaaS (fragmented, mutable logs)
 * 
 * DSID-P Layers (L1-L5):
 * L1 - Identity Layer (DSID nodes)
 * L2 - Semantic Classification Layer
 * L3 - Governance Evaluation Layer (PASS/FLAG/BLOCK)
 * L4 - Trust & Permission Layer (T0-T4)
 * L5 - Coordination & Ledger Commit
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from '../HomeNew.module.css';

// Governance states
type GovernanceState = 'passed' | 'flagged' | 'blocked';
type ExecutionSource = 'user' | 'agent' | 'system' | 'simulation';

// Configuration
const CONFIG = {
    layers: {
        L1_IDENTITY: { y: 0.12, label: 'L1 — Identity', sublabel: 'DSID Resolution' },
        L2_SEMANTIC: { y: 0.28, label: 'L2 — Semantic', sublabel: 'Domain Classification' },
        L3_GOVERNANCE: { y: 0.44, label: 'L3 — Governance', sublabel: 'Policy Evaluation' },
        L4_TRUST: { y: 0.60, label: 'L4 — Trust', sublabel: 'Permission Check' },
        L5_LEDGER: { y: 0.76, label: 'L5 — Ledger', sublabel: 'Immutable Commit' },
    },
    trustTiers: {
        T0: { color: '#ef4444', label: 'Untrusted' },
        T1: { color: '#f59e0b', label: 'Basic' },
        T2: { color: '#3b82f6', label: 'Verified' },
        T3: { color: '#8b5cf6', label: 'Trusted' },
        T4: { color: '#06b6d4', label: 'Sovereign' },
    },
    governanceColors: {
        passed: '#22c55e',    // Green when passed all layers
        flagged: '#f59e0b',   // Orange when flagged
        blocked: '#ef4444',   // Red when blocked/stopped
        default: '#7dd3fc',   // Blue/white like hero sphere
    },
    semanticDomains: [
        'finance.accounting',
        'healthcare.clinical',
        'engineering.code',
        'legal.compliance',
        'research.analysis',
    ],
};

interface ExecutionEvent {
    id: string;
    x: number;
    y: number;
    targetY: number;
    layer: number;
    state: GovernanceState;
    source: ExecutionSource;
    trustTier: number;
    trustDelta: number;
    semanticDomain: string;
    dsid: string;
    actionType: string;
    progress: number;
    speed: number;
    opacity: number;
    isReal: boolean;
}

interface BlockchainBlock {
    x: number;
    y: number;
    targetY: number;
    opacity: number;
}

interface SaasLog {
    x: number;
    y: number;
    opacity: number;
    drift: number;
}

const DSIDParallaxExplainer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>();
    const eventsRef = useRef<ExecutionEvent[]>([]);
    const blocksRef = useRef<BlockchainBlock[]>([]);
    const logsRef = useRef<SaasLog[]>([]);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const scrollProgressRef = useRef(0);
    const timeRef = useRef(0);
    const lastSpawnRef = useRef(0);
    const [hoveredEvent, setHoveredEvent] = useState<ExecutionEvent | null>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const generateDSID = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return 'DSID-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const spawnExecutionEvent = useCallback((width: number, height: number) => {
        const sectionWidth = width / 3;
        const centerX = sectionWidth * 1.5;
        
        // Determine governance outcome (weighted)
        const rand = Math.random();
        let state: GovernanceState;
        if (rand < 0.7) state = 'passed';
        else if (rand < 0.9) state = 'flagged';
        else state = 'blocked';

        // Determine source
        const sourceRand = Math.random();
        let source: ExecutionSource;
        if (sourceRand < 0.5) source = 'user';
        else if (sourceRand < 0.8) source = 'agent';
        else if (sourceRand < 0.95) source = 'system';
        else source = 'simulation';

        const trustTier = Math.floor(Math.random() * 5);
        const trustDelta = state === 'passed' ? (Math.random() > 0.7 ? 1 : 0) : (state === 'blocked' ? -1 : 0);

        const event: ExecutionEvent = {
            id: Math.random().toString(36).substr(2, 9),
            x: centerX + (Math.random() - 0.5) * sectionWidth * 0.6,
            y: height * CONFIG.layers.L1_IDENTITY.y,
            targetY: height * CONFIG.layers.L1_IDENTITY.y,
            layer: 1,
            state,
            source,
            trustTier,
            trustDelta,
            semanticDomain: CONFIG.semanticDomains[Math.floor(Math.random() * CONFIG.semanticDomains.length)],
            dsid: generateDSID(),
            actionType: ['analyze', 'generate', 'validate', 'coordinate', 'execute'][Math.floor(Math.random() * 5)],
            progress: 0,
            speed: 0.3 + Math.random() * 0.3,
            opacity: 1,
            isReal: source !== 'simulation',
        };

        eventsRef.current.push(event);
    }, []);

    const spawnBlockchainBlock = useCallback((width: number, height: number) => {
        const sectionWidth = width / 3;
        blocksRef.current.push({
            x: sectionWidth * 0.5,
            y: height * 0.1,
            targetY: height * 0.1,
            opacity: 0,
        });
    }, []);

    const spawnSaasLog = useCallback((width: number, height: number) => {
        const sectionWidth = width / 3;
        logsRef.current.push({
            x: sectionWidth * 2.5 + (Math.random() - 0.5) * sectionWidth * 0.6,
            y: height * 0.15 + Math.random() * height * 0.6,
            opacity: 0.8,
            drift: (Math.random() - 0.5) * 2,
        });
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let width = 0;
        let height = 0;

        const resizeCanvas = () => {
            const rect = container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouseRef.current.x = (e.clientX - rect.left) / width;
            mouseRef.current.y = (e.clientY - rect.top) / height;
        };

        const handleScroll = () => {
            const rect = container.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            scrollProgressRef.current = Math.max(0, Math.min(1, 
                1 - (rect.top + rect.height) / (viewportHeight + rect.height)
            ));
        };

        container.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Drawing functions
        const drawBackground = () => {
            // Transparent background - no fill
            ctx.clearRect(0, 0, width, height);

            // Section dividers (subtle)
            const sectionWidth = width / 3;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 10]);
            ctx.beginPath();
            ctx.moveTo(sectionWidth, 0);
            ctx.lineTo(sectionWidth, height);
            ctx.moveTo(sectionWidth * 2, 0);
            ctx.lineTo(sectionWidth * 2, height);
            ctx.stroke();
            ctx.setLineDash([]);
        };

        const drawLayerLabels = () => {
            const sectionWidth = width / 3;
            const centerX = sectionWidth * 1.5;

            ctx.textAlign = 'left';
            ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';

            Object.values(CONFIG.layers).forEach((layer, idx) => {
                const y = height * layer.y;
                
                // Layer line
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(sectionWidth + 20, y);
                ctx.lineTo(sectionWidth * 2 - 20, y);
                ctx.stroke();

                // Layer label - larger font for visibility
                ctx.fillStyle = 'rgba(139, 92, 246, 0.85)';
                ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.fillText(layer.label, sectionWidth + 25, y - 10);
                
                ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.fillStyle = 'rgba(139, 92, 246, 0.6)';
                ctx.fillText(layer.sublabel, sectionWidth + 25, y + 14);
                ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';

                // Governance gate indicator at L3
                if (idx === 2) {
                    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
                    ctx.fillRect(sectionWidth + 20, y - 2, sectionWidth - 40, 4);
                    
                    ctx.fillStyle = '#8b5cf6';
                    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('GOVERNANCE GATE', centerX, y + 30);
                    ctx.textAlign = 'left';
                }
            });
        };

        const drawColumnHeaders = () => {
            const sectionWidth = width / 3;
            ctx.textAlign = 'center';

            // LEFT - Blockchain - larger fonts
            ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = '#fbbf24';
            ctx.fillText('TRADITIONAL BLOCKCHAIN', sectionWidth * 0.5, 32);
            ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
            ctx.fillText('Tracks money', sectionWidth * 0.5, 52);

            // CENTER - DSID-P - larger fonts
            ctx.shadowColor = '#8b5cf6';
            ctx.shadowBlur = 20;
            ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = '#8b5cf6';
            ctx.fillText('DSID-P GOVERNED LEDGER', sectionWidth * 1.5, 32);
            ctx.shadowBlur = 0;
            ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = 'rgba(139, 92, 246, 0.9)';
            ctx.fillText('Tracks AI actions, not money', sectionWidth * 1.5, 52);

            // RIGHT - SaaS - larger fonts
            ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = '#9ca3af';
            ctx.fillText('TRADITIONAL SAAS', sectionWidth * 2.5, 32);
            ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = 'rgba(156, 163, 175, 0.7)';
            ctx.fillText('Logs behavior', sectionWidth * 2.5, 52);
        };

        const drawBlockchain = () => {
            const sectionWidth = width / 3;
            const centerX = sectionWidth * 0.5;
            
            // Draw chain - bigger blocks
            blocksRef.current.forEach((block, idx) => {
                const y = block.y;
                
                // Block - larger size
                ctx.fillStyle = `rgba(251, 191, 36, ${0.3 + block.opacity * 0.4})`;
                ctx.strokeStyle = `rgba(251, 191, 36, ${0.5 + block.opacity * 0.3})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(centerX - 40, y - 20, 80, 40, 6);
                ctx.fill();
                ctx.stroke();

                // Chain link to previous
                if (idx > 0) {
                    const prevBlock = blocksRef.current[idx - 1];
                    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(centerX, prevBlock.y + 20);
                    ctx.lineTo(centerX, y - 20);
                    ctx.stroke();
                }

                // Block number - larger font
                ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
                ctx.font = 'bold 13px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`#${1000 + idx}`, centerX, y + 5);
            });

            // Labels - larger fonts
            ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Linear', centerX, height - 70);
            ctx.fillText('No governance gates', centerX, height - 52);
            ctx.fillText('Wallet-based identity', centerX, height - 34);
        };

        const drawSaasLogs = () => {
            const sectionWidth = width / 3;
            
            logsRef.current.forEach(log => {
                // Floating disconnected log entry - bigger size
                ctx.fillStyle = `rgba(107, 114, 128, ${log.opacity * 0.4})`;
                ctx.strokeStyle = `rgba(107, 114, 128, ${log.opacity * 0.3})`;
                ctx.setLineDash([4, 4]);
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(log.x - 45, log.y - 12, 90, 24, 5);
                ctx.fill();
                ctx.stroke();
                ctx.setLineDash([]);

                // Log text - larger font
                ctx.fillStyle = `rgba(156, 163, 175, ${log.opacity * 0.7})`;
                ctx.font = '11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('log_entry', log.x, log.y + 4);
            });

            // Labels - larger fonts
            ctx.fillStyle = 'rgba(156, 163, 175, 0.5)';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Fragmented', sectionWidth * 2.5, height - 70);
            ctx.fillText('No enforcement', sectionWidth * 2.5, height - 52);
            ctx.fillText('Session-based', sectionWidth * 2.5, height - 34);
        };

        // Helper function to draw a star shape
        const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
        };

        const drawExecutionEvents = () => {
            eventsRef.current.forEach(event => {
                // Determine color based on state and layer
                // Default: blue/white, changes only at specific conditions
                let currentColor = CONFIG.governanceColors.default; // Blue/white like hero sphere
                
                if (event.state === 'blocked' && event.layer >= 3) {
                    currentColor = CONFIG.governanceColors.blocked; // Red when blocked/stopped
                } else if (event.state === 'flagged' && event.layer >= 3) {
                    currentColor = CONFIG.governanceColors.flagged; // Orange when flagged
                } else if (event.state === 'passed' && event.layer >= 5) {
                    currentColor = CONFIG.governanceColors.passed; // Green when passed all layers
                }
                
                // Parallax offset
                const parallaxX = (mouseRef.current.x - 0.5) * 20;
                const parallaxY = (mouseRef.current.y - 0.5) * 10;
                const x = event.x + parallaxX;
                const y = event.y + parallaxY;

                // Star size (same as previous circle radius)
                const starOuterRadius = event.isReal ? 8 : 6;
                const starInnerRadius = starOuterRadius * 0.5;
                const spikes = 4; // 4-pointed star like small squares

                // Glow effect
                const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, starOuterRadius * 3);
                glowGradient.addColorStop(0, currentColor + '40');
                glowGradient.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(x, y, starOuterRadius * 3, 0, Math.PI * 2);
                ctx.fillStyle = glowGradient;
                ctx.fill();

                // Draw star
                drawStar(x, y, spikes, starOuterRadius, starInnerRadius);
                
                if (event.isReal) {
                    const nodeGradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, starOuterRadius);
                    nodeGradient.addColorStop(0, '#ffffff');
                    nodeGradient.addColorStop(0.6, currentColor);
                    nodeGradient.addColorStop(1, currentColor);
                    ctx.fillStyle = nodeGradient;
                } else {
                    // Simulated - dashed outline
                    ctx.fillStyle = 'transparent';
                    ctx.strokeStyle = currentColor + '80';
                    ctx.setLineDash([2, 2]);
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
                ctx.fill();

                // Outer glow ring
                ctx.beginPath();
                ctx.arc(x, y, starOuterRadius + 3, 0, Math.PI * 2);
                ctx.strokeStyle = currentColor + '60';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Trust tier badge
                const trustColor = CONFIG.trustTiers[`T${event.trustTier}` as keyof typeof CONFIG.trustTiers].color;
                if (event.layer >= 4) {
                    ctx.fillStyle = trustColor;
                    ctx.font = 'bold 7px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(`T${event.trustTier}`, x, y - starOuterRadius - 6);
                    
                    // Trust delta indicator
                    if (event.trustDelta !== 0) {
                        ctx.fillStyle = event.trustDelta > 0 ? '#22c55e' : '#ef4444';
                        ctx.fillText(event.trustDelta > 0 ? '↑' : '↓', x + 12, y - starOuterRadius - 6);
                    }
                }

                // DSID label at L1
                if (event.layer === 1) {
                    ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
                    ctx.font = '7px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(event.dsid, x, y + starOuterRadius + 12);
                }

                // Semantic domain at L2
                if (event.layer === 2) {
                    ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
                    ctx.font = '7px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(event.semanticDomain, x, y + starOuterRadius + 12);
                }

                // Governance result at L3
                if (event.layer === 3) {
                    ctx.fillStyle = currentColor;
                    ctx.font = 'bold 8px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(event.state.toUpperCase(), x, y + starOuterRadius + 12);
                }

                // Blocked events - X mark
                if (event.state === 'blocked' && event.layer >= 3) {
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x - 5, y - 5);
                    ctx.lineTo(x + 5, y + 5);
                    ctx.moveTo(x + 5, y - 5);
                    ctx.lineTo(x - 5, y + 5);
                    ctx.stroke();
                }

                // Flagged events - side channel indicator
                if (event.state === 'flagged' && event.layer >= 3) {
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([3, 3]);
                    ctx.beginPath();
                    ctx.moveTo(x + starOuterRadius + 5, y);
                    ctx.lineTo(x + 40, y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    
                    ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
                    ctx.font = '6px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillText('REVIEW', x + 45, y + 3);
                }

                // Connection to previous layer
                if (event.layer > 1 && event.state !== 'blocked') {
                    const prevY = height * Object.values(CONFIG.layers)[event.layer - 2].y;
                    ctx.strokeStyle = currentColor + '40';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x, prevY + 15);
                    ctx.lineTo(x, y - starOuterRadius - 5);
                    ctx.stroke();

                    // Arrow
                    ctx.beginPath();
                    ctx.moveTo(x - 4, y - starOuterRadius - 10);
                    ctx.lineTo(x, y - starOuterRadius - 5);
                    ctx.lineTo(x + 4, y - starOuterRadius - 10);
                    ctx.strokeStyle = currentColor + '60';
                    ctx.stroke();
                }
            });
        };

        const drawLedgerCommits = () => {
            const sectionWidth = width / 3;
            const centerX = sectionWidth * 1.5;
            const ledgerY = height * CONFIG.layers.L5_LEDGER.y + 40;

            // Ledger visualization
            ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(centerX - 100, ledgerY, 200, 30, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
            ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('IMMUTABLE LEDGER', centerX, ledgerY + 18);

            // Commit count
            const passedCount = eventsRef.current.filter(e => e.state === 'passed' && e.layer >= 5).length;
            ctx.fillStyle = '#22c55e';
            ctx.font = '8px monospace';
            ctx.fillText(`${passedCount} commits`, centerX, ledgerY + 45);
        };

        const drawLegend = () => {
            const legendX = width - 150;
            const legendY = height - 120;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.roundRect(legendX - 10, legendY - 15, 140, 100, 8);
            ctx.fill();

            ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'left';
            ctx.fillText('Governance States', legendX, legendY);

            // PASSED
            ctx.beginPath();
            ctx.arc(legendX + 8, legendY + 20, 5, 0, Math.PI * 2);
            ctx.fillStyle = CONFIG.governanceColors.passed;
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '8px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText('PASSED — Executed', legendX + 20, legendY + 23);

            // FLAGGED
            ctx.beginPath();
            ctx.arc(legendX + 8, legendY + 40, 5, 0, Math.PI * 2);
            ctx.fillStyle = CONFIG.governanceColors.flagged;
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('FLAGGED — Review', legendX + 20, legendY + 43);

            // BLOCKED
            ctx.beginPath();
            ctx.arc(legendX + 8, legendY + 60, 5, 0, Math.PI * 2);
            ctx.fillStyle = CONFIG.governanceColors.blocked;
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('BLOCKED — Stopped', legendX + 20, legendY + 63);

            // Real vs Simulated
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '7px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText('Solid = Real | Dashed = Simulated', legendX, legendY + 80);
        };

        const updateEvents = () => {
            const layerYs = Object.values(CONFIG.layers).map(l => height * l.y);

            eventsRef.current = eventsRef.current.filter(event => {
                // Progress through layers
                if (event.layer <= 5) {
                    const targetY = layerYs[event.layer - 1];
                    const dy = targetY - event.y;
                    
                    // Blocked events stop at L3
                    if (event.state === 'blocked' && event.layer >= 3) {
                        event.opacity -= 0.005;
                        return event.opacity > 0;
                    }

                    // Flagged events slow down
                    const speedMod = event.state === 'flagged' ? 0.3 : 1;

                    if (Math.abs(dy) > 2) {
                        event.y += dy * 0.02 * event.speed * speedMod;
                    } else {
                        event.progress += 0.01 * event.speed * speedMod;
                        if (event.progress >= 1 && event.layer < 5) {
                            event.layer++;
                            event.progress = 0;
                        }
                    }
                }

                // Remove completed events
                if (event.layer >= 5 && event.y >= layerYs[4]) {
                    event.opacity -= 0.01;
                }

                return event.opacity > 0;
            });

            // Update blockchain blocks
            blocksRef.current.forEach((block, idx) => {
                const targetY = height * 0.15 + idx * 55;
                block.y += (targetY - block.y) * 0.02;
                block.opacity = Math.min(1, block.opacity + 0.02);
            });

            // Update SaaS logs (drift and fade)
            logsRef.current = logsRef.current.filter(log => {
                log.x += log.drift * 0.5;
                log.y += Math.sin(timeRef.current + log.x) * 0.3;
                log.opacity -= 0.002;
                return log.opacity > 0;
            });
        };

        const animate = () => {
            timeRef.current += 0.016;

            // Spawn new events periodically
            if (timeRef.current - lastSpawnRef.current > 1.5) {
                spawnExecutionEvent(width, height);
                if (Math.random() > 0.5) spawnBlockchainBlock(width, height);
                if (Math.random() > 0.3) spawnSaasLog(width, height);
                lastSpawnRef.current = timeRef.current;
            }

            // Limit counts
            if (blocksRef.current.length > 8) blocksRef.current.shift();
            if (logsRef.current.length > 15) logsRef.current.shift();

            // Update
            if (!prefersReducedMotion) {
                updateEvents();
            }

            // Render
            drawBackground();
            drawColumnHeaders();
            drawLayerLabels();
            drawBlockchain();
            drawSaasLogs();
            drawExecutionEvents();
            drawLedgerCommits();
            drawLegend();

            animationRef.current = requestAnimationFrame(animate);
        };

        // Initial spawn
        for (let i = 0; i < 5; i++) {
            setTimeout(() => spawnExecutionEvent(width, height), i * 300);
        }
        for (let i = 0; i < 4; i++) {
            spawnBlockchainBlock(width, height);
        }
        for (let i = 0; i < 8; i++) {
            spawnSaasLog(width, height);
        }

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            container.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [spawnExecutionEvent, spawnBlockchainBlock, spawnSaasLog, prefersReducedMotion]);

    return (
        <div className={styles.governedLedgerContainer} ref={containerRef}>
            <canvas ref={canvasRef} className={styles.governedLedgerCanvas} />
            
            {/* Hover tooltip */}
            {hoveredEvent && (
                <div className={styles.eventTooltip} style={{ 
                    left: hoveredEvent.x, 
                    top: hoveredEvent.y - 80 
                }}>
                    <div><strong>DSID:</strong> {hoveredEvent.dsid}</div>
                    <div><strong>Action:</strong> {hoveredEvent.actionType}</div>
                    <div><strong>Domain:</strong> {hoveredEvent.semanticDomain}</div>
                    <div><strong>Result:</strong> {hoveredEvent.state.toUpperCase()}</div>
                    <div><strong>Trust:</strong> T{hoveredEvent.trustTier} {hoveredEvent.trustDelta !== 0 ? `→ T${hoveredEvent.trustTier + hoveredEvent.trustDelta}` : ''}</div>
                </div>
            )}

            {/* Accessibility */}
            <div className="sr-only">
                DSID-P Governed Parallax Ledger visualization showing three systems:
                Traditional Blockchain (tracks money, linear, no governance),
                DSID-P Ledger (tracks AI actions with 5-layer governance: Identity, Semantic, Governance, Trust, Ledger),
                Traditional SaaS (logs behavior, fragmented, mutable).
                Events flow through governance gates and are either PASSED, FLAGGED, or BLOCKED.
            </div>
        </div>
    );
};

export default DSIDParallaxExplainer;
