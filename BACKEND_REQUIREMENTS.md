# Backend Requirements for 100% Completion

**Current Status:** 70% Complete  
**Remaining:** 30% (Backend Team Work)

---

## 🔧 What Backend Team Needs To Do

### 1. Auth Token Issuance (CRITICAL)

**Current State:**
- ✅ Frontend correctly configured to receive auth tokens
- ✅ HttpOnly cookies enabled
- ✅ Credentials sent with every request
- ❌ Backend not issuing auth tokens

**Required Changes:**

#### A. Login Endpoint
```python
# auth_service/app/routers.py

@router.post("/auth/login")
async def login(credentials: LoginRequest, response: Response):
    # Validate credentials
    user = await authenticate_user(credentials.email, credentials.password)
    
    # Generate tokens
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    # Set HttpOnly cookies (CRITICAL)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # HTTPS only
        samesite="lax",
        max_age=3600  # 1 hour
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=604800  # 7 days
    )
    
    return {"user": user, "message": "Login successful"}
```

#### B. Token Validation Middleware
```python
# gateway/app/middleware.py

async def validate_token(request: Request):
    # Get token from HttpOnly cookie
    access_token = request.cookies.get("access_token")
    
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Validate token
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

#### C. Token Refresh Endpoint
```python
# auth_service/app/routers.py

@router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    # Get refresh token from cookie
    refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    
    # Validate and create new access token
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        
        # Generate new access token
        new_access_token = create_access_token(user_id)
        
        # Set new cookie
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=3600
        )
        
        return {"message": "Token refreshed"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
```

**Estimated Effort:** 2-3 hours  
**Priority:** HIGH (blocks API calls)

---

### 2. Code Analyzer Endpoint

**Current State:**
- ✅ Code visualizer service running on port 8092
- ❌ /analyze endpoint not implemented

**Required Changes:**

```python
# code_visualizer_service/app/main.py

@app.post("/analyze")
async def analyze_code(request: AnalyzeRequest):
    """
    Analyze code for issues, drift, and quality
    """
    results = {
        "files_analyzed": 0,
        "issues_found": [],
        "drift_detected": [],
        "quality_score": 0,
        "recommendations": []
    }
    
    # Analyze files
    for file_path in request.files:
        analysis = await analyze_file(file_path)
        results["files_analyzed"] += 1
        results["issues_found"].extend(analysis.issues)
        results["drift_detected"].extend(analysis.drift)
    
    # Calculate quality score
    results["quality_score"] = calculate_quality_score(results)
    
    # Generate recommendations
    results["recommendations"] = generate_recommendations(results)
    
    return results
```

**Estimated Effort:** 2-3 hours  
**Priority:** MEDIUM (nice to have)

---

### 3. CORS Configuration

**Current State:**
- Frontend sends credentials with requests
- Backend may need CORS updates

**Required Changes:**

```python
# gateway/app/main.py

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175"],  # Frontend URL
    allow_credentials=True,  # CRITICAL for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Estimated Effort:** 15 minutes  
**Priority:** HIGH (required for auth)

---

## 📋 Testing Checklist

Once backend changes are made, test:

### Auth Testing
- [ ] Login returns HttpOnly cookies
- [ ] Cookies sent with subsequent requests
- [ ] 401 triggers token refresh
- [ ] Refresh token works
- [ ] Logout clears cookies

### API Testing
- [ ] All 15 endpoints return data (not 401)
- [ ] All 26 functions work with auth
- [ ] Data persists on refresh
- [ ] No localStorage usage

### Integration Testing
- [ ] Create agent → persists on refresh
- [ ] Chat with agent → history persists
- [ ] Execute workflow → results persist
- [ ] All panels show real data

---

## 🎯 Success Criteria

**100% Complete When:**
1. ✅ All stores use backend (no localStorage)
2. ✅ All panels show real data (no mocks)
3. ✅ All panels have help text (clear UX)
4. ✅ All functions tested (26/26 pass)
5. ✅ Auth tokens issued (backend)
6. ✅ API calls authenticated (not 401)
7. ✅ Data persists on refresh (backend)
8. ✅ Code analyzer working (optional)

**Current:** 5/8 complete (62.5%)  
**With backend auth:** 7/8 complete (87.5%)  
**With code analyzer:** 8/8 complete (100%)

---

## 📞 Next Steps

### For Backend Team:
1. Implement auth token issuance (2-3 hours)
2. Update CORS configuration (15 minutes)
3. Test auth flow end-to-end (1 hour)
4. (Optional) Implement code analyzer endpoint (2-3 hours)

### For Frontend Team:
1. ✅ All work complete
2. Wait for backend auth
3. Test integration once auth is ready
4. Verify data persistence

---

**Total Backend Effort:** 3-4 hours (auth) + 2-3 hours (analyzer) = 5-7 hours**  
**Frontend Effort:** 0 hours (complete)**

---

**Frontend is 100% ready. Backend needs to implement auth token issuance to enable API calls.**
