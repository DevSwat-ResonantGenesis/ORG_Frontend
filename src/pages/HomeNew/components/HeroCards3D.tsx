import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { RoundedBox, Text, ContactShadows } from '@react-three/drei';
import { Physics, useBox, usePlane } from '@react-three/cannon';
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

/* ── Card definitions — each maps to a real product page ── */
interface Card3D {
    label: string;
    desc: string;
    color: string;
    textColor: string;
    route: string;
    /* horizontal drop lane */
    px: number;
    /* size */
    w: number; h: number;
    /* horizontal jitter at spawn */
    chaosX: number;
    /* stagger delay before gravity kicks in (seconds) */
    delay: number;
    vertical?: boolean;
}

const CARDS: Card3D[] = [
    /*           label          desc            color       textColor       route                        px     w    h     chaosX  delay */
    { label: 'Code',       desc: 'AI dev',      color: '#121214', textColor: '#ffffff', route: '/products/ide',           px: -0.2, w: 3.8, h: 2.2, chaosX: -1.8, delay: 0.0 },
    { label: 'Governance', desc: 'Compliance',  color: '#FFD800', textColor: '#121214', route: '/products/governance',    px: 3.0,  w: 2.5, h: 5.5, chaosX: 2.0,  delay: 0.65, vertical: true },
    { label: "LLM's",      desc: '',            color: '#FAA525', textColor: '#121214', route: '/products/mining',        px: -2.0, w: 2.0, h: 2.0, chaosX: -1.2, delay: 0.5 },
    { label: 'Agents',     desc: 'Workflows',   color: '#01A6BC', textColor: '#ffffff', route: '/products/ai-agents',     px: 0.5,  w: 2.6, h: 2.1, chaosX: 1.4,  delay: 0.12 },
    { label: 'Tools',      desc: '',            color: '#FA547C', textColor: '#ffffff', route: '/products/neural-routing',px: 2.1,  w: 2.4, h: 2.6, chaosX: -1.0, delay: 0.25 },
    { label: "API's",      desc: '',            color: '#FFFFFF', textColor: '#121214', route: '/api/docs',              px: 2.9,  w: 1.5, h: 1.8, chaosX: 1.6,  delay: 0.85 },
    { label: 'Memory',     desc: 'Knowledge',   color: '#71C23E', textColor: '#121214', route: '/products/memory',       px: -1.0, w: 3.2, h: 2.0, chaosX: -0.8, delay: 0.38 },
];

const MOBILE_SCALE = 0.42;
const CARDS_MOBILE: Card3D[] = CARDS.map((c) => ({
    ...c,
    desc: '',
    px: c.px * MOBILE_SCALE,
    w: c.w * MOBILE_SCALE,
    h: c.h * MOBILE_SCALE,
    chaosX: c.chaosX * 0.35,
}));

const DEPTH = 0.42;
const RADIUS = 0.14;

/* ── Input tracker — mouse + device orientation (gyroscope), drives camera parallax ── */
const input = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
        input.x = (e.clientX / window.innerWidth - 0.5) * 2;
        input.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    const handleOrientation = (e: DeviceOrientationEvent) => {
        const gamma = e.gamma ?? 0;
        const beta = e.beta ?? 0;
        input.x = Math.max(-1, Math.min(1, gamma / 30));
        input.y = Math.max(-1, Math.min(1, (beta - 45) / 30));
    };
    if ('DeviceOrientationEvent' in window) {
        const doe = DeviceOrientationEvent as any;
        if (typeof doe.requestPermission === 'function') {
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

/* Camera drifts with mouse/gyro — real parallax without ever touching physics coordinates */
function CameraRig({ baseX, baseY, baseZ }: { baseX: number; baseY: number; baseZ: number }) {
    const { camera } = useThree();
    const lerped = useRef({ x: 0, y: 0 });
    useFrame(() => {
        lerped.current.x += (input.x - lerped.current.x) * 0.04;
        lerped.current.y += (input.y - lerped.current.y) * 0.04;
        camera.position.x = baseX + lerped.current.x * 1.1;
        camera.position.y = baseY - lerped.current.y * 0.7;
        camera.position.z = baseZ;
        /* straight-ahead dolly (no lookAt) — keeps the frustum symmetric around
           the camera so world-space bounds stay predictable as it drifts */
    });
    return null;
}

/* Invisible floor + side walls that bound the pile */
function Floor({ y }: { y: number }) {
    const [ref] = usePlane<THREE.Mesh>(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, y, 0],
        type: 'Static',
        material: { friction: 0.5, restitution: 0.15 },
    }));
    return <mesh ref={ref} visible={false}><planeGeometry args={[60, 60]} /></mesh>;
}

function Wall({ x, facing }: { x: number; facing: 1 | -1 }) {
    const [ref] = usePlane<THREE.Mesh>(() => ({
        rotation: [0, facing > 0 ? Math.PI / 2 : -Math.PI / 2, 0],
        position: [x, 0, 0],
        type: 'Static',
        material: { friction: 0.3, restitution: 0.25 },
    }));
    return <mesh ref={ref} visible={false}><planeGeometry args={[60, 60]} /></mesh>;
}

/* Walls sized from the ACTUAL rendered canvas aspect ratio (via useThree), not a guessed
   per-device constant — this is what keeps blocks inside the visible screen on any width,
   including narrow phones, instead of overflowing past the edges. */
function Bounds({ camBaseX, camBaseZ, floorY, fov }: { camBaseX: number; camBaseZ: number; floorY: number; fov: number }) {
    const { size } = useThree();
    const vFOV = (fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFOV / 2) * camBaseZ;
    const visibleWidth = visibleHeight * (size.width / size.height);
    const margin = 0.3;
    const halfWidth = Math.max(1, visibleWidth / 2 - margin);

    return (
        <>
            <Floor y={floorY} />
            <Wall x={camBaseX - halfWidth} facing={1} />
            <Wall x={camBaseX + halfWidth} facing={-1} />
        </>
    );
}

/* Shared hover state so neighboring cards could react (kept minimal: just cosmetic lift) */
const LONG_PRESS_MS = 550;
const DOUBLE_TAP_MS = 350;
const DRAG_THRESHOLD = 6;

const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

/* ── A single falling, draggable, navigable 3D block ── */
function FallingCard({ card, isMobile, spawnY }: { card: Card3D; isMobile: boolean; spawnY: number }) {
    const navigate = useNavigate();
    /* Cards releasing later also spawn higher up, proportional to their delay — this gives
       real spatial clearance from frame one instead of a timing gap that only becomes a
       physical gap after it compounds, which is what let overlapping neighbors clip into
       each other while both were still airborne. */
    const mySpawnY = spawnY + card.delay * 6;
    const [ref, api] = useBox<THREE.Group>(() => ({
        mass: 0,
        type: 'Dynamic',
        args: [card.w, card.h, DEPTH],
        position: [card.px + card.chaosX * 0.4, mySpawnY, 0],
        rotation: [0, 0, (Math.random() - 0.5) * 0.5],
        angularFactor: [0, 0, 1],
        linearFactor: [1, 1, 0],
        linearDamping: 0.55,
        angularDamping: 0.8,
        material: { friction: 0.5, restitution: 0.1 },
        allowSleep: true,
    }));

    const posRef = useRef<[number, number, number]>([card.px, mySpawnY, 0]);
    const velRef = useRef<[number, number, number]>([0, 0, 0]);
    const angVelRef = useRef<[number, number, number]>([0, 0, 0]);
    const rotRef = useRef<[number, number, number]>([0, 0, 0]);
    useEffect(() => api.position.subscribe((p) => { posRef.current = p; }), [api]);
    useEffect(() => api.velocity.subscribe((v) => { velRef.current = v; }), [api]);
    useEffect(() => api.angularVelocity.subscribe((v) => { angVelRef.current = v; }), [api]);
    useEffect(() => api.rotation.subscribe((r) => { rotRef.current = r; }), [api]);

    /* Release into free-fall after its stagger delay */
    const released = useRef(false);
    const releasedAt = useRef(0);
    useEffect(() => {
        const t = window.setTimeout(() => {
            api.velocity.set((Math.random() - 0.5) * 0.5, -0.3, 0);
            api.angularVelocity.set(0, 0, (Math.random() - 0.5) * 2.5);
            api.mass.set(1);
            released.current = true;
            releasedAt.current = performance.now();
        }, card.delay * 1000 + 30);
        return () => window.clearTimeout(t);
    }, [api, card.delay]);

    /* Gesture state — drag vs tap vs long-press vs double-tap, all from raw pointer events */
    const gesture = useRef({
        down: false,
        dragging: false,
        moved: false,
        startX: 0,
        startY: 0,
        lastTap: 0,
        longPressTimer: 0 as unknown as number,
        pokeTimer: 0 as unknown as number,
        dragVel: { x: 0, y: 0 },
        lastDrag: { x: 0, y: 0, t: 0 },
    });

    const raycastPoint = (e: ThreeEvent<PointerEvent>): THREE.Vector3 | null => {
        const point = new THREE.Vector3();
        const hit = e.ray.intersectPlane(dragPlane, point);
        return hit ? point : null;
    };

    const startDrag = (point: THREE.Vector3) => {
        const g = gesture.current;
        g.dragging = true;
        g.dragVel = { x: 0, y: 0 };
        g.lastDrag = { x: point.x, y: point.y, t: performance.now() };
        api.mass.set(0);
        api.angularVelocity.set(0, 0, 0);
    };

    const endDrag = () => {
        const g = gesture.current;
        g.dragging = false;
        const clamp = (v: number) => Math.max(-12, Math.min(12, v));
        api.velocity.set(clamp(g.dragVel.x), clamp(g.dragVel.y), 0);
        api.angularVelocity.set(0, 0, clamp(g.dragVel.x * 0.3));
        api.mass.set(1);
    };

    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        (e.target as any)?.setPointerCapture?.(e.pointerId);
        const g = gesture.current;
        g.down = true;
        g.moved = false;
        g.startX = e.clientX;
        g.startY = e.clientY;
        g.longPressTimer = window.setTimeout(() => {
            if (!g.moved) navigate(card.route);
        }, LONG_PRESS_MS);
    };

    const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        const g = gesture.current;
        if (!g.down) return;
        const dx = e.clientX - g.startX;
        const dy = e.clientY - g.startY;
        if (!g.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
            g.moved = true;
            window.clearTimeout(g.longPressTimer);
            const point = raycastPoint(e);
            if (point) startDrag(point);
        }
        if (g.dragging) {
            const point = raycastPoint(e);
            if (!point) return;
            const now = performance.now();
            const dt = Math.max((now - g.lastDrag.t) / 1000, 0.001);
            const vx = (point.x - g.lastDrag.x) / dt;
            const vy = (point.y - g.lastDrag.y) / dt;
            g.dragVel.x = g.dragVel.x * 0.7 + vx * 0.3;
            g.dragVel.y = g.dragVel.y * 0.7 + vy * 0.3;
            g.lastDrag = { x: point.x, y: point.y, t: now };
            api.position.set(point.x, point.y, 0);
        }
    };

    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        const g = gesture.current;
        window.clearTimeout(g.longPressTimer);
        g.down = false;
        if (g.dragging) {
            endDrag();
            return;
        }
        if (!g.moved) {
            const now = performance.now();
            if (now - g.lastTap < DOUBLE_TAP_MS) {
                window.clearTimeout(g.pokeTimer);
                g.lastTap = 0;
                navigate(card.route);
            } else {
                g.lastTap = now;
                /* quick tap that wasn't a double-click / long-press — give it a little poke.
                   Delayed past the double-tap window so a following second tap can cancel it —
                   otherwise the poke could nudge the block out from under a real double-click. */
                g.pokeTimer = window.setTimeout(() => {
                    api.applyImpulse([(Math.random() - 0.5) * 1.4, 2, 0], posRef.current);
                }, DOUBLE_TAP_MS + 30);
            }
        }
    };

    const [hovered, setHovered] = useState(false);
    useFrame((_, delta) => {
        if (!ref.current) return;
        const target = hovered ? 1.045 : 1;
        ref.current.scale.x += (target - ref.current.scale.x) * 0.15;
        ref.current.scale.y += (target - ref.current.scale.y) * 0.15;
        ref.current.scale.z += (target - ref.current.scale.z) * 0.15;

        if (!released.current || gesture.current.dragging) return;

        /* Blocks fall and tumble freely at first; once they've had time to land,
           a gentle continuous righting spring biases them back toward upright so
           labels stay legible even when wedged against a neighbor (a one-shot
           correction can get absorbed by contact friction — this can't, since it
           runs every frame). */
        const elapsed = (performance.now() - releasedAt.current) / 1000;
        if (elapsed > 1.4) {
            const angle = ((rotRef.current[2] + Math.PI) % (2 * Math.PI)) - Math.PI;
            const spring = -angle * 3.2;
            const nextAngVel = angVelRef.current[2] * 0.85 + spring * delta;
            api.angularVelocity.set(0, 0, nextAngVel);
        }
    });

    const color = useMemo(() => new THREE.Color(card.color), [card.color]);
    const txtColor = useMemo(() => new THREE.Color(card.textColor), [card.textColor]);
    const ts = isMobile ? MOBILE_SCALE : 1;
    const zFace = DEPTH / 2 + 0.02;

    return (
        <group
            ref={ref}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onContextMenu={(e) => e.nativeEvent.preventDefault()}
        >
            <RoundedBox args={[card.w, card.h, DEPTH]} radius={RADIUS} smoothness={4}>
                <meshPhysicalMaterial
                    color={color}
                    transparent
                    opacity={0.82}
                    roughness={0.15}
                    metalness={0.05}
                    clearcoat={0.6}
                    clearcoatRoughness={0.2}
                    envMapIntensity={0.8}
                />
            </RoundedBox>

            <mesh position={[0, card.h / 2 - 0.02, zFace + 0.005]}>
                <planeGeometry args={[card.w * 0.7, 0.02]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={hovered ? 0.32 : 0.18} />
            </mesh>

            {card.label && !card.vertical && (
                <Text
                    position={[-card.w / 2 + 0.15 * ts + 0.1, -card.h / 2 + 0.35 * ts + 0.1, zFace]}
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
                    position={[-card.w / 2 + 0.15 * ts + 0.1, -card.h / 2 + 0.08 * ts + 0.05, zFace]}
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
                    position={[-card.w / 2 + 0.3 * ts + 0.08, -card.h / 2 + 0.35 * ts + 0.1, zFace]}
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
                    position={[-card.w / 2 + 0.3 * ts + 0.08 + 0.5, -card.h / 2 + 0.1 * ts + 0.05, zFace]}
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

/* ── Main 3D Canvas ── */
export function HeroCards3DScene() {
    const isMobile = useIsMobile();
    const cards = isMobile ? CARDS_MOBILE : CARDS;

    const camBaseX = isMobile ? 0.4 : 1.2;
    const camBaseY = isMobile ? -0.3 : 0;
    const camBaseZ = isMobile ? 7 : 10;
    const floorY = isMobile ? -2.7 : -3.5;
    const spawnY = isMobile ? 5.5 : 7;

    return (
        <Canvas
            camera={{ position: [camBaseX, camBaseY, camBaseZ], fov: 50 }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'auto',
                touchAction: 'none',
            }}
            gl={{ alpha: true, antialias: true }}
            dpr={[1, isMobile ? 1.5 : 2]}
        >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={0.8} />
            <directionalLight position={[-3, -2, 4]} intensity={0.3} color="#FFD800" />
            <pointLight position={[0, -3, 3]} intensity={0.4} color="#01A6BC" />

            <CameraRig baseX={camBaseX} baseY={camBaseY} baseZ={camBaseZ} />

            <Physics gravity={[0, isMobile ? -9 : -11, 0]} allowSleep iterations={14}>
                <Bounds camBaseX={camBaseX} camBaseZ={camBaseZ} floorY={floorY} fov={50} />
                {cards.map((card, i) => (
                    <FallingCard key={card.label + i} card={card} isMobile={isMobile} spawnY={spawnY} />
                ))}
            </Physics>

            <ContactShadows position={[0, floorY + 0.02, 0]} opacity={0.45} scale={20} blur={2.4} far={5} frames={1} />
        </Canvas>
    );
}
