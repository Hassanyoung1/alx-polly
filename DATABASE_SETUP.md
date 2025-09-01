# Database Setup Guide for ALX Polly

This guide will help you set up the Supabase database for the ALX Polly polling application.

## Prerequisites

1. **Supabase Account**: You need a Supabase account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project or use an existing one
3. **Environment Variables**: Ensure your `.env.local` file is configured

## Step 1: Environment Variables Setup

First, make sure your `.env.local` file contains these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SECRET_KEY=your-service-role-key-here
```

**To get these values:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the values from the API section

## Step 2: Database Schema Setup

### Option A: Quick Setup (Recommended for first-time setup)

1. **Open Supabase Dashboard**
   - Go to your project dashboard
   - Click on **SQL Editor** in the left sidebar

2. **Run the Quick Setup Script**
   - Copy the contents of `supabase-setup.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute

3. **Verify Setup**
   - You should see: `Database setup completed successfully!`
   - Check the **Table Editor** to see the new tables

### Option B: Full Setup (Advanced features)

1. **Run the Complete Schema**
   - Copy the contents of `database-schema.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute

2. **This includes:**
   - All tables with constraints
   - Performance indexes
   - Row Level Security (RLS) policies
   - Triggers and functions
   - Views for common queries

## Step 3: Verify Database Setup

### Check Tables Created

In the **Table Editor**, you should see:

- ✅ **polls** - Main poll information
- ✅ **poll_options** - Available choices for each poll  
- ✅ **votes** - User votes on poll options

### Check RLS Policies

In the **Authentication** → **Policies** section:

- ✅ **polls**: View active polls, create polls
- ✅ **poll_options**: View options, create options
- ✅ **votes**: View votes, create votes

## Step 4: Test the Setup

### 1. Test Poll Creation
1. Start your development server: `npm run dev`
2. Go to `/polls/new`
3. Create a new poll with options
4. Check the database to see the poll was created

### 2. Test Voting
1. Go to `/polls` to see your poll
2. Click on the poll to view it
3. Cast a vote on one of the options
4. Check the database to see the vote was recorded

## Database Schema Details

### Tables Structure

#### `polls` Table
```sql
- id: UUID (Primary Key)
- title: TEXT (Required, max 200 chars)
- description: TEXT (Optional, max 1000 chars)
- created_by: UUID (References auth.users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- expires_at: TIMESTAMP (Optional)
- is_active: BOOLEAN (Default: true)
```

#### `poll_options` Table
```sql
- id: UUID (Primary Key)
- poll_id: UUID (References polls)
- text: TEXT (Required, max 100 chars)
- order_num: INTEGER (Required, > 0)
- created_at: TIMESTAMP
```

#### `votes` Table
```sql
- id: UUID (Primary Key)
- poll_id: UUID (References polls)
- option_id: UUID (References poll_options)
- user_id: UUID (References auth.users, optional)
- session_id: TEXT (For anonymous voting)
- created_at: TIMESTAMP
```

### Key Features

1. **UUID Primary Keys**: Secure, unique identifiers
2. **Foreign Key Constraints**: Maintains data integrity
3. **Check Constraints**: Validates data at database level
4. **Row Level Security**: Ensures data privacy and security
5. **Performance Indexes**: Fast queries on common fields
6. **Cascade Deletes**: Automatically removes related data

## Troubleshooting

### Common Issues

#### 1. "Missing Supabase environment variables"
- **Solution**: Check your `.env.local` file has all required variables
- **Verify**: Restart your development server after changes

#### 2. "Table doesn't exist" errors
- **Solution**: Run the database setup script in Supabase SQL Editor
- **Verify**: Check Table Editor shows the required tables

#### 3. "Permission denied" errors
- **Solution**: Ensure RLS policies are created correctly
- **Verify**: Check Authentication → Policies section

#### 4. "Foreign key constraint" errors
- **Solution**: Ensure tables are created in the correct order
- **Verify**: Run the complete setup script again

### Debug Steps

1. **Check Environment Variables**
   ```bash
   # In your terminal
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   echo $SUPABASE_SECRET_KEY
   ```

2. **Check Database Connection**
   - Go to Supabase Dashboard → Settings → API
   - Verify your project URL and keys

3. **Check Table Structure**
   - Go to Table Editor in Supabase
   - Verify all tables exist with correct columns

## Next Steps

After successful database setup:

1. **Test the Application**: Create polls and vote on them
2. **Customize RLS Policies**: Adjust security policies as needed
3. **Add Sample Data**: Use the sample data section in the full schema
4. **Monitor Performance**: Check query performance in Supabase Analytics

## Support

If you encounter issues:

1. **Check Supabase Logs**: Go to Logs section in dashboard
2. **Verify SQL Syntax**: Ensure SQL scripts run without errors
3. **Check RLS Policies**: Verify policies are correctly applied
4. **Review Environment**: Confirm all environment variables are set

---

**Status**: ✅ Database schema ready for ALX Polly application
