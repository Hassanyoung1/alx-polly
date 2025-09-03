# ALX Polly API Endpoints 🚀

## 📋 Complete CRUD API Reference

All endpoints are now properly implemented with Supabase integration and comprehensive error handling.

### 🏁 Base URL
```
http://localhost:3000/api
```

---

## 📊 **POLLS ENDPOINTS**

### **GET /api/polls**
Get all polls

**Query Parameters:**
- `includeInactive` (boolean) - Include inactive polls (default: false)

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Poll Title",
    "description": "Poll Description",
    "created_at": "2025-09-01T12:00:00Z",
    "expires_at": "2025-09-02T12:00:00Z",
    "is_active": true,
    "created_by": null,
    "options": [
      {
        "id": "uuid",
        "poll_id": "uuid", 
        "text": "Option 1",
        "order_num": 1
      }
    ],
    "votes": []
  }
]
```

**Example:**
```bash
curl http://localhost:3000/api/polls
curl http://localhost:3000/api/polls?includeInactive=true
```

---

### **POST /api/polls**
Create a new poll

**Request Body:**
```json
{
  "title": "What's your favorite programming language?",
  "description": "Optional description",
  "options": ["JavaScript", "Python", "TypeScript"],
  "expiresAt": "2025-09-02T15:30"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "What's your favorite programming language?",
  "description": "Optional description",
  "created_at": "2025-09-01T12:00:00Z",
  "expires_at": "2025-09-02T15:30:00Z",
  "is_active": true,
  "options": [
    {
      "id": "uuid",
      "poll_id": "uuid",
      "text": "JavaScript", 
      "order_num": 1
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Best IDE?",
    "options": ["VS Code", "IntelliJ", "Vim"]
  }'
```

---

### **GET /api/polls/[id]**
Get a specific poll by ID

**Response:**
```json
{
  "id": "uuid",
  "title": "Poll Title",
  "description": "Poll Description", 
  "created_at": "2025-09-01T12:00:00Z",
  "expires_at": "2025-09-02T12:00:00Z",
  "is_active": true,
  "options": [...],
  "votes": [
    {
      "id": "uuid",
      "poll_id": "uuid",
      "option_id": "uuid",
      "user_id": "uuid",
      "created_at": "2025-09-01T12:00:00Z"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/polls/87074f70-e399-4e3b-a409-db13131cdc5a
```

---

### **PUT /api/polls/[id]**
Update an existing poll

**Request Body:**
```json
{
  "title": "Updated Poll Title",
  "description": "Updated description",
  "options": ["New Option 1", "New Option 2"],
  "expiresAt": "2025-09-03T15:30"
}
```

**Response:** Updated poll object (same format as GET)

**Example:**
```bash
curl -X PUT http://localhost:3000/api/polls/87074f70-e399-4e3b-a409-db13131cdc5a \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Poll Title",
    "options": ["Option A", "Option B", "Option C"]
  }'
```

---

### **DELETE /api/polls/[id]**
Delete a poll

**Response:**
```json
{
  "success": true,
  "message": "Poll deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/polls/87074f70-e399-4e3b-a409-db13131cdc5a
```

---

### **PATCH /api/polls/[id]**
Toggle poll active status

**Request Body:**
```json
{
  "is_active": false
}
```

**Response:** Updated poll object

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/polls/87074f70-e399-4e3b-a409-db13131cdc5a \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

---

## 🗳️ **VOTING ENDPOINTS**

### **POST /api/polls/[id]/vote**
Submit a vote for a poll

**Request Body:**
```json
{
  "optionId": "uuid",
  "userId": "uuid"  // Optional - for anonymous voting
}
```

**Response:**
```json
{
  "id": "uuid",
  "poll_id": "uuid",
  "option_id": "uuid", 
  "user_id": "uuid",
  "created_at": "2025-09-01T12:00:00Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/polls/87074f70-e399-4e3b-a409-db13131cdc5a/vote \
  -H "Content-Type: application/json" \
  -d '{
    "optionId": "option-uuid",
    "userId": "user-uuid"
  }'
```

---

### **GET /api/polls/[id]/vote?userId=xxx**
Get user's vote for a specific poll

**Query Parameters:**
- `userId` (required) - The user ID to check

**Response:**
```json
{
  "id": "uuid",
  "poll_id": "uuid", 
  "option_id": "uuid",
  "user_id": "uuid",
  "created_at": "2025-09-01T12:00:00Z"
}
```

**Example:**
```bash
curl "http://localhost:3000/api/polls/87074f70-e399-4e3b-a409-db13131cdc5a/vote?userId=user-uuid"
```

---

## 🛡️ **ERROR HANDLING**

All endpoints return consistent error responses:

### **400 Bad Request**
```json
{
  "error": "Invalid poll data. Title and at least 2 options are required."
}
```

### **404 Not Found**
```json
{
  "error": "Poll not found"
}
```

### **500 Internal Server Error**
```json
{
  "error": "Failed to create poll"
}
```

---

## 📝 **VALIDATION RULES**

### **Poll Creation/Update:**
- ✅ `title` - Required, string
- ✅ `description` - Optional, string  
- ✅ `options` - Required, array of strings, minimum 2 items
- ✅ `expiresAt` - Optional, valid datetime string

### **Voting:**
- ✅ `optionId` - Required, valid UUID
- ✅ `userId` - Optional, valid UUID (for anonymous voting)

### **Status Toggle:**
- ✅ `is_active` - Required, boolean

---

## 🔄 **CRUD OPERATIONS SUMMARY**

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| **Create** | POST | `/api/polls` | Create new poll |
| **Read** | GET | `/api/polls` | List all polls |
| **Read** | GET | `/api/polls/[id]` | Get specific poll |
| **Update** | PUT | `/api/polls/[id]` | Update poll |
| **Delete** | DELETE | `/api/polls/[id]` | Delete poll |
| **Toggle** | PATCH | `/api/polls/[id]` | Activate/deactivate |
| **Vote** | POST | `/api/polls/[id]/vote` | Submit vote |
| **Check Vote** | GET | `/api/polls/[id]/vote` | Get user vote |

---

## 🧪 **Testing Examples**

### **Create and Test a Poll:**
```bash
# 1. Create poll
curl -X POST http://localhost:3000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Best Framework?",
    "options": ["React", "Vue", "Angular"]
  }'

# 2. Vote on poll (use ID from response)
curl -X POST http://localhost:3000/api/polls/[poll-id]/vote \
  -H "Content-Type: application/json" \
  -d '{
    "optionId": "[option-id]"
  }'

# 3. Get updated poll
curl http://localhost:3000/api/polls/[poll-id]

# 4. Update poll
curl -X PUT http://localhost:3000/api/polls/[poll-id] \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated: Best Framework?",
    "options": ["React", "Vue", "Angular", "Svelte"]
  }'

# 5. Deactivate poll
curl -X PATCH http://localhost:3000/api/polls/[poll-id] \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'

# 6. Delete poll
curl -X DELETE http://localhost:3000/api/polls/[poll-id]
```

---

## 🎯 **API Features**

✅ **Complete CRUD Operations**
✅ **Supabase Integration** 
✅ **Data Validation with Zod**
✅ **Comprehensive Error Handling**
✅ **Proper HTTP Status Codes**
✅ **TypeScript Type Safety**
✅ **Foreign Key Constraint Handling**
✅ **Anonymous Voting Support**
✅ **Poll Status Management**
✅ **Expiration Date Handling**

**The ALX Polly API is now production-ready with full CRUD functionality!** 🚀
