import { deviceIsMobile } from '@/utils/deviceCheck';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './ThreeParticleSphere.module.css';

/**
 * ThreeParticleSphere - Ultra-Enhanced Vision Pro Aesthetic
 * Multi-layer particle field with wireframe, core glow, and depth
 */
export const ThreeParticleSphere: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const getIsMobileLayout = () => {
            if (typeof window === 'undefined') return false;
            return deviceIsMobile() || window.matchMedia('(max-width: 768px)').matches;
        };

        let isMobileLayout = getIsMobileLayout();

        // Scene
        const scene = new THREE.Scene();

        // Camera - positioned for sphere to fit nicely in hero section
        // Slightly zoomed out to prevent edge clipping
        const camera = new THREE.PerspectiveCamera(
            52, // Slightly wider FOV
            1, // 1:1 aspect ratio
            0.1,
            100
        );
        camera.position.z = 4.2; // Slightly back to prevent edge clipping
        camera.position.y = 0;

        const applyCameraSettings = () => {
            if (isMobileLayout) {
                camera.fov = 52;
                camera.position.z = 3.25;
                camera.position.y = 0;
            } else {
                camera.fov = 52;
                camera.position.z = 4.2;
                camera.position.y = 0;
            }
            camera.updateProjectionMatrix();
        };

        applyCameraSettings();

        // Renderer - Ultra High Quality
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });

        // Desktop/laptop should match the previous fixed hero sphere sizing.
        const canvasSize = 820;

        const getNextSize = () => {
            const el = mountRef.current;
            if (!el) return 300;
            const rect = el.getBoundingClientRect();
            const size = Math.floor(Math.min(rect.width, rect.height));
            return Math.max(1, size || 300);
        };

        const applySize = () => {
            if (!isMobileLayout) {
                renderer.setSize(canvasSize, canvasSize, false);
                camera.aspect = 1;
                camera.updateProjectionMatrix();
                return;
            }

            const nextSize = getNextSize();
            renderer.setSize(nextSize, nextSize, false);
            camera.aspect = 1;
            camera.updateProjectionMatrix();
        };

        applySize();
        // Maximum quality - no mobile compromise for sharpness
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
        
        // Style canvas to stay centered and not move
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.margin = '0 auto';

        if (!isMobileLayout) {
            renderer.domElement.style.width = `${canvasSize}px`;
            renderer.domElement.style.height = `${canvasSize}px`;
        } else {
            renderer.domElement.style.width = '100%';
            renderer.domElement.style.height = '100%';
        }
        
        mountRef.current.appendChild(renderer.domElement);

        // ============================================================
        // LIGHTING for 3D depth and realism
        // ============================================================
        // Ambient light - soft overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        // Point light 1 - main light (front-right) - Bright Blue
        const pointLight1 = new THREE.PointLight(0x3b82f6, 1.5, 100);
        pointLight1.position.set(3, 2, 5);
        scene.add(pointLight1);

        // Point light 2 - accent light (back-left) - Cool Cyan
        const pointLight2 = new THREE.PointLight(0x06b6d4, 1, 100);
        pointLight2.position.set(-3, -2, 3);
        scene.add(pointLight2);

        // Point light 3 - top light for highlights - Bright Sky Blue
        const pointLight3 = new THREE.PointLight(0xbae6fd, 0.8, 100);
        pointLight3.position.set(0, 4, 2);
        scene.add(pointLight3);

        // ============================================================
        // ============================================================
        // LAYER 1: Hyper-Realistic 3D Core (Physical Glass & Energy)
        // ============================================================

        // 1. Outer Glass Shell (Physical Material for Realism)
        const coreOuterGeometry = new THREE.SphereGeometry(0.5, 128, 128); // Ultra smooth
        const coreOuterMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x3b82f6,       // Clear Blue
            emissive: 0x1d4ed8,    // Deep Blue glow
            emissiveIntensity: 0.2, // Subtle self-emission
            roughness: 0.1,        // Very smooth
            metalness: 0.1,        // Slight metallic hint
            transmission: 0.6,     // Glass transparency
            thickness: 1.5,        // Refraction volume
            clearcoat: 1.0,        // High polish
            clearcoatRoughness: 0.0,
            transparent: true,
            opacity: 0.8,
            side: THREE.FrontSide, // Render outside only for proper refraction
        });
        const coreOuter = new THREE.Mesh(coreOuterGeometry, coreOuterMaterial);
        scene.add(coreOuter);

        // 2. Mid Atmoshpere (Frosted Energy)
        const coreMidGeometry = new THREE.SphereGeometry(0.38, 64, 64);
        const coreMidMaterial = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,       // Cyan
            emissive: 0x3b82f6,    // Blue
            emissiveIntensity: 0.8,
            roughness: 0.7,        // Frosted look
            metalness: 0.3,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
        });
        const coreMid = new THREE.Mesh(coreMidGeometry, coreMidMaterial);
        scene.add(coreMid);

        // 3. Inner Reactor (Intense Glow)
        const coreInnerGeometry = new THREE.SphereGeometry(0.24, 64, 64);
        const coreInnerMaterial = new THREE.MeshStandardMaterial({
            color: 0x67e8f9,       // Bright Cyan
            emissive: 0xbae6fd,    // White-Blue
            emissiveIntensity: 1.5,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.9,
        });
        const coreInner = new THREE.Mesh(coreInnerGeometry, coreInnerMaterial);
        scene.add(coreInner);

        // 4. Center Singularity (Pure Light)
        const coreCenterGeometry = new THREE.SphereGeometry(0.12, 64, 64);
        const coreCenterMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0,
        });
        const coreCenter = new THREE.Mesh(coreCenterGeometry, coreCenterMaterial);
        scene.add(coreCenter);

        // ============================================================
        // LAYER 2: Enhanced 3D Wireframe Sphere with Nebula Effect
        // ============================================================
        const wireframeGeometry = new THREE.SphereGeometry(1.1, 48, 48); // More segments
        const wireframeMaterial = new THREE.MeshPhongMaterial({
            color: 0x93c5fd, // Brighter Sky Blue for more contrast
            emissive: 0x60a5fa, // Stronger blue glow
            emissiveIntensity: 0.5, // Increased for nebula effect
            wireframe: true,
            transparent: true,
            opacity: 0.45, // Slightly more visible
            shininess: 100, // More shine
            blending: THREE.AdditiveBlending, // Nebula glow effect
        });
        const wireframeSphere = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        scene.add(wireframeSphere);

        // ============================================================
        // LAYER 3: Main Particle Cloud (Gold → White)
        // ============================================================
        const particleCount = isMobileLayout ? 1800 : 4000; // Increased for desktop
        const radius = 1.1;

        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const colorA = new THREE.Color('#7dd3fc'); // Sky Blue
        const colorB = new THREE.Color('#ffffff'); // white
        const colorC = new THREE.Color('#2563eb'); // Deep Blue accent

        for (let i = 0; i < particleCount; i++) {
            // Spherical distribution with some randomness
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * (0.85 + Math.random() * 0.3); // Varied radius

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions.set([x, y, z], i * 3);

            // Enhanced color blend: gold → white with constant flow
            const mix = Math.random();
            let c;
            if (mix < 0.15) {
                // 15% deep gold accents
                c = colorC;
            } else {
                // 85% gold → white gradient
                const blend = Math.random() * 0.7 + 0.3;
                c = colorA.clone().lerp(colorB, blend);
            }
            colors.set([c.r, c.g, c.b], i * 3);

            // Varied particle sizes
            sizes[i] = Math.random() * 0.5 + 0.5;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: isMobileLayout ? 0.015 : 0.025,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            sizeAttenuation: true,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // ============================================================
        // LAYER 4: Nebula Orbital Rings (Multi-Axis "Niuba" Style)
        // ============================================================
        const createNebulaRing = (radius: number, axisTilt: number) => {
            const rCount = isMobileLayout ? 300 : 800;
            const rPos = new Float32Array(rCount * 3);
            const rCol = new Float32Array(rCount * 3);
            const rBase = new THREE.Color('#3b82f6'); // Blue

            for (let i = 0; i < rCount; i++) {
                const theta = Math.random() * Math.PI * 2;
                const spread = (Math.random() - 0.5) * 0.15;
                const r = radius + spread;

                // Create tilted orbit logic
                const x0 = r * Math.cos(theta);
                const z0 = r * Math.sin(theta);
                const y0 = (Math.random() - 0.5) * 0.2; // Nebulous spread height

                // Apply Tilt Rotation (around X axis)
                const y = y0 * Math.cos(axisTilt) - z0 * Math.sin(axisTilt);
                const z = y0 * Math.sin(axisTilt) + z0 * Math.cos(axisTilt);
                const x = x0;

                rPos.set([x, y, z], i * 3);

                const mix = Math.random();
                const c = rBase.clone().lerp(new THREE.Color('#06b6d4'), mix); // Cyan accent
                rCol.set([c.r, c.g, c.b], i * 3);
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(rCol, 3));
            const mat = new THREE.PointsMaterial({
                size: isMobileLayout ? 0.012 : 0.015,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
            });
            return new THREE.Points(geo, mat);
        };

        const orbit1 = createNebulaRing(1.6, 0); // Flat
        const orbit2 = createNebulaRing(1.7, Math.PI / 3); // 60 deg
        const orbit3 = createNebulaRing(1.7, -Math.PI / 3); // -60 deg

        scene.add(orbit1);
        scene.add(orbit2);
        scene.add(orbit3);

        // ============================================================
        // Animation System
        // ============================================================
        const clock = new THREE.Clock();

        // Mouse parallax disabled - keep sphere in fixed position
        // Only pulsation effect, no mouse tracking

        const handleResize = () => {
            const nextIsMobileLayout = getIsMobileLayout();
            if (nextIsMobileLayout !== isMobileLayout) {
                isMobileLayout = nextIsMobileLayout;
                if (!isMobileLayout) {
                    renderer.domElement.style.width = `${canvasSize}px`;
                    renderer.domElement.style.height = `${canvasSize}px`;
                } else {
                    renderer.domElement.style.width = '100%';
                    renderer.domElement.style.height = '100%';
                }

                applyCameraSettings();
            }
            applySize();
        };

        window.addEventListener('resize', handleResize);
        let ro: ResizeObserver | null = null;
        if (isMobileLayout) {
            ro = new ResizeObserver(() => {
                applySize();
            });
            ro.observe(mountRef.current);
        }

        let animationFrameId: number;

        const animate = () => {
            const t = clock.getElapsedTime();

            // Multi-gradient core pulsing (all 4 layers)
            const coreScale1 = 1 + Math.sin(t * 1.2) * 0.08;
            coreOuter.scale.set(coreScale1, coreScale1, coreScale1);
            coreOuterMaterial.opacity = 0.2 + Math.sin(t * 1.5) * 0.08;

            const coreScale2 = 1 + Math.sin(t * 1.3) * 0.09;
            coreMid.scale.set(coreScale2, coreScale2, coreScale2);
            coreMidMaterial.opacity = 0.25 + Math.sin(t * 1.4) * 0.07;

            const coreScale3 = 1 + Math.sin(t * 1.4) * 0.1;
            coreInner.scale.set(coreScale3, coreScale3, coreScale3);
            coreInnerMaterial.opacity = 0.3 + Math.sin(t * 1.3) * 0.08;

            const coreScale4 = 1 + Math.sin(t * 1.5) * 0.12;
            coreCenter.scale.set(coreScale4, coreScale4, coreScale4);
            coreCenterMaterial.opacity = 0.35 + Math.sin(t * 1.2) * 0.1;

            // Wireframe rotation (opposite direction for depth)
            wireframeSphere.rotation.y = -t * 0.1;
            wireframeSphere.rotation.x = Math.sin(t * 0.15) * 0.1;

            // Main particles - slow rotation
            particles.rotation.y = t * 0.06;
            particles.rotation.x = Math.sin(t * 0.18) * 0.04;

            // Gentle harmonic breathing
            const breathScale = 1 + Math.sin(t * 0.4) * 0.025;
            particles.scale.set(breathScale, breathScale, breathScale);

            // Nebula Orbits Animation - Complex Swirls
            orbit1.rotation.y = t * 0.1;
            orbit1.rotation.z = Math.sin(t * 0.15) * 0.08;

            orbit2.rotation.y = t * 0.12;
            orbit2.rotation.x = Math.sin(t * 0.2) * 0.05;

            orbit3.rotation.y = -t * 0.12; // Counter rotate
            orbit3.rotation.x = Math.sin(t * 0.1) * 0.05;

            // Camera stays fixed - no mouse parallax
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup - prevent WebGL context leaks
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            ro?.disconnect();

            // Dispose all geometries and materials
            geometry.dispose();
            material.dispose();
            orbit1.geometry.dispose();
            (orbit1.material as THREE.Material).dispose();
            orbit2.geometry.dispose();
            (orbit2.material as THREE.Material).dispose();
            orbit3.geometry.dispose();
            (orbit3.material as THREE.Material).dispose();
            coreOuterGeometry.dispose();
            coreOuterMaterial.dispose();
            coreMidGeometry.dispose();
            coreMidMaterial.dispose();
            coreInnerGeometry.dispose();
            coreInnerMaterial.dispose();
            coreCenterGeometry.dispose();
            coreCenterMaterial.dispose();
            wireframeGeometry.dispose();
            wireframeMaterial.dispose();

            // Remove DOM element first
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            
            // Dispose renderer and force context loss to free WebGL context
            renderer.dispose();
            renderer.forceContextLoss();
        };
    }, []);


    return <div className={styles.container} ref={mountRef} />;
};

export default ThreeParticleSphere;
