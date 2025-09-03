# ALX Polly Route Standards & Integration Guide

## 🎯 **Route Standardization Complete**

All backend routes in ALX Polly now follow the `/api/v1/` prefix convention with RESTful design principles.

## 📊 **API Route Structure**

### **Authentication Routes (RESTful)**
```
POST   /api/v1/auth/login      - User authentication
POST   /api/v1/auth/register   - User registration  
POST   /api/v1/auth/logout     - User logout
GET    /api/v1/auth/profile    - Get user profile
PUT    /api/v1/auth/profile    - Update user profile
```

### **Legacy Authentication Routes (Backward Compatible)**
```
POST   /api/v1/auth/signin     - Legacy login
POST   /api/v1/auth/signup     - Legacy registration
POST   /api/v1/auth/signout    - Legacy logout
```

### **Poll Routes (RESTful)**
```
GET    /api/v1/polls           - List all polls
POST   /api/v1/polls           - Create new poll
GET    /api/v1/polls/[id]      - Get specific poll
PUT    /api/v1/polls/[id]      - Update poll
DELETE /api/v1/polls/[id]      - Delete poll
PATCH  /api/v1/polls/[id]      - Toggle poll status
```

### **Voting Routes (RESTful)**
```
POST   /api/v1/polls/[id]/vote - Submit vote
GET    /api/v1/polls/[id]/vote - Get user vote (with ?userId=xxx)
```

### **Profile Routes**
```
GET    /api/v1/profile/get     - Get detailed profile
PUT    /api/v1/profile/update  - Update detailed profile
```

### **Legacy Poll Routes (Backward Compatible)**
```
POST   /api/v1/poll/create     - Legacy create poll
PUT    /api/v1/poll/update     - Legacy update poll
DELETE /api/v1/poll/delete     - Legacy delete poll
GET    /api/v1/poll/get        - Legacy get poll
GET    /api/v1/poll/list       - Legacy list polls
POST   /api/v1/poll/[id]/vote  - Legacy voting
```

## 🔧 **Frontend Integration**

### **Centralized API Configuration**
- **Location**: `/lib/api-config.ts`
- **Base URL**: Environment-driven (`NEXT_PUBLIC_API_BASE_URL`)
- **Endpoints**: Centralized constants for all routes

### **API Client Usage**
```typescript
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api-config'

// RESTful endpoints
const loginUrl = buildApiUrl(API_ENDPOINTS.AUTH.LOGIN)        // /api/v1/auth/login
const pollsUrl = buildApiUrl(API_ENDPOINTS.POLLS.BASE)        // /api/v1/polls
const voteUrl = buildApiUrl(API_ENDPOINTS.POLLS.VOTE('123'))  // /api/v1/polls/123/vote
```

### **Environment Configuration**
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🚀 **Application Architecture**

### **Frontend-Backend Communication Patterns**

#### **1. Server Components (Data Fetching)**
```typescript
// app/polls/page.tsx
export default async function PollsPage() {
  const polls = await getPolls() // Direct database function
  return <PollList polls={polls} />
}
```

#### **2. Client Components (API Calls)**
```typescript
// components/auth/auth-form.tsx
import { signInAPI } from '@/lib/api-client'

const handleLogin = async () => {
  const result = await signInAPI(email, password) // Uses /api/v1/auth/login
}
```

#### **3. Server Actions (Mutations)**
```typescript
// lib/actions.ts
'use server'
export async function createPollAction(formData: FormData) {
  const poll = await createPoll(validatedData) // Direct database function
  revalidatePath('/polls')
}
```

## 🧪 **Testing & Verification**

### **Endpoint Status Testing**
```bash
# Test authentication
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Test polls
curl http://localhost:3000/api/v1/polls

# Test voting
curl -X POST http://localhost:3000/api/v1/polls/123/vote \
  -H "Content-Type: application/json" \
  -d '{"optionId":"option-1"}'
```

### **Frontend Integration Test**
1. **Authentication**: Login/Register forms work
2. **Polls**: Create, read, update, delete operations
3. **Voting**: Submit and retrieve votes
4. **Profile**: User profile management

## 🔒 **CORS & Security**

### **CORS Configuration**
- **Development**: `localhost:3000`, `localhost:3001`, `localhost:5000`
- **Production**: Environment-based frontend URL
- **Credentials**: Enabled for authentication

### **Error Handling**
- **Consistent response format** across all endpoints
- **Proper HTTP status codes** (200, 201, 400, 401, 404, 500)
- **Error messages** in standard format

## 📈 **Response Format Standards**

### **Success Response**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### **Error Response**
```json
{
  "error": "Error message description"
}
```

### **List Response**
```json
{
  "success": true,
  "data": [/* array of items */]
}
```

## 🌐 **Deployment Readiness**

### **Environment Support**
- ✅ **Development**: `http://localhost:3000`
- ✅ **Staging**: Environment variable driven
- ✅ **Production**: Environment variable driven

### **Environment Variables Required**
```bash
NEXT_PUBLIC_API_BASE_URL=<your-api-base-url>
NEXT_PUBLIC_APP_URL=<your-app-url>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>
```

## ✅ **Implementation Status**

### **Backend Standardization** ✅
- [x] All routes use `/api/v1/` prefix
- [x] RESTful route conventions implemented
- [x] Legacy routes preserved for compatibility
- [x] Consistent response formats
- [x] Proper error handling

### **Frontend Integration** ✅  
- [x] Centralized API configuration
- [x] Environment-based URLs
- [x] Updated API client
- [x] No hardcoded URLs
- [x] Proper error handling

### **Testing & Verification** ✅
- [x] Route accessibility confirmed
- [x] Frontend-backend connection working
- [x] Authentication flow functional
- [x] CRUD operations working
- [x] Error responses appropriate

## 🎉 **Result**

**ALX Polly now has a fully standardized, production-ready API structure:**

- **Consistent `/api/v1/` routing** across all endpoints
- **RESTful design principles** followed
- **Environment-driven configuration** for all deployments
- **Full frontend-backend integration** with optimized patterns
- **Comprehensive error handling** and response formatting
- **Legacy compatibility** maintained during transition

**The application is ready for development, staging, and production deployment!** 🚀

---

## 📝 **Developer Guidelines**

**When adding new endpoints:**
1. Use `/api/v1/` prefix
2. Follow RESTful conventions (`GET /resource`, `POST /resource`, etc.)
3. Add endpoint to `API_ENDPOINTS` in `/lib/api-config.ts`
4. Use consistent response format
5. Add proper error handling
6. Test with multiple environments

**This document ensures any developer or AI assistant working on ALX Polly follows the established route conventions.**
