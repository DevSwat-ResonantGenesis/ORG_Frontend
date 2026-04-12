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

/* Mirrored-L layout:
 *   Top row (wide):  [Code]  [Governance]
 *   Middle:     [Orange]     [Yellow tall]
 *   Bottom:     [Green] [Agents] [Memory]
 */
const CARDS: Card3D[] = [
    /* TOP ROW — wide horizontal bar of the L */
    { label: 'Code',       desc: 'AI-powered dev',      color: '#121214', textColor: '#ffffff', px: -0.4, py: 2.2,  pz: -0.3, w: 2.4, h: 1.4, chaosX: -1.5, chaosRx: 0.8,  chaosRy: -0.6, chaosRz: 0.35, delay: 0.0 },
    { label: 'Governance', desc: 'On-chain compliance',  color: '#01A6BC', textColor: '#ffffff', px: 2.0,  py: 2.5,  pz: -0.2, w: 2.0, h: 1.3, chaosX: 1.2,  chaosRx: -0.5, chaosRy: 0.6,  chaosRz: -0.4, delay: 0.12 },
    /* MIDDLE — corner of the L */
    { label: '',           desc: '',                     color: '#FAA525', textColor: '#121214', px: -0.6, py: 0.2,  pz: 0.2,  w: 1.5, h: 2.5, chaosX: -1.0, chaosRx: 0.9,  chaosRy: -0.4, chaosRz: 0.2,  delay: 0.3 },
    { label: '',           desc: '',                     color: '#FFD800', textColor: '#121214', px: 2.2,  py: 0.0,  pz: 0.4,  w: 1.8, h: 3.5, chaosX: 1.8,  chaosRx: -0.7, chaosRy: 0.8,  chaosRz: -0.3, delay: 0.18 },
    /* BOTTOM — vertical bar of the L extends down-right */
    { label: '',           desc: '',                     color: '#71C23E', textColor: '#121214', px: -0.8, py: -2.0, pz: 0.3,  w: 1.3, h: 1.3, chaosX: -0.6, chaosRx: 0.6,  chaosRy: -0.8, chaosRz: 0.5,  delay: 0.38 },
    { label: 'Agents',     desc: 'Autonomous workflows', color: '#FA547C', textColor: '#ffffff', px: 1.2,  py: -2.4, pz: 0.15, w: 1.8, h: 1.3, chaosX: -0.8, chaosRx: 0.7,  chaosRy: -0.7, chaosRz: 0.45, delay: 0.25 },
    { label: 'Memory',     desc: 'Persistent knowledge', color: '#FFFFFF', textColor: '#121214', px: 2.8,  py: -2.2, pz: -0.4, w: 1.3, h: 1.5, chaosX: 1.2,  chaosRx: -0.8, chaosRy: 0.5,  chaosRz: -0.3, delay: 0.32 },
];

/* ── Mouse tracker ── */
const mouse = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
}

/* ── Scene rotation from mouse (parallax) — more responsive ── */
function SceneRotation({ children }: { children: React.ReactNode }) {
    const groupRef = useRef<THREE.Group>(null!);
    const lerped = useRef({ x: 0, y: 0 });

    useFrame(() => {
        lerped.current.x += (mouse.x - lerped.current.x) * 0.05;
        lerped.current.y += (mouse.y - lerped.current.y) * 0.05;
        if (groupRef.current) {
            groupRef.current.rotation.y = lerped.current.x * 0.22;
            groupRef.current.rotation.x = -lerped.current.y * 0.15;
        }
    });

    return <group ref={groupRef}>{children}</group>;
}

/* ── Single card — emerges from deep behind screen, rotates randomly, settles at front ── */
function ZoomCard({ card }: { card: Card3D }) {
    const meshRef = useRef<THREE.Group>(null!);
    const startTime = useRef<number | null>(null);
    const [arrived, setArrived] = useState(false);

    /* Each card gets unique random spin speeds */
    const spin = useMemo(() => ({
        sx: (card.chaosRx + 0.5) * 1.2,   /* spin speed X */
        sy: (card.chaosRy - 0.3) * 1.4,   /* spin speed Y */
        sz: (card.chaosRz + 0.2) * 0.9,   /* spin speed Z */
    }), [card]);

    /* Animation state */
    const state = useRef({
        progress: 0,       /* 0 = deep behind, 1 = arrived at front */
        started: false,
    });

    /* Start deep behind the screen */
    const startZ = -25;
    /* Duration in seconds for the card to travel from deep to front */
    const duration = 3.5 + card.delay * 2;

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

        if (!arrived) {
            /* Ease-out progress: fast start, slow approach */
            s.progress += (1 - s.progress) * dt * (1.2 / duration);

            /* Clamp and check arrival */
            if (s.progress > 0.995) {
                s.progress = 1;
                setArrived(true);
            }

            const t = s.progress;
            /* Smooth ease-out curve */
            const ease = 1 - Math.pow(1 - t, 3);

            /* Position: lerp from deep behind to final position */
            const x = card.px * ease + card.chaosX * (1 - ease);
            const y = card.py * ease + (card.chaosRx * 2) * (1 - ease);
            const z = startZ * (1 - ease) + card.pz * ease;

            meshRef.current.position.set(x, y, z);

            /* Rotation: spins freely while traveling, slows as it arrives */
            const spinFactor = (1 - ease) * 4;
            const elapsed = now - (startTime.current ?? now) - card.delay;
            meshRef.current.rotation.set(
                spin.sx * elapsed * spinFactor,
                spin.sy * elapsed * spinFactor,
                spin.sz * elapsed * spinFactor
            );
        } else {
            /* Arrived: react to mouse — tilt toward cursor + subtle lift */
            const t = now * 0.6;
            const floatY = Math.sin(t + card.delay * 10) * 0.04;

            /* Mouse proximity: cards tilt and lift when mouse is near */
            const dx = mouse.x - (card.px / 4);
            const dy = mouse.y + (card.py / 4);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const proximity = Math.max(0, 1 - dist / 1.8);
            const tiltX = -dy * proximity * 0.15;
            const tiltY = dx * proximity * 0.12;
            const liftZ = proximity * 0.4;

            meshRef.current.position.set(
                card.px,
                card.py + floatY,
                card.pz + liftZ
            );
            meshRef.current.rotation.set(tiltX, tiltY, 0);
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
            camera={{ position: [isMobile ? 0.4 : 1.2, 0, isMobile ? 4 : 8.5], fov: isMobile ? 50 : 52 }}
            style={{
                position: isMobile ? 'relative' : 'absolute',
                right: isMobile ? 'auto' : 0,
                top: isMobile ? 'auto' : 0,
                width: isMobile ? '100%' : '55vw',
                height: isMobile ? '45vh' : '100vh',
                zIndex: 2,
                pointerEvents: 'auto',
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
                    <ZoomCard key={i} card={card} />
                ))}
            </SceneRotation>
        </Canvas>
    );
}
