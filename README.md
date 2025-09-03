# ALX Polly - Polling Application

## Overview
ALX Polly is a modern Next.js polling application that allows users to create, share, and participate in polls. The application is built with TypeScript, Tailwind CSS, and Shadcn UI components with a complete API v1 backend.

## 🚀 API v1 Structure (COMPLETE)

ALX Polly features a fully standardized API structure with consistent `/api/v1/` endpoints following RESTful conventions:

### Authentication API v1 (RESTful)
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/register` - User registration  
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Polls API v1 (RESTful)
- `GET /api/v1/polls` - List all polls
- `POST /api/v1/polls` - Create new poll
- `GET /api/v1/polls/[id]` - Get specific poll
- `PUT /api/v1/polls/[id]` - Update poll
- `DELETE /api/v1/polls/[id]` - Delete poll
- `PATCH /api/v1/polls/[id]` - Toggle poll status

### Voting API v1 (RESTful)
- `POST /api/v1/polls/[id]/vote` - Submit vote
- `GET /api/v1/polls/[id]/vote` - Get user vote

### Profile API v1
- `GET /api/v1/profile/get` - Get detailed profile
- `PUT /api/v1/profile/update` - Update detailed profile

### Legacy Authentication (Backward Compatible)
- `POST /api/v1/auth/signin` - User authentication (legacy)
- `POST /api/v1/auth/signup` - User registration (legacy)
- `POST /api/v1/auth/signout` - User logout (legacy)

### Polls API v1
- `POST /api/v1/poll/create` - Create new poll
- `PUT /api/v1/poll/update` - Update existing poll  
- `DELETE /api/v1/poll/delete` - Delete poll
- `GET /api/v1/poll/get` - Get specific poll
- `GET /api/v1/poll/list` - List all polls

### Voting API v1
- `POST /api/v1/poll/[id]/vote` - Submit vote
- `GET /api/v1/poll/[id]/vote` - Get user vote

### Profile API v1
- `GET /api/v1/profile/get` - Get detailed profile
- `PUT /api/v1/profile/update` - Update detailed profile

### Legacy Endpoints (Backward Compatible)
- `GET /api/polls` - List polls
- `POST /api/polls` - Create poll
- `GET /api/polls/[id]` - Get specific poll
- `PUT /api/polls/[id]` - Update poll
- `DELETE /api/polls/[id]` - Delete poll

## Quick Start

### 1. Environment Setup
```bash
# Copy environment variables
cp .env.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Environment Variables
The application uses environment variables for configuration. See `.env.example` for all available options.

**Required for development:**
- `APP_URL` - Application URL (default: http://localhost:3001)
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `JWT_SECRET` - JWT signing secret

**Optional features:**
- Email configuration (SMTP, SendGrid, Resend)
- OAuth providers (Google, GitHub)
- File upload settings
- Feature flags

### 3. Database Setup
Currently configured for SQLite in development:
```bash
# Database will be created automatically at ./dev.db
# No additional setup required for development
```

## Project Structure

```
alx-polly/
├── app/                      # Next.js app directory
│   ├── auth/                 # Authentication pages
│   ├── polls/                # Poll-related pages
│   │   ├── [id]/             # Individual poll viewing
│   │   └── new/              # Poll creation
│   ├── globals.css           # Global styles with CSS variables
│   ├── layout.tsx            # Root layout with navigation
│   └── page.tsx              # Landing page
├── components/               # Reusable UI components
│   ├── auth/                 # Authentication components
│   ├── polls/                # Poll-related components
│   ├── ui/                   # Shadcn UI components
│   └── navigation.tsx        # Main navigation
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions and API
├── types/                    # TypeScript type definitions
└── tailwind.config.ts        # Tailwind configuration
```

## Key Features

### 1. **Landing Page**
- Hero section with call-to-action buttons
- Feature showcase cards
- Modern gradient design

### 2. **Authentication System**
- Sign in/Sign up form component
- Form validation and state management
- Placeholder for backend integration

### 3. **Poll Management**
- **Create Polls**: Dynamic form with multiple options
- **View Polls**: Card-based poll listing
- **Vote on Polls**: Interactive voting interface with real-time results
- **Poll Details**: Individual poll pages with voting and results
- **Chart Visualization**: Enhanced PollResultChart component with colorful progress bars, statistics, and winner display

### 4. **New API Integration**
- **Client Library**: Type-safe API client functions
- **Server Actions**: Updated server actions using new endpoints
- **Demo Pages**: Interactive API testing at `/api-demo` and `/new-api-example`

## 🔧 API Usage Examples

### Using New Server Actions
```typescript
import { createPollActionNew, updatePollActionNew, deletePollActionNew } from '@/lib/actions-new'

// Create poll
const result = await createPollActionNew(formData)
if (result.success) {
  console.log('Poll created:', result.data)
}

// Update poll
const updateResult = await updatePollActionNew(pollId, formData)

// Delete poll
const deleteResult = await deletePollActionNew(pollId)
```

### Using API Client Directly
```typescript
import { createPollAPI, updatePollAPI, deletePollAPI } from '@/lib/api-client'

// Create poll
const poll = await createPollAPI({
  title: "Sample Poll",
  options: ["Option 1", "Option 2"],
  expiresAt: "2025-12-31T23:59:59.000Z"
})

// Update poll
const updatedPoll = await updatePollAPI(pollId, {
  title: "Updated Title"
})

// Delete poll
await deletePollAPI(pollId)
```

### Direct API Calls
```typescript
// Create poll
const response = await fetch('/api/poll/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "My Poll",
    options: ["Option A", "Option B"]
  })
})

// List polls
const polls = await fetch('/api/poll/list').then(res => res.json())

// Get specific poll
const poll = await fetch(`/api/poll/get?id=${pollId}`).then(res => res.json())
```

### 4. **UI Components (Shadcn)**
- Button with variants (default, outline, secondary, destructive)
- Card components with proper styling
- Input fields with validation
- Labels and form controls
- Badges for status indication
- Textarea for descriptions

### 5. **Real API Backend**
The application now includes a complete API backend with the following endpoints:

#### **Authentication API**
- `POST /api/auth/signin` - User authentication
- `POST /api/auth/signup` - User registration

#### **Polls API**
- `GET /api/polls` - Get all polls
- `POST /api/polls` - Create new poll
- `GET /api/polls/[id]` - Get specific poll
- `POST /api/polls/[id]/vote` - Submit vote
- `GET /api/polls/[id]/vote?userId=xxx` - Get user's vote

### 6. **State Management**
- Custom hooks for polls (`usePolls`, `usePoll`)
- Authentication hook (`useAuth`)
- Mock API service for development

## Technical Implementation

### **Type Safety**
- Comprehensive TypeScript interfaces for all data structures
- Type-safe component props and API responses

### **Responsive Design**
- Mobile-first approach with Tailwind CSS
- Grid layouts for different screen sizes
- Accessible form controls

### **Mock Data Service**
- API abstraction layer in `lib/api.ts`
- Mock polls with voting functionality
- Ready for backend integration

### **Date Utilities**
- Helper functions for date formatting
- Relative time display (e.g., "2 hours ago")

## Sample Data Structure

The application uses the following main types:

```typescript
interface Poll {
  id: string
  title: string
  description?: string
  createdBy: string
  createdAt: Date
  expiresAt?: Date
  isActive: boolean
  options: PollOption[]
  votes: Vote[]
}
```

## Development Status

✅ **Completed Features:**
- Project scaffolding and folder structure
- Landing page with modern UI
- Authentication form component
- Poll creation form
- Poll listing and voting components
- Navigation and layout
- TypeScript types and interfaces
- Mock API service
- Responsive design

🔄 **Ready for Integration:**
- Database connection
- Real authentication system
- API endpoints
- User sessions
- Real-time voting updates

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```

3. **Access Application:**
   - Main app: http://localhost:3000
   - Authentication: http://localhost:3000/auth
   - Polls: http://localhost:3000/polls
   - Create Poll: http://localhost:3000/polls/new

## Next Steps for Production

1. **Backend Integration:**
   - Set up database (PostgreSQL/MongoDB)
   - Implement authentication (NextAuth.js/Clerk)
   - Create API routes

2. **Enhanced Features:**
   - Real-time voting with WebSockets
   - Poll analytics and charts
   - Social sharing
   - User profiles and poll history

3. **Performance Optimization:**
   - Image optimization
   - Caching strategies
   - SEO improvements

4. **Deployment:**
   - Vercel/Netlify deployment
   - Environment variables
   - Production build optimization

The application is now fully scaffolded and ready for feature development and backend integration!
