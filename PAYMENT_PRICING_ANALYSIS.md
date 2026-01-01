# ResonantGenesis Payment & Pricing Pipeline Analysis

**Generated:** December 17, 2025  
**Scope:** Complete analysis of payment, billing, and pricing infrastructure across frontend and backend

---

## Executive Summary

ResonantGenesis has a **comprehensive billing system** built on:
- **Stripe** for payment processing (subscriptions, one-time purchases, marketplace)
- **Platform Token** model for usage-based billing
- **6 subscription tiers** from Free to Private Cloud
- **Marketplace payments** with Stripe Connect for publisher payouts

### Implementation Status

| Component | Backend | Frontend | Status |
|-----------|---------|----------|--------|
| Subscription Management | ✅ Complete | ✅ Complete | **Ready** |
| Usage Tracking | ✅ Complete | ✅ Complete | **Ready** |
| Usage Alerts/Indicators | ✅ Complete | ✅ Restored | **Ready** |
| Token Purchases | ✅ Complete | ✅ Complete | **Ready** |
| Invoice Management | ✅ Complete | ✅ Complete | **Ready** |
| Payment Methods | ✅ Complete | ✅ Complete | **Ready** |
| Marketplace Payments | ✅ Complete | ⚠️ Partial | **In Progress** |
| Stripe Webhooks | ✅ Complete | N/A | **Ready** |

> **Note:** `UsageNotification.tsx` and `UsageIndicator.tsx` were restored from Windsurf history on Dec 17, 2025.

---

## 1. Pricing Model

### 1.1 Platform Token System

**One currency for everything** - Users get Platform Tokens each month.

| Operation | Token Cost | ~Real Cost |
|-----------|------------|------------|
| Agent Execution | 1,000 tokens | ~$0.08 |
| Workflow Run | 5,000 tokens | ~$0.40 |
| Storage (per GB/month) | 10,000 tokens | ~$0.80 |
| LLM Input (per 1K) | 100 tokens | ~$0.008 |
| LLM Output (per 1K) | 300 tokens | ~$0.024 |

### 1.2 Subscription Tiers

| Tier | Price | Monthly Tokens | Key Features |
|------|-------|----------------|--------------|
| **Free** | $0 | 10,000 | 2 agents, community support |
| **Builder** | $39 | 500,000 | 10 agents, 5 published, email support |
| **Pro** ⭐ | $99 | 2,000,000 | 50 agents, 5 team members, priority support |
| **Team** | $299 | 10,000,000 | 200 agents, 25 members, SSO, account manager |
| **Enterprise** | $999+ | Unlimited | SLA, on-premise, compliance |
| **Private Cloud** | $15,000+ | Unlimited | Dedicated infrastructure, air-gapped |

### 1.3 Token Pack Purchases (Overages)

| Pack | Tokens | Price | Per 1K Tokens | Savings |
|------|--------|-------|---------------|---------|
| Pay-as-you-go | 1,000 | $0.10 | $0.10 | - |
| 100K Pack | 100,000 | $9 | $0.09 | 10% |
| 500K Pack | 500,000 | $40 | $0.08 | 20% |
| 1M Pack | 1,000,000 | $70 | $0.07 | 30% |
| 5M Pack | 5,000,000 | $300 | $0.06 | 40% |

### 1.4 Marketplace Commission

| Transaction Type | Platform Fee | Developer Keeps |
|------------------|--------------|-----------------|
| One-time Purchase | 20% | 80% |
| Subscription | 25% | 75% |
| Per-execution | 30% | 70% |
| Enterprise License | 15% | 85% |

---

## 2. Backend Architecture

### 2.1 Core Services

```
Backend Billing Architecture
============================

┌─────────────────────────────────────────────────────────────────┐
│                     BILLING SERVICE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                  │
│  │  BillingService  │     │   UsageService   │                  │
│  │  (billing_       │     │   (usage_        │                  │
│  │   service.py)    │     │    service.py)   │                  │
│  └────────┬─────────┘     └────────┬─────────┘                  │
│           │                        │                             │
│           ▼                        ▼                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   STRIPE INTEGRATION                       │   │
│  │  - Customer management                                     │   │
│  │  - Checkout sessions                                       │   │
│  │  - Subscription lifecycle                                  │   │
│  │  - Invoice processing                                      │   │
│  │  - Webhook handling                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   MARKETPLACE PAYMENTS                     │   │
│  │  - Stripe Connect (publisher accounts)                     │   │
│  │  - Split payments (platform fee + publisher)               │   │
│  │  - Publisher payouts                                       │   │
│  │  - Refund processing                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Database Models

**File:** `agent_engine_service/app/models_billing.py`

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Organization` | Billing entity | stripe_customer_id, plan_tier, monthly_token_limit, tokens_used |
| `Subscription` | Subscription records | stripe_subscription_id, plan_tier, status, period dates |
| `UsageRecord` | Individual usage events | usage_type, tokens_consumed, resource_id |
| `UsageSummary` | Aggregated usage | period totals by type |
| `Invoice` | Invoice history | stripe_invoice_id, amounts, status |
| `PaymentMethod` | Stored cards | stripe_payment_method_id, card details |
| `TokenPurchase` | Token pack purchases | tokens_purchased, price_paid, tokens_remaining |

### 2.3 API Endpoints

**File:** `agent_engine_service/app/routers_billing.py`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/billing/checkout` | POST | Create Stripe checkout for subscription |
| `/billing/tokens/purchase` | POST | Create checkout for token pack |
| `/billing/subscription/cancel` | POST | Cancel subscription |
| `/billing/subscription/change` | POST | Change plan |
| `/billing/info` | GET | Get billing info |
| `/billing/usage` | GET | Get usage summary |
| `/billing/usage/history` | GET | Get usage history |
| `/billing/usage/record` | POST | Record usage (internal) |
| `/billing/usage/check` | GET | Check if can execute |
| `/billing/webhook/stripe` | POST | Stripe webhook handler |
| `/billing/tokens/packs` | GET | Get available token packs |
| `/billing/plans` | GET | Get available plans |

### 2.4 Stripe Integration Details

**File:** `agent_engine_service/app/services/billing_service.py`

```python
# Environment Variables Required
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Price IDs (configured in Stripe Dashboard)
STRIPE_PRICE_BUILDER = os.getenv("STRIPE_PRICE_BUILDER")
STRIPE_PRICE_PRO = os.getenv("STRIPE_PRICE_PRO")
STRIPE_PRICE_TEAM = os.getenv("STRIPE_PRICE_TEAM")
STRIPE_PRICE_ENTERPRISE = os.getenv("STRIPE_PRICE_ENTERPRISE")
```

**Webhook Events Handled:**
- `customer.subscription.created` → Activate subscription, allocate tokens
- `customer.subscription.updated` → Update billing period, reset usage
- `customer.subscription.deleted` → Downgrade to free
- `invoice.paid` → Create invoice record
- `checkout.session.completed` → Process token purchases

### 2.5 Marketplace Payments

**File:** `marketplace_service/app/payments.py`

**Stripe Connect Features:**
- Express accounts for publishers
- Onboarding links
- Split payments with platform fee
- Publisher balance and payouts
- Refund processing with transfer reversal

```python
MARKETPLACE_FEE_PERCENT = 15  # Default platform fee

# Payment flow:
# 1. Buyer checkout → Stripe
# 2. Stripe charges card
# 3. Platform fee deducted (15-30%)
# 4. Rest transferred to publisher's connected account
```

---

## 3. Frontend Implementation

### 3.1 API Client

**File:** `src/api/billingComplete.ts` (438 lines)

**Comprehensive API coverage:**

| Category | Functions |
|----------|-----------|
| Subscriptions | `getSubscription`, `createSubscription`, `cancelSubscription`, `reactivateSubscription`, `changePlan`, `getPlans` |
| Credits | `getCreditBalance`, `purchaseCredits`, `getCreditTransactions` |
| Usage | `getUsageSummary`, `getUsageMetrics`, `recordUsage` |
| Invoices | `getInvoices`, `getInvoice`, `downloadInvoicePdf`, `payInvoice` |
| Payment Methods | `getPaymentMethods`, `addPaymentMethod`, `removePaymentMethod`, `setDefaultPaymentMethod` |
| Checkout | `createCheckoutSession`, `createCreditsCheckout`, `getBillingPortalUrl` |
| Overview | `getBillingOverview` |

### 3.2 React Hooks

**File:** `src/hooks/useBilling.ts` (372 lines)

| Hook | Purpose |
|------|---------|
| `useSubscription()` | Manage subscription state |
| `useCredits()` | Track credit balance and transactions |
| `useUsage()` | Monitor usage metrics |
| `useInvoices()` | List and manage invoices |
| `usePaymentMethods()` | Manage payment methods |
| `usePlans()` | Get available plans, initiate checkout |
| `useBillingOverview()` | Combined billing dashboard data |

### 3.3 UI Components

#### Billing Pages (`src/pages/Billing/`)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `BillingPage.tsx` | 380 | Main billing dashboard |
| `BillingOverview.tsx` | 846 | Subscription status card |
| `UsageBreakdown.tsx` | 2,131 | Usage visualization |
| `InvoicesPanel.tsx` | 1,854 | Invoice history |
| `PaymentMethodsPanel.tsx` | 2,666 | Card management |
| `PricingPanel.tsx` | 7,431 | Plan comparison |

#### Billing Components (`src/components/billing/`) ✅ RESTORED

| Component | Lines | Purpose |
|-----------|-------|---------|
| `UsageNotification.tsx` | 353 | Alerts when usage approaches limits |
| `UsageIndicator.tsx` | 487 | Visual indicator of token/resource usage |

#### Public Pricing Pages

| Component | Lines | Purpose |
|-----------|-------|---------|
| `PricingPage-2025.tsx` | 279 | Public pricing page (main) |
| `PricingPage-New.tsx` | 525 | Alternative pricing page |
| `PricingPageComplete.tsx` | 675 | Full-featured pricing page |
| `PricingPage.tsx` | 13,416 | Pricing page (in `/pages/Pricing/`) |

### 3.4 Frontend Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/billing` | BillingPage | User billing dashboard |
| `/pricing` | PricingPage | Public pricing page |
| `/signup` | SignupPage | Plan selection during signup |

---

## 4. Usage Tracking Flow

```
Usage Tracking Flow
===================

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Agent     │     │  Usage      │     │  Database   │
│  Execution  │────▶│  Middleware │────▶│  Update     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Check     │
                    │   Limits    │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌─────────────┐          ┌─────────────┐
       │  Allow      │          │  Block +    │
       │  + Record   │          │  402 Error  │
       └─────────────┘          └─────────────┘
```

**Token Deduction Logic:**

```python
# From usage_service.py
async def record_usage(org_id, usage_type, quantity):
    token_cost = TOKEN_COSTS[usage_type]  # e.g., 1000 for agent execution
    tokens_consumed = token_cost * quantity
    
    # Check limits
    if org.tokens_used + tokens_consumed > org.monthly_token_limit:
        if not org.overage_enabled:
            return {"error": "token_limit_exceeded"}
        # Record as overage
        org.overage_tokens_used += overage_amount
    
    # Update usage
    org.tokens_used_this_period += tokens_consumed
    
    # Create usage record for audit
    create_usage_record(org_id, usage_type, tokens_consumed, ...)
```

---

## 5. Subscription Lifecycle

```
Subscription Lifecycle
======================

┌─────────────┐
│   FREE      │◀──────────────────────────────────┐
│   TIER      │                                   │
└──────┬──────┘                                   │
       │ Upgrade                                  │ Cancel/Expire
       ▼                                          │
┌─────────────┐     ┌─────────────┐     ┌────────┴────────┐
│  Checkout   │────▶│  ACTIVE     │────▶│   CANCELED      │
│  (Stripe)   │     │  Subscription│     │   (end of period)│
└─────────────┘     └──────┬──────┘     └─────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
             ┌─────────────┐ ┌─────────────┐
             │  Upgrade    │ │  Downgrade  │
             │  (prorate)  │ │  (prorate)  │
             └─────────────┘ └─────────────┘
```

**Webhook-Driven Updates:**

1. `customer.subscription.created` → Set plan tier, allocate tokens
2. `customer.subscription.updated` → Update period, reset usage on renewal
3. `customer.subscription.deleted` → Downgrade to free tier
4. `invoice.paid` → Record successful payment

---

## 6. Marketplace Payment Flow

```
Marketplace Payment Flow (Stripe Connect)
=========================================

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Buyer     │────▶│   Stripe    │────▶│  Platform   │
│   Checkout  │     │   Checkout  │     │  (15-30%)   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                        ┌──────┴──────┐
                                        ▼             ▼
                                 ┌─────────────┐ ┌─────────────┐
                                 │  Platform   │ │  Publisher  │
                                 │  Revenue    │ │  Account    │
                                 └─────────────┘ └──────┬──────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │  Publisher  │
                                                 │  Payout     │
                                                 └─────────────┘
```

**Publisher Onboarding:**

```python
# 1. Create connected account
account = stripe.Account.create(type="express", email=email)

# 2. Generate onboarding link
link = stripe.AccountLink.create(
    account=account.id,
    type="account_onboarding",
    return_url=return_url,
    refresh_url=refresh_url
)

# 3. Publisher completes Stripe onboarding
# 4. Account verified → can receive payments
```

---

## 7. Configuration Requirements

### 7.1 Environment Variables

```bash
# Backend (.env)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Subscription Prices (from Stripe Dashboard)
STRIPE_PRICE_BUILDER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_TEAM=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Token Pack Prices
STRIPE_PRICE_TOKENS_100K=price_...
STRIPE_PRICE_TOKENS_500K=price_...
STRIPE_PRICE_TOKENS_1M=price_...
STRIPE_PRICE_TOKENS_5M=price_...

# Marketplace
MARKETPLACE_FEE_PERCENT=15
```

### 7.2 Stripe Dashboard Setup

**Products to Create:**

1. **Subscription Products:**
   - Builder Plan ($39/month)
   - Pro Plan ($99/month)
   - Team Plan ($299/month)
   - Enterprise Plan ($999/month)

2. **Token Pack Products:**
   - 100K Token Pack ($9)
   - 500K Token Pack ($40)
   - 1M Token Pack ($70)
   - 5M Token Pack ($300)

**Webhooks to Configure:**

| Event | Endpoint |
|-------|----------|
| `customer.subscription.created` | `/billing/webhook/stripe` |
| `customer.subscription.updated` | `/billing/webhook/stripe` |
| `customer.subscription.deleted` | `/billing/webhook/stripe` |
| `invoice.paid` | `/billing/webhook/stripe` |
| `checkout.session.completed` | `/billing/webhook/stripe` |

---

## 8. Gap Analysis

### 8.1 Backend Gaps

| Gap | Priority | Description |
|-----|----------|-------------|
| Stripe Price IDs | **High** | Need to create products in Stripe Dashboard |
| Webhook URL | **High** | Need public URL for Stripe webhooks |
| Database Migration | **Medium** | Need to run billing tables migration |
| Scheduled Jobs | **Medium** | Need cron for usage alerts, period resets |

### 8.2 Frontend Gaps

| Gap | Priority | Description |
|-----|----------|-------------|
| Marketplace Checkout | **Medium** | Agent purchase UI needs completion |
| Usage Alerts UI | **Low** | Show alerts when approaching limits |
| Credit Purchase UI | **Low** | Token pack purchase flow |

### 8.3 Integration Gaps

| Gap | Priority | Description |
|-----|----------|-------------|
| Usage Middleware | **High** | Not all endpoints track usage |
| LLM Usage Tracking | **Medium** | Need to track LLM token consumption |
| Real-time Usage Updates | **Low** | WebSocket for live usage updates |

---

## 9. Revenue Projections

### Year 1 Targets

| Tier | Target Users | Price | MRR |
|------|--------------|-------|-----|
| Free | 10,000 | $0 | $0 |
| Builder | 400 (4%) | $39 | $15,600 |
| Pro | 200 (2%) | $99 | $19,800 |
| Team | 30 (0.3%) | $299 | $8,970 |
| Enterprise | 5 (0.05%) | $999 | $4,995 |
| **Subscription MRR** | | | **$49,365** |

**Additional Revenue:**
- Marketplace (25% of $50K GMV): $12,500/month
- Usage Overages: $5,000/month
- Compute Credits: $3,000/month
- **Total MRR: ~$70,000**
- **Annual Run Rate: ~$840,000**

---

## 10. Recommendations

### Immediate Actions (Week 1)

1. **Create Stripe Products** - Set up subscription and token pack products
2. **Configure Webhooks** - Point to production webhook endpoint
3. **Run Migrations** - Deploy billing tables to production database
4. **Test Checkout Flow** - End-to-end subscription purchase test

### Short-term (Month 1)

1. **Usage Middleware** - Add to all billable endpoints
2. **Usage Alerts** - Email notifications at 80%, 90%, 100%
3. **Marketplace Payments** - Complete agent purchase flow
4. **Invoice Emails** - Automated invoice delivery

### Medium-term (Month 2-3)

1. **Annual Billing** - 17% discount for yearly plans
2. **Coupon Codes** - Promotional discounts
3. **Referral Program** - User referral credits
4. **Enterprise Self-serve** - Custom quote flow

---

## Appendix: Code References

### Backend Files

| File | Lines | Purpose |
|------|-------|---------|
| `billing_service.py` | 510 | Stripe integration, subscription management |
| `usage_service.py` | 367 | Usage tracking, token deduction |
| `models_billing.py` | 264 | Database models |
| `routers_billing.py` | 340 | API endpoints |
| `payments.py` | 383 | Marketplace Stripe Connect |

### Frontend Files

#### API & Hooks
| File | Lines | Purpose |
|------|-------|---------|
| `src/api/billingComplete.ts` | 438 | Full billing API client |
| `src/api/billing.ts` | 39 | Simple billing API |
| `src/api/stripe.ts` | 1,654 | Stripe integration |
| `src/hooks/useBilling.ts` | 372 | React hooks for billing |

#### Billing Pages
| File | Lines | Purpose |
|------|-------|---------|
| `src/pages/Billing/BillingPage.tsx` | 380 | Main billing dashboard |
| `src/pages/Billing/BillingOverview.tsx` | 846 | Subscription status |
| `src/pages/Billing/UsageBreakdown.tsx` | 2,131 | Usage charts |
| `src/pages/Billing/InvoicesPanel.tsx` | 1,854 | Invoice list |
| `src/pages/Billing/PaymentMethodsPanel.tsx` | 2,666 | Card management |
| `src/pages/Billing/PricingPanel.tsx` | 7,431 | Plan comparison |

#### Billing Components ✅ RESTORED FROM WINDSURF HISTORY
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/billing/UsageNotification.tsx` | 353 | Usage limit alerts |
| `src/components/billing/UsageIndicator.tsx` | 487 | Visual usage meter |

#### Public Pricing Pages
| File | Lines | Purpose |
|------|-------|---------|
| `src/pages/Public/PricingPage-2025.tsx` | 279 | Public pricing (main) |
| `src/pages/Public/PricingPage-New.tsx` | 525 | Alternative pricing |
| `src/pages/Public/PricingPageComplete.tsx` | 675 | Full pricing page |
| `src/pages/Pricing/PricingPage.tsx` | 13,416 | Complete pricing page |

---

**Total Frontend Billing Code: ~32,000+ lines**

*Report updated: December 17, 2025 - Added restored billing components from Windsurf history*
