# Frontend Style Migration Report
**Generated:** 2025-01-XX

## Executive Summary

This report analyzes the frontend codebase to identify:
1. **Old styles** that need to be deleted
2. **Files** that need migration to the new style system
3. **Line counts** for cleanup and migration planning

---

## Overall Statistics

- **Total CSS Files:** 156 files
- **Total Lines of CSS:** 46,554 lines
- **Files Using Old Styles:** 70 files
- **Total Lines with Old Styles:** ~13,560 lines
- **Files Using New Styles:** 110 files
- **Files with 2025 Suffix (Migrated):** 39 files
- **Total Lines in Migrated Files:** ~21,200 lines
- **Files Without 2025 (Need Migration):** 117 files
- **Old Style Occurrences:** 664+ occurrences across files

---

## Old Style Patterns Detected

### Pattern Usage Counts:
- `var(--spacing-*)`: **180 occurrences** (old spacing system)
- `var(--text-900)`: **129 occurrences** (old text color)
- `var(--rg-*)`: **197 occurrences** (old ResonantGenesis variables)
- `var(--font-bold)`: Multiple occurrences (old font weights)
- `var(--surface-border)`: Multiple occurrences (old border variables)

### New Style Patterns (Target):
- `var(--space-*)`: **2,348 occurrences** (new spacing system) ✅
- `var(--text-primary)`: **100 occurrences** (new text colors) ✅
- `var(--color-primary-*)`: **148 occurrences** (new color system) ✅
- `var(--font-weight-*)`: Multiple occurrences (new font weights) ✅
- `var(--border)`: Multiple occurrences (new border variables) ✅

---

## Files Using Old Styles (70 files, ~13,560 lines)

### Components (35 files, ~4,200 lines)
1. `src/components/EmptyState.css` - 86 lines
2. `src/components/Icons/DashboardIcons.css` - 54 lines
3. `src/components/LLMScannerWidget/LLMScannerWidget.css` - 217 lines
4. `src/components/MenuBurger.css` - 103 lines
5. `src/components/ResponsiveTable.css` - 136 lines
6. `src/components/ThemeToggle.css` - 192 lines
7. `src/components/Toast/Toast.css` - 182 lines
8. `src/components/auth/SSOButtons.module.css` - 64 lines
9. `src/components/common/SearchFilter.css` - 141 lines
10. `src/components/dashboard/businessImpactKPIs.css` - 123 lines
11. `src/components/dashboard/dashboardEvidenceGraphWidget.css` - 230 lines
12. `src/components/diagrams/flowDiagram.css` - 221 lines
13. `src/components/features/dashboard/apiEndpointsPanel.css` - 229 lines
14. `src/components/features/dashboard/businessImpactKPIs.css` - 123 lines (duplicate)
15. `src/components/features/dashboard/dashboardEvidenceGraphWidget.css` - 230 lines (duplicate)
16. `src/components/features/landing/ParallaxTitle.css` - 119 lines
17. `src/components/features/landing/animatedCounter.css` - 64 lines
18. `src/components/features/landing/audienceSections.css` - 573 lines
19. `src/components/features/landing/ceoExplanation.css` - 370 lines
20. `src/components/features/landing/evidenceGraphPreview.css` - 90 lines
21. `src/components/features/landing/evidenceParallax.css` - 242 lines
22. `src/components/features/landing/evidenceParallaxAdvanced.css` - 288 lines
23. `src/components/features/landing/howItWorks.css` - 573 lines
24. `src/components/features/landing/industryFilter.css` - 111 lines
25. `src/components/features/landing/inputMethods.css` - 369 lines
26. `src/components/features/landing/packagesPricingSection.css` - 173 lines
27. `src/components/features/landing/sdkApiSection.css` - 264 lines
28. `src/components/features/landing/useCaseCard.css` - 395 lines
29. `src/components/features/landing/useCasesSection.css` - 284 lines
30. `src/components/features/pricing/pricingCalculator.css` - 124 lines
31. `src/components/layout/Footer.css` - 75 lines
32. `src/components/layout/ModernPageLayout.module.css` - 206 lines
33. `src/components/layout/Sidebar.module.css` - 96 lines
34. `src/components/layout/UnifiedTwoColumnLayout.module.css` - 335 lines
35. `src/components/modal.css` - 67 lines
36. `src/components/panels/logPanel.css` - 307 lines
37. `src/components/shared/Modal.module.css` - 68 lines
38. `src/components/shared/Table.module.css` - 59 lines
39. `src/components/shared/modal.css` - 67 lines (duplicate)
40. `src/components/ui/Button.module.css` - 201 lines
41. `src/components/ui/Card.css` - 101 lines
42. `src/components/ui/HertzEnergyVisualization.module.css` - 140 lines
43. `src/components/ui/Input.css` - 110 lines
44. `src/components/ui/Input.module.css` - 102 lines
45. `src/components/ui/UniverseSelector.module.css` - 155 lines

### Pages (7 files, ~1,100 lines)
1. `src/pages/AIAudit/AIAuditDashboardPage.module.css` - 296 lines
2. `src/pages/AIAudit/AIAuditLogDetailPage.module.css` - 302 lines
3. `src/pages/Admin/UserManagementPage.module.css` - 58 lines
4. `src/pages/Dashboard/DashboardPage.module.css` - 371 lines
5. `src/pages/ML/TrainingJobDetailPage.module.css` - 79 lines
6. `src/pages/ML/WorkerMonitorPage.module.css` - 63 lines
7. `src/pages/Predictions/PredictionDetailPage.module.css` - 76 lines
8. `src/pages/Settings/MFASetupPage.module.css` - 42 lines
9. `src/pages/Typography/TypographyShowcasePage.module.css` - 151 lines

### Layout (3 files, ~750 lines)
1. `src/layout/Footer.css` - 151 lines
2. `src/layout/Footer.module.css` - 138 lines
3. `src/layout/MainLayout.css` - 460 lines

### Theme Modules (11 files, ~2,500 lines)
1. `src/theme/modules/base.css` - 170 lines (partially migrated)
2. `src/theme/modules/components.css` - 281 lines
3. `src/theme/modules/content-pages.css` - 313 lines
4. `src/theme/modules/dashboard-layout.css` - 153 lines
5. `src/theme/modules/forms.css` - 79 lines
6. `src/theme/modules/responsive-2025.css` - 343 lines (mixed)
7. `src/theme/modules/themes.css` - 225 lines
8. `src/theme/modules/tokens.css` - 222 lines
9. `src/theme/modules/tool-pages.css` - 132 lines
10. `src/theme/modules/typography-enforcement.css` - 196 lines
11. `src/theme/modules/typography.css` - 317 lines
12. `src/theme/modules/utilities.css` - 303 lines
13. `src/theme/pages.css` - 180 lines

---

## Files Already Migrated (39 files with -2025 suffix)

### Successfully Migrated Pages:
- ✅ `src/pages/Help/HelpCenterPage.module.css` (just migrated)
- ✅ `src/pages/Help/HelpArticlePage.module.css` (just migrated)
- ✅ `src/pages/ResonantChat/ResonantChatPage-2025.module.css`
- ✅ `src/pages/Dashboards/UnifiedPlatformDevDashboard-2025.module.css`
- ✅ `src/pages/Dashboards/UnifiedMLEngineerDashboard-2025.module.css`
- ✅ `src/pages/Dashboards/UnifiedFinanceDashboard-2025.module.css`
- ✅ `src/pages/Dashboards/UnifiedComplianceDashboard-2025.module.css`
- ✅ `src/pages/Dashboards/UnifiedOrgAdminDashboard-2025.module.css`
- ✅ `src/pages/Dashboards/UnifiedViewerDashboard-2025.module.css`
- ✅ `src/pages/Dashboards/UnifiedUserDashboard-2025.module.css`
- ✅ `src/pages/Public/PricingPage-2025.module.css`
- ✅ `src/pages/Public/ValidationToolPageFull-2025.module.css`
- ✅ `src/pages/Public/LLMScannerPageFull-2025.module.css`
- ✅ `src/pages/Auth/LoginPage-2025.module.css`
- ✅ `src/pages/Auth/ForgotPasswordPage-2025.module.css`
- ✅ `src/pages/Auth/ResetPasswordPage-2025.module.css`
- ✅ `src/pages/Public/SignupPageEnhanced-2025.module.css`
- ✅ `src/pages/Public/CareersPage-2025.module.css`
- ✅ `src/pages/Public/ContactPage-2025.module.css`
- ✅ `src/pages/Public/AboutPage-2025.module.css`
- ✅ `src/pages/Public/CareerApplicationPage-2025.module.css`
- ✅ `src/pages/Public/Legal/TermsPage-2025.module.css`
- ✅ `src/pages/Public/Legal/CompliancePage-2025.module.css`
- ✅ `src/pages/Public/Legal/PrivacyPage-2025.module.css`
- ✅ `src/pages/Settings/SettingsPage-2025.module.css`
- ✅ `src/pages/Audit/AuditLogsPage-2025.module.css`
- ✅ `src/pages/Compliance/CompliancePage-2025.module.css`
- ✅ `src/pages/Policies/PoliciesPage-2025.module.css`
- ✅ `src/pages/Predictions/PredictionsPage-2025.module.css`

### Successfully Migrated Components:
- ✅ `src/components/ResonantChat/EnhancedSidebar-2025.module.css`
- ✅ `src/components/ui/Button-2025.module.css`
- ✅ `src/components/ui/Card-2025.module.css`
- ✅ `src/components/ui/Input-2025.module.css`
- ✅ `src/components/layout/Header/Header-2025.module.css`
- ✅ `src/components/layout/PageLayout-2025.module.css`

---

## Migration Priority Recommendations

### 🔴 HIGH PRIORITY (Core Components - 15 files, ~2,000 lines)
These are used across many pages and should be migrated first:
1. `src/components/ui/Button.module.css` - 201 lines
2. `src/components/ui/Input.module.css` - 102 lines
3. `src/components/ui/Card.css` - 101 lines
4. `src/components/shared/Modal.module.css` - 68 lines
5. `src/components/shared/Table.module.css` - 59 lines
6. `src/components/layout/Sidebar.module.css` - 96 lines
7. `src/components/layout/UnifiedTwoColumnLayout.module.css` - 335 lines
8. `src/components/layout/ModernPageLayout.module.css` - 206 lines
9. `src/layout/Footer.module.css` - 138 lines
10. `src/layout/MainLayout.css` - 460 lines
11. `src/theme/modules/components.css` - 281 lines
12. `src/theme/modules/forms.css` - 79 lines
13. `src/theme/modules/base.css` - 170 lines (partial)
14. `src/theme/modules/themes.css` - 225 lines
15. `src/theme/modules/tokens.css` - 222 lines

### 🟡 MEDIUM PRIORITY (Page-Specific - 9 files, ~1,200 lines)
1. `src/pages/Dashboard/DashboardPage.module.css` - 371 lines
2. `src/pages/AIAudit/AIAuditDashboardPage.module.css` - 296 lines
3. `src/pages/AIAudit/AIAuditLogDetailPage.module.css` - 302 lines
4. `src/pages/Predictions/PredictionDetailPage.module.css` - 76 lines
5. `src/pages/ML/TrainingJobDetailPage.module.css` - 79 lines
6. `src/pages/ML/WorkerMonitorPage.module.css` - 63 lines
7. `src/pages/Admin/UserManagementPage.module.css` - 58 lines
8. `src/pages/Settings/MFASetupPage.module.css` - 42 lines
9. `src/pages/Typography/TypographyShowcasePage.module.css` - 151 lines

### 🟢 LOW PRIORITY (Landing/Feature Components - 20 files, ~4,000 lines)
These are less critical and can be migrated later:
- All `src/components/features/landing/*.css` files
- `src/components/dashboard/*.css` files
- `src/components/features/dashboard/*.css` files
- `src/components/features/pricing/*.css` files

---

## Estimated Cleanup

### Old Styles to Delete:
- **Total Lines with Old Styles:** ~13,560 lines
- **Files to Clean:** 70 files
- **Old Style Variable Occurrences:** 664+ occurrences
- **Duplicate Files:** 3 files (can be deleted immediately)
  - `src/components/shared/modal.css` (duplicate of Modal.module.css)
  - `src/components/features/dashboard/businessImpactKPIs.css` (duplicate)
  - `src/components/features/dashboard/dashboardEvidenceGraphWidget.css` (duplicate)

### Migration Effort:
- **High Priority Files:** 15 files, ~2,000 lines
- **Medium Priority Files:** 9 files, ~1,200 lines
- **Low Priority Files:** 20 files, ~4,000 lines
- **Theme Modules:** 11 files, ~2,500 lines

---

## Action Items

### Immediate Actions:
1. ✅ **Delete duplicate files** (3 files)
2. 🔄 **Migrate core UI components** (Button, Input, Card, Modal, Table)
3. 🔄 **Migrate layout components** (Sidebar, Footer, MainLayout)
4. 🔄 **Migrate theme modules** (components.css, forms.css, base.css)

### Short-term (Next Sprint):
1. Migrate high-priority page components
2. Update theme modules to use new variables
3. Remove old style references from migrated files

### Long-term:
1. Migrate landing page components
2. Clean up remaining old style references
3. Consolidate duplicate styles

---

## Style Variable Mapping

### Old → New Variable Mapping:
```
--spacing-*     → --space-*
--text-900      → --text-primary
--text-700      → --text-secondary
--text-600      → --text-tertiary
--rg-primary    → --color-primary-500
--rg-primary-hover → --color-primary-600
--font-bold     → --font-weight-bold
--font-semibold → --font-weight-semibold
--surface-border → --border
--bg            → --bg-primary
--surface       → --surface (same)
```

---

## Notes

- Files with `-2025` suffix are already migrated ✅
- Some files may have mixed old/new styles (partial migration)
- Backup files should be deleted after verification
- Theme modules need careful migration to avoid breaking global styles

---

**Report Generated:** 2025-01-XX
**Total Analysis:** 156 CSS files, 46,554 lines
**Migration Status:** 
- ✅ 39 files migrated (~21,200 lines)
- 🔄 70 files need migration (~13,560 lines with old styles)
- 🗑️ 664+ old style variable occurrences to replace
- 📊 12 core UI component files need priority migration

