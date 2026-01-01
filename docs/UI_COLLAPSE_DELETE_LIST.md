# UI Collapse - DELETE / HIDE List

This document lists all frontend files that must be **deleted or hidden** to achieve UI truthification.

**Rule:** NO UI PAGE is allowed to define plans, prices, limits, or metrics. UI pages are pure renderers of backend truth.

---

## 🔴 CRITICAL: Files with Local Tier Definitions (MUST FIX)

These files contain `PLAN_LIMITS`, tier inference, or fallback credits:

| File | Issue | Action |
|------|-------|--------|
| `src/utils/signupLogic.ts` | 27 matches for old tier names | **REWRITE** - remove all tier logic |
| `src/pages/Dashboards/UnifiedUserDashboard.tsx` | Local PLAN_LIMITS, tier inference | **REPLACE** with `/account` page |
| `src/pages/Dashboards/RoleBasedDashboard.tsx` | 7 matches for old tier names | **HIDE** - unreachable |
| `src/constants/pricing.ts` | Local pricing definitions | **DELETE** or empty |

---

## 🔴 CRITICAL: Multiple Pricing Pages (CONSOLIDATE)

Only ONE pricing page should exist. All others must be hidden.

| File | Action |
|------|--------|
| `src/pages/Pricing/PricingPage.tsx` | **HIDE** |
| `src/pages/Pricing/PricingPageNew.tsx` | **HIDE** |
| `src/pages/Public/PricingPage-2025.tsx` | **HIDE** |
| `src/pages/Public/PricingPage-New.tsx` | **HIDE** |
| `src/pages/Public/PricingPageComplete.tsx` | **HIDE** |
| `src/pages/Billing/PricingPanel.tsx` | **KEEP** - integrate into `/billing` |

**Canonical:** Create new `/billing` page that reads from backend only.

---

## 🔴 CRITICAL: Multiple Dashboard Pages (CONSOLIDATE)

Only ONE user dashboard should exist. All others must be hidden.

| File | Action |
|------|--------|
| `src/pages/Dashboards/UnifiedUserDashboard.tsx` | **REPLACE** with `/account` |
| `src/pages/Dashboards/UnifiedUserDashboard-2025.tsx` | **HIDE** |
| `src/pages/Dashboards/RoleBasedDashboard.tsx` | **HIDE** |
| `src/pages/Dashboards/UnifiedOrgAdminDashboard-2025.tsx` | **HIDE** |
| `src/pages/Dashboards/UnifiedFinanceDashboard-2025.tsx` | **HIDE** |
| `src/pages/Dashboards/UnifiedComplianceDashboard-2025.tsx` | **HIDE** |
| `src/pages/Dashboards/UnifiedMLEngineerDashboard-2025.tsx` | **HIDE** |
| `src/pages/Dashboards/UnifiedPlatformDevDashboard-2025.tsx` | **HIDE** |
| `src/pages/Dashboards/UnifiedViewerDashboard-2025.tsx` | **HIDE** |
| `src/pages/Dashboard/` (entire directory) | **HIDE** |

**Canonical:** Create new `/account` page that reads from backend only.

---

## 🟡 WARNING: Files with Old Tier Names

These files reference `developer`, `professional`, or `unlimited` tiers:

| File | Matches | Action |
|------|---------|--------|
| `src/pages/Help/HelpCenterPage.tsx` | 13 | Review - may be documentation |
| `src/pages/Agents/components/Panels/FactoryPanel/AdvancedFactory.tsx` | 10 | Review |
| `src/components/dashboard/FinanceDashboard.tsx` | 7 | **HIDE** |
| `src/components/features/dashboard/FinanceDashboard.tsx` | 7 | **HIDE** |
| `src/pages/Landing/LandingPage.tsx` | 4 | Review - may be marketing copy |

---

## 🟢 KEEP: Canonical Pages (After Rewrite)

These are the ONLY dashboard/billing pages that should exist:

| Route | File | Backend APIs |
|-------|------|--------------|
| `/account` | `src/pages/Account/AccountPage.tsx` | `GET /billing/economic-state/me`, `GET /billing/usage/summary`, `GET /auth/me` |
| `/billing` | `src/pages/Billing/BillingPage.tsx` | `GET /billing/economic-state/me`, `GET /billing/invoices` |
| `/usage` | `src/pages/Usage/UsagePage.tsx` | `GET /billing/usage/summary`, `GET /billing/usage/metrics` |
| `/profile` | `src/pages/Profile/ProfilePage.tsx` | `GET /auth/me`, `GET /billing/economic-state/me` |

---

## 🟢 KEEP: Feature Pages (No Economic Logic)

These pages are fine as-is (they don't define economics):

| Directory | Purpose |
|-----------|---------|
| `src/pages/Agents/` | Agent management (uses FeatureGate) |
| `src/pages/Auth/` | Login/signup |
| `src/pages/IDE/` | IDE interface |
| `src/pages/HashSphere/` | HashSphere feature |
| `src/pages/Help/` | Documentation |
| `src/pages/Settings/` | User settings |

---

## Router Changes Required

Update `src/router/index.tsx` to:

1. **Remove** routes to hidden dashboards
2. **Add** routes to canonical pages:
   - `/account` → `AccountPage`
   - `/billing` → `BillingPage` (rewritten)
   - `/usage` → `UsagePage` (new)
   - `/profile` → `ProfilePage` (rewritten)
3. **Redirect** old routes:
   - `/dashboard` → `/account`
   - `/pricing` → `/billing`

---

## Execution Order

1. ✅ Create `/account` page (primary dashboard)
2. ✅ Create `/billing` page (pricing + subscription)
3. ✅ Create `/usage` page (metrics)
4. ✅ Rewrite `/profile` page (identity)
5. ✅ Update router
6. ✅ Hide old dashboards (comment out routes)
7. ✅ Delete `src/constants/pricing.ts` contents

---

## Files to DELETE (can be removed from git)

```
src/constants/pricing.ts (empty or delete)
```

## Files to HIDE (comment out routes, keep in git)

```
src/pages/Dashboards/RoleBasedDashboard.tsx
src/pages/Dashboards/UnifiedUserDashboard-2025.tsx
src/pages/Dashboards/UnifiedOrgAdminDashboard-2025.tsx
src/pages/Dashboards/UnifiedFinanceDashboard-2025.tsx
src/pages/Dashboards/UnifiedComplianceDashboard-2025.tsx
src/pages/Dashboards/UnifiedMLEngineerDashboard-2025.tsx
src/pages/Dashboards/UnifiedPlatformDevDashboard-2025.tsx
src/pages/Dashboards/UnifiedViewerDashboard-2025.tsx
src/pages/Pricing/PricingPage.tsx
src/pages/Pricing/PricingPageNew.tsx
src/pages/Public/PricingPage-2025.tsx
src/pages/Public/PricingPage-New.tsx
src/pages/Public/PricingPageComplete.tsx
src/components/dashboard/FinanceDashboard.tsx
src/components/features/dashboard/FinanceDashboard.tsx
```

---

## Verification Checklist

After collapse:

- [ ] Only 4 dashboard/billing routes exist
- [ ] No file contains `PLAN_LIMITS`
- [ ] No file infers tier from Stripe price
- [ ] All metrics come from `/billing/usage/*`
- [ ] All tier info comes from `/billing/economic-state/me`
- [ ] User sees consistent data across all pages
