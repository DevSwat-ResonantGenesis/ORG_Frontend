# Header Menu & Mobile Sidebar Reorganization Plan

**Date:** February 21, 2026  
**Objective:** Improve navigation structure, clarity, and user experience across desktop header menu and mobile sidebar

---

## Current Menu Structure Analysis

### Desktop Header Menu (4 Dropdowns)

#### 1. **Solutions** (6 items)
- ✅ Resonant Chat - AI-powered conversations
- ✅ Project Builder - AI project generation
- ✅ Agents - Agent Console
- ✅ Agent Teams - Collaborative AI workflows
- ✅ Workflow Designer - Visual workflow builder
- ⚠️ General Store - Templates & UI Skins (confusing name)

#### 2. **Control Plane** (10 items - TOO MANY)
- Overview - System dashboard
- Live Monitor - Real-time execution
- Performance - Metrics & analytics
- Semantics - Semantic analysis
- Trust - Trust verification
- Governance - Policy management
- Security - Access & protection
- Compliance - Regulatory reports
- Business - Business metrics
- Guided Scenarios - Interactive guides

#### 3. **Developer** (4 items)
- State Physics - Invariant enforcement API
- Hash Sphere Memory - AI memory infrastructure
- Code Visualizer - Codebase analysis
- Resonant IDE - In-browser IDE

#### 4. **Decentralized** (5 items)
- DSID Marketplace - T3 verified agents only
- Agent Browser - Discover agents
- Publish Agent - Share your agents
- Execution History - View past runs
- Node Status - Network node info

#### 5. **Pricing** (standalone link)

### Mobile Sidebar Menu
- Currently uses `UnifiedSidebarMenu.tsx`
- Duplicates desktop navigation structure
- Missing Help Center link
- No clear organization hierarchy

---

## Issues Identified

### 🔴 Critical Issues
1. **"General Store"** - Confusing name, should be "Marketplace" or "Templates"
2. **Control Plane has 10 items** - Too many, needs categorization
3. **No Help Center link** - Missing from both desktop and mobile
4. **Inconsistent naming** - "Decentralized" vs "Network" vs "DSID Marketplace"
5. **Mobile menu disabled** - Line 638: `{false && isMobileMenuOpen &&` - menu is hidden!

### ⚠️ Medium Issues
1. **Developer tools unclear** - "State Physics" and "Hash Sphere Memory" need better descriptions
2. **Duplicate functionality** - "Agent Browser" in Decentralized vs "Agents" in Solutions
3. **No clear user journey** - New users don't know where to start
4. **Missing categories** - No "Resources", "Community", or "Support" sections

### 💡 Opportunities
1. Add Help Center to main navigation
2. Split Control Plane into logical sub-categories
3. Rename confusing items for clarity
4. Add "Getting Started" or "Quick Start" section
5. Better mobile menu organization

---

## Proposed Reorganization

### Desktop Header Menu (Recommended Structure)

#### 1. **Platform** (Core product features)
- 🆕 Resonant Chat - AI conversations
- 🆕 Agent Studio - Create & manage agents (rename from "Agents")
- 🆕 Agent Teams - Multi-agent workflows
- 🆕 Workflow Designer - Visual automation
- 🆕 Project Builder - AI code generation

#### 2. **Marketplace** (Rename from "General Store")
- 🆕 Templates - Pre-built agents & workflows
- 🆕 UI Themes - Interface customization
- 🆕 Extensions - Add-ons & integrations
- 🆕 Community Agents - Browse shared agents

#### 3. **Network** (Blockchain & Decentralized - merge with "Decentralized")
- 🆕 Agent Marketplace - Buy/sell verified agents (DSID)
- 🆕 Publish to Network - Share your agents
- 🆕 Execution History - View blockchain logs
- 🆕 Node Dashboard - Network status & metrics

#### 4. **Control Center** (Rename from "Control Plane", split into 2 sub-menus)
**Monitoring & Analytics:**
- Overview Dashboard
- Live Monitor
- Performance Metrics
- Business Intelligence

**Governance & Security:**
- Trust & Compliance
- Security Center
- Policy Management
- Audit Logs

#### 5. **Developer** (Keep, but improve descriptions)
- 🆕 Resonant IDE - Browser-based development
- 🆕 API Documentation - Integration guides
- 🆕 State Physics - Invariant enforcement
- 🆕 Memory Infrastructure - Hash Sphere system
- 🆕 Code Visualizer - Codebase analysis

#### 6. **Resources** (NEW - consolidate help & learning)
- 🆕 Help Center - Documentation & guides
- 🆕 API Reference - Technical docs
- 🆕 Tutorials - Step-by-step guides
- 🆕 Community - Discord, GitHub, Forum
- 🆕 Blog - Updates & announcements

#### 7. **Pricing** (Keep standalone)

---

## Mobile Sidebar Reorganization

### Proposed Mobile Menu Structure

**Top Section (Quick Access)**
- 🏠 Home
- 💬 Resonant Chat
- 🤖 My Agents
- 📊 Dashboard

**Platform Section**
- Agent Studio
- Agent Teams
- Workflow Designer
- Project Builder

**Marketplace Section**
- Templates
- Community Agents
- UI Themes

**Network Section**
- Agent Marketplace (DSID)
- Publish Agent
- Execution History
- Node Status

**Control Center Section**
- Overview
- Live Monitor
- Performance
- Compliance & Security

**Developer Section**
- Resonant IDE
- API Docs
- State Physics
- Code Visualizer

**Resources Section**
- 🆕 Help Center
- Tutorials
- Community
- Blog

**Account Section** (Bottom)
- Profile
- Settings
- Billing
- Log Out

---

## Implementation Action Plan

### Phase 1: Critical Fixes (Immediate)
**Agent 1:**
- [ ] Fix mobile menu (remove `false &&` on line 638)
- [ ] Add Help Center link to desktop header
- [ ] Rename "General Store" to "Marketplace"
- [ ] Add Help Center to mobile sidebar

**Agent 2:**
- [ ] Update Help Center page content
- [ ] Create Help Center route in router
- [ ] Add Help Center icon component

### Phase 2: Menu Restructuring (Week 1)
**Agent 1:**
- [ ] Split Control Plane into "Monitoring" and "Governance" sub-dropdowns
- [ ] Rename "Decentralized" to "Network"
- [ ] Merge DSID Marketplace into Network section
- [ ] Update all navigation labels for clarity

**Agent 3:**
- [ ] Create new "Resources" dropdown
- [ ] Add API Documentation link
- [ ] Add Tutorials section
- [ ] Add Community links

### Phase 3: Mobile Menu Enhancement (Week 1)
**Agent 2:**
- [ ] Reorganize mobile sidebar with new structure
- [ ] Add collapsible sections for better organization
- [ ] Add icons to all menu items
- [ ] Implement search functionality in mobile menu

### Phase 4: User Experience (Week 2)
**All Agents:**
- [ ] Add "Getting Started" quick links for new users
- [ ] Create onboarding tooltips for menu items
- [ ] Add keyboard shortcuts for power users
- [ ] Implement menu analytics to track usage

---

## Naming Conventions

### Before → After
- ❌ General Store → ✅ Marketplace
- ❌ Agents → ✅ Agent Studio
- ❌ Decentralized → ✅ Network
- ❌ DSID Marketplace → ✅ Agent Marketplace (DSID)
- ❌ Control Plane → ✅ Control Center
- ❌ State Physics → ✅ State Physics API
- ❌ Hash Sphere Memory → ✅ Memory Infrastructure

---

## Success Metrics

### User Experience
- ✅ Reduce clicks to reach any page (target: max 2 clicks)
- ✅ Improve menu clarity (user testing feedback)
- ✅ Increase Help Center usage by 50%
- ✅ Reduce support tickets about navigation

### Technical
- ✅ Mobile menu fully functional
- ✅ All links working and tested
- ✅ Consistent naming across platform
- ✅ Accessibility compliance (WCAG 2.1 AA)

---

## Files to Modify

### Frontend Files
1. `/src/components/layout/Header/Header.tsx` - Desktop header menu
2. `/src/components/layout/UnifiedSidebarMenu.tsx` - Mobile sidebar
3. `/src/router/index.tsx` - Add Help Center route
4. `/src/pages/Help/HelpCenterPage.tsx` - Update content
5. `/src/components/Icons/` - Add new icons as needed

### CSS Files
1. `/src/components/layout/Header/Header.module.css`
2. `/src/components/layout/UnifiedSidebarMenu.module.css`
3. `/src/pages/Help/HelpCenterPage.module.css`

---

## Next Steps

1. **User Review** - Get user approval on proposed structure
2. **Agent Assignment** - Assign specific tasks to each agent
3. **Implementation** - Execute Phase 1 (critical fixes) immediately
4. **Testing** - Test all navigation changes on desktop and mobile
5. **Deployment** - Deploy via Git CI and rebuild frontend
6. **Monitoring** - Track user engagement with new menu structure

---

**Created by:** Agent 1  
**Status:** Awaiting user approval and agent task assignment
