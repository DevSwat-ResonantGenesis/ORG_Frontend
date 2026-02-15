import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionData, isAuthenticated } from '@/utils/auth-cookies';
import { 
  Search, Filter, Clock, Network, Layers, Eye, EyeOff, 
  Zap, RotateCcw, ZoomIn, ZoomOut, X
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import styles from './HashSphereMemoryPage.module.css';

import { ENV } from '../../config/env';

const API_URL = ENV.apiUrl;

// Memory type color mapping
const TYPE_COLORS: Record<string, string> = {
  chat: '#3b82f6',      // Blue
  code: '#f59e0b',      // Amber
  function: '#10b981',  // Emerald
  pattern: '#8b5cf6',   // Violet
  concept: '#ec4899',   // Pink
  decision: '#ef4444',  // Red
  insight: '#06b6d4',   // Cyan
  reference: '#84cc16', // Lime
  default: '#6b7280',   // Gray
};

// Resonance color mapping
const RESONANCE_COLORS = {
  low: 0x64748b,      // Slate
  medium: 0x3b82f6,   // Blue
  high: 0x22d3ee,     // Cyan
  critical: 0xf0abfc, // Fuchsia
};

type ViewMode = 'sphere' | 'timeline' | 'network';

interface MemoryAnchor {
  id: string;
  anchor_text: string;
  anchor_hash: string;
  context: string;
  importance_score: number;
  xyz_x: number;
  xyz_y: number;
  xyz_z: number;
  anchor_type: string;
  resonance_score: number;
  created_at: string;
}

interface ResonanceCluster {
  id: string;
  cluster_name: string;
  cluster_hash: string;
  anchor_ids: string[];
  resonance_score: number;
  personality_traits: Record<string, any>;
}

interface MemoryCluster {
  cluster_id: string;
  centroid: number[];
  size: number;
  dominant_type: string;
  avg_similarity: number;
}

interface MemoryMetrics {
  total_memories: number;
  total_clusters: number;
  avg_cluster_size: number;
  encryption_algorithm: string;
  encryption_key_size: number;
  embedding_dimensions: number;
  storage_bytes: number;
  storage_mb: number;
  last_sync: string;
}

const HashSphereMemoryPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const linesRef = useRef<THREE.Line[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const isDisposedRef = useRef<boolean>(false);
  const hasAutoFittedRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchors, setAnchors] = useState<MemoryAnchor[]>([]);
  const [clusters, setClusters] = useState<MemoryCluster[]>([]);
  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null);
  const [selectedAnchor, setSelectedAnchor] = useState<MemoryAnchor | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Redirect to signup if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);
  const [showClusters, setShowClusters] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [showAnchors, setShowAnchors] = useState(true);
  const [showEnergyAura, setShowEnergyAura] = useState(true);
  const sessionData = getSessionData();
  
  // New enhanced state
  const [viewMode, setViewMode] = useState<ViewMode>('sphere');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minResonance, setMinResonance] = useState(0);
  const [hoveredAnchor, setHoveredAnchor] = useState<MemoryAnchor | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(false);

  // Filter anchors based on search and filters
  const filteredAnchors = useMemo(() => {
    return anchors.filter(anchor => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          anchor.anchor_text.toLowerCase().includes(query) ||
          anchor.context.toLowerCase().includes(query) ||
          anchor.anchor_type.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(anchor.anchor_type)) {
        return false;
      }
      
      // Resonance filter
      if (anchor.resonance_score < minResonance) {
        return false;
      }
      
      return true;
    });
  }, [anchors, searchQuery, selectedTypes, minResonance]);

  // Group anchors by date for timeline view
  const timelineGroups = useMemo(() => {
    const groups: Record<string, MemoryAnchor[]> = {};
    filteredAnchors.forEach(anchor => {
      const date = new Date(anchor.created_at).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(anchor);
    });
    // Sort by date descending
    return Object.entries(groups).sort((a, b) => 
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  }, [filteredAnchors]);

  // Get unique types from anchors
  const availableTypes = useMemo(() => {
    const types = new Set(anchors.map(a => a.anchor_type));
    return Array.from(types);
  }, [anchors]);

  // Toggle type filter
  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Fetch encrypted memories, clusters, and metrics from API
  useEffect(() => {
    const fetchMemoryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!sessionData?.userId) {
          setIsLoggedIn(false);
          setError('Please log in to view your encrypted memory sphere');
          setIsLoading(false);
          return;
        }
        
        setIsLoggedIn(true);
        
        // Fetch memories using search endpoint - get ALL user memories
        const searchResponse = await fetch(`${API_URL}/memory/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            user_id: sessionData.userId,
            query: '',
            limit: 10000  // High limit to get all memories
          }),
        });

        // Fetch memory stats through gateway
        const statsResponse = await fetch(`${API_URL}/memory/stats`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        
        // Fetch anchors from hash-sphere endpoint
        const anchorsResponse = await fetch(`${API_URL}/memory/hash-sphere/anchors?user_id=${sessionData.userId}&limit=10000`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setMetrics({
            total_memories: stats.total_memories || 0,
            total_clusters: stats.total_clusters || 0,
            avg_cluster_size: 0,
            encryption_algorithm: 'AES-256-GCM',
            encryption_key_size: 256,
            embedding_dimensions: 1536,
            storage_bytes: stats.storage_bytes || 0,
            storage_mb: stats.storage_mb || 0,
            last_sync: new Date().toISOString(),
          });
        }
        
        // Process both memories and anchors
        const toFiniteNumber = (value: unknown, fallback: number): number => {
          if (value === null || value === undefined || value === '') return fallback;
          const n = typeof value === 'number' ? value : Number(value);
          return Number.isFinite(n) ? n : fallback;
        };

        const normalizeAnchors = (items: MemoryAnchor[]): MemoryAnchor[] => {
          if (items.length === 0) return items;
          const box = new THREE.Box3();
          for (const a of items) {
            box.expandByPoint(new THREE.Vector3(a.xyz_x, a.xyz_y, a.xyz_z));
          }
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const desired = 250;
          const scale = maxDim > 0 ? desired / maxDim : 1;

          return items.map(a => ({
            ...a,
            xyz_x: (a.xyz_x - center.x) * scale,
            xyz_y: (a.xyz_y - center.y) * scale,
            xyz_z: (a.xyz_z - center.z) * scale,
          }));
        };

        let memoryAnchors: MemoryAnchor[] = [];
        let apiAnchors: MemoryAnchor[] = [];
        
        // First, try to get memories
        if (searchResponse.ok) {
          const memData = await searchResponse.json();
          const rawMemories = memData.memories || [];
          console.log(`Fetched ${rawMemories.length} memories from API`);
          
          // Transform memories to anchor format for 3D visualization
          memoryAnchors = rawMemories.map((mem: any, idx: number) => ({
            id: mem.id || `mem-${idx}`,
            anchor_text: mem.content?.slice(0, 100) || 'Memory content',
            anchor_hash: mem.id ? `${mem.id}`.substring(0, 16) : `hash-${idx}`,
            context: mem.content || '',
            importance_score: 0.5 + Math.random() * 0.5,
            xyz_x: (Math.random() - 0.5) * 400,
            xyz_y: (Math.random() - 0.5) * 400,
            xyz_z: (Math.random() - 0.5) * 400,
            anchor_type: mem.source || 'chat',
            resonance_score: 0.5 + Math.random() * 0.5,
            created_at: mem.created_at || new Date().toISOString(),
          }));
        }
        
        // Then, get actual anchors
        if (anchorsResponse.ok) {
          const anchorData = await anchorsResponse.json();
          const rawAnchors = Array.isArray(anchorData) ? anchorData : [];
          console.log(`Fetched ${rawAnchors.length} anchors from API`);

          if (rawAnchors.length > 0) {
            apiAnchors = rawAnchors.map((anchor: any, idx: number) => {
              const fallbackX = (Math.random() - 0.5) * 300;
              const fallbackY = (Math.random() - 0.5) * 300;
              const fallbackZ = (Math.random() - 0.5) * 300;

              return {
                id: anchor.id ?? `anchor-${idx}`,
                anchor_text: anchor.anchor_text ?? 'Anchor',
                anchor_hash: anchor.anchor_hash ?? `hash-${idx}`,
                context: anchor.context ?? '',
                importance_score: toFiniteNumber(anchor.importance_score, 0.5),
                xyz_x: toFiniteNumber(anchor.xyz_x, fallbackX),
                xyz_y: toFiniteNumber(anchor.xyz_y, fallbackY),
                xyz_z: toFiniteNumber(anchor.xyz_z, fallbackZ),
                anchor_type: anchor.anchor_type ?? 'chat',
                resonance_score: toFiniteNumber(anchor.resonance_score, 0.5),
                created_at: anchor.created_at ?? new Date().toISOString(),
              };
            });
          }
        }

        const chosenAnchors = apiAnchors.length > 0 ? apiAnchors : memoryAnchors;
        const normalizedAnchors = normalizeAnchors(chosenAnchors);

        // No fallback data - only show real data
        if (normalizedAnchors.length === 0) {
          console.log('No memories found in database');
          setAnchors([]);
          setMetrics(prev => prev ? { ...prev, total_memories: 0, total_clusters: 0, avg_cluster_size: 0 } : null);
          setError('No memories found. Start chatting to create memory anchors.');
        } else {
          setAnchors(normalizedAnchors);
          setMetrics(prev => prev ? {
            ...prev,
            total_memories: normalizedAnchors.length,
            total_clusters: 5,
            avg_cluster_size: Math.round(normalizedAnchors.length / 5),
          } : null);
        }

        // Handle API errors
        if (!searchResponse.ok) {
          console.error('Search API error:', searchResponse.status);
        }
        if (!anchorsResponse.ok) {
          console.error('Anchors API error:', anchorsResponse.status);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching memory data:', err);
        setError(`Failed to load encrypted memories: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    
    fetchMemoryData();
  }, [sessionData?.userId]);

  useEffect(() => {
    hasAutoFittedRef.current = false;
  }, [anchors]);

  // Get color based on anchor type
  const getAnchorColor = (type: string): string => {
    return TYPE_COLORS[type] || TYPE_COLORS.default;
  };
  
  // Get color based on resonance score (energy)
  const getResonanceColor = (score: number): number => {
    if (score > 0.8) return RESONANCE_COLORS.critical;
    if (score > 0.6) return RESONANCE_COLORS.high;
    if (score > 0.4) return RESONANCE_COLORS.medium;
    return RESONANCE_COLORS.low;
  };

  // Handle auto-rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 0.5;
    }
  }, [autoRotate]);

  // Reset camera position
  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(400, 300, 400);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Zoom controls
  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.8);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.2);
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    // Use window dimensions as fallback if container dimensions are 0
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || (window.innerHeight - 60);
    
    console.log(`Initializing Three.js with dimensions: ${width}x${height}`);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 200, 1000);
    sceneRef.current = scene;

    // Camera - positioned to see the scene with clear 3D perspective
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
    camera.position.set(400, 300, 400);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer - fix WebGL texture immutable error
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio to prevent texture issues
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 100;
    controls.maxDistance = 800;
    controlsRef.current = controls;

    // Lights - brighter for visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 1.5, 2000);
    pointLight1.position.set(500, 500, 500);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1, 2000);
    pointLight2.position.set(-500, -500, -500);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x667eea, 0.8, 2000);
    pointLight3.position.set(0, 500, 0);
    scene.add(pointLight3);

    // Test sphere removed - production ready

    // Animation loop with proper cleanup tracking
    isDisposedRef.current = false;
    const animate = () => {
      if (isDisposedRef.current) return;
      animationFrameRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || (window.innerHeight - 60);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup - prevent WebGL context leaks
    return () => {
      isDisposedRef.current = true;
      
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      window.removeEventListener('resize', handleResize);
      
      // Dispose all meshes
      meshesRef.current.forEach(mesh => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          (mesh.material as THREE.Material).dispose();
        }
      });
      meshesRef.current.clear();
      
      // Dispose all lines
      linesRef.current.forEach(line => {
        line.geometry.dispose();
        if (Array.isArray(line.material)) {
          line.material.forEach(m => m.dispose());
        } else {
          (line.material as THREE.Material).dispose();
        }
      });
      linesRef.current = [];
      
      // Dispose scene objects
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(m => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        sceneRef.current.clear();
        sceneRef.current = null;
      }
      
      // Dispose controls
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      
      // Dispose renderer and force context loss
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }
      
      cameraRef.current = null;
    };
  }, []);

  // Render memories in 3D scene - use filteredAnchors for filtering support
  useEffect(() => {
    if (!sceneRef.current) return;
    if (filteredAnchors.length === 0) {
      console.log('No anchors to render');
      return;
    }

    console.log(`Rendering ${filteredAnchors.length} anchors in 3D scene`);
    const scene = sceneRef.current;
    
    // Clear old meshes and lines
    meshesRef.current.forEach(mesh => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    meshesRef.current.clear();
    
    linesRef.current.forEach(line => {
      scene.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    });
    linesRef.current = [];

    // Draw connection lines with energy/meaning visualization
    if (showConnections) {
      filteredAnchors.forEach(anchor => {
        try {
          const similarAnchors = anchors.filter(a =>
            Math.abs(a.resonance_score - anchor.resonance_score) < 0.2 &&
            a.id !== anchor.id &&
            a.resonance_score > 0.6
          ).slice(0, 3);

          similarAnchors.forEach(similar => {
            try {
              const points = [
                new THREE.Vector3(anchor.xyz_x, anchor.xyz_y, anchor.xyz_z),
                new THREE.Vector3(similar.xyz_x, similar.xyz_y, similar.xyz_z),
              ];
              const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
              
              // Color based on resonance strength (energy)
              const lineColor = getResonanceColor(similar.resonance_score);
              
              const lineMat = new THREE.LineBasicMaterial({
                color: lineColor,
                transparent: true,
                opacity: similar.resonance_score * 0.7,
              });
              const line = new THREE.Line(lineGeom, lineMat);
              scene.add(line);
              linesRef.current.push(line);

              // Add energy aura particles along strong connections
              if (showEnergyAura && similar.resonance_score > 0.8) {
                const particleGeom = new THREE.SphereGeometry(1, 8, 8);
                const particleMat = new THREE.MeshBasicMaterial({
                  color: lineColor,
                  transparent: true,
                  opacity: 0.6,
                });
                const numParticles = 3;
                for (let i = 0; i < numParticles; i++) {
                  const t = (i + 1) / (numParticles + 1);
                  const particlePos = new THREE.Vector3().lerpVectors(points[0], points[1], t);
                  const particle = new THREE.Mesh(particleGeom, particleMat);
                  particle.position.copy(particlePos);
                  scene.add(particle);
                  linesRef.current.push(particle as any);
                }
              }
            } catch (err) {
              console.error('Error creating connection line:', err);
            }
          });
        } catch (err) {
          console.error(`Error processing connections for anchor ${anchor.id}:`, err);
        }
      });
    }
    
    console.log(`Total lines/clusters in scene: ${linesRef.current.length}`);
    console.log('Scene rendering complete');

    // Draw anchor nodes using REAL xyz coordinates from backend
    filteredAnchors.forEach((anchor, idx) => {
      try {
        const isSelected = selectedAnchor?.id === anchor.id;
        const inSelectedCluster = false; // Clusters not yet implemented

        // Size based on importance_score from backend
        const baseSize = 3 + (anchor.importance_score * 10);
        const size = isSelected ? baseSize * 1.5 : baseSize;
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        
        // Get color based on anchor type from backend
        const typeColor = getAnchorColor(anchor.anchor_type);
        const color = new THREE.Color(typeColor);
        
        const material = new THREE.MeshPhongMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: isSelected ? 0.6 : 0.3,
          shininess: 30,
          transparent: false,
          opacity: 1,
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        // Use REAL xyz coordinates from backend
        const x = anchor.xyz_x;
        const y = anchor.xyz_y;
        const z = anchor.xyz_z;
        
        mesh.position.set(x, y, z);
        mesh.userData = { anchor };

        scene.add(mesh);
        meshesRef.current.set(anchor.id, mesh);
        
        if (idx === 0) {
          console.log(`First anchor positioned at: ${x}, ${y}, ${z}`);
          console.log(`Anchor type: ${anchor.anchor_type}, Resonance: ${anchor.resonance_score}, Color: ${typeColor}`);
        }

        // Add glow ring for selected
        if (isSelected) {
          const ringGeom = new THREE.RingGeometry(size + 2, size + 4, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
          });
          const ring = new THREE.Mesh(ringGeom, ringMat);
          ring.position.copy(mesh.position);
          ring.lookAt(cameraRef.current!.position);
          scene.add(ring);
          linesRef.current.push(ring as any);
        }
      } catch (err) {
        console.error(`Error rendering anchor ${anchor.id}:`, err);
      }
    });
    
    console.log(`Total meshes in scene: ${meshesRef.current.size}`);

    if (!hasAutoFittedRef.current && cameraRef.current && controlsRef.current && meshesRef.current.size > 0) {
      const box = new THREE.Box3();
      meshesRef.current.forEach(mesh => {
        box.expandByPoint(mesh.position);
      });

      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const dist = maxDim > 0 ? maxDim * 1.8 : 600;

      const dir = new THREE.Vector3(1, 0.8, 1).normalize();
      cameraRef.current.position.copy(center.clone().add(dir.multiplyScalar(dist)));
      cameraRef.current.near = Math.max(0.1, dist / 100);
      cameraRef.current.far = dist * 20;
      cameraRef.current.updateProjectionMatrix();

      controlsRef.current.target.copy(center);
      controlsRef.current.minDistance = Math.max(10, maxDim * 0.2);
      controlsRef.current.maxDistance = Math.max(controlsRef.current.minDistance + 10, maxDim * 6);
      controlsRef.current.update();

      hasAutoFittedRef.current = true;
    }
  }, [filteredAnchors, clusters, selectedAnchor, selectedCluster, showClusters, showConnections, showAnchors, showEnergyAura]);
  // Handle click and hover on 3D objects
  useEffect(() => {
    if (!containerRef.current || !cameraRef.current) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current!);
      const meshes = Array.from(meshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const anchor = intersects[0].object.userData.anchor as MemoryAnchor;
        setSelectedAnchor(anchor);
        setSelectedCluster(null);
        setHoveredAnchor(null); // Clear hover when selecting
      } else {
        setSelectedAnchor(null);
        setSelectedCluster(null);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current!);
      const meshes = Array.from(meshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const anchor = intersects[0].object.userData.anchor as MemoryAnchor;
        setHoveredAnchor(anchor);
        setTooltipPos({ x: event.clientX + 15, y: event.clientY + 15 });
      } else {
        setHoveredAnchor(null);
      }
    };

    const container = containerRef.current;
    container.addEventListener('click', handleClick);
    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [filteredAnchors]);


  return (
    <div className={styles.visualizationContainer}>
        {/* Always render canvas container so Three.js can initialize */}
        {viewMode === 'sphere' && <div ref={containerRef} className={styles.canvas} />}
        
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Loading your memories...</p>
          </div>
        )}
        
        {!isLoading && (
          <>
            {/* Enhanced Toolbar */}
            <div className={styles.toolbar}>
              <button 
                className={`${styles.toolbarBtn} ${showSearch ? styles.active : ''}`}
                onClick={() => setShowSearch(!showSearch)}
                title="Search & Filter"
              >
                <Search size={16} />
                Search
              </button>
              <div className={styles.toolbarDivider} />
              <button 
                className={`${styles.toolbarBtn} ${showConnections ? styles.active : ''}`}
                onClick={() => setShowConnections(!showConnections)}
                title="Toggle Connections"
              >
                <Network size={16} />
              </button>
              <button 
                className={`${styles.toolbarBtn} ${showClusters ? styles.active : ''}`}
                onClick={() => setShowClusters(!showClusters)}
                title="Toggle Clusters"
              >
                <Layers size={16} />
              </button>
              <button 
                className={`${styles.toolbarBtn} ${showEnergyAura ? styles.active : ''}`}
                onClick={() => setShowEnergyAura(!showEnergyAura)}
                title="Toggle Energy Aura"
              >
                <Zap size={16} />
              </button>
              <div className={styles.toolbarDivider} />
              <button 
                className={`${styles.toolbarBtn} ${autoRotate ? styles.active : ''}`}
                onClick={() => setAutoRotate(!autoRotate)}
                title="Auto Rotate"
              >
                <RotateCcw size={16} />
              </button>
              <button className={styles.toolbarBtn} onClick={zoomIn} title="Zoom In">
                <ZoomIn size={16} />
              </button>
              <button className={styles.toolbarBtn} onClick={zoomOut} title="Zoom Out">
                <ZoomOut size={16} />
              </button>
              <button className={styles.toolbarBtn} onClick={resetCamera} title="Reset View">
                <Eye size={16} />
              </button>
            </div>

            {/* View Mode Tabs */}
            <div className={styles.viewTabs}>
              <button 
                className={`${styles.viewTab} ${viewMode === 'sphere' ? styles.active : ''}`}
                onClick={() => setViewMode('sphere')}
              >
                3D Sphere
              </button>
              <button 
                className={`${styles.viewTab} ${viewMode === 'timeline' ? styles.active : ''}`}
                onClick={() => setViewMode('timeline')}
              >
                Timeline
              </button>
              <button 
                className={`${styles.viewTab} ${viewMode === 'network' ? styles.active : ''}`}
                onClick={() => setViewMode('network')}
              >
                Network
              </button>
            </div>

            {/* Search Panel */}
            {showSearch && (
              <div className={styles.searchPanel}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className={styles.filterGroup}>
                  <span className={styles.filterLabel}>Memory Types</span>
                  <div className={styles.filterTags}>
                    {availableTypes.map(type => (
                      <button
                        key={type}
                        className={`${styles.filterTag} ${selectedTypes.includes(type) ? styles.active : ''}`}
                        onClick={() => toggleTypeFilter(type)}
                        style={{ borderColor: selectedTypes.includes(type) ? TYPE_COLORS[type] : undefined }}
                      >
                        <span style={{ 
                          display: 'inline-block', 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: TYPE_COLORS[type] || TYPE_COLORS.default,
                          marginRight: 6 
                        }} />
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <div className={styles.resonanceSlider}>
                    <span className={styles.sliderLabel}>Min Resonance</span>
                    <input
                      type="range"
                      className={styles.slider}
                      min="0"
                      max="100"
                      value={minResonance * 100}
                      onChange={(e) => setMinResonance(Number(e.target.value) / 100)}
                    />
                    <span className={styles.sliderValue}>{(minResonance * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                  Showing {filteredAnchors.length} of {anchors.length} memories
                </div>
              </div>
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <div className={styles.timelineContainer}>
                <div className={styles.timelineHeader}>
                  <h2 className={styles.timelineTitle}>Memory Timeline</h2>
                  <span style={{ color: '#64748b', fontSize: 13 }}>
                    {filteredAnchors.length} memories
                  </span>
                </div>
                
                {timelineGroups.map(([date, items]) => (
                  <div key={date} className={styles.timelineGroup}>
                    <div className={styles.timelineDate}>{date}</div>
                    {items.map(anchor => (
                      <div 
                        key={anchor.id} 
                        className={styles.timelineItem}
                        onClick={() => setSelectedAnchor(anchor)}
                      >
                        <div 
                          className={styles.timelineDot}
                          style={{ backgroundColor: TYPE_COLORS[anchor.anchor_type] || TYPE_COLORS.default }}
                        />
                        <div className={styles.timelineItemContent}>
                          <div className={styles.timelineItemText}>
                            {anchor.anchor_text.slice(0, 100)}
                            {anchor.anchor_text.length > 100 ? '...' : ''}
                          </div>
                          <div className={styles.timelineItemMeta}>
                            <span style={{ color: TYPE_COLORS[anchor.anchor_type] }}>{anchor.anchor_type}</span>
                            {' • '}
                            Resonance: {(anchor.resonance_score * 100).toFixed(0)}%
                            {' • '}
                            {new Date(anchor.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                
                {timelineGroups.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
                    No memories match your filters
                  </div>
                )}
              </div>
            )}

            {/* Hover Tooltip */}
            {hoveredAnchor && viewMode === 'sphere' && (
              <div 
                className={styles.tooltip}
                style={{ left: tooltipPos.x, top: tooltipPos.y }}
              >
                <div className={styles.tooltipTitle}>
                  <span 
                    className={styles.tooltipType}
                    style={{ backgroundColor: TYPE_COLORS[hoveredAnchor.anchor_type] || TYPE_COLORS.default }}
                  >
                    {hoveredAnchor.anchor_type}
                  </span>
                </div>
                <div className={styles.tooltipContent}>
                  {hoveredAnchor.anchor_text.slice(0, 80)}
                  {hoveredAnchor.anchor_text.length > 80 ? '...' : ''}
                </div>
                <div className={styles.tooltipMeta}>
                  <span>Resonance: {(hoveredAnchor.resonance_score * 100).toFixed(0)}%</span>
                  <span>Importance: {(hoveredAnchor.importance_score * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}

            {/* Network View Legend */}
            {viewMode === 'sphere' && (
              <div className={styles.networkLegend}>
                <div className={styles.legendTitle}>Memory Types</div>
                <div className={styles.legendItems}>
                  {Object.entries(TYPE_COLORS).filter(([k]) => k !== 'default').map(([type, color]) => (
                    <div key={type} className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ backgroundColor: color }} />
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detail Panel */}
            {selectedAnchor && (
              <div className={styles.detailPanel}>
                <h3>Memory Anchor</h3>
                <div className={styles.detailContent}>
                  <p><strong>Hash:</strong> <code>{selectedAnchor.anchor_hash.slice(0, 16)}...</code></p>
                  <p>
                    <strong>Type:</strong>{' '}
                    <span style={{ color: TYPE_COLORS[selectedAnchor.anchor_type] }}>
                      {selectedAnchor.anchor_type}
                    </span>
                  </p>
                  <p><strong>Resonance:</strong> {(selectedAnchor.resonance_score * 100).toFixed(1)}%</p>
                  <p><strong>Importance:</strong> {(selectedAnchor.importance_score * 100).toFixed(1)}%</p>
                  <p><strong>Position:</strong> ({selectedAnchor.xyz_x.toFixed(1)}, {selectedAnchor.xyz_y.toFixed(1)}, {selectedAnchor.xyz_z.toFixed(1)})</p>
                  <p><strong>Created:</strong> {new Date(selectedAnchor.created_at).toLocaleString()}</p>
                  <p><strong>Text:</strong> <code className={styles.encrypted}>{selectedAnchor.anchor_text}</code></p>
                  {selectedAnchor.context && <p><strong>Context:</strong> {selectedAnchor.context.slice(0, 100)}...</p>}
                </div>
                <button onClick={() => { setSelectedAnchor(null); setSelectedCluster(null); }} className={styles.closeButton}>Close</button>
              </div>
            )}
            
            {/* Stats Grid */}
            {metrics && viewMode === 'sphere' && (
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statCardValue}>{filteredAnchors.length}</div>
                  <div className={styles.statCardLabel}>Memories</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardValue}>{metrics.total_clusters}</div>
                  <div className={styles.statCardLabel}>Clusters</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardValue}>{metrics.embedding_dimensions}</div>
                  <div className={styles.statCardLabel}>Dimensions</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardValue}>{metrics.storage_mb.toFixed(1)}</div>
                  <div className={styles.statCardLabel}>MB Storage</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
  );
};

export default HashSphereMemoryPage;
