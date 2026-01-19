# 🔧 Frontend Pricing Fix Plan

**Status**: IN PROGRESS  
**Goal**: Remove ALL hardcoded pricing, fetch from `/api/pricing/plans`

---

## ✅ **Files Fixed**

### **1. UnifiedPricingPage.tsx** ✅
- Added `fetchPlans()` API call
- Removed hardcoded plan data
- Transforms backend data to component format
- Shows loading state

### **2. UnifiedUserDashboard.tsx** ✅
- Added `fetchPlan()` API call
- Fetches user's tier pricing on mount
- Sets `creditsLimit` from API instead of hardcoded 10000

---

## 📋 **Remaining Files to Fix**

### **High Priority** (User-facing pages):
- [ ] `pages/Pricing/PricingPage.tsx` - Hardcoded 10K, 75K, "Up to 3 agents"
- [ ] `pages/Pricing/PricingPageNew.tsx` - Hardcoded tokens
- [ ] `pages/Dashboards/PlusDashboard.tsx` - Hardcoded 100K credits (wrong!)
- [ ] `pages/Dashboards/OwnerDashboard.tsx` - Hardcoded topupAmount

### **Medium Priority** (Config files):
- [ ] `utils/signupLogic.ts` - Hardcoded limits with quantity restrictions
- [ ] `config/pricing.ts` - Hardcoded values and features
- [ ] `api/economicState.ts` - Hardcoded max_agents, max_workflows

### **Low Priority** (Other components):
- [ ] `pages/HomeNew/components/StatePhysicsSection.tsx` - "$49/mo"
- [ ] `pages/Account/AccountPage.tsx` - Uses hardcoded limits
- [ ] `pages/API/APIDocsPage.tsx` - Hardcoded API pricing

---

## 🎯 **Pattern to Follow**

### **Before** ❌:
```typescript
const plans = [
  {
    name: 'Developer',
    credits: '10,000 credits/month',  // Hardcoded
    price: { monthly: 0 },            // Hardcoded
    features: ['Up to 3 agents']      // Hardcoded quantity limit
  }
];
```

### **After** ✅:
```typescript
import { fetchPlans, formatCredits } from '@/api/pricing';

const [plans, setPlans] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadPricing() {
    const data = await fetchPlans();
    // Transform to component format
    setPlans(transformData(data));
    setLoading(false);
  }
  loadPricing();
}, []);

// Display: {formatCredits(plan.credits.included)}
// NO quantity limits shown
```

---

## 🚫 **What to Remove**

### **Quantity Limits** (Don't exist in backend):
- ❌ "Up to 3 agents"
- ❌ "Up to 20 agents"
- ❌ "max_agents: 3"
- ❌ "max_workflows: 5"
- ❌ Any agent/workflow/message limits

### **Replace With**:
- ✅ "Unlimited agents (billed by credits)"
- ✅ "Credits-only pricing"
- ✅ No quantity restrictions shown

---

## 📊 **Backend API**

### **Endpoint**: `GET /api/billing/pricing`

**Response**:
```json
{
  "plans": {
    "developer": {
      "name": "Developer",
      "price": { "monthly": 0, "yearly": 0 },
      "credits": {
        "included": 10000,
        "rollover": false
      },
      "limits": {
        "users": 1,
        "teams": 0,
        "org_features": false
      }
    },
    "plus": {
      "name": "Plus",
      "price": { "monthly": 49, "yearly": 490 },
      "credits": {
        "included": 75000,
        "rollover": true,
        "rollover_limit": 37500
      },
      "limits": {
        "users": 1,
        "teams": 0,
        "org_features": false
      }
    }
  }
}
```

**Note**: NO agent/workflow limits in backend!

---

## ✅ **Next Steps**

1. Fix remaining pricing pages (PricingPage.tsx, PricingPageNew.tsx)
2. Fix remaining dashboards (PlusDashboard.tsx, OwnerDashboard.tsx)
3. Remove hardcoded config files
4. Remove ALL quantity limit references
5. Test complete flow
6. Push to production

---

**Progress**: 2/15+ files fixed
