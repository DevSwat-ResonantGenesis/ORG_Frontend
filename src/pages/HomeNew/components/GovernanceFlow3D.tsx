/**
 * GovernanceFlow3D - Premium 3D WebGL Governance Visualization
 * 
 * Particles flowing through 5 governance layers with premium glow effects.
 * Uses SAME particle style as hero sphere (blue/cyan/white orbits).
 * 
 * Layers:
 * L1 - Identity (top)
 * L2 - Semantic
 * L3 - Governance Gate (center - key decision point)
 * L4 - Trust
 * L5 - Ledger (bottom)
 * 
 * Particle Behavior:
 * - Red (blocked): Disappear at L3
 * - Orange (flagged): Slow down significantly
 * - Green (passed): Flow through all layers, create green glow at bottom
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from '../HomeNew.module.css';

// Governance states with colors matching hero sphere palette
const COLORS = {
    default: new THREE.Color('#7dd3fc'),    // Sky blue - flowing (same as hero)
    defaultWhite: new THREE.Color('#ffffff'), // White blend
    defaultDeep: new THREE.Color('#2563eb'),  // Deep blue accent
    passed: new THREE.Color('#22c55e'),      // Green - passed
    passedGlow: new THREE.Color('#4ade80'),  // Lighter green glow
    flagged: new THREE.Color('#f59e0b'),     // Orange - flagged
    blocked: new THREE.Color('#ef4444'),     // Red - blocked
    layer: new THREE.Color('#3b82f6'),       // Blue - layer rings
    glow: new THREE.Color('#06b6d4'),        // Cyan - glow (same as hero)
    white: new THREE.Color('#ffffff'),       // White - highlights
};

// Layer Y positions (normalized -2 to 2)
const LAYERS = [
    { y: 1.6, name: 'Identity', radius: 1.2 },
    { y: 0.8, name: 'Semantic', radius: 1.4 },
    { y: 0.0, name: 'Governance', radius: 1.6 },  // Center - main gate
    { y: -0.8, name: 'Trust', radius: 1.4 },
    { y: -1.6, name: 'Ledger', radius: 1.2 },
];

interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    baseVelocity: number;
    layer: number;
    state: 'flowing' | 'passed' | 'flagged' | 'blocked';
    life: number;
    maxLife: number;
    size: number;
    delay: number;
    fadeOut: number; // For disappearing effect
    orbitAngle: number; // For orbital motion like hero
    orbitSpeed: number;
    orbitRadius: number;
}

const GovernanceFlow3D: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        
        // Get container dimensions
        const container = mountRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight || 500;

        // Camera
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.z = 5;
        camera.position.y = 0;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x3b82f6, 1.5, 20);
        pointLight1.position.set(3, 2, 4);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x06b6d4, 1, 20);
        pointLight2.position.set(-3, -2, 3);
        scene.add(pointLight2);

        // Create layer rings
        const layerRings: THREE.Mesh[] = [];
        LAYERS.forEach((layer, idx) => {
            // Torus ring for each layer
            const ringGeometry = new THREE.TorusGeometry(layer.radius, 0.02, 16, 100);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: COLORS.layer,
                emissive: COLORS.glow,
                emissiveIntensity: idx === 2 ? 0.5 : 0.2, // Governance gate glows more
                transparent: true,
                opacity: idx === 2 ? 0.8 : 0.4,
                metalness: 0.5,
                roughness: 0.3,
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.y = layer.y;
            ring.rotation.x = Math.PI / 2;
            scene.add(ring);
            layerRings.push(ring);

            // Add glow ring for governance gate (L3)
            if (idx === 2) {
                const glowGeometry = new THREE.TorusGeometry(layer.radius + 0.1, 0.08, 16, 100);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: COLORS.glow,
                    transparent: true,
                    opacity: 0.15,
                });
                const glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
                glowRing.position.y = layer.y;
                glowRing.rotation.x = Math.PI / 2;
                scene.add(glowRing);
            }
        });

        // Create central core (like hero sphere core)
        const coreGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const coreMaterial = new THREE.MeshPhysicalMaterial({
            color: COLORS.glow,
            emissive: COLORS.white,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.6,
            metalness: 0.2,
            roughness: 0.1,
            transmission: 0.3,
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 0; // At governance gate level
        scene.add(core);

        // Particle system - SAME STYLE AS HERO SPHERE
        const particles: Particle[] = [];
        const particleCount = 300; // More particles for richer effect
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        // Initialize particles with hero sphere style
        for (let i = 0; i < particleCount; i++) {
            const orbitRadius = 0.3 + Math.random() * 0.8;
            const orbitAngle = Math.random() * Math.PI * 2;
            
            const particle: Particle = {
                position: new THREE.Vector3(
                    Math.cos(orbitAngle) * orbitRadius,
                    2.5 + Math.random() * 2, // Start above
                    Math.sin(orbitAngle) * orbitRadius
                ),
                velocity: new THREE.Vector3(0, -0.015 - Math.random() * 0.008, 0),
                baseVelocity: 0.015 + Math.random() * 0.008,
                layer: 0,
                state: 'flowing',
                life: 0,
                maxLife: 400 + Math.random() * 200,
                size: 0.02 + Math.random() * 0.015, // Smaller like hero sphere
                delay: Math.random() * 150,
                fadeOut: 1.0,
                orbitAngle: orbitAngle,
                orbitSpeed: 0.5 + Math.random() * 0.5,
                orbitRadius: orbitRadius,
            };
            particles.push(particle);

            positions[i * 3] = particle.position.x;
            positions[i * 3 + 1] = particle.position.y;
            positions[i * 3 + 2] = particle.position.z;

            // Hero sphere color blend: Sky Blue → White with Deep Blue accents
            const mix = Math.random();
            let color;
            if (mix < 0.15) {
                color = COLORS.defaultDeep; // 15% deep blue accents
            } else {
                const blend = Math.random() * 0.7 + 0.3;
                color = COLORS.default.clone().lerp(COLORS.defaultWhite, blend);
            }
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = particle.size;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Particle material - same style as hero sphere
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.025,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);

        // Green glow pool at bottom - BLURRED with gradient shader
        const glowPoolGeometry = new THREE.PlaneGeometry(4, 4, 1, 1);
        const glowPoolMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: 0 },
                color: { value: new THREE.Vector3(0.29, 0.87, 0.5) }, // Green
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float intensity;
                uniform vec3 color;
                varying vec2 vUv;
                
                void main() {
                    // Distance from center
                    vec2 center = vec2(0.5, 0.5);
                    float dist = distance(vUv, center);
                    
                    // Soft radial gradient - blur effect
                    float alpha = smoothstep(0.5, 0.0, dist);
                    alpha = pow(alpha, 1.5); // Softer falloff
                    
                    // Pulsing effect
                    float pulse = 0.7 + 0.3 * sin(time * 2.0);
                    alpha *= pulse * intensity;
                    
                    // Very soft, transparent glow
                    gl_FragColor = vec4(color, alpha * 0.3);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        const glowPool = new THREE.Mesh(glowPoolGeometry, glowPoolMaterial);
        glowPool.position.y = -2.0;
        glowPool.rotation.x = -Math.PI / 2;
        scene.add(glowPool);

        // Track passed particles for glow intensity
        let passedCount = 0;
        let glowIntensity = 0;

        // Vertical flow lines (subtle)
        const flowLineCount = 12;
        const flowLines: THREE.Line[] = [];
        for (let i = 0; i < flowLineCount; i++) {
            const angle = (i / flowLineCount) * Math.PI * 2;
            const radius = 0.8;
            const lineGeometry = new THREE.BufferGeometry();
            const linePositions = new Float32Array([
                Math.cos(angle) * radius, 2, Math.sin(angle) * radius,
                Math.cos(angle) * radius * 0.6, -2, Math.sin(angle) * radius * 0.6,
            ]);
            lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: COLORS.layer,
                transparent: true,
                opacity: 0.1,
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
            flowLines.push(line);
        }

        // Animation
        const clock = new THREE.Clock();
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
            mouseY = -((e.clientY - rect.top) / height - 0.5) * 2;
        };
        container.addEventListener('mousemove', handleMouseMove);

        // Handle resize
        const handleResize = () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight || 500;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);

        // Store animation frame ID for cleanup
        let animationFrameId: number;
        const animateWrapper = () => {
            animationFrameId = requestAnimationFrame(animateWrapper);
            const t = clock.getElapsedTime();

            // Update particles
            const positionAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
            const colorAttr = particleGeometry.attributes.color as THREE.BufferAttribute;
            const sizeAttr = particleGeometry.attributes.size as THREE.BufferAttribute;

            passedCount = 0;

            particles.forEach((particle, i) => {
                if (particle.delay > 0) {
                    particle.delay--;
                    return;
                }

                particle.life++;

                // Orbital motion like hero sphere
                particle.orbitAngle += particle.orbitSpeed * 0.01;
                const orbitX = Math.cos(particle.orbitAngle) * particle.orbitRadius;
                const orbitZ = Math.sin(particle.orbitAngle) * particle.orbitRadius;

                // Flow downward with orbital motion
                particle.position.x = orbitX;
                particle.position.z = orbitZ;
                particle.position.y += particle.velocity.y;

                // Determine current layer
                const y = particle.position.y;
                let newLayer = 0;
                for (let l = 0; l < LAYERS.length; l++) {
                    if (y < LAYERS[l].y + 0.3) {
                        newLayer = l + 1;
                    }
                }

                // State changes at governance gate (L3)
                if (newLayer >= 3 && particle.layer < 3) {
                    const rand = Math.random();
                    if (rand < 0.7) {
                        particle.state = 'passed';
                    } else if (rand < 0.85) {
                        particle.state = 'flagged';
                        particle.velocity.y = -particle.baseVelocity * 0.15;
                    } else {
                        particle.state = 'blocked';
                        particle.velocity.y = 0;
                        particle.fadeOut = 1.0;
                    }
                }

                particle.layer = newLayer;

                // Handle different states
                let color = COLORS.default.clone().lerp(COLORS.defaultWhite, Math.random() * 0.5);
                let size = particle.size;

                if (particle.state === 'blocked') {
                    particle.fadeOut -= 0.02;
                    color = COLORS.blocked;
                    size = particle.size * particle.fadeOut;
                    
                    if (particle.fadeOut <= 0) {
                        resetParticle(particle, i);
                        return;
                    }
                } else if (particle.state === 'flagged') {
                    color = COLORS.flagged;
                } else if (particle.state === 'passed' && particle.layer >= 3) {
                    color = COLORS.passed;
                    
                    if (particle.layer >= 5) {
                        passedCount++;
                    }
                }

                colorAttr.setXYZ(i, color.r, color.g, color.b);
                sizeAttr.setX(i, size);

                if (particle.position.y < -2.2) {
                    if (particle.state === 'passed') {
                        passedCount++;
                    }
                    resetParticle(particle, i);
                    return;
                }

                if (particle.life > particle.maxLife) {
                    resetParticle(particle, i);
                    return;
                }

                positionAttr.setXYZ(i, particle.position.x, particle.position.y, particle.position.z);
            });

            function resetParticle(particle: Particle, i: number) {
                const newOrbitRadius = 0.3 + Math.random() * 0.8;
                const newOrbitAngle = Math.random() * Math.PI * 2;
                
                particle.position.set(
                    Math.cos(newOrbitAngle) * newOrbitRadius,
                    2.5 + Math.random() * 1.5,
                    Math.sin(newOrbitAngle) * newOrbitRadius
                );
                particle.baseVelocity = 0.015 + Math.random() * 0.008;
                particle.velocity.set(0, -particle.baseVelocity, 0);
                particle.layer = 0;
                particle.state = 'flowing';
                particle.life = 0;
                particle.maxLife = 400 + Math.random() * 200;
                particle.fadeOut = 1.0;
                particle.orbitAngle = newOrbitAngle;
                particle.orbitRadius = newOrbitRadius;
                particle.orbitSpeed = 0.5 + Math.random() * 0.5;
                
                const mix = Math.random();
                let color;
                if (mix < 0.15) {
                    color = COLORS.defaultDeep;
                } else {
                    const blend = Math.random() * 0.7 + 0.3;
                    color = COLORS.default.clone().lerp(COLORS.defaultWhite, blend);
                }
                colorAttr.setXYZ(i, color.r, color.g, color.b);
                sizeAttr.setX(i, particle.size);
            }

            const targetIntensity = Math.min(1.0, passedCount * 0.08);
            glowIntensity += (targetIntensity - glowIntensity) * 0.05;
            glowPoolMaterial.uniforms.time.value = t;
            glowPoolMaterial.uniforms.intensity.value = glowIntensity;

            positionAttr.needsUpdate = true;
            colorAttr.needsUpdate = true;
            sizeAttr.needsUpdate = true;

            layerRings.forEach((ring, idx) => {
                ring.rotation.z = t * 0.1 * (idx % 2 === 0 ? 1 : -1);
            });

            const coreScale = 1 + Math.sin(t * 2) * 0.1;
            core.scale.set(coreScale, coreScale, coreScale);
            (core.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.3 + Math.sin(t * 3) * 0.2;

            camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
            camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.02;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };

        animateWrapper();

        // Cleanup - prevent WebGL context leaks
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            container.removeEventListener('mousemove', handleMouseMove);
            
            // Dispose all geometries and materials
            particleGeometry.dispose();
            particleMaterial.dispose();
            glowPoolGeometry.dispose();
            glowPoolMaterial.dispose();
            coreGeometry.dispose();
            coreMaterial.dispose();
            
            layerRings.forEach(ring => {
                ring.geometry.dispose();
                (ring.material as THREE.Material).dispose();
            });
            
            flowLines.forEach(line => {
                line.geometry.dispose();
                (line.material as THREE.Material).dispose();
            });
            
            // Remove DOM element first
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            
            // Dispose renderer and force context loss
            renderer.dispose();
            renderer.forceContextLoss();
        };
    }, []);

    return (
        <div className={styles.governanceFlow3DContainer} ref={mountRef}>
            {/* Layer labels overlay - LEFT */}
            <div className={styles.governanceFlow3DLabels}>
                <div className={styles.flowLabel} style={{ top: '8%' }}>
                    <span className={styles.flowLabelText}>L1 — Identity</span>
                </div>
                <div className={styles.flowLabel} style={{ top: '26%' }}>
                    <span className={styles.flowLabelText}>L2 — Semantic</span>
                </div>
                <div className={styles.flowLabel} style={{ top: '44%' }}>
                    <span className={styles.flowLabelText}>L3 — Governance</span>
                    <span className={styles.flowLabelBadge}>GATE</span>
                </div>
                <div className={styles.flowLabel} style={{ top: '62%' }}>
                    <span className={styles.flowLabelText}>L4 — Trust</span>
                </div>
                <div className={styles.flowLabel} style={{ top: '80%' }}>
                    <span className={styles.flowLabelText}>L5 — Ledger</span>
                </div>
            </div>

            {/* Legend overlay - RIGHT */}
            <div className={styles.governanceFlow3DLegend}>
                <div className={styles.legendTitle}>What You're Seeing</div>
                <p className={styles.legendDescription}>
                    Each particle represents an AI action flowing through our 5-layer governance system.
                </p>
                
                <div className={styles.legendColors}>
                    <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: '#7dd3fc' }}></span>
                        <span className={styles.legendLabel}>Flowing — Action in progress</span>
                    </div>
                    <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: '#22c55e' }}></span>
                        <span className={styles.legendLabel}>Passed — Approved & recorded</span>
                    </div>
                    <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: '#f59e0b' }}></span>
                        <span className={styles.legendLabel}>Flagged — Requires review</span>
                    </div>
                    <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: '#ef4444' }}></span>
                        <span className={styles.legendLabel}>Blocked — Policy violation</span>
                    </div>
                </div>

                <p className={styles.legendNote}>
                    The green glow at the bottom represents successfully governed actions committed to the immutable ledger.
                </p>
            </div>
        </div>
    );
};

export default GovernanceFlow3D;
