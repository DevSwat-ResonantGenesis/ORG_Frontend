# 🚨 CRITICAL: Hardcoded Pricing Audit

**Date**: January 18, 2026  
**Status**: ❌ **MASSIVE HARDCODED VALUES FOUND**

---

## 🔍 **Findings**

### **Pricing API Exists** ✅
**File**: `src/api/pricing.ts`
- ✅ Fetches from `/billing/pricing` endpoint
- ✅ Has proper types and caching
- ✅ Provides helper functions

### **BUT: Almost NO Pages Use It** ❌

---

## 📊 **Hardcoded Values Found**

### **1. Pricing Pages** ❌

#### `pages/Pricing/PricingPage.tsx`
```typescript
features: [
  '10,000 credits/month',        // ❌ HARDCODED
  'Up to 3 agents',              // ❌ HARDCODED (quantity limit!)
  '75,000 credits/month',        // ❌ HARDCODED
  'Up to 20 agents',             // ❌ HARDCODED (quantity limit!)
]

featureComparison: [
  { name: 'Credits/Month', developer: '10,000', plus: '75,000' },  // ❌ HARDCODED
  { name: 'Agents', developer: '3', plus: '20' },                  // ❌ HARDCODED
]
```

#### `pages/Pricing/UnifiedPricingPage.tsx`
```typescript
credits: '10,000 credits/month',   // ❌ HARDCODED
features: [
  '10,000 credits/month',          // ❌ HARDCODED
  '75,000 credits/month',          // ❌ HARDCODED
  'Rollover up to 37.5K credits',  // ❌ HARDCODED
]
```

#### `pages/Pricing/PricingPageNew.tsx`
```typescript
tokens: '10,000',                  // ❌ HARDCODED
tokens: '10,000,000',              // ❌ HARDCODED
```

---

### **2. Dashboard Pages** ❌

#### `pages/Dashboards/UnifiedUserDashboard.tsx`
```typescript
creditsLimit: 10000,               // ❌ HARDCODED (Developer tier default)
```

#### `pages/Dashboards/PlusDashboard.tsx`
```typescript
creditsTotal: 100000,              // ❌ HARDCODED (wrong value!)
```

#### `pages/Dashboards/OwnerDashboard.tsx`
```typescript
topupAmount: 10000,                // ❌ HARDCODED
```

---

### **3. Config Files** ❌

#### `utils/signupLogic.ts`
```typescript
limits: {
  tokens: 75000,                   // ❌ HARDCODED
  agents: 20,                      // ❌ HARDCODED (quantity limit!)
  teams: 5,                        // ❌ HARDCODED
  users: 5,                        // ❌ HARDCODED
}
features: [
  '75,000 credits/month',          // ❌ HARDCODED
  'Up to 20 agents',               // ❌ HARDCODED
]
```

#### `config/pricing.ts`
```typescript
topupAmount: 10000,                // ❌ HARDCODED
note: 'Rollover up to 37.5K',      // ❌ HARDCODED
features: [
  '75,000 credits/month',          // ❌ HARDCODED
  'Up to 20 agents',               // ❌ HARDCODED
]
```

#### `api/economicState.ts`
```typescript
hard_limits: {
  max_agents: 3,                   // ❌ HARDCODED (quantity limit!)
  max_workflows: 5,                // ❌ HARDCODED
  max_memory_mb: 100,              // ❌ HARDCODED
}
```

---

### **4. Account Pages** ❌

#### `pages/Account/AccountPage.tsx`
```typescript
<LimitCard 
  label="Max Agents"
  value={limits.max_agents}        // ❌ Uses hardcoded limits
  unlimited={limits.max_agents === -1}
/>
```

---

## 🎯 **What Backend Says (Source of Truth)**

**File**: `billing_service/app/pricing.yaml`

```yaml
developer:
  credits:
    included: 10000              # ✅ 10K credits
  limits:
    users: 1                     # ✅ Single user
    teams: 0                     # ✅ No teams
    org_features: false          # ✅ No org UI
    # NO agent limits            # ✅ Credits-only
    # NO message limits          # ✅ Credits-only

plus:
  credits:
    included: 75000              # ✅ 75K credits
    rollover_limit: 37500        # ✅ 37.5K rollover
  limits:
    users: 1                     # ✅ Single user
    teams: 0                     # ✅ No teams
    org_features: false          # ✅ No org UI
    # NO agent limits            # ✅ Credits-only
    # NO message limits          # ✅ Credits-only
```

---

## ❌ **Problems**

### **1. Hardcoded Quantity Limits**
Frontend shows:
- "Up to 3 agents" (Developer)
- "Up to 20 agents" (Plus)

**Backend reality**: NO agent limits, only credits

### **2. Wrong Values**
- `PlusDashboard.tsx`: Shows 100,000 credits (should be 75,000)
- Multiple files have inconsistent values

### **3. Not Using Pricing API**
- API exists at `src/api/pricing.ts`
- Almost NO pages import or use it
- Everything is hardcoded

### **4. Duplicate Config**
- `utils/signupLogic.ts` - Hardcoded
- `config/pricing.ts` - Hardcoded
- `api/economicState.ts` - Hardcoded
- All should fetch from backend API

---

## ✅ **What Needs to Happen**

### **Phase 1: Update All Pricing Pages**

**Files to fix**:
1. `pages/Pricing/PricingPage.tsx`
2. `pages/Pricing/UnifiedPricingPage.tsx`
3. `pages/Pricing/PricingPageNew.tsx`

**Change**:
```typescript
// BEFORE ❌
const plans = [
  {
    name: 'Developer',
    credits: '10,000 credits/month',  // Hardcoded
    features: ['Up to 3 agents']      // Hardcoded
  }
]

// AFTER ✅
import { fetchPlans } from '@/api/pricing';

const [plans, setPlans] = useState(null);

useEffect(() => {
  async function loadPricing() {
    const data = await fetchPlans();
    setPlans(data);
  }
  loadPricing();
}, []);

// Display: {plans.developer.credits.included} credits
// NO agent limits shown (credits-only)
```

---

### **Phase 2: Update Dashboards**

**Files to fix**:
1. `pages/Dashboards/UnifiedUserDashboard.tsx`
2. `pages/Dashboards/PlusDashboard.tsx`
3. `pages/Dashboards/OwnerDashboard.tsx`

**Change**:
```typescript
// BEFORE ❌
creditsLimit: 10000  // Hardcoded

// AFTER ✅
import { fetchPlan } from '@/api/pricing';

const plan = await fetchPlan(userTier);
creditsLimit: plan.credits.included
```

---

### **Phase 3: Remove Config Files**

**Files to delete/update**:
1. `utils/signupLogic.ts` - Remove hardcoded limits
2. `config/pricing.ts` - Remove hardcoded values
3. `api/economicState.ts` - Remove hardcoded limits

**Replace with**: API calls to backend

---

### **Phase 4: Remove Quantity Limit References**

**Search and remove**:
- "Up to 3 agents"
- "Up to 20 agents"
- "max_agents"
- "max_workflows"
- Any quantity-based limits

**Replace with**:
- "Unlimited agents (billed by credits)"
- "Credits-only pricing"

---

## 📋 **Files That Need Updates**

### **High Priority** (User-facing):
- [ ] `pages/Pricing/PricingPage.tsx`
- [ ] `pages/Pricing/UnifiedPricingPage.tsx`
- [ ] `pages/Pricing/PricingPageNew.tsx`
- [ ] `pages/Dashboards/UnifiedUserDashboard.tsx`
- [ ] `pages/Dashboards/PlusDashboard.tsx`

### **Medium Priority** (Config):
- [ ] `utils/signupLogic.ts`
- [ ] `config/pricing.ts`
- [ ] `api/economicState.ts`

### **Low Priority** (Other):
- [ ] `pages/Account/AccountPage.tsx`
- [ ] `pages/HomeNew/components/StatePhysicsSection.tsx`

---

## 🎯 **Expected Result**

After fixes:
1. ✅ All pricing fetched from backend API
2. ✅ NO hardcoded credit amounts
3. ✅ NO quantity limits shown (agents, messages, etc.)
4. ✅ Only "credits-only" pricing displayed
5. ✅ Single source of truth: `billing_service/app/pricing.yaml`

---

## 🚨 **Current Status**

**Backend**: ✅ Correct (credits-only, no quantity limits)  
**Frontend**: ❌ **BROKEN** (hardcoded values, quantity limits shown)  
**API**: ✅ Exists but **NOT USED**

**Conclusion**: Frontend needs complete pricing overhaul to use backend API.
