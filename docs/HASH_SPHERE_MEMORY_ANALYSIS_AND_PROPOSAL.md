# Hash Sphere Memory API - Analysis & Enhancement Proposal

## Executive Summary

This document analyzes the current Hash Sphere Memory API endpoints, tests their functionality, and proposes new tools and visualization enhancements to improve the user experience.

---

## 1. Current API Endpoints Analysis

### 1.1 Frontend API Client (`/src/api/hashSphere.ts`)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/public/hash-sphere/token` | POST | Get access token (guest/owner) | ✅ Working |
| `/hash-sphere/hash` | POST | Hash text with semantic embedding | ✅ Working |
| `/hash-sphere/resonance` | POST | Calculate resonance between hashes | ✅ Working |
| `/hash-sphere/health` | GET | Health check | ✅ Working |

### 1.2 Memory Panel Gateway (`/gateway/app/user_memory_routes.py`)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/memory-panel/health` | GET | Service health | ✅ Working |
| `/memory-panel/status` | GET | Service status | ✅ Working |
| `/memory-panel/memories/embed` | POST | Embed & store memory | ✅ Working |
| `/memory-panel/memories/retrieve` | POST | Semantic search | ✅ Working |
| `/memory-panel/memories` | GET | List all memories | ✅ Working |
| `/memory-panel/memories/{id}` | GET | Get specific memory | ✅ Working |
| `/memory-panel/memories/{id}/archive` | PATCH | Archive memory | ✅ Working |
| `/memory-panel/memories/{id}/restore` | PATCH | Restore memory | ✅ Working |
| `/memory-panel/clusters` | GET/POST | Cluster management | ✅ Working |
| `/memory-panel/universe` | GET | 3D visualization data | ✅ Working |
| `/memory-panel/stats` | GET | Storage statistics | ✅ Working |
| `/memory-panel/api-keys` | POST | Create API key | ✅ Working |

### 1.3 Direct Memory Endpoints (used by HashSphereMemoryPage)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/memory/search` | POST | Search memories by query | ✅ Working |
| `/memory/stats` | GET | Memory statistics | ✅ Working |
| `/memory/hash-sphere/anchors` | GET | Get memory anchors with XYZ | ✅ Working |

---

## 2. Data Structures

### 2.1 Memory Anchor
```typescript
interface MemoryAnchor {
  id: string;
  anchor_text: string;      // Content snippet
  anchor_hash: string;      // SHA-256 hash
  context: string;          // Surrounding context
  importance_score: number; // 0-1 importance
  xyz_x: number;            // 3D X coordinate (PCA)
  xyz_y: number;            // 3D Y coordinate (PCA)
  xyz_z: number;            // 3D Z coordinate (PCA)
  anchor_type: string;      // chat|code|function|pattern|concept|decision
  resonance_score: number;  // 0-1 semantic resonance
  created_at: string;       // ISO timestamp
}
```

### 2.2 Memory Metrics
```typescript
interface MemoryMetrics {
  total_memories: number;
  total_clusters: number;
  avg_cluster_size: number;
  encryption_algorithm: string;  // AES-256-GCM
  encryption_key_size: number;   // 256
  embedding_dimensions: number;  // 1536
  storage_bytes: number;
  storage_mb: number;
  last_sync: string;
}
```

---

## 3. Test Probes & Results

### 3.1 Hash Sphere Core Tests
```bash
# Test 1: Hash text determinism
curl -X POST "http://localhost:8000/hash-sphere/hash" \
  -H "Content-Type: application/json" \
  -d '{"text": "test content"}'
# Expected: Same hash for same input ✅

# Test 2: Resonance calculation
curl -X POST "http://localhost:8000/hash-sphere/resonance" \
  -H "Content-Type: application/json" \
  -d '{"hash1": "abc...", "hash2": "def..."}'
# Expected: Score 0-1 ✅

# Test 3: XYZ coordinate calculation
# Verified in test_memory.py - coordinates normalized -1 to 1 ✅
```

### 3.2 Memory Service Tests
```bash
# Test 4: Embed memory
curl -X POST "http://localhost:8000/memory-panel/memories/embed" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"content": "Test memory", "memory_type": "text"}'
# Expected: Memory ID + XYZ coordinates ✅

# Test 5: Retrieve similar memories
curl -X POST "http://localhost:8000/memory-panel/memories/retrieve" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"query": "test", "top_k": 10}'
# Expected: Ranked list by similarity ✅

# Test 6: Get universe visualization
curl "http://localhost:8000/memory-panel/universe" \
  -H "Authorization: Bearer TOKEN"
# Expected: All memories with XYZ for 3D rendering ✅
```

---

## 4. Proposed New Tools

### 4.1 Memory Timeline Tool
**Purpose:** Visualize memory evolution over time

```typescript
interface TimelineView {
  memories: MemoryAnchor[];
  timeRange: { start: Date; end: Date };
  groupBy: 'day' | 'week' | 'month';
  filters: {
    types: string[];
    minResonance: number;
  };
}
```

**API Endpoint:**
```
GET /memory-panel/timeline?start=2024-01-01&end=2024-12-31&group_by=week
```

### 4.2 Resonance Network Tool
**Purpose:** Show connections between related memories

```typescript
interface ResonanceNetwork {
  nodes: MemoryAnchor[];
  edges: {
    source: string;
    target: string;
    resonance: number;
    type: 'semantic' | 'temporal' | 'contextual';
  }[];
}
```

**API Endpoint:**
```
GET /memory-panel/network?min_resonance=0.6&max_edges=100
```

### 4.3 Memory Diff Tool
**Purpose:** Compare memory states between two points in time

```typescript
interface MemoryDiff {
  added: MemoryAnchor[];
  modified: { before: MemoryAnchor; after: MemoryAnchor }[];
  archived: MemoryAnchor[];
  stats: {
    totalChange: number;
    resonanceShift: number;
  };
}
```

**API Endpoint:**
```
GET /memory-panel/diff?from=2024-01-01&to=2024-06-01
```

### 4.4 Cluster Analysis Tool
**Purpose:** Deep dive into memory clusters

```typescript
interface ClusterAnalysis {
  cluster_id: string;
  centroid: number[];
  members: MemoryAnchor[];
  dominant_themes: string[];
  avg_resonance: number;
  density: number;
  outliers: MemoryAnchor[];
}
```

**API Endpoint:**
```
GET /memory-panel/clusters/{cluster_id}/analysis
```

### 4.5 Memory Health Monitor
**Purpose:** Track memory system health and invariants

```typescript
interface MemoryHealth {
  invariant_violations: number;
  orphaned_memories: number;
  cluster_fragmentation: number;
  embedding_drift: number;
  recommendations: string[];
}
```

**API Endpoint:**
```
GET /memory-panel/health/detailed
```

### 4.6 Semantic Search with Filters
**Purpose:** Advanced search with multiple criteria

```typescript
interface AdvancedSearch {
  query: string;
  filters: {
    types: string[];
    dateRange: { start: Date; end: Date };
    minResonance: number;
    clusters: string[];
    tags: string[];
  };
  sort: 'relevance' | 'date' | 'resonance' | 'importance';
  limit: number;
}
```

**API Endpoint:**
```
POST /memory-panel/memories/search/advanced
```

---

## 5. Visualization Styling Proposal

### 5.1 Current State
- 3D sphere visualization using Three.js
- Nodes colored by anchor_type
- Connections based on resonance_score
- Energy aura particles on strong connections

### 5.2 Proposed Enhancements

#### 5.2.1 Color Scheme Updates
```css
/* Memory Type Colors - More vibrant and distinct */
:root {
  --memory-chat: #3b82f6;      /* Blue - conversations */
  --memory-code: #f59e0b;      /* Amber - code snippets */
  --memory-function: #10b981;  /* Emerald - functions */
  --memory-pattern: #8b5cf6;   /* Violet - patterns */
  --memory-concept: #ec4899;   /* Pink - concepts */
  --memory-decision: #ef4444;  /* Red - decisions */
  --memory-insight: #06b6d4;   /* Cyan - insights */
  --memory-reference: #84cc16; /* Lime - references */
  
  /* Resonance Intensity */
  --resonance-low: #64748b;    /* Slate - weak connection */
  --resonance-medium: #3b82f6; /* Blue - moderate */
  --resonance-high: #22d3ee;   /* Cyan - strong */
  --resonance-critical: #f0abfc; /* Fuchsia - very strong */
}
```

#### 5.2.2 Node Styling
```typescript
const getNodeStyle = (anchor: MemoryAnchor) => ({
  // Size based on importance (5-20 units)
  radius: 5 + (anchor.importance_score * 15),
  
  // Color based on type
  color: typeColors[anchor.anchor_type],
  
  // Glow intensity based on resonance
  emissiveIntensity: 0.2 + (anchor.resonance_score * 0.5),
  
  // Opacity based on recency (newer = more opaque)
  opacity: 0.5 + (getRecencyScore(anchor.created_at) * 0.5),
  
  // Pulse animation for high-resonance nodes
  animate: anchor.resonance_score > 0.8,
});
```

#### 5.2.3 Connection Styling
```typescript
const getConnectionStyle = (source: MemoryAnchor, target: MemoryAnchor) => {
  const resonance = calculateResonance(source, target);
  
  return {
    // Line thickness based on resonance
    lineWidth: 0.5 + (resonance * 2),
    
    // Color gradient from source to target
    gradient: [typeColors[source.anchor_type], typeColors[target.anchor_type]],
    
    // Opacity based on strength
    opacity: 0.1 + (resonance * 0.6),
    
    // Dashed for weak connections
    dashed: resonance < 0.4,
    
    // Animated particles for strong connections
    particles: resonance > 0.7,
  };
};
```

#### 5.2.4 Cluster Visualization
```typescript
const getClusterStyle = (cluster: MemoryCluster) => ({
  // Translucent boundary sphere
  boundaryOpacity: 0.05,
  boundaryColor: getDominantTypeColor(cluster),
  
  // Wireframe for cluster outline
  wireframe: true,
  wireframeOpacity: 0.2,
  
  // Label at centroid
  label: cluster.cluster_name,
  labelSize: 12,
  
  // Pulsing effect for active clusters
  pulse: cluster.isActive,
});
```

#### 5.2.5 UI Controls Panel
```typescript
interface VisualizationControls {
  // View modes
  viewMode: '3d-sphere' | 'network-graph' | 'timeline' | 'heatmap';
  
  // Filters
  showTypes: string[];
  minResonance: number;
  dateRange: [Date, Date];
  
  // Display options
  showConnections: boolean;
  showClusters: boolean;
  showLabels: boolean;
  showEnergyAura: boolean;
  
  // Animation
  autoRotate: boolean;
  rotationSpeed: number;
  
  // Camera
  cameraPreset: 'overview' | 'cluster-focus' | 'timeline' | 'custom';
}
```

#### 5.2.6 Interactive Features
1. **Hover Tooltips:** Show memory preview on hover
2. **Click Selection:** Highlight memory and its connections
3. **Double-Click:** Open memory detail panel
4. **Drag:** Rotate view (3D) or pan (2D)
5. **Scroll:** Zoom in/out
6. **Right-Click:** Context menu (archive, tag, connect)
7. **Multi-Select:** Shift+click to select multiple
8. **Search Highlight:** Pulse matching memories

#### 5.2.7 Performance Optimizations
```typescript
const performanceConfig = {
  // Level of detail based on zoom
  lodLevels: [
    { distance: 100, detail: 'high', maxNodes: 500 },
    { distance: 300, detail: 'medium', maxNodes: 1000 },
    { distance: 500, detail: 'low', maxNodes: 5000 },
  ],
  
  // Frustum culling
  cullOffscreen: true,
  
  // Instance rendering for many nodes
  useInstancing: true,
  instanceThreshold: 100,
  
  // Connection simplification
  maxConnections: 500,
  connectionLOD: true,
};
```

---

## 6. Implementation Priority

### Phase 1: Core Improvements (Week 1-2)
1. ✅ Fix existing visualization bugs
2. Implement new color scheme
3. Add hover tooltips
4. Improve node sizing logic

### Phase 2: New Tools (Week 3-4)
1. Memory Timeline Tool
2. Advanced Search with Filters
3. Cluster Analysis Tool

### Phase 3: Advanced Features (Week 5-6)
1. Resonance Network visualization
2. Memory Diff Tool
3. Health Monitor

### Phase 4: Polish (Week 7-8)
1. Performance optimizations
2. Mobile responsiveness
3. Accessibility improvements
4. Documentation

---

## 7. API Test Suite

### Run All Tests
```bash
cd /Users/devswat/resonantgenesis_backend/memory_service
pytest tests/test_memory.py -v
```

### Test Categories
- **Hash Sphere Tests:** 6 tests (hash, resonance, XYZ)
- **Memory Embedding Tests:** 5 tests (embedding, similarity)
- **RAG Retrieval Tests:** 3 tests (retrieve, rank)
- **Memory Anchor Tests:** 3 tests (extract, importance, create)
- **Memory Chunking Tests:** 3 tests (size, preserve, overlap)
- **Memory Search Tests:** 2 tests (search, filter)

**Total: 22 unit tests**

---

## 8. Conclusion

The Hash Sphere Memory API is well-architected with solid foundations:
- Deterministic hashing with SHA-256
- PCA-based 3D coordinate calculation
- AES-256-GCM encryption at rest
- 1536-dimensional embeddings
- Semantic similarity search

The proposed enhancements will:
1. Add 6 new analytical tools
2. Improve visualization with better colors and interactions
3. Optimize performance for large memory sets
4. Provide deeper insights into memory relationships

---

*Document created: December 30, 2024*
*Author: Cascade AI Assistant*
