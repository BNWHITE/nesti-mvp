-- Nesti MVP Database Schema
-- Privacy by Design: All user data is encrypted and access is controlled via RLS

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- FAMILIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS families (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '👨‍👩‍👧‍👦',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Families policies
CREATE POLICY "Users can view families they belong to" ON families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family creators can update their families" ON families
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can create families" ON families
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- ============================================
-- FAMILY MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'parent', 'ado', 'enfant')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Enable RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Family members policies
CREATE POLICY "Users can view members of their families" ON family_members
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage family members" ON family_members
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  emoji TEXT,
  type TEXT CHECK (type IN ('celebration', 'photo', 'milestone', 'memory', 'activity', 'food', 'default')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Users can view posts from their families" ON posts
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create posts in their families" ON posts
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (author_id = auth.uid());

-- ============================================
-- POST REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'celebration', 'support')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Enable RLS
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Post reactions policies
CREATE POLICY "Users can view reactions on posts from their families" ON post_reactions
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM posts WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add reactions" ON post_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their reactions" ON post_reactions
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Users can view comments on posts from their families" ON comments
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM posts WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (author_id = auth.uid());

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('medical', 'shopping', 'sport', 'school', 'appointment', 'birthday', 'other')),
  emoji TEXT,
  location TEXT,
  distance TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration TEXT,
  priority TEXT CHECK (priority IN ('urgent', 'important', 'normal')),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Users can view events from their families" ON events
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events in their families" ON events
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Event creators can update their events" ON events
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Event creators can delete their events" ON events
  FOR DELETE USING (created_by = auth.uid());

-- ============================================
-- EVENT PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Event participants policies
CREATE POLICY "Users can view participants of events in their families" ON event_participants
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage their participation" ON event_participants
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- ACTIVITIES TABLE (for recommendations)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  image_url TEXT,
  location TEXT,
  distance TEXT,
  date TEXT,
  price NUMERIC(10, 2),
  rating NUMERIC(2, 1),
  reviews_count INTEGER DEFAULT 0,
  tags TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Activities policies
CREATE POLICY "Anyone can view public activities" ON activities
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create activities" ON activities
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators can update their activities" ON activities
  FOR UPDATE USING (created_by = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
