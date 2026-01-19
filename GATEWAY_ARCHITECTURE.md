# Gateway Architecture - All Requests Through Gateway

## ✅ Correct Architecture

**Frontend** → **Gateway (api.dev-swat.com)** → **Backend Services**

All frontend requests MUST go through the gateway. The gateway routes to backend services.

---

## 🔒 Gateway Routes

### **Gateway Configuration**
All backend services are accessed through the gateway at `https://api.dev-swat.com`

The gateway proxies requests to internal services:

| Frontend Route | Gateway Route | Backend Service |
|----------------|---------------|-----------------|
| `/api/auth/*` | `/api/auth/*` | `auth_service:8000` |
| `/api/chat/*` | `/api/chat/*` | `chat_service:8000` |
| `/api/memory/*` | `/api/memory/*` | `memory_service:8000` |
| `/api/billing/*` | `/api/billing/*` | `billing_service:8000` |
| `/api/agents/*` | `/api/agents/*` | `agent_engine_service:8000` |
| `/api/code/*` | `/api/code/*` | `code_execution_service:8000` |
| `/api/v1/code/project-builder/*` | `/api/v1/code/project-builder/*` | `agent_engine_service:8000` |
| `/api/state-physics/*` | `/api/state-physics/*` | `state_physics_service:8091` |
| `/api/llm/*` | `/api/llm/*` | `llm_service:8000` |
| `/api/storage/*` | `/api/storage/*` | `storage_service:8000` |
| `/api/blockchain/*` | `/api/blockchain/*` | `blockchain_service:8000` |
| `/api/crypto/*` | `/api/crypto/*` | `crypto_service:8000` |
| `/api/notification/*` | `/api/notification/*` | `notification_service:8000` |
| `/api/ide/*` | `/api/ide/*` | `ide_service:8080` |
| `/api/build/*` | `/api/build/*` | `build_service:8003` |

---

## 📝 Frontend Environment Variables

### **Production (.env.production)**
```bash
# Main Gateway - ALL backend requests go through here
VITE_API_URL=https://api.dev-swat.com

# Frontend-only keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# External monitoring (NOT backend services)
VITE_GRAFANA_URL=https://grafana.dev-swat.com
VITE_PROMETHEUS_URL=https://prometheus.dev-swat.com
```

### **Development (.env)**
```bash
# In development, gateway runs on localhost:8000
VITE_API_URL=http://localhost:8000
```

---

## ❌ WRONG - Direct Backend Connections

**Never do this:**
```typescript
// ❌ WRONG - Bypasses gateway
const url = 'http://localhost:8003/build';
const url = 'http://localhost:8091/state-physics';
const url = 'http://localhost:8093/rara';
```

---

## ✅ CORRECT - Through Gateway

**Always do this:**
```typescript
// ✅ CORRECT - Goes through gateway
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const url = `${API_BASE}/api/build/projects`;
const url = `${API_BASE}/api/state-physics/state`;
const url = `${API_BASE}/api/agents/autonomous`;
```

---

## 🔧 How Gateway Works

### **Request Flow**
1. Frontend makes request to `https://api.dev-swat.com/api/chat/messages`
2. Gateway receives request at port 8000
3. Gateway extracts auth token from cookies
4. Gateway validates JWT token
5. Gateway adds `X-User-ID` and `X-Org-ID` headers
6. Gateway proxies to `http://chat_service:8000/api/chat/messages`
7. Backend service processes request
8. Response flows back through gateway to frontend

### **Benefits**
- ✅ Single entry point for all API requests
- ✅ Centralized authentication
- ✅ Rate limiting
- ✅ Request logging
- ✅ CORS handling
- ✅ SSL termination
- ✅ Load balancing
- ✅ Service discovery

---

## 🚨 Security

**Why everything goes through gateway:**
1. **Authentication**: Gateway validates JWT tokens
2. **Authorization**: Gateway checks user permissions
3. **Rate Limiting**: Gateway prevents abuse
4. **Logging**: Gateway logs all requests
5. **CORS**: Gateway handles cross-origin requests
6. **SSL**: Gateway terminates SSL connections
7. **Firewall**: Only gateway port (443) is exposed

**Backend services are NOT directly accessible from internet!**

---

## 📋 Frontend Code Examples

### **API Client (Correct)**
```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies
});
```

### **Build Service (Correct)**
```typescript
// src/api/build.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const buildProject = async (data) => {
  return axios.post(`${API_BASE}/api/build/projects`, data);
};
```

### **State Physics (Correct)**
```typescript
// src/pages/StatePhysics.tsx
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const statePhysicsUrl = `${API_BASE}/api/state-physics`;
```

---

## 🔍 Verification Checklist

Before deployment, verify:
- [ ] All API calls use `VITE_API_URL`
- [ ] No hardcoded `localhost:8003`, `localhost:8091`, etc.
- [ ] No direct backend service URLs
- [ ] All requests include credentials (cookies)
- [ ] Gateway routes are configured for all services
- [ ] CORS is configured on gateway
- [ ] SSL certificates are installed

---

## 🎯 Summary

**One Rule**: All frontend → backend communication goes through the gateway.

**Frontend only needs to know**: `https://api.dev-swat.com`

**Gateway knows**: Where all backend services are and how to route to them.

**Backend services**: Only accessible from gateway, not from internet.
