# Frontend-Gateway API Mismatch Report
**Generated:** December 30, 2025

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Total Frontend API Calls** | 251 |
| **Total Gateway Routes** | 271 |
| **✅ Matching Routes** | 76 (30%) |
| **❌ Missing/Incorrect Routes** | 175 (70%) |

---

## ❌ Missing API Routes by Category

### Critical (Billing/Auth - User-Facing)

#### `/auth/` - 20 calls NOT in gateway
| Frontend Call | Status | Fix Required |
|---------------|--------|--------------|
| `/auth/me` | ❌ Missing | Add route to gateway |
| `/auth/change-password` | ❌ Missing | Add route to gateway |
| `/auth/api-keys` | ❌ Missing | Add route to gateway |
| `/auth/api-keys/revoke` | ❌ Missing | Add route to gateway |
| `/auth/mfa/setup` | ❌ Missing | Add route to gateway |
| `/auth/mfa/verify` | ❌ Missing | Add route to gateway |
| `/auth/mfa/status` | ❌ Missing | Add route to gateway |
| `/auth/mfa/disable` | ❌ Missing | Add route to gateway |
| `/auth/settings/agents` | ❌ Missing | Add route to gateway |
| `/auth/settings/agents/import` | ❌ Missing | Add route to gateway |
| `/auth/settings/agents/shared` | ❌ Missing | Add route to gateway |
| `/auth/settings/agents/templates` | ❌ Missing | Add route to gateway |
| `/auth/settings/api-keys` | ❌ Missing | Add route to gateway |
| `/auth/settings/model-versions` | ❌ Missing | Add route to gateway |
| `/auth/settings/thresholds` | ❌ Missing | Add route to gateway |
| `/auth/sso/oauth/initiate` | ❌ Missing | Add route to gateway |
| `/auth/sso/oauth/callback` | ❌ Missing | Add route to gateway |
| `/auth/sso/saml/initiate` | ❌ Missing | Add route to gateway |
| `/auth/sso/saml/callback` | ❌ Missing | Add route to gateway |
| `/auth/sso/providers` | ❌ Missing | Add route to gateway |

#### `/billing/` - 16 calls NOT in gateway
| Frontend Call | Status | Fix Required |
|---------------|--------|--------------|
| `/billing/packs` | ❌ Missing | Should be `/billing/pricing/credit-packs` |
| `/billing/plans` | ❌ Missing | Should be `/billing/pricing/plans` |
| `/billing/token-packs` | ❌ Missing | Should be `/billing/pricing/credit-packs` |
| `/billing/overview` | ❌ Missing | Add route or use `/billing/dashboard/me` |
| `/billing/history` | ❌ Missing | Add route to gateway |
| `/billing/current-costs` | ❌ Missing | Add route to gateway |
| `/billing/usage` | ❌ Missing | Should be `/billing/usage/summary` |
| `/billing/usage/record` | ❌ Missing | Add route to gateway |
| `/billing/api-subscribe` | ❌ Missing | Add route to gateway |
| `/billing/api-subscriptions` | ❌ Missing | Add route to gateway |
| `/billing/api-usage/summary` | ❌ Missing | Add route to gateway |
| `/billing/economic-state/me` | ❌ Missing | Add route to gateway |
| `/billing/economic-state/me/check-credits` | ❌ Missing | Add route to gateway |
| `/billing/economic-state/me/check-limit` | ❌ Missing | Add route to gateway |
| `/billing/stripe/subscription` | ❌ Missing | Add route to gateway |
| `/billing/usage/tokens/history?days=30` | ⚠️ Query param | Use `/billing/usage/tokens/history` |

### High Priority (Core Features)

#### `/resonant-chat/` - 10 calls NOT in gateway
| Frontend Call | Status | Fix Required |
|---------------|--------|--------------|
| `/resonant-chat/create` | ❌ Missing | Add route to gateway |
| `/resonant-chat/message` | ❌ Missing | Add route to gateway |
| `/resonant-chat/conversations` | ❌ Missing | Add route to gateway |
| `/resonant-chat/feedback` | ❌ Missing | Add route to gateway |
| `/resonant-chat/analytics` | ❌ Missing | Add route to gateway |
| `/resonant-chat/providers` | ❌ Missing | Add route to gateway |
| `/resonant-chat/provider/stats` | ❌ Missing | Add route to gateway |
| `/resonant-chat/agents/list` | ❌ Missing | Add route to gateway |
| `/resonant-chat/teams` | ❌ Missing | Add route to gateway |
| `/resonant-chat/clusters` | ❌ Missing | Add route to gateway |

#### `/memory/` - 22 calls NOT in gateway
| Frontend Call | Status | Fix Required |
|---------------|--------|--------------|
| `/memory/store` | ❌ Missing | Add route to gateway |
| `/memory/store/batch` | ❌ Missing | Add route to gateway |
| `/memory/retrieve` | ❌ Missing | Add route to gateway |
| `/memory/search` | ❌ Missing | Add route to gateway |
| `/memory/list` | ❌ Missing | Add route to gateway |
| `/memory/stats` | ❌ Missing | Add route to gateway |
| `/memory/clear` | ❌ Missing | Add route to gateway |
| `/memory/embedding` | ❌ Missing | Add route to gateway |
| `/memory/ingest` | ❌ Missing | Add route to gateway |
| `/memory/similarity` | ❌ Missing | Add route to gateway |
| `/memory/anchors` | ❌ Missing | Add route to gateway |
| `/memory/search/anchors` | ❌ Missing | Add route to gateway |
| `/memory/hash-sphere/search` | ❌ Missing | Add route to gateway |
| `/memory/hash-sphere/anchors` | ❌ Missing | Add route to gateway |
| `/memory/rag/context` | ❌ Missing | Add route to gateway |
| `/memory/rag/augment` | ❌ Missing | Add route to gateway |
| `/memory/sphere/compute` | ❌ Missing | Add route to gateway |
| `/memory/sphere/stats` | ❌ Missing | Add route to gateway |
| `/memory/sphere/visualization` | ❌ Missing | Add route to gateway |
| `/memory/archive/file` | ❌ Missing | Add route to gateway |
| `/memory/archived/files` | ❌ Missing | Add route to gateway |
| `/memory/unarchive/file` | ❌ Missing | Add route to gateway |

#### `/usage/` - 3 calls NOT in gateway
| Frontend Call | Status | Fix Required |
|---------------|--------|--------------|
| `/usage/metrics` | ❌ Missing | Add route to gateway |
| `/usage/summary` | ❌ Missing | Add route to gateway |
| `/usage/providers` | ❌ Missing | Add route to gateway |

### Medium Priority (Features)

#### `/autonomy/` - 15 calls NOT in gateway
All autonomy routes are missing from gateway.

#### `/marketplace/` - 16 calls NOT in gateway
All marketplace routes are missing from gateway.

#### `/blockchain/` - 15 calls NOT in gateway
Most blockchain routes are missing (only `/blockchain/status` exists).

#### `/hash-sphere/` - 8 calls NOT in gateway
All hash-sphere routes are missing from gateway.

### Lower Priority

#### `/advanced/` - 13 calls (blockchain advanced features)
#### `/audit/` - 6 calls
#### `/ai/` - 3 calls
#### `/ml/` - 7 calls
#### `/workflow/` - 3 calls
#### `/rag/` - 3 calls
#### `/code/` - 3 calls
#### `/ide/` - 2 calls
#### `/github/` - 2 calls
#### `/finance/` - 3 calls
#### `/compliance/` - 2 calls
#### `/api/` - 2 calls
#### `/public/` - 1 call

---

## ✅ Working Routes (76 total)

These frontend calls correctly match gateway routes:
- `/billing/credits` ✅
- `/billing/subscription` ✅
- `/billing/checkout/credits` ✅
- `/billing/checkout/subscription` ✅
- `/billing/dashboard/me` ✅
- `/billing/payment-methods` ✅
- `/billing/invoices` ✅
- `/billing/pricing` ✅
- `/billing/pricing/credit-packs` ✅
- `/billing/pricing/plans` ✅
- `/billing/usage/metrics` ✅
- `/billing/usage/summary` ✅
- `/billing/usage/breakdown` ✅
- `/notifications` ✅
- `/users` ✅
- `/health` ✅
- And 60 more...

---

## Recommended Fixes

### 1. Frontend Path Corrections (Quick Wins)

| Frontend Currently Calls | Should Call |
|--------------------------|-------------|
| `/billing/packs` | `/billing/pricing/credit-packs` |
| `/billing/plans` | `/billing/pricing/plans` |
| `/billing/token-packs` | `/billing/pricing/credit-packs` |
| `/billing/usage` | `/billing/usage/summary` |

### 2. Gateway Routes to Add (Backend Work)

Add wildcard routes for these prefixes:
```python
# In gateway/app/main.py
app.include_router(auth_proxy, prefix="/auth", tags=["auth"])
app.include_router(autonomy_proxy, prefix="/autonomy", tags=["autonomy"])
app.include_router(memory_proxy, prefix="/memory", tags=["memory"])
app.include_router(usage_proxy, prefix="/usage", tags=["usage"])
```

### 3. Priority Order

1. **P0 - Critical:** `/auth/*`, `/billing/*` fixes
2. **P1 - High:** `/resonant-chat/*`, `/memory/*`, `/usage/*`
3. **P2 - Medium:** `/marketplace/*`, `/autonomy/*`
4. **P3 - Low:** Other routes

---

## Summary

**70% of frontend API calls are NOT reaching the gateway correctly.**

Main issues:
1. **Missing wildcard routes** in gateway for auth, memory, usage, autonomy
2. **Path mismatches** (e.g., `/billing/packs` vs `/billing/pricing/credit-packs`)
3. **Services not proxied** through gateway

---

*Report generated by Cascade AI Assistant*
