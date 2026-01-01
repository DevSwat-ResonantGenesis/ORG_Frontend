# 🧹 Cleanup & UI/UX Polish Plan

## Phase 1: Clean Old Styles

### Files to Archive (Not Imported)
1. ✅ `src/theme/global.css` - Already marked as legacy
2. Check for other unused CSS files in `src/theme/`

### Files Still Used (Keep for Now)
- `src/theme/pages.css` - Used by old dashboard components
  - **Action**: Migrate old dashboard components to 2025 design system, then remove

### Old Component CSS Modules (Can be removed if replaced)
- Check for old `.module.css` files that have `-2025.module.css` replacements

---

## Phase 2: Page-by-Page UI/UX Review & Polish

### ✅ Completed Pages
- [x] AboutPage-2025 - Looks good, using 2025 design system

### 🔄 In Progress
- [ ] LoginPage-2025 - Reviewing...

### 📋 Pages to Review

#### Public Pages
- [ ] HomePage (HomeNew) - Check if needs 2025 migration
- [x] AboutPage-2025
- [ ] ContactPage-2025
- [ ] CareersPage-2025
- [ ] PricingPage-2025
- [ ] PrivacyPage-2025
- [ ] TermsPage-2025
- [ ] CompliancePage-2025 (Legal)
- [ ] SignupPageEnhanced-2025
- [ ] LLMScannerPageFull
- [ ] ValidationToolPageFull

#### Auth Pages
- [ ] LoginPage-2025
- [ ] ForgotPasswordPage-2025
- [ ] ResetPasswordPage-2025

#### Dashboard Pages
- [ ] UnifiedUserDashboard-2025
- [ ] UnifiedOrgAdminDashboard-2025
- [ ] UnifiedPlatformDevDashboard-2025
- [ ] UnifiedFinanceDashboard-2025
- [ ] UnifiedComplianceDashboard-2025
- [ ] UnifiedMLEngineerDashboard-2025
- [ ] UnifiedViewerDashboard-2025

#### Feature Pages
- [ ] PoliciesPage-2025
- [ ] CompliancePage-2025
- [ ] AuditLogsPage-2025
- [ ] SettingsPage-2025
- [ ] PredictionsPage-2025
- [ ] ResonantChatPage-2025

---

## Phase 3: UI/UX Polish Checklist

For each page, check:

### Visual Design
- [ ] Consistent spacing (using design tokens)
- [ ] Proper typography hierarchy
- [ ] Consistent button styles
- [ ] Card styling matches 2025 design
- [ ] Color usage follows design system
- [ ] Border radius consistency
- [ ] Shadow usage

### Layout
- [ ] Responsive design (mobile-first)
- [ ] Proper container widths
- [ ] Grid layouts are responsive
- [ ] Touch targets are 44px minimum
- [ ] Proper padding/margins

### Interactions
- [ ] Button hover states
- [ ] Focus states (accessibility)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Smooth transitions

### Accessibility
- [ ] Proper heading hierarchy
- [ ] ARIA labels where needed
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] Color contrast

### Performance
- [ ] No layout shifts
- [ ] Smooth scrolling
- [ ] Optimized images
- [ ] Lazy loading where appropriate

---

## Phase 4: Remove Old Styles

After all pages are polished:
1. Remove old CSS files
2. Remove unused CSS modules
3. Clean up imports
4. Verify build still works

---

## Progress Tracking

**Started**: 2025-01-27  
**Status**: In Progress

