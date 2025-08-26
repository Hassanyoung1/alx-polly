# ALX Polly - Polling Application

## Overview
ALX Polly is a modern Next.js polling application that allows users to create, share, and participate in polls. The application is built with TypeScript, Tailwind CSS, and Shadcn UI components with a complete API backend.

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
