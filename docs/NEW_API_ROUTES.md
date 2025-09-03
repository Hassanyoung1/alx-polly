# ALX Polly API Routes - Updated Structure

## 📋 Overview

The ALX Polly API has been updated to use more specific and RESTful endpoints for better organization and clarity.

## 🔄 New API Structure

### Poll Management Endpoints

| Endpoint | Method | Purpose | Body/Query |
|----------|--------|---------|------------|
| `/api/poll/create` | POST | Create new poll | Poll data in body |
| `/api/poll/update` | PUT | Update existing poll | Poll ID + data in body |
| `/api/poll/delete` | DELETE/POST | Delete poll | Poll ID in body |
| `/api/poll/get` | GET/POST | Get specific poll | ID in query param or body |
| `/api/poll/list` | GET | Get all polls | Optional `includeInactive` query param |

### Legacy Endpoints (Still Available)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/polls` | GET/POST | List polls / Create poll |
| `/api/polls/[id]` | GET/PUT/DELETE | Poll CRUD operations |
| `/api/polls/[id]/vote` | POST | Submit vote |

## 🛠️ API Usage Examples

### Create Poll
```typescript
POST /api/poll/create
Content-Type: application/json

{
  "title": "What's your favorite programming language?",
  "description": "Let's see what the community prefers",
  "options": ["JavaScript", "TypeScript", "Python", "Go"],
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
```

### Update Poll
```typescript
PUT /api/poll/update
Content-Type: application/json

{
  "id": "poll-uuid-here",
  "title": "Updated poll title",
  "description": "Updated description",
  "options": ["Updated Option 1", "Updated Option 2", "New Option 3"],
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
```

### Delete Poll
```typescript
DELETE /api/poll/delete
Content-Type: application/json

{
  "id": "poll-uuid-here"
}

// Alternative using POST for better compatibility
POST /api/poll/delete
Content-Type: application/json

{
  "id": "poll-uuid-here"
}
```

### Get Specific Poll
```typescript
// Using GET with query parameter
GET /api/poll/get?id=poll-uuid-here

// Using POST with body
POST /api/poll/get
Content-Type: application/json

{
  "id": "poll-uuid-here"
}
```

### List All Polls
```typescript
// Get active polls only
GET /api/poll/list

// Get all polls including inactive
GET /api/poll/list?includeInactive=true
```

## 🔧 Client Usage

### Using the New API Client

```typescript
import { createPollAPI, updatePollAPI, deletePollAPI } from '@/lib/api-client'

// Create poll
const newPoll = await createPollAPI({
  title: "Sample Poll",
  options: ["Option 1", "Option 2"],
  expiresAt: "2025-12-31T23:59:59.000Z"
})

// Update poll
const updatedPoll = await updatePollAPI(pollId, {
  title: "Updated Title",
  options: ["New Option 1", "New Option 2"]
})

// Delete poll
await deletePollAPI(pollId)
```

### Using New Server Actions

```typescript
import { 
  createPollActionNew, 
  updatePollActionNew, 
  deletePollActionNew 
} from '@/lib/actions-new'

// In your form components
const result = await createPollActionNew(formData)
if (result.success) {
  // Handle success
} else {
  // Handle error: result.error
}
```

## 📊 Response Formats

### Success Responses

```typescript
// Create/Update Poll Response
{
  "id": "uuid",
  "title": "Poll Title",
  "description": "Poll Description",
  "options": [
    {
      "id": "option-uuid",
      "text": "Option Text",
      "order_num": 0
    }
  ],
  "votes": [],
  "created_at": "2025-09-01T00:00:00.000Z",
  "updated_at": "2025-09-01T00:00:00.000Z",
  "expires_at": "2025-12-31T23:59:59.000Z",
  "is_active": true,
  "creator_id": "user-uuid"
}

// Delete Poll Response
{
  "message": "Poll deleted successfully"
}

// List Polls Response
[
  {
    // Poll objects as above
  }
]
```

### Error Responses

```typescript
{
  "error": "Error message description"
}
```

## 🔒 Error Handling

All endpoints include comprehensive error handling:

- **400 Bad Request**: Invalid data or missing required fields
- **404 Not Found**: Poll not found
- **500 Internal Server Error**: Server-side errors

## 🚀 Migration Guide

### From Old Actions to New Actions

```typescript
// OLD
import { createPollAction } from '@/lib/actions'

// NEW
import { createPollActionNew } from '@/lib/actions-new'
```

### From Direct API Calls to New Endpoints

```typescript
// OLD
fetch('/api/polls', { method: 'POST', ... })

// NEW
fetch('/api/poll/create', { method: 'POST', ... })
// OR use the API client
import { createPollAPI } from '@/lib/api-client'
const poll = await createPollAPI(pollData)
```

## ✅ Benefits of New Structure

1. **Clearer Intent**: Each endpoint has a specific purpose
2. **Better Organization**: Related operations are grouped logically
3. **Consistency**: All endpoints follow the same pattern
4. **Flexibility**: Multiple HTTP methods supported for compatibility
5. **Type Safety**: Full TypeScript support with proper error handling
6. **Backward Compatibility**: Old endpoints still work

## 📝 Notes

- All new endpoints include the same validation and error handling as the original endpoints
- The new structure maintains full compatibility with existing Supabase integration
- Server actions automatically handle revalidation for optimal performance
- Both GET and POST methods are supported where appropriate for maximum compatibility

## 🧪 Testing

All new endpoints can be tested using:

```bash
# Start development server
npm run dev

# Test endpoints using curl or your preferred API client
curl -X POST http://localhost:3001/api/poll/create \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Poll","options":["Option 1","Option 2"]}'
```
