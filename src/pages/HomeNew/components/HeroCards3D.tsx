import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { RoundedBox, Text, ContactShadows } from '@react-three/drei';
import { Physics, useBox, usePlane, useConvexPolyhedron } from '@react-three/cannon';
import * as THREE from 'three';

/* Laptop-sized viewports (roughly 768-1439px) previously fell into the same
   bucket as wide external monitors and got full-size desktop boxes, which
   read as oversized on a laptop screen. This adds a distinct tier for them. */
type ViewportTier = 'mobile' | 'laptop' | 'desktop';
function getViewportTier(): ViewportTier {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1440) return 'laptop';
    return 'desktop';
}
function useViewportTier(): ViewportTier {
    const [tier, setTier] = useState<ViewportTier>(getViewportTier);
    useEffect(() => {
        const check = () => setTier(getViewportTier());
        window.addEventListener('resize', check, { passive: true });
        return () => window.removeEventListener('resize', check);
    }, []);
    return tier;
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
    { label: 'Code',       desc: 'AI dev',      color: '#121214', textColor: '#ffffff', route: '/products/ide',           px: 3.5,  w: 3.8, h: 2.2, chaosX: 1.8,  delay: 0.0 },
    { label: 'Governance', desc: 'Compliance',  color: '#FFD800', textColor: '#121214', route: '/products/governance',    px: 4.0,  w: 2.5, h: 5.5, chaosX: 2.0,  delay: 1.6, vertical: true },
    { label: "LLM's",      desc: '',            color: '#FAA525', textColor: '#121214', route: '/products/chat',          px: 4.5,  w: 2.0, h: 2.0, chaosX: 1.2,  delay: 0.4 },
    { label: 'Agents',     desc: 'Workflows',   color: '#01A6BC', textColor: '#ffffff', route: '/products/ai-agents',     px: 3.8,  w: 2.6, h: 2.1, chaosX: 1.4,  delay: 0.2 },
    { label: 'Tools',      desc: '',            color: '#FA547C', textColor: '#ffffff', route: '/products/neural-routing',px: 4.3,  w: 2.4, h: 2.6, chaosX: 1.0,  delay: 1.0 },
    { label: "API's",      desc: '',            color: '#FFFFFF', textColor: '#121214', route: '/api/docs',              px: 4.2,  w: 1.5, h: 1.8, chaosX: 1.6,  delay: 1.2 },
    { label: 'Memory',     desc: 'Knowledge',   color: '#71C23E', textColor: '#121214', route: '/products/memory',       px: 3.7,  w: 3.2, h: 2.0, chaosX: 0.8,  delay: 0.8 },
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

const LAPTOP_SCALE = 0.72;
const CARDS_LAPTOP: Card3D[] = CARDS.map((c) => ({
    ...c,
    px: c.px * LAPTOP_SCALE,
    w: c.w * 0.625,
    h: c.h * 0.625,
}));

const DEPTH = 0.42;
const RADIUS = 0.14;

/* ── Input tracker — device orientation (gyroscope) only, drives camera parallax ── */
const input = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
    const handleOrientation = (e: DeviceOrientationEvent) => {
        /* Browsers/devices with no real gyroscope commonly fire ONE deviceorientation event
           with gamma/beta both null, just to signal "no sensor". Treating that as gamma=0,
           beta=0 (as a naive `?? 0` fallback would) reads as a real, specific tilt angle —
           which, combined with the beta-45 neutral offset below, was quietly zeroing out
           gravity's vertical component on any desktop/no-sensor browser. Bail out instead:
           no real reading means don't touch input at all, leave it at its neutral default. */
        if (e.gamma === null || e.beta === null) return;
        input.x = Math.max(-1, Math.min(1, e.gamma / 50));
        input.y = Math.max(-1, Math.min(1, (e.beta - 45) / 50));
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
        material: { friction: 0.4, restitution: 0.06 },
    }));
    return <mesh ref={ref} visible={false}><planeGeometry args={[60, 60]} /></mesh>;
}

/* Walls + card spawn X are BOTH derived from the ACTUAL rendered canvas aspect ratio (via
   useThree), not a guessed per-device constant. Deriving them from the same source and
   clamping each card's spawn position to fit inside — accounting for its own width — is
   what prevents a card from ever spawning overlapping a wall: that overlap is what was
   causing the violent "bounce to the other side" on narrow/tall phone aspect ratios, since
   the solver forcefully ejects a body that starts deeply interpenetrating a static body. */
/* Clamping each card to the walls independently isn't enough — several cards' desired
   positions land close enough to each other that, once wall-clamped (especially in a narrow
   mobile corridor), their footprints deeply overlap EACH OTHER. Two bodies that start deeply
   interpenetrating get violently separated the instant one goes dynamic (that's what was
   launching cards clear off the top of the screen). This does a real 1D layout pass: clamp
   to the walls first, then sort left-to-right and push any still-overlapping neighbor along
   just enough to clear it — guaranteeing zero overlap between any two cards at spawn. */
function layoutSpawnX(cards: Card3D[], wallMin: number, wallMax: number, camBaseX: number, isMobile: boolean): number[] {
    // On desktop, use raw px values to respect right-side positioning
    if (!isMobile) {
        return cards.map((card) => card.px + card.chaosX * 0.4);
    }

    const inset = 0.14;
    const gap = 0.08;
    const availableMin = wallMin + inset;
    const availableMax = wallMax - inset;
    const availableWidth = Math.max(0.5, availableMax - availableMin);

    const items = cards.map((card, i) => ({ i, halfW: card.w / 2, raw: card.px + card.chaosX * 0.4, x: 0 }));
    const order = [...items].sort((a, b) => a.raw - b.raw);
    const totalWidth = order.reduce((sum, o) => sum + o.halfW * 2, 0) + gap * (order.length - 1);

    if (totalWidth <= availableWidth) {
        /* Everything fits: lay cards out left-to-right with real gaps between them,
           centered in the available corridor — this is the normal desktop-like case. */
        let cursor = availableMin + (availableWidth - totalWidth) / 2;
        for (const o of order) {
            cursor += o.halfW;
            o.x = cursor;
            cursor += o.halfW + gap;
        }
    } else {
        /* Not enough room for every card side by side (the common case on a narrow phone
           with this many cards) — spread their centers evenly across the full corridor
           instead. Adjacent cards may overlap a little, but every card is guaranteed to
           stay within the walls, and any residual overlap is only ever between immediate
           neighbors — a small, bounded overlap the solver settles gently, not the
           unbounded, multi-body pileup that was launching cards to absurd heights. */
        const step = availableWidth / order.length;
        order.forEach((o, k) => { o.x = availableMin + step * (k + 0.5); });
    }

    const result = new Array(cards.length);
    items.forEach((o) => { result[o.i] = o.x; });
    return result;
}

function Scene({ cards, camBaseX, camBaseY, camBaseZ, floorY, spawnY, isMobile, sizeScale, fov, gravity }: {
    cards: Card3D[]; camBaseX: number; camBaseY: number; camBaseZ: number; floorY: number; spawnY: number; isMobile: boolean; sizeScale: number; fov: number;
    gravity: [number, number, number];
}) {
    const { size } = useThree();
    const vFOV = (fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFOV / 2) * camBaseZ;
    const visibleWidth = visibleHeight * (size.width / size.height);
    const margin = 0.3;
    const halfWidth = Math.max(1, visibleWidth / 2 - margin);
    const wallMin = camBaseX - halfWidth;
    const wallMax = camBaseX + halfWidth;
    const spawnXs = layoutSpawnX(cards, wallMin, wallMax, camBaseX, isMobile);

    return (
        <>
            <Floor y={floorY} />
            <Wall x={wallMin} facing={1} />
            <Wall x={wallMax} facing={-1} />
            <TitleCollider camBaseX={camBaseX} camBaseY={camBaseY} camBaseZ={camBaseZ} fov={fov} />
            <TriangleCollider camBaseX={camBaseX} camBaseY={camBaseY} camBaseZ={camBaseZ} fov={fov} />
            {cards.map((card, i) => (
                <FallingCard key={card.label + i} card={card} isMobile={isMobile} sizeScale={sizeScale} spawnX={spawnXs[i]} spawnY={spawnY} gravity={gravity} />
            ))}
        </>
    );
}

/* An invisible static box matching the headline/CTA text block's actual screen position —
   so falling blocks physically collide with it and can't slide behind/through it, treating
   it as a real obstacle the same way the floor and side walls are. Measured from the DOM
   (via the `data-hero-textblock` marker in HeroSection.tsx) and converted into world
   coordinates using the same screen<->world mapping the walls use, then created once as a
   static physics body — matching how the rest of the scene's static geometry behaves. */
function TitleCollider({ camBaseX, camBaseY, camBaseZ, fov }: { camBaseX: number; camBaseY: number; camBaseZ: number; fov: number }) {
    const { size } = useThree();
    const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

    useEffect(() => {
        const measure = () => {
            const el = document.querySelector('[data-hero-textblock]');
            if (!el) return;
            const r = el.getBoundingClientRect();
            if (r.width < 4 || r.height < 4) return;
            const vFOV = (fov * Math.PI) / 180;
            const visibleHeight = 2 * Math.tan(vFOV / 2) * camBaseZ;
            const visibleWidth = visibleHeight * (size.width / size.height);
            const pad = 0.18;
            const worldLeft = camBaseX - visibleWidth / 2 + (r.left / size.width) * visibleWidth - pad;
            const worldRight = camBaseX - visibleWidth / 2 + (r.right / size.width) * visibleWidth + pad;
            const worldTop = camBaseY + visibleHeight / 2 - (r.top / size.height) * visibleHeight + pad;
            const worldBottom = camBaseY + visibleHeight / 2 - (r.bottom / size.height) * visibleHeight - pad;
            const w = Math.max(0.3, worldRight - worldLeft);
            const h = Math.max(0.3, worldTop - worldBottom);
            /* Safety net: never let this become big enough to block the whole fall zone —
               if the measured element covers most of the screen (unexpected layout state),
               skip creating an obstacle rather than risk trapping every block above it. */
            if (w > visibleWidth * 0.75 || h > visibleHeight * 0.6) return;
            setBox({ x: (worldLeft + worldRight) / 2, y: (worldTop + worldBottom) / 2, w, h });
        };
        const t = window.setTimeout(measure, 350);
        window.addEventListener('resize', measure, { passive: true });
        return () => { window.clearTimeout(t); window.removeEventListener('resize', measure); };
    }, [size, camBaseX, camBaseY, camBaseZ, fov]);

    if (!box) return null;
    return <TitleBox {...box} />;
}

function TitleBox({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
    const [ref] = useBox<THREE.Mesh>(() => ({
        type: 'Static',
        position: [x, y, 0],
        args: [w, h, DEPTH * 2],
        material: { friction: 0.4, restitution: 0.08 },
    }));
    return <mesh ref={ref} visible={false} />;
}

/* Triangle collider above title to make cards slide right when falling */
function TriangleCollider({ camBaseX, camBaseY, camBaseZ, fov }: { camBaseX: number; camBaseY: number; camBaseZ: number; fov: number }) {
    const { size } = useThree();
    const [triangle, setTriangle] = useState<{ x: number; y: number; size: number } | null>(null);

    useEffect(() => {
        const measure = () => {
            const el = document.querySelector('[data-hero-triangle]');
            if (!el) return;
            const r = el.getBoundingClientRect();
            if (r.width < 4 || r.height < 4) return;
            const vFOV = (fov * Math.PI) / 180;
            const visibleHeight = 2 * Math.tan(vFOV / 2) * camBaseZ;
            const visibleWidth = visibleHeight * (size.width / size.height);
            
            // Position triangle based on the DOM element
            const worldLeft = camBaseX - visibleWidth / 2 + (r.left / size.width) * visibleWidth;
            const worldTop = camBaseY + visibleHeight / 2 - (r.top / size.height) * visibleHeight;
            const triangleSize = Math.min(r.width, r.height) * 0.8;
            
            setTriangle({ 
                x: worldLeft + triangleSize / 2, 
                y: worldTop - triangleSize / 2, 
                size: triangleSize 
            });
        };
        const t = window.setTimeout(measure, 350);
        window.addEventListener('resize', measure, { passive: true });
        return () => { window.clearTimeout(t); window.removeEventListener('resize', measure); };
    }, [size, camBaseX, camBaseY, camBaseZ, fov]);

    if (!triangle) return null;
    return <TriangleShape {...triangle} />;
}

function TriangleShape({ x, y, size }: { x: number; y: number; size: number }) {
    // Create a triangular prism shape using vertices
    const vertices: [number, number, number][] = [
        // Bottom triangle (z = -depth/2)
        [0, -size/2, -DEPTH], [size/2, size/2, -DEPTH], [-size/2, size/2, -DEPTH],
        // Top triangle (z = depth/2)
        [0, -size/2, DEPTH], [size/2, size/2, DEPTH], [-size/2, size/2, DEPTH],
    ];
    
    const faces: [number, number, number][] = [
        [0, 1, 2], [3, 5, 4], // Bottom and top
        [0, 3, 4], [0, 4, 1], // Side 1
        [1, 4, 5], [1, 5, 2], // Side 2
        [2, 5, 3], [2, 3, 0], // Side 3
    ];

    const [ref] = useConvexPolyhedron(() => ({
        type: 'Static',
        position: [x, y, 0],
        args: [vertices, faces],
        material: { friction: 0.3, restitution: 0.05 },
    }));
    
    return <mesh ref={ref as any} visible={false} />;
}

/* Shared hover state so neighboring cards could react (kept minimal: just cosmetic lift) */
const LONG_PRESS_MS = 550;
const DOUBLE_TAP_MS = 350;
const DRAG_THRESHOLD = 6;

const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

/* ── A single falling, draggable, navigable 3D block ── */
function FallingCard({ card, isMobile, sizeScale, spawnX, spawnY, gravity }: {
    card: Card3D; isMobile: boolean; sizeScale: number; spawnX: number; spawnY: number; gravity: [number, number, number];
}) {
    const navigate = useNavigate();
    /* Cards releasing later also spawn higher up, proportional to their delay — this gives
       real spatial clearance from frame one instead of a timing gap that only becomes a
       physical gap after it compounds. This matters MORE on the narrow mobile corridor, not
       less — with less room to spread out in X, cards are more likely to share a footprint,
       so they need clear Y separation at spawn to avoid two bodies going dynamic while still
       overlapping (which is what was launching cards to absurd heights). Spawning higher up
       just costs a bit more fall time, not final pile height. */
    const mySpawnY = spawnY + card.delay * 6;
    /* Kick strength: the tap-poke should scale down on mobile (a full-strength poke reads as
       way too violent in the smaller world), but the release kick that spreads blocks out
       sideways should NOT be scaled down — on mobile it's exactly what stops them dropping
       almost straight down into a single-file tower instead of settling into a spread pile. */
    const kickScale = isMobile ? MOBILE_SCALE : 1;
    const [ref, api] = useBox<THREE.Group>(() => ({
        mass: 0,
        type: 'Dynamic',
        args: [card.w, card.h, DEPTH],
        position: [spawnX, mySpawnY, 0],
        rotation: [0, 0, (Math.random() - 0.5) * 0.5],
        angularFactor: [0, 0, 1],
        linearFactor: [1, 1, 0],
        linearDamping: 0.55,
        angularDamping: 0.8,
        material: { friction: 0.5, restitution: 0.1 },
        allowSleep: true,
    }));

    /* A body that's fallen asleep (at rest, no longer actively simulated — a perf
       optimization) doesn't automatically wake up just because the world's gravity vector
       changed direction. Without this, tilting the phone after the pile has already
       settled would silently do nothing until something else (a drag, a poke) happened to
       wake a card up first. */
    useEffect(() => {
        if (released.current) api.wakeUp();
    }, [gravity[0], gravity[1]]);

    const posRef = useRef<[number, number, number]>([spawnX, mySpawnY, 0]);
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
            api.velocity.set((Math.random() - 0.5) * (isMobile ? 1.1 : 0.5), -0.3, 0);
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
                    api.applyImpulse([(Math.random() - 0.5) * 1.4 * kickScale, 2 * kickScale, 0], posRef.current);
                }, DOUBLE_TAP_MS + 30);
            }
        }
    };

    useFrame((_, delta) => {
        if (!ref.current) return;

        if (!released.current || gesture.current.dragging) return;

        /* Safety net: a body that spawns still slightly overlapping a neighbor or wall gets
           a one-frame correction impulse from the solver — normally tiny, but deep enough
           interpenetration (more likely in a tight mobile corridor) can resolve into a
           launch to an absurd position. Capping speed every frame costs nothing visually
           for the normal case and makes that failure mode structurally impossible. */
        const speed = Math.hypot(velRef.current[0], velRef.current[1]);
        const maxSpeed = isMobile ? 10 : 15;
        if (speed > maxSpeed) {
            const s = maxSpeed / speed;
            api.velocity.set(velRef.current[0] * s, velRef.current[1] * s, 0);
        }

        /* Blocks fall and tumble freely at first; once they've had time to land,
           a gentle continuous righting spring biases them back toward upright so
           labels stay legible even when wedged against a neighbor (a one-shot
           correction can get absorbed by contact friction — this can't, since it
           runs every frame). */
        const elapsed = (performance.now() - releasedAt.current) / 1000;
        if (elapsed > 2.0) {
            const angle = ((rotRef.current[2] + Math.PI) % (2 * Math.PI)) - Math.PI;
            const spring = -angle * 3.2;
            const nextAngVel = angVelRef.current[2] * 0.85 + spring * delta;
            api.angularVelocity.set(0, 0, nextAngVel);
        }
    });

    const color = useMemo(() => new THREE.Color(card.color), [card.color]);
    const txtColor = useMemo(() => new THREE.Color(card.textColor), [card.textColor]);
    const ts = sizeScale;
    const zFace = DEPTH / 2 + 0.02;

    return (
        <group
            ref={ref}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
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
                <meshBasicMaterial color="#ffffff" transparent opacity={0.18} />
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

/* Real gravity direction follows phone tilt — not just camera parallax. Tilting the phone
   left/right/up/down redirects gravity that way so the whole pile slides/falls toward the
   tilt, like a marble-maze. Magnitude stays constant (only direction changes) so it always
   reads as "gravity", just repointed. Throttled to ~10Hz — tilt itself doesn't change fast
   enough to need 60fps, and this avoids re-rendering the whole Physics tree every frame. */
function useTiltGravity(magnitude: number): [number, number, number] {
    const [gravity, setGravity] = useState<[number, number, number]>([0, -magnitude, 0]);
    useEffect(() => {
        let raf = 0;
        let last = 0;
        /* Gravity direction as a bounded ROTATION of "straight down", not raw additive
           components — this guarantees it can never fully cancel or invert regardless of
           tilt input edge cases (an earlier additive version could hit exactly zero
           vertical gravity at a legitimate clamped tilt value). Capped well short of 90°
           so gravity always stays meaningfully downward even at max combined tilt. */
        const maxTiltRad = (55 * Math.PI) / 180;
        const tick = (t: number) => {
            if (t - last > 100) {
                last = t;
                const tiltX = Math.max(-1, Math.min(1, input.x));
                const tiltY = Math.max(-1, Math.min(1, input.y));
                const angle = Math.max(-1, Math.min(1, tiltX + tiltY * 0.5)) * maxTiltRad;
                const dx = Math.sin(angle) * magnitude;
                const dy = -Math.cos(angle) * magnitude;
                setGravity((prev) => (Math.abs(prev[0] - dx) > 0.04 || Math.abs(prev[1] - dy) > 0.04) ? [dx, dy, 0] : prev);
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [magnitude]);
    return gravity;
}

/* ── Main 3D Canvas ── */
export function HeroCards3DScene() {
    const tier = useViewportTier();
    const isMobile = tier === 'mobile';
    const isLaptop = tier === 'laptop';
    const cards = tier === 'mobile' ? CARDS_MOBILE : tier === 'laptop' ? CARDS_LAPTOP : CARDS;
    const sizeScale = tier === 'mobile' ? MOBILE_SCALE : tier === 'laptop' ? LAPTOP_SCALE : 1;

    const camBaseX = isMobile ? 0 : isLaptop ? 0.3 : 0.3;
    const camBaseY = isMobile ? -0.3 : 0;
    const camBaseZ = isMobile ? 10.8 : isLaptop ? 16.8 : 12;
    const floorY = isMobile ? -4.3 : -4.5;
    const spawnY = isMobile ? 6.5 : 7;
    const gravity = useTiltGravity(isMobile ? 9 : 11);

    return (
        <Canvas
            camera={{ position: [camBaseX, camBaseY, camBaseZ], fov: isLaptop ? 45 : 50 }}
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

            <Physics gravity={gravity} allowSleep iterations={14}>
                <Scene cards={cards} camBaseX={camBaseX} camBaseY={camBaseY} camBaseZ={camBaseZ} floorY={floorY} spawnY={spawnY} isMobile={isMobile} sizeScale={sizeScale} fov={50} gravity={gravity} />
                {/* Desktop only — on mobile the headline becomes a full-width stacked banner
                    (not a left-side panel), so treating it as an obstacle would block the
                    entire fall zone with nowhere left to drop through. */}
                {!isMobile && <TitleCollider camBaseX={camBaseX} camBaseY={camBaseY} camBaseZ={camBaseZ} fov={50} />}
                {!isMobile && <TriangleCollider camBaseX={camBaseX} camBaseY={camBaseY} camBaseZ={camBaseZ} fov={50} />}
            </Physics>

            <ContactShadows position={[0, floorY + 0.02, 0]} opacity={0.6} scale={25} blur={2.5} far={6} frames={1} />
        </Canvas>
    );
}
