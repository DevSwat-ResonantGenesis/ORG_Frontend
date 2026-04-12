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
    /* vertical text */
    vertical?: boolean;
}

/* Cards — Tetris mosaic: tiles fit together with ~0.1 unit gaps */
const CARDS: Card3D[] = [
    /*           label          desc            color       textColor       px     py     pz     w    h     chaosX  chaosRx chaosRy chaosRz delay */
    { label: 'Code',       desc: 'AI dev',      color: '#121214', textColor: '#ffffff', px: -0.2,  py: 2.2,   pz: 0.0,  w: 3.8, h: 2.2, chaosX: -1.8, chaosRx: 0.8,  chaosRy: -0.6, chaosRz: 0.35, delay: 0.0 },
    { label: 'Governance', desc: 'Compliance',   color: '#FFD800', textColor: '#121214', px: 3.0,   py: 0.8,   pz: 0.2,  w: 2.5, h: 5.5, chaosX: 2.0,  chaosRx: -0.7, chaosRy: 0.8,  chaosRz: -0.3, delay: 0.18, vertical: true },
    { label: "LLM's",     desc: '',             color: '#FAA525', textColor: '#121214', px: -2.0,  py: 0.0,   pz: 0.3,  w: 2.0, h: 2.0, chaosX: -1.2, chaosRx: 0.9,  chaosRy: -0.4, chaosRz: 0.2,  delay: 0.35 },
    { label: 'Agents',     desc: 'Workflows',    color: '#01A6BC', textColor: '#ffffff', px: 0.5,   py: -0.1,  pz: -0.1, w: 2.6, h: 2.1, chaosX: 1.4,  chaosRx: -0.5, chaosRy: 0.6,  chaosRz: -0.4, delay: 0.12 },
    { label: 'Tools',      desc: '',             color: '#FA547C', textColor: '#ffffff', px: 2.1,   py: -2.5,  pz: 0.25, w: 2.4, h: 2.6, chaosX: -1.0, chaosRx: 0.7,  chaosRy: -0.7, chaosRz: 0.45, delay: 0.28 },
    { label: "API's",     desc: '',             color: '#FFFFFF', textColor: '#121214', px: 3.8,   py: -3.2,  pz: -0.2, w: 1.5, h: 1.8, chaosX: 1.6,  chaosRx: -0.8, chaosRy: 0.5,  chaosRz: -0.3, delay: 0.22 },
    { label: 'Memory',     desc: 'Knowledge',    color: '#71C23E', textColor: '#121214', px: -1.0,  py: -2.4,  pz: 0.15, w: 3.2, h: 2.0, chaosX: -0.8, chaosRx: 0.6,  chaosRy: -0.8, chaosRz: 0.5,  delay: 0.4 },
];

/* ── Input tracker — mouse + device orientation (gyroscope) ── */
const input = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
        input.x = (e.clientX / window.innerWidth - 0.5) * 2;
        input.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    /* Gyroscope — phone tilt moves the scene */
    const handleOrientation = (e: DeviceOrientationEvent) => {
        const gamma = e.gamma ?? 0; // left-right tilt [-90, 90]
        const beta = e.beta ?? 0;   // front-back tilt [-180, 180]
        input.x = Math.max(-1, Math.min(1, gamma / 30));
        input.y = Math.max(-1, Math.min(1, (beta - 45) / 30));
    };
    if ('DeviceOrientationEvent' in window) {
        const doe = DeviceOrientationEvent as any;
        if (typeof doe.requestPermission === 'function') {
            // iOS 13+ — permission will be requested on first user gesture
            document.addEventListener('touchstart', () => {
                doe.requestPermission().then((p: string) => {
                    if (p === 'granted') window.addEventListener('deviceorientation', handleOrientation, { passive: true });
                }).catch(() => {});
            }, { once: true });
        } else {
            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
        }
    }
}

/* ── Scene rotation from mouse/gyroscope (parallax) ── */
function SceneRotation({ children }: { children: React.ReactNode }) {
    const groupRef = useRef<THREE.Group>(null!);
    const lerped = useRef({ x: 0, y: 0 });

    useFrame(() => {
        lerped.current.x += (input.x - lerped.current.x) * 0.04;
        lerped.current.y += (input.y - lerped.current.y) * 0.04;
        if (groupRef.current) {
            groupRef.current.rotation.y = lerped.current.x * 0.18;
            groupRef.current.rotation.x = -lerped.current.y * 0.12;
        }
    });

    return <group ref={groupRef}>{children}</group>;
}

/* Shared hover state — all cards react to whichever is hovered */
const hoverState = { index: -1 };

/* ── Single card — emerges from deep, reacts to hover on arrival ── */
function ZoomCard({ card, index, allCards, isMobile }: { card: Card3D; index: number; allCards: Card3D[]; isMobile?: boolean }) {
    const meshRef = useRef<THREE.Group>(null!);
    const startTime = useRef<number | null>(null);
    const [arrived, setArrived] = useState(false);
    const lerpPos = useRef({ x: card.px, y: card.py, z: card.pz, rx: 0, ry: 0 });

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
            /* Arrived: hover interaction */
            const t = now * 0.6;
            const floatY = Math.sin(t + card.delay * 10) * 0.04;
            const lp = lerpPos.current;
            const lerpSpeed = 6 * dt;

            let targetX = card.px;
            let targetY = card.py;
            let targetZ = card.pz;
            let targetRx = 0;
            let targetRy = 0;

            if (hoverState.index === index) {
                /* THIS card is hovered — pull forward */
                targetZ = card.pz + 1.2;
                targetRx = -input.y * 0.08;
                targetRy = input.x * 0.08;
            } else if (hoverState.index >= 0) {
                /* Another card is hovered — push away from it */
                const hovered = allCards[hoverState.index];
                const dx = card.px - hovered.px;
                const dy = card.py - hovered.py;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 4.0 && dist > 0.01) {
                    const pushStrength = (1 - dist / 4.0) * 0.5;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    targetX = card.px + nx * pushStrength;
                    targetY = card.py + ny * pushStrength;
                }
            }

            /* Smooth lerp to target */
            lp.x += (targetX - lp.x) * lerpSpeed;
            lp.y += (targetY + floatY - lp.y) * lerpSpeed;
            lp.z += (targetZ - lp.z) * lerpSpeed;
            lp.rx += (targetRx - lp.rx) * lerpSpeed;
            lp.ry += (targetRy - lp.ry) * lerpSpeed;

            meshRef.current.position.set(lp.x, lp.y, lp.z);
            meshRef.current.rotation.set(lp.rx, lp.ry, 0);
        }
    });

    const color = useMemo(() => new THREE.Color(card.color), [card.color]);
    const txtColor = useMemo(() => new THREE.Color(card.textColor), [card.textColor]);
    const ts = isMobile ? MOBILE_SCALE : 1; // text scale factor

    const handlePointerEnter = () => { hoverState.index = index; };
    const handlePointerLeave = () => { if (hoverState.index === index) hoverState.index = -1; };

    return (
        <group
            ref={meshRef}
            visible={false}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
        >
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

            {card.label && !card.vertical && (
                <Text
                    position={[-card.w / 2 + 0.15 * ts + 0.1, -card.h / 2 + 0.35 * ts + 0.1, 0.06]}
                    fontSize={0.38 * ts}
                    font="/fonts/WorkSans-Bold.ttf"
                    color={txtColor}
                    anchorX="left"
                    anchorY="bottom"
                    maxWidth={card.w - 0.3}
                >
                    {card.label}
                </Text>
            )}
            {card.desc && !card.vertical && (
                <Text
                    position={[-card.w / 2 + 0.15 * ts + 0.1, -card.h / 2 + 0.08 * ts + 0.05, 0.06]}
                    fontSize={0.17 * ts}
                    color={txtColor}
                    anchorX="left"
                    anchorY="bottom"
                    maxWidth={card.w - 0.3}
                    fillOpacity={0.5}
                >
                    {card.desc}
                </Text>
            )}
            {card.label && card.vertical && (
                <Text
                    position={[-card.w / 2 + 0.3 * ts + 0.08, -card.h / 2 + 0.35 * ts + 0.1, 0.06]}
                    fontSize={0.42 * ts}
                    font="/fonts/WorkSans-Bold.ttf"
                    color={txtColor}
                    anchorX="left"
                    anchorY="bottom"
                    rotation={[0, 0, Math.PI / 2]}
                    maxWidth={card.h - 0.4}
                >
                    {card.label}
                </Text>
            )}
            {card.desc && card.vertical && (
                <Text
                    position={[-card.w / 2 + 0.3 * ts + 0.08 + 0.5, -card.h / 2 + 0.1 * ts + 0.05, 0.06]}
                    fontSize={0.16 * ts}
                    color={txtColor}
                    anchorX="left"
                    anchorY="bottom"
                    rotation={[0, 0, Math.PI / 2]}
                    maxWidth={card.h - 0.4}
                    fillOpacity={0.5}
                >
                    {card.desc}
                </Text>
            )}
        </group>
    );
}

/* ── Mobile-scaled cards — smaller, no subtitles, scale factor 0.42 ── */
const MOBILE_SCALE = 0.42;
const CARDS_MOBILE: Card3D[] = CARDS.map(c => ({
    ...c,
    desc: '',                       // hide subtitles on mobile
    px: c.px * MOBILE_SCALE,
    py: c.py * MOBILE_SCALE,
    pz: c.pz * 0.2,
    w: c.w * MOBILE_SCALE,
    h: c.h * MOBILE_SCALE,
    chaosX: c.chaosX * 0.3,
}));

/* ── Main 3D Canvas ── */
export function HeroCards3DScene() {
    const isMobile = useIsMobile();
    const cards = isMobile ? CARDS_MOBILE : CARDS;

    return (
        <Canvas
            camera={{ position: [isMobile ? 0.4 : 1.2, isMobile ? -0.3 : 0, isMobile ? 7 : 10], fov: isMobile ? 50 : 50 }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'auto',
            }}
            gl={{ alpha: true, antialias: true }}
            dpr={[1, isMobile ? 1.5 : 2]}
        >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={0.8} />
            <directionalLight position={[-3, -2, 4]} intensity={0.3} color="#FFD800" />
            <pointLight position={[0, -3, 3]} intensity={0.4} color="#01A6BC" />

            <group position={[isMobile ? 0 : 2, 0, 0]}>
                <SceneRotation>
                    {cards.map((card, i) => (
                        <ZoomCard key={i} card={card} index={i} allCards={cards} isMobile={isMobile} />
                    ))}
                </SceneRotation>
            </group>
        </Canvas>
    );
}
