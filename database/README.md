# Nesti Database Schema

## Setup Instructions

### 1. Access Supabase Dashboard

Go to your Supabase project: https://app.supabase.com/project/ozlbjohbzaommmtbwues

### 2. Run Schema

1. Navigate to SQL Editor in the left sidebar
2. Copy the contents of `schema.sql`
3. Paste and run the SQL script
4. Wait for confirmation that all tables and policies are created

### 3. Run Seed Data (Optional)

1. In the SQL Editor, copy the contents of `seed.sql`
2. Paste and run the SQL script
3. This will create sample activities for testing

## Database Structure

### Tables

#### `users`
- User profile information
- Automatically created when a user signs up
- Stores: name, email, avatar

#### `families`
- Family groups (nests)
- Each family has a creator and members
- Supports description and emoji

#### `family_members`
- Junction table for users and families
- Roles: admin, parent, ado, enfant
- Controls access to family data

#### `posts`
- Family feed posts
- Supports text, emoji, images
- Types: celebration, photo, milestone, etc.

#### `post_reactions`
- Reactions to posts (like, love, celebration)
- One reaction per user per type per post

#### `comments`
- Comments on posts
- Nested conversations

#### `events`
- Family calendar events
- Supports location, time, participants
- Priority levels: urgent, important, normal

#### `event_participants`
- Who's attending each event
- Status: pending, accepted, declined

#### `activities`
- Activity recommendations
- Can be public or private
- Includes ratings and reviews

## Security (RLS Policies)

All tables have Row Level Security enabled with the following principles:

1. **Privacy by Design**: Users can only see data from families they belong to
2. **Creator Control**: Users can edit/delete their own content
3. **Admin Rights**: Family admins can manage members
4. **Public Activities**: Some activities are publicly visible for discovery

## Key Features

### Automatic Profile Creation
When a user signs up, a profile is automatically created via trigger

### Timestamps
All tables have `created_at` and `updated_at` timestamps that auto-update

### Indexes
Performance indexes on frequently queried columns

### Data Integrity
- Foreign key constraints
- Check constraints for enums
- Unique constraints where appropriate

## Privacy & Security

- ✅ Row Level Security on all tables
- ✅ No data leakage between families
- ✅ Secure by default
- ✅ Users can only access their own data
- ✅ OAuth and email auth supported
- ✅ Session management handled by Supabase

## Testing

After running the schema:

1. Sign up a test user
2. Check that a profile was created
3. Create a family
4. Add family members
5. Create posts and events
6. Verify RLS policies work correctly
