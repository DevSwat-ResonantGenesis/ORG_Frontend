# 📦 Offline Mode Components

## Overview

React components for offline mode features in the ResonantGraphAI Desktop application.

---

## Components

### 1. OfflineDashboard
Main dashboard showing offline mode status and statistics.

**Features:**
- Online/offline status indicator
- Sync queue statistics
- Cache statistics
- Quick actions

**Usage:**
```tsx
import { OfflineDashboard } from '@/components/OfflineMode';

<OfflineDashboard />
```

---

### 2. RAGQueryInterface
Interface for performing RAG queries on cached projects.

**Features:**
- Query input
- Project selection
- Results display with sources
- Source citations

**Usage:**
```tsx
import { RAGQueryInterface } from '@/components/OfflineMode';

<RAGQueryInterface projectId="project-123" />
```

---

### 3. CacheManager
Manage project cache: sync, view, and clear cached projects.

**Features:**
- Sync projects
- View cache statistics
- List cached projects
- Clear cache

**Usage:**
```tsx
import { CacheManager } from '@/components/OfflineMode';

<CacheManager />
```

---

### 4. SyncQueueViewer
View and manage the sync queue for offline actions.

**Features:**
- List queued actions
- View action status
- Auto-refresh
- Clear completed actions

**Usage:**
```tsx
import { SyncQueueViewer } from '@/components/OfflineMode';

<SyncQueueViewer />
```

---

## Integration

All components are integrated in the Settings page:

```tsx
import { OfflineModeSettingsPage } from '@/pages/Settings/OfflineModeSettingsPage';

// Route: /settings/offline-mode
```

---

## Requirements

All components require:
- Electron environment (`window.electron`)
- IPC handlers registered
- Services initialized

---

**Complete component library for offline mode!**

