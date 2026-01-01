# Public Pages Style Analysis

## Complete List of Public Pages (17 total)

### 1. **Home Page** (`/`)
- **File**: `src/pages/HomeNew/HomeNew.tsx`
- **Styles**: `HomeNew.module.css` (1,785 lines)
- **Uses**: `<Header />` component directly
- **Layout**: Custom layout with hero section

### 2. **Signup Page** (`/public/signup`)
- **File**: `src/pages/Public/SignupPageEnhanced.tsx`
- **Styles**: `SignupPageEnhanced.module.css` (515 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 3. **Login Page** (`/login`)
- **File**: `src/pages/Auth/LoginPage.tsx`
- **Styles**: `LoginPage.module.css` (204 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 4. **Forgot Password** (`/forgot-password`)
- **File**: `src/pages/Auth/ForgotPasswordPage.tsx`
- **Styles**: `ForgotPasswordPage.module.css` (110 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 5. **Reset Password** (`/reset-password`)
- **File**: `src/pages/Auth/ResetPasswordPage.tsx`
- **Styles**: `ResetPasswordPage.module.css` (98 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 6. **Pricing Page** (`/pricing`)
- **File**: `src/pages/Public/PricingPage.tsx`
- **Styles**: `PricingPage.module.css` (783 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 7. **About Page** (`/about`)
- **File**: `src/pages/Public/AboutPage.tsx`
- **Styles**: `AboutPage.module.css` (235 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 8. **Careers Page** (`/careers`)
- **File**: `src/pages/Public/CareersPage.tsx`
- **Styles**: `CareersPage.module.css` (239 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 9. **Career Application** (`/careers/apply/:position`)
- **File**: `src/pages/Public/CareerApplicationPage.tsx`
- **Styles**: `CareerApplicationPage.module.css` (135 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 10. **Contact Page** (`/contact`)
- **File**: `src/pages/Public/ContactPage.tsx`
- **Styles**: `ContactPage.module.css` (260 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 11. **Privacy Page** (`/public/legal/privacy`)
- **File**: `src/pages/Public/Legal/PrivacyPage.tsx`
- **Styles**: `LegalPage.module.css` (218 lines) - **SHARED**
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 12. **Terms Page** (`/public/legal/terms`)
- **File**: `src/pages/Public/Legal/TermsPage.tsx`
- **Styles**: `LegalPage.module.css` (218 lines) - **SHARED**
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 13. **Legal Compliance** (`/public/legal/compliance`)
- **File**: `src/pages/Public/Legal/CompliancePage.tsx`
- **Styles**: `LegalPage.module.css` (218 lines) - **SHARED**
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 14. **Validation Tool** (`/validate`, `/public/validate`)
- **File**: `src/pages/Public/ValidationToolPageFull.tsx`
- **Styles**: `ValidationToolPageFull.module.css` (1,330 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 15. **LLM Scanner** (`/llm-scan`, `/public/llm-scan`)
- **File**: `src/pages/Public/LLMScannerPageFull.tsx`
- **Styles**: `LLMScannerPageFull.module.css` (1,544 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 16. **Resonant Chat** (`/resonant-chat`, `/resonant-chat-next`)
- **File**: `src/pages/ResonantChat/ResonantChatPage.tsx`
- **Styles**: `ResonantChatPage.module.css` (951 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

### 17. **API Docs** (`/api/docs`, `/api`)
- **File**: `src/pages/API/APIDocsPage.tsx`
- **Styles**: `APIDocsPage.module.css` (343 lines)
- **Layout**: Uses `MainLayout` via `withPublicShell`

---

## Style Consistency Analysis

### ✅ **SHARED STYLES** (Common Patterns)

Most public pages share these common patterns:

#### 1. **Page Container Pattern**
```css
.pageName {
  min-height: 100vh;
  padding: var(--spacing-4);
  padding-top: calc(56px + var(--spacing-4)); /* Account for fixed header */
  background: var(--bg);
  color: var(--text-900);
  width: 100%;
  box-sizing: border-box;
  margin: 0;
}
```

**Used by**: AboutPage, ContactPage, PricingPage, LoginPage, SignupPage, CareersPage

#### 2. **Container Pattern**
```css
.container {
  max-width: 1400px; /* or 900px for forms */
  margin: 0 auto;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}
```

**Used by**: AboutPage, ContactPage, LoginPage, SignupPage, CareersPage

#### 3. **Header Pattern**
```css
.header {
  text-align: center;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--surface-border);
}

.header h1 {
  font-size: var(--font-4xl);
  font-weight: var(--font-bold);
  color: var(--text-900);
  margin-bottom: var(--spacing-2);
}
```

**Used by**: AboutPage, ContactPage, LoginPage, SignupPage, CareersPage

#### 4. **Content Body Pattern**
```css
.contentBody {
  display: grid;
  grid-template-columns: 1fr 300px; /* or 1fr for single column */
  gap: var(--spacing-4);
  width: 100%;
  box-sizing: border-box;
  align-items: start;
}

.contentMain {
  width: 100%;
  box-sizing: border-box;
}

.contentSection {
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-4);
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
}
```

**Used by**: AboutPage, ContactPage, LoginPage, SignupPage

#### 5. **Shared CSS Variables**
All pages use these design tokens:
- `var(--bg)` - Background color
- `var(--text-900)` - Primary text color
- `var(--text-700)` - Secondary text color
- `var(--surface)` - Surface/card background
- `var(--surface-border)` - Border color
- `var(--spacing-*)` - Spacing scale
- `var(--font-*)` - Typography scale
- `var(--radius-*)` - Border radius

---

### ❌ **INCONSISTENCIES** (Different Styles)

#### 1. **Home Page** (`HomeNew.module.css`)
- **Unique**: Has its own hero section, complex layout
- **Does NOT use**: Standard `.container`, `.header`, `.contentBody` patterns
- **Uses**: Custom classes like `.hero`, `.heroContent`, `.sectionTitle`, etc.

#### 2. **Pricing Page** (`PricingPage.module.css`)
- **Unique**: Complex pricing tables, tabs, billing toggle
- **Has**: Extensive dark mode overrides with `!important` flags
- **Different**: Uses different color variables in some places

#### 3. **Validation Tool** (`ValidationToolPageFull.module.css`)
- **Unique**: Large file (1,330 lines) with tool-specific styles
- **Different**: Custom form layouts, validation UI

#### 4. **LLM Scanner** (`LLMScannerPageFull.module.css`)
- **Unique**: Largest file (1,544 lines) with scanner-specific UI
- **Different**: Custom scanning interface, results display

#### 5. **Resonant Chat** (`ResonantChatPage.module.css`)
- **Unique**: Chat interface with messages, sidebar, input panel
- **Different**: Real-time chat UI patterns

#### 6. **API Docs** (`APIDocsPage.module.css`)
- **Unique**: Documentation layout, code blocks, endpoint lists
- **Different**: Uses `ModernPageLayout` component

#### 7. **Legal Pages** (Privacy, Terms, Compliance)
- **Shared**: All 3 pages use the same `LegalPage.module.css`
- **Consistent**: ✅ Good example of shared styles

---

## Summary

### ✅ **Pages with SIMILAR Styles** (8 pages)
1. AboutPage
2. ContactPage
3. LoginPage
4. SignupPage
5. CareersPage
6. CareerApplicationPage
7. ForgotPasswordPage
8. ResetPasswordPage

**Common Pattern**: `.container` → `.header` → `.contentBody` → `.contentMain` → `.contentSection`

### ❌ **Pages with UNIQUE Styles** (9 pages)
1. HomeNew - Custom hero layout
2. PricingPage - Complex pricing tables
3. ValidationToolPageFull - Tool-specific UI
4. LLMScannerPageFull - Scanner interface
5. ResonantChatPage - Chat interface
6. APIDocsPage - Documentation layout
7. Legal Pages (3 pages) - Shared but different from others

---

## Recommendations

### 1. **Create Shared Public Page Module**
Extract common patterns into `src/components/layout/PublicPage.module.css`:
- `.publicPage` - Base page container
- `.publicContainer` - Standard container
- `.publicHeader` - Standard header
- `.publicContentBody` - Standard content layout
- `.publicContentSection` - Standard section

### 2. **Consolidate Legal Pages**
✅ Already done - Legal pages share `LegalPage.module.css`

### 3. **Standardize Auth Pages**
Login, Signup, ForgotPassword, ResetPassword could share more styles

### 4. **Remove Duplicate Header Styles**
Many pages have duplicate header styles that should use the `<Header />` component's module

---

## Total Style Files: 17
- **Total Lines**: ~7,040 lines of CSS
- **Shared Styles**: ~1,200 lines (could be extracted)
- **Unique Styles**: ~5,840 lines (page-specific)

