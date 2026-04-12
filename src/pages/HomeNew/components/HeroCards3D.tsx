import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

function useIsMobile(breakpoint = 768) {
    const [mobile, setMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
    );
    useEffect(() => {
        const check = () => setMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', check, { passive: true });
        return () => window.removeEventListener('resize', check);
    }, [breakpoint]);
    return mobile;
}

/* ── Card definitions ── */
interface Card3D {
    label: string;
    desc: string;
    color: string;
    textColor: string;
    /* final resting position in 3D world */
    px: number; py: number; pz: number;
    /* size */
    w: number; h: number;
    /* initial chaos: random lateral offset + rotation */
    chaosX: number;
    chaosRx: number; chaosRy: number; chaosRz: number;
    /* stagger delay (seconds) */
    delay: number;
}

/* 3-column mosaic — NO overlaps. Yellow tall pillar right, Orange tall pillar left. */
const CARDS: Card3D[] = [
    /*            label          desc                    color      text       px     py     pz     w    h    chaosX  chaosRx chaosRy chaosRz delay */
    /* Top center-left: wide */
    { label: 'Code',       desc: 'AI-powered dev',      color: '#121214', textColor: '#ffffff', px: 0.6,  py: 2.8,  pz: -0.3, w: 3.5, h: 2.0, chaosX: -1.8, chaosRx: 0.8,  chaosRy: -0.6, chaosRz: 0.35, delay: 0.0 },
    /* Right pillar: TALL yellow — sits BESIDE center cards, not over them */
    { label: '',           desc: '',                     color: '#FFD800', textColor: '#121214', px: 3.8,  py: 1.0,  pz: 0.4,  w: 2.5, h: 5.0, chaosX: 2.0,  chaosRx: -0.7, chaosRy: 0.8,  chaosRz: -0.3, delay: 0.18 },
    /* Left pillar: tall orange */
    { label: '',           desc: '',                     color: '#FAA525', textColor: '#121214', px: -1.6, py: 0.5,  pz: 0.2,  w: 1.8, h: 3.5, chaosX: -1.2, chaosRx: 0.9,  chaosRy: -0.4, chaosRz: 0.2,  delay: 0.35 },
    /* Center: wide governance */
    { label: 'Governance', desc: 'On-chain compliance',  color: '#01A6BC', textColor: '#ffffff', px: 0.8,  py: 0.0,  pz: -0.4, w: 3.0, h: 1.8, chaosX: 1.4,  chaosRx: -0.5, chaosRy: 0.6,  chaosRz: -0.4, delay: 0.12 },
    /* Bottom center: agents */
    { label: 'Agents',     desc: 'Autonomous workflows', color: '#FA547C', textColor: '#ffffff', px: 0.8,  py: -2.2, pz: 0.3,  w: 2.2, h: 1.8, chaosX: -1.0, chaosRx: 0.7,  chaosRy: -0.7, chaosRz: 0.45, delay: 0.28 },
    /* Bottom right: memory */
    { label: 'Memory',     desc: 'Persistent knowledge', color: '#FFFFFF', textColor: '#121214', px: 3.8,  py: -2.5, pz: -0.5, w: 1.5, h: 2.0, chaosX: 1.6,  chaosRx: -0.8, chaosRy: 0.5,  chaosRz: -0.3, delay: 0.22 },
    /* Bottom left: green */
    { label: '',           desc: '',                     color: '#71C23E', textColor: '#121214', px: -1.6, py: -2.5, pz: 0.5,  w: 1.5, h: 1.8, chaosX: -0.8, chaosRx: 0.6,  chaosRy: -0.8, chaosRz: 0.5,  delay: 0.4 },
];

/* ── Mouse tracker ── */
const mouse = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
}

/* ── Scene rotation from mouse (parallax) ── */
function SceneRotation({ children }: { children: React.ReactNode }) {
    const groupRef = useRef<THREE.Group>(null!);
    const lerped = useRef({ x: 0, y: 0 });

    useFrame(() => {
        lerped.current.x += (mouse.x - lerped.current.x) * 0.03;
        lerped.current.y += (mouse.y - lerped.current.y) * 0.03;
        if (groupRef.current) {
            groupRef.current.rotation.y = lerped.current.x * 0.15;
            groupRef.current.rotation.x = -lerped.current.y * 0.10;
        }
    });

    return <group ref={groupRef}>{children}</group>;
}

/* ── Single falling card ── */
function FallingCard({ card }: { card: Card3D }) {
    const meshRef = useRef<THREE.Group>(null!);
    const startTime = useRef<number | null>(null);
    const [landed, setLanded] = useState(false);

    /* Physics state */
    const state = useRef({
        y: 10,           /* start above viewport */
        vy: 0,           /* vertical velocity */
        x: card.chaosX,  /* lateral chaos offset */
        rx: card.chaosRx * 2,
        ry: card.chaosRy * 2,
        rz: card.chaosRz * 2,
        started: false,
    });

    const gravity = -7;
    const bounceDamping = 0.25;
    const rotDamping = 0.96;
    const lateralDamping = 0.97;

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        const s = state.current;
        const now = performance.now() / 1000;

        /* Stagger: don't start until delay */
        if (!s.started) {
            if (startTime.current === null) startTime.current = now;
            if (now - startTime.current < card.delay) return;
            s.started = true;
            meshRef.current.visible = true;
        }

        const dt = Math.min(delta, 0.05);

        if (!landed) {
            /* Gravity */
            s.vy += gravity * dt;
            s.y += s.vy * dt;

            /* Lateral drift toward target */
            s.x += (0 - s.x) * (1 - Math.pow(lateralDamping, dt * 60));

            /* Rotation damping toward 0 */
            const rDamp = Math.pow(rotDamping, dt * 60);
            s.rx *= rDamp;
            s.ry *= rDamp;
            s.rz *= rDamp;

            /* Bounce off target Y */
            if (s.y <= card.py) {
                s.y = card.py;
                if (Math.abs(s.vy) < 0.15) {
                    /* Settled */
                    s.vy = 0;
                    s.x = 0;
                    s.rx = 0; s.ry = 0; s.rz = 0;
                    setLanded(true);
                } else {
                    s.vy = Math.abs(s.vy) * bounceDamping;
                }
            }

            meshRef.current.position.set(
                card.px + s.x,
                s.y,
                card.pz
            );
            meshRef.current.rotation.set(s.rx, s.ry, s.rz);
        } else {
            /* Subtle float when landed */
            const t = now * 0.8;
            meshRef.current.position.set(
                card.px,
                card.py + Math.sin(t + card.delay * 10) * 0.03,
                card.pz
            );
            meshRef.current.rotation.set(0, 0, 0);
        }
    });

    const color = useMemo(() => new THREE.Color(card.color), [card.color]);
    const txtColor = useMemo(() => new THREE.Color(card.textColor), [card.textColor]);

    return (
        <group ref={meshRef} visible={false}>
            <RoundedBox
                args={[card.w, card.h, 0.08]}
                radius={0.12}
                smoothness={4}
            >
                <meshPhysicalMaterial
                    color={color}
                    transparent
                    opacity={0.78}
                    roughness={0.15}
                    metalness={0.05}
                    clearcoat={0.6}
                    clearcoatRoughness={0.2}
                    envMapIntensity={0.8}
                />
            </RoundedBox>

            {/* Glass shine edge — top highlight */}
            <mesh position={[0, card.h / 2 - 0.02, 0.045]}>
                <planeGeometry args={[card.w * 0.7, 0.02]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.18} />
            </mesh>

            {card.label && (
                <Text
                    position={[-card.w / 2 + 0.2, -card.h / 2 + 0.45, 0.06]}
                    fontSize={0.28}
                    color={txtColor}
                    anchorX="left"
                    anchorY="bottom"
                    maxWidth={card.w - 0.4}
                >
                    {card.label}
                </Text>
            )}
            {card.desc && (
                <Text
                    position={[-card.w / 2 + 0.2, -card.h / 2 + 0.18, 0.06]}
                    fontSize={0.14}
                    color={txtColor}
                    anchorX="left"
                    anchorY="bottom"
                    maxWidth={card.w - 0.4}
                    fillOpacity={0.55}
                >
                    {card.desc}
                </Text>
            )}
        </group>
    );
}

/* ── Mobile-scaled cards — smaller to fit screen, no cutoff ── */
const CARDS_MOBILE: Card3D[] = CARDS.map(c => ({
    ...c,
    px: c.px * 0.38,
    py: c.py * 0.38,
    pz: c.pz * 0.2,
    w: c.w * 0.38,
    h: c.h * 0.38,
    chaosX: c.chaosX * 0.3,
}));

/* ── Main 3D Canvas ── */
export function HeroCards3DScene() {
    const isMobile = useIsMobile();
    const cards = isMobile ? CARDS_MOBILE : CARDS;

    return (
        <Canvas
            camera={{ position: [isMobile ? 0.4 : 1.5, 0, isMobile ? 4 : 9], fov: isMobile ? 50 : 48 }}
            style={{
                position: isMobile ? 'relative' : 'absolute',
                right: isMobile ? 'auto' : 0,
                top: isMobile ? 'auto' : 0,
                width: isMobile ? '100%' : '55vw',
                height: isMobile ? '45vh' : '100vh',
                zIndex: 2,
                pointerEvents: 'none',
            }}
            gl={{ alpha: true, antialias: true }}
            dpr={[1, isMobile ? 1.5 : 2]}
        >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={0.8} />
            <directionalLight position={[-3, -2, 4]} intensity={0.3} color="#FFD800" />
            <pointLight position={[0, -3, 3]} intensity={0.4} color="#01A6BC" />

            <SceneRotation>
                {cards.map((card, i) => (
                    <FallingCard key={i} card={card} />
                ))}
            </SceneRotation>
        </Canvas>
    );
}
