# 🎨 Resonant Chat Frontend - Complete Style Architecture Guide

**Date:** 2025-12-01  
**Purpose:** Complete guide to understanding and modifying Resonant Chat UI elements

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design System Structure](#design-system-structure)
3. [Component Hierarchy](#component-hierarchy)
4. [CSS Module System](#css-module-system)
5. [How to Change Each Element](#how-to-change-each-element)
6. [Design Tokens Reference](#design-tokens-reference)
7. [Common Modifications](#common-modifications)

---

## 🏗️ Architecture Overview

### **Three-Layer Architecture**

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: Design Tokens (CSS Variables)                  │
│  Location: src/theme/modules/tokens-2025.css             │
│  Purpose: Global design system variables                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 2: CSS Modules (Component Styles)                 │
│  Location: *.module.css files                            │
│  Purpose: Scoped component styles using tokens           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 3: React Components                               │
│  Location: *.tsx files                                   │
│  Purpose: UI components using CSS module classes         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Design System Structure

### **1. Design Tokens (Foundation)**

**File:** `src/theme/modules/tokens-2025.css`

**What it contains:**
- Color palette (primary, gray, semantic colors)
- Typography scale (font sizes, weights, line heights)
- Spacing system (4px base unit)
- Border radius values
- Shadows
- Transitions
- Z-index scale
- Breakpoints

**How to change:**
```css
/* Example: Change primary brand color */
--color-primary-500: #0ea5e9; /* Change this value */
```

**Key Variables:**
```css
/* Colors */
--color-primary-500: #0ea5e9;        /* Main brand color */
--bg-primary: #ffffff;                 /* Light mode background */
--text-primary: #171717;              /* Primary text color */
--border: #e5e5e5;                    /* Border color */

/* Spacing */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-4: 1rem;     /* 16px */

/* Typography */
--font-14: 0.875rem;  /* 14px */
--font-16: 1rem;      /* 16px */
--font-weight-semibold: 600;
```

---

### **2. CSS Modules (Component Styles)**

**Main Files:**
- `src/pages/ResonantChat/ResonantChatPage-2025.module.css` (3,191 lines)
- `src/components/ResonantChat/EnhancedSidebar-2025.module.css` (1,824 lines)
- `src/components/ResonantChat/ProjectBuilder.module.css` (463 lines)

**How CSS Modules Work:**
1. Each `.module.css` file is scoped to its component
2. Classes are imported as objects: `import styles from './Component.module.css'`
3. Used in JSX: `<div className={styles.className}>`
4. CSS variables from tokens are used: `color: var(--text-primary)`

---

## 🧩 Component Hierarchy

### **Main Page Structure**

```
ResonantChatPage.tsx
├── chatPage (main container)
│   ├── sidebarWrapper
│   │   └── EnhancedSidebar.tsx
│   │       ├── userSection
│   │       ├── tabs
│   │       ├── conversations section
│   │       ├── memory section
│   │       ├── files section
│   │       └── settings section
│   │
│   └── chatContainer
│       ├── mainChatArea
│       │   ├── splitViewContainer (optional)
│       │   │   ├── splitViewPanel (chat messages)
│       │   │   │   ├── messagesContainer
│       │   │   │   │   └── message (user/assistant)
│       │   │   │   └── welcomePanel (when empty)
│       │   │   │
│       │   │   └── splitViewCodePanel (code preview)
│       │   │       └── splitViewCodeContent
│       │   │
│       │   └── inputContainer
│       │       └── inputBar
│       │           ├── inputTopRow (action buttons)
│       │           ├── inputBarMainRow
│       │           │   ├── textInput
│       │           │   └── sendButton
│       │           └── inputBottom (left tools)
│       │
│       └── projectBuilderWrapper (when building)
│           └── ProjectBuilder.tsx
```

---

## 📝 CSS Module System

### **ResonantChatPage-2025.module.css**

**Key Sections:**

#### **1. Page Layout**
```css
.chatPage {
  /* Main page container */
  display: flex;
  height: 100vh;
  background-color: transparent;
  padding-top: var(--header-height, 60px);
}
```

**To change:** Page background, padding, layout direction

#### **2. Sidebar Wrapper**
```css
.sidebarWrapper {
  position: fixed;
  left: 0;
  top: var(--header-height, 60px);
  width: 280px;
  height: calc(100vh - var(--header-height, 60px));
}
```

**To change:** Sidebar width, position, background

#### **3. Chat Container**
```css
.chatContainer {
  width: 100%;
  height: calc(100vh - var(--header-height, 60px));
  margin-left: 0; /* Adjusts when sidebar opens */
}
```

**To change:** Chat area width, margins, background

#### **4. Messages Container**
```css
.messagesContainer {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-3);
  overflow-y: auto;
  max-width: 700px;
  margin: 0 auto;
}
```

**To change:** Message spacing, padding, max-width, alignment

#### **5. Message Bubbles**
```css
.message {
  display: flex;
  flex-direction: column;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  max-width: 85%;
}

.message.user {
  align-self: flex-end;
  background-color: var(--color-primary-500);
  color: #ffffff;
}

.message.assistant {
  align-self: flex-start;
  background-color: transparent;
  border: 1px solid var(--border);
}
```

**To change:** Message colors, padding, border-radius, max-width

#### **6. Input Container**
```css
.inputContainer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-3);
  z-index: 50;
}

.inputBar {
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  max-width: 700px;
  margin: 0 auto;
}
```

**To change:** Input position, padding, background, border, max-width

#### **7. Text Input**
```css
.textInput {
  flex: 1;
  min-height: 20px;
  max-height: 120px;
  padding: 2px 4px;
  border: none;
  background: transparent;
  font-size: var(--font-14);
}
```

**To change:** Input height, padding, font-size, background

#### **8. Send Button**
```css
.sendButton {
  width: 28px;
  height: 28px;
  background-color: var(--color-primary-500);
  border: none;
  border-radius: var(--radius-sm);
  color: #ffffff;
}
```

**To change:** Button size, color, border-radius

---

### **EnhancedSidebar-2025.module.css**

**Key Sections:**

#### **1. Sidebar Container**
```css
.sidebar {
  position: fixed;
  left: 0;
  top: var(--header-height, 60px);
  width: 280px;
  height: calc(100vh - var(--header-height, 60px));
  background-color: transparent;
}
```

**To change:** Sidebar width, background, position

#### **2. Tabs**
```css
.tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
}

.tab {
  flex: 1;
  padding: var(--space-2);
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: var(--color-primary-600);
  border-bottom-color: var(--color-primary-500);
}
```

**To change:** Tab padding, active state color, border

#### **3. Conversation Items**
```css
.conversationItem {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.conversationItem.active {
  background-color: rgba(14, 165, 233, 0.1);
  color: var(--color-primary-600);
}
```

**To change:** Item padding, active state background, hover effects

---

## 🔧 How to Change Each Element

### **Method 1: Modify CSS Module Directly**

**Location:** `src/pages/ResonantChat/ResonantChatPage-2025.module.css`

**Example: Change message bubble padding**
```css
/* Find this in the file: */
.message {
  padding: var(--space-3) var(--space-4); /* Current: 12px 16px */
}

/* Change to: */
.message {
  padding: var(--space-4) var(--space-5); /* New: 16px 20px */
}
```

### **Method 2: Modify Design Tokens**

**Location:** `src/theme/modules/tokens-2025.css`

**Example: Change primary brand color**
```css
/* Find this: */
--color-primary-500: #0ea5e9; /* Sky blue */

/* Change to: */
--color-primary-500: #8b5cf6; /* Purple */
```

**This will automatically update:**
- User message bubbles
- Active tab indicators
- Send button
- All primary-colored elements

### **Method 3: Override with Inline Styles (Not Recommended)**

**Location:** Component TSX file

```tsx
<div className={styles.message} style={{ padding: '20px' }}>
  {/* content */}
</div>
```

---

## 📚 Design Tokens Reference

### **Colors**

```css
/* Primary Brand */
--color-primary-500: #0ea5e9;  /* Main brand - use for buttons, active states */
--color-primary-600: #0284c7;  /* Hover states */
--color-primary-400: #38bdf8;  /* Lighter variant */

/* Backgrounds */
--bg-primary: #ffffff;          /* Main background (light mode) */
--bg-secondary: #fafafa;        /* Sidebar/secondary backgrounds */
--surface: #ffffff;              /* Card/surface backgrounds */
--surface-hover: #fafafa;       /* Hover state backgrounds */

/* Text */
--text-primary: #171717;         /* Main text color */
--text-secondary: #525252;       /* Secondary text */
--text-tertiary: #737373;        /* Tertiary text */

/* Borders */
--border: #e5e5e5;               /* Standard border */
```

### **Spacing**

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

### **Typography**

```css
--font-12: 0.75rem;   /* 12px - Small labels */
--font-14: 0.875rem;  /* 14px - Body small */
--font-16: 1rem;      /* 16px - Body base */
--font-18: 1.125rem;  /* 18px - Body large */
--font-20: 1.25rem;   /* 20px - Subheading */

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
```

### **Border Radius**

```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
```

### **Shadows**

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

---

## 🎨 Common Modifications

### **1. Change Message Bubble Colors**

**File:** `ResonantChatPage-2025.module.css`

**User Messages:**
```css
.message.user {
  background-color: var(--color-primary-500); /* Change this */
  color: #ffffff;
}
```

**Assistant Messages:**
```css
.message.assistant {
  background-color: transparent;
  border: 1px solid var(--border); /* Change border color */
}
```

### **2. Change Input Box Styling**

**File:** `ResonantChatPage-2025.module.css`

```css
.inputBar {
  background-color: var(--surface); /* Change background */
  border: 1px solid var(--border);   /* Change border */
  border-radius: var(--radius-md);   /* Change roundness */
  max-width: 700px;                  /* Change width */
}
```

### **3. Change Sidebar Width**

**File:** `ResonantChatPage-2025.module.css`

```css
.sidebarWrapper {
  width: 280px; /* Change this value */
}
```

**Also update in:**
```css
.chatContainer.sidebarOpen {
  margin-left: 280px; /* Match sidebar width */
  width: calc(100% - 280px);
}
```

### **4. Change Font Sizes**

**Option A: Change globally via tokens**
```css
/* tokens-2025.css */
--font-14: 0.875rem; /* Change to 1rem for larger text */
```

**Option B: Change specific element**
```css
/* ResonantChatPage-2025.module.css */
.message {
  font-size: var(--font-16); /* Override default */
}
```

### **5. Change Spacing Between Messages**

**File:** `ResonantChatPage-2025.module.css`

```css
.messagesContainer {
  gap: var(--space-3); /* Change to var(--space-4) for more space */
}
```

### **6. Change Send Button Style**

**File:** `ResonantChatPage-2025.module.css`

```css
.sendButton {
  width: 28px;  /* Change size */
  height: 28px;
  background-color: var(--color-primary-500); /* Change color */
  border-radius: var(--radius-sm); /* Change roundness */
}
```

### **7. Change Active Tab Indicator**

**File:** `EnhancedSidebar-2025.module.css`

```css
.tab.active {
  color: var(--color-primary-600);      /* Change text color */
  border-bottom-color: var(--color-primary-500); /* Change underline */
}
```

---

## 📁 File Locations Summary

### **Main Components**
- `src/pages/ResonantChat/ResonantChatPage.tsx` - Main page component
- `src/pages/ResonantChat/ResonantChatPage-2025.module.css` - Main page styles (3,191 lines)

### **Sub-Components**
- `src/components/ResonantChat/EnhancedSidebar.tsx` - Sidebar component
- `src/components/ResonantChat/EnhancedSidebar-2025.module.css` - Sidebar styles (1,824 lines)
- `src/components/ResonantChat/ProjectBuilder.tsx` - Project builder component
- `src/components/ResonantChat/ProjectBuilder.module.css` - Project builder styles (463 lines)

### **Design System**
- `src/theme/modules/tokens-2025.css` - Design tokens (CSS variables)
- `src/theme/modules/index.css` - Main CSS import file
- `src/theme/modules/typography-2025.css` - Typography system

---

## 🔍 Finding Elements Quickly

### **Search Strategy**

1. **Find CSS class in component:**
   ```tsx
   // In ResonantChatPage.tsx, search for:
   className={styles.message}
   ```

2. **Find CSS definition:**
   ```css
   // In ResonantChatPage-2025.module.css, search for:
   .message {
   ```

3. **Find design token:**
   ```css
   // In tokens-2025.css, search for:
   --color-primary-500
   ```

---

## ⚠️ Important Notes

1. **CSS Modules are Scoped:** Classes in `.module.css` files are automatically scoped to prevent conflicts
2. **Use Design Tokens:** Always use CSS variables from `tokens-2025.css` instead of hardcoded values
3. **Mobile Responsive:** Check `@media (max-width: 768px)` sections for mobile-specific styles
4. **Dark Mode:** Use `[data-theme='dark']` selectors for dark mode overrides
5. **Transparent Backgrounds:** Many elements use `background-color: transparent !important` to show parent backgrounds

---

## 🚀 Quick Reference: Element → File → Class

| Element | File | CSS Class |
|---------|------|-----------|
| Page container | ResonantChatPage-2025.module.css | `.chatPage` |
| Sidebar | EnhancedSidebar-2025.module.css | `.sidebar` |
| Chat area | ResonantChatPage-2025.module.css | `.chatContainer` |
| Messages list | ResonantChatPage-2025.module.css | `.messagesContainer` |
| User message | ResonantChatPage-2025.module.css | `.message.user` |
| Assistant message | ResonantChatPage-2025.module.css | `.message.assistant` |
| Input box | ResonantChatPage-2025.module.css | `.inputBar` |
| Text input | ResonantChatPage-2025.module.css | `.textInput` |
| Send button | ResonantChatPage-2025.module.css | `.sendButton` |
| Sidebar tabs | EnhancedSidebar-2025.module.css | `.tab` |
| Conversation item | EnhancedSidebar-2025.module.css | `.conversationItem` |

---

## 📖 Next Steps

1. **Make a change** - Start with a simple modification (e.g., change message padding)
2. **Test in browser** - Use Vite dev server to see changes instantly
3. **Check mobile** - Test responsive behavior at different screen sizes
4. **Check dark mode** - Verify changes work in both light and dark themes

---

**End of Guide** 🎉

