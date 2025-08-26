# ALX Polly Development Guide

## Environment Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd alx-polly
npm install
```

### 2. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the environment variables as needed
nano .env.local
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## Environment Variables

### Core Configuration
```bash
# Application settings
NODE_ENV=development
APP_URL=http://localhost:3001
APP_NAME="ALX Polly - Polling App"

# Database (SQLite for development)
DATABASE_URL="file:./dev.db"

# Authentication secrets
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
```

### Feature Flags
```bash
# Control application features
ENABLE_REGISTRATION=true
ENABLE_ANONYMOUS_VOTING=true
ENABLE_POLL_EXPIRATION=true
ENABLE_EMAIL_NOTIFICATIONS=false
```

### Development Options
```bash
# Development settings
DEBUG=true
LOG_LEVEL=debug
USE_MOCK_DATA=true
```

## Project Architecture

### Frontend Structure
```
app/
├── page.tsx              # Landing page
├── layout.tsx            # Root layout
├── auth/
│   └── page.tsx          # Authentication page
├── polls/
│   ├── page.tsx          # Polls listing
│   ├── new/
│   │   └── page.tsx      # Create poll
│   └── [id]/
│       └── page.tsx      # Individual poll
└── api/                  # API routes
    ├── auth/
    │   ├── signin/
    │   └── signup/
    └── polls/
        ├── route.ts      # GET/POST /api/polls
        └── [id]/
            ├── route.ts  # GET /api/polls/[id]
            └── vote/
                └── route.ts # POST /api/polls/[id]/vote
```

### Component Structure
```
components/
├── auth/
│   └── auth-form.tsx     # Sign in/up form
├── polls/
│   ├── create-poll-form.tsx
│   ├── poll-card.tsx
│   ├── poll-list.tsx
│   └── poll-voting.tsx
├── ui/                   # Shadcn components
└── navigation.tsx
```

## API Development

### Adding New Endpoints
1. Create route file: `app/api/[route]/route.ts`
2. Export HTTP method handlers: `GET`, `POST`, `PUT`, `DELETE`
3. Add TypeScript types in `types/index.ts`
4. Update API service in `lib/api.ts`

### Example API Route
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello World' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ received: body })
}
```

## Database Integration

### Current Setup (Development)
- SQLite database (`./dev.db`)
- File-based storage
- No migrations required

### Production Setup
1. Update `DATABASE_URL` to your production database
2. Consider PostgreSQL, MySQL, or MongoDB
3. Implement proper database schema
4. Add data persistence layer

### Recommended Database Schema
```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Polls table
CREATE TABLE polls (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  is_active BOOLEAN DEFAULT true,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Poll options
CREATE TABLE poll_options (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL,
  text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (poll_id) REFERENCES polls(id)
);

-- Votes
CREATE TABLE votes (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poll_id) REFERENCES polls(id),
  FOREIGN KEY (option_id) REFERENCES poll_options(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Testing

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Testing Environment Variables
Create `.env.test` for test-specific configuration:
```bash
NODE_ENV=test
DATABASE_URL="file:./test.db"
USE_MOCK_DATA=true
```

## Deployment

### Production Environment
1. Set production environment variables:
   ```bash
   NODE_ENV=production
   APP_URL=https://yourapp.com
   DATABASE_URL=postgresql://...
   ```

2. Build the application:
   ```bash
   npm run build
   npm start
   ```

### Environment Security
- Never commit `.env.local` or `.env.production`
- Use secure secrets for `NEXTAUTH_SECRET` and `JWT_SECRET`
- Enable HTTPS in production
- Configure CORS properly

### Deployment Platforms
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment

## Troubleshooting

### Common Issues

**1. Port already in use:**
```bash
# Kill process on port 3000/3001
npx kill-port 3000
# or
lsof -ti:3000 | xargs kill
```

**2. Environment variables not loading:**
- Check file naming: `.env.local` (not `.env`)
- Restart development server after changes
- Verify variable names match exactly

**3. Database connection issues:**
- Check `DATABASE_URL` format
- Ensure database server is running
- Verify permissions and credentials

**4. TypeScript errors:**
- Run `npm run type-check`
- Check import paths use `@/` alias
- Verify all types are properly exported

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

### Code Standards
- Use TypeScript for all new code
- Follow existing naming conventions
- Add proper error handling
- Include JSDoc comments for functions
- Write tests for new features
