# ⭐ MODULE E: HUMAN-IN-THE-LOOP REVIEW PIPELINE

## Implementation Plan

### Overview
Enterprise-grade approval workflow for AI-generated code changes. Required for government & enterprise clients for security compliance.

---

## Architecture

### Database Schema

**Table: `ai_review_tasks`**
```sql
CREATE TABLE ai_review_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),  -- AI requester
    file_path TEXT NOT NULL,
    old_code TEXT NOT NULL,
    new_code TEXT NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending/approved/rejected/modifications_requested
    reviewer_user_id UUID REFERENCES users(id),
    review_comment TEXT,
    approval_chain JSONB,  -- Multi-step approval: [{"role": "tech_lead", "user_id": "...", "status": "pending"}]
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    applied_at TIMESTAMP,
    metadata JSONB  -- Additional context
);
```

### API Endpoints

1. **POST `/api/ai/submit_patch`**
   - Submit AI-generated code change for review
   - Returns: `{ task_id, status }`

2. **GET `/api/ai/review_tasks`**
   - List all review tasks (filtered by user/org)
   - Query params: `status`, `user_id`, `organization_id`

3. **GET `/api/ai/review_tasks/{task_id}`**
   - Get single review task with full details

4. **POST `/api/ai/review_tasks/{task_id}/approve`**
   - Approve a review task
   - Applies patch to codebase if approval chain complete

5. **POST `/api/ai/review_tasks/{task_id}/reject`**
   - Reject a review task

6. **POST `/api/ai/review_tasks/{task_id}/request_modifications`**
   - Request modifications with comment

---

## Implementation Steps

### Phase 1: Backend Database Model ✅
- [x] Create `AIReviewTask` SQLAlchemy model
- [ ] Create database migration
- [ ] Add model to `__init__.py`

### Phase 2: Backend API Routes ✅
- [ ] Create `/backend/fastapi_app/routers/ai_review.py`
- [ ] Implement all 6 endpoints
- [ ] Add authentication/authorization
- [ ] Register router in `main.py`

### Phase 3: Frontend API Client ✅
- [ ] Create `/src/api/aiReview.ts`
- [ ] Define TypeScript interfaces
- [ ] Implement API client functions

### Phase 4: Review Queue UI ✅
- [ ] Create `/src/pages/AIReview/ReviewQueuePage.tsx`
- [ ] Create diff viewer component
- [ ] Create approval/reject UI
- [ ] Add to router

### Phase 5: Integration ✅
- [ ] Integrate with code generation endpoints
- [ ] Add "Submit for Review" button in IDE
- [ ] Show pending reviews indicator

---

## File Structure

```
Backend:
/Applications/ResonantGraphAIV0.1/
├── backend/fastapi_app/
│   ├── models/
│   │   └── ai_review.py          # Database model
│   ├── routers/
│   │   └── ai_review.py          # API endpoints
│   └── services/
│       └── ai_review_service.py  # Business logic

Frontend:
/Applications/ResonantGraphAI_FrontendV0.1/
├── src/
│   ├── api/
│   │   └── aiReview.ts           # API client
│   ├── pages/
│   │   └── AIReview/
│   │       ├── ReviewQueuePage.tsx
│   │       ├── ReviewQueuePage.module.css
│   │       ├── ReviewDetailModal.tsx
│   │       └── DiffViewer.tsx
│   └── components/
│       └── CodeDiff/
│           └── DiffViewer.tsx    # Reusable diff component
```

---

## Features

### 1. Diff Viewer
- Side-by-side comparison
- Syntax highlighting
- Line-by-line highlighting
- Inline comments

### 2. Approval Workflow
- Single-step (default)
- Multi-step (up to 3 roles)
- Role-based routing
- Email notifications (future)

### 3. Audit Log
- All actions logged
- Reviewer identity tracked
- Timestamps for all events
- Full audit trail

---

## Next Steps

1. **Start with backend model** - Create database schema
2. **Implement API endpoints** - RESTful CRUD operations
3. **Build frontend UI** - Review queue with diff viewer
4. **Integrate with code generation** - Hook into existing `/code/generate`

---

**Status:** 🚀 Ready to implement!

