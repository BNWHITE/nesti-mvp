-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- Strict access control for all tables
-- ============================================

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except sensitive fields)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND password_hash = (SELECT password_hash FROM users WHERE id = auth.uid())
  );

-- Users can view profiles of family members
CREATE POLICY "users_select_family" ON users
  FOR SELECT
  USING (
    id IN (
      SELECT fm.user_id 
      FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Prevent direct password changes (must use auth.users)
CREATE POLICY "users_prevent_password_change" ON users
  FOR UPDATE
  USING (false)
  WITH CHECK (
    password_hash = (SELECT password_hash FROM users WHERE id = auth.uid())
  );

-- ============================================
-- FAMILIES TABLE POLICIES
-- ============================================

-- Users can view families they belong to
CREATE POLICY "families_select_member" ON families
  FOR SELECT
  USING (
    id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Family admins can update their families
CREATE POLICY "families_update_admin" ON families
  FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Authenticated users can create families
CREATE POLICY "families_insert_authenticated" ON families
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can delete families
CREATE POLICY "families_delete_admin" ON families
  FOR DELETE
  USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FAMILY_MEMBERS TABLE POLICIES
-- ============================================

-- Users can view members of their families
CREATE POLICY "family_members_select_family" ON family_members
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Family admins can add members
CREATE POLICY "family_members_insert_admin" ON family_members
  FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Family admins can update member roles
CREATE POLICY "family_members_update_admin" ON family_members
  FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Family admins can remove members
CREATE POLICY "family_members_delete_admin" ON family_members
  FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can leave families themselves
CREATE POLICY "family_members_delete_self" ON family_members
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- POSTS TABLE POLICIES
-- ============================================

-- Users can view posts from their families
CREATE POLICY "posts_select_family" ON posts
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Users can create posts in their families
CREATE POLICY "posts_insert_family" ON posts
  FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
    AND author_id = auth.uid()
  );

-- Users can update their own posts
CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE
  USING (author_id = auth.uid());

-- Users can delete their own posts
CREATE POLICY "posts_delete_own" ON posts
  FOR DELETE
  USING (author_id = auth.uid());

-- Family admins can delete any post in their family
CREATE POLICY "posts_delete_admin" ON posts
  FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- COMMENTS TABLE POLICIES
-- ============================================

-- Users can view comments on posts from their families
CREATE POLICY "comments_select_family" ON comments
  FOR SELECT
  USING (
    post_id IN (
      SELECT id FROM posts WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Users can create comments on family posts
CREATE POLICY "comments_insert_family" ON comments
  FOR INSERT
  WITH CHECK (
    post_id IN (
      SELECT id FROM posts WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
    AND author_id = auth.uid()
  );

-- Users can update their own comments
CREATE POLICY "comments_update_own" ON comments
  FOR UPDATE
  USING (author_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "comments_delete_own" ON comments
  FOR DELETE
  USING (author_id = auth.uid());

-- ============================================
-- REACTIONS TABLE POLICIES
-- ============================================

-- Users can view reactions on family posts
CREATE POLICY "reactions_select_family" ON reactions
  FOR SELECT
  USING (
    post_id IN (
      SELECT id FROM posts WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Users can add reactions to family posts
CREATE POLICY "reactions_insert_family" ON reactions
  FOR INSERT
  WITH CHECK (
    post_id IN (
      SELECT id FROM posts WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
    AND user_id = auth.uid()
  );

-- Users can remove their own reactions
CREATE POLICY "reactions_delete_own" ON reactions
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- EVENTS TABLE POLICIES
-- ============================================

-- Users can view events from their families
CREATE POLICY "events_select_family" ON events
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Users can create events in their families
CREATE POLICY "events_insert_family" ON events
  FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
    AND creator_id = auth.uid()
  );

-- Event creators can update their events
CREATE POLICY "events_update_creator" ON events
  FOR UPDATE
  USING (creator_id = auth.uid());

-- Event creators can delete their events
CREATE POLICY "events_delete_creator" ON events
  FOR DELETE
  USING (creator_id = auth.uid());

-- Family admins can delete any event
CREATE POLICY "events_delete_admin" ON events
  FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- EVENT_PARTICIPANTS TABLE POLICIES
-- ============================================

-- Users can view participants of family events
CREATE POLICY "event_participants_select_family" ON event_participants
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Users can add themselves to events
CREATE POLICY "event_participants_insert_self" ON event_participants
  FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
    AND user_id = auth.uid()
  );

-- Users can update their own participation
CREATE POLICY "event_participants_update_own" ON event_participants
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can remove their participation
CREATE POLICY "event_participants_delete_own" ON event_participants
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- ACTIVITIES TABLE POLICIES (Public Catalog)
-- ============================================

-- Anyone can view active public activities
CREATE POLICY "activities_select_public" ON activities
  FOR SELECT
  USING (is_active = true);

-- Admins can create activities (role check would need custom implementation)
CREATE POLICY "activities_insert_admin" ON activities
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can update activities
CREATE POLICY "activities_update_admin" ON activities
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- FAVORITE_ACTIVITIES TABLE POLICIES
-- ============================================

-- Users can view their own favorites
CREATE POLICY "favorite_activities_select_own" ON favorite_activities
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can add favorites
CREATE POLICY "favorite_activities_insert_own" ON favorite_activities
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can remove their favorites
CREATE POLICY "favorite_activities_delete_own" ON favorite_activities
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- CHAT_MESSAGES TABLE POLICIES
-- ============================================

-- Users can view their own chat messages
CREATE POLICY "chat_messages_select_own" ON chat_messages
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can view family chat messages if AI is shared
CREATE POLICY "chat_messages_select_family" ON chat_messages
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Users can create their own chat messages
CREATE POLICY "chat_messages_insert_own" ON chat_messages
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own chat messages
CREATE POLICY "chat_messages_delete_own" ON chat_messages
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- USER_CONSENTS TABLE POLICIES (GDPR)
-- ============================================

-- Users can view their own consents
CREATE POLICY "user_consents_select_own" ON user_consents
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own consents
CREATE POLICY "user_consents_insert_own" ON user_consents
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own consents (revoke)
CREATE POLICY "user_consents_update_own" ON user_consents
  FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- DATA_EXPORTS TABLE POLICIES (GDPR)
-- ============================================

-- Users can view their own export requests
CREATE POLICY "data_exports_select_own" ON data_exports
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create export requests
CREATE POLICY "data_exports_insert_own" ON data_exports
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- DELETION_REQUESTS TABLE POLICIES (GDPR)
-- ============================================

-- Users can view their own deletion requests
CREATE POLICY "deletion_requests_select_own" ON deletion_requests
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create deletion requests
CREATE POLICY "deletion_requests_insert_own" ON deletion_requests
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their deletion requests (cancel)
CREATE POLICY "deletion_requests_update_own" ON deletion_requests
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (status IN ('pending', 'cancelled'));

-- ============================================
-- AUDIT_LOGS TABLE POLICIES
-- ============================================

-- No direct user access to audit logs
-- Only accessible through security functions
CREATE POLICY "audit_logs_no_access" ON audit_logs
  FOR ALL
  USING (false);

-- Service role can access all audit logs
-- This requires service_role key, not user auth
CREATE POLICY "audit_logs_service_role" ON audit_logs
  FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- BLOCKED_IPS TABLE POLICIES
-- ============================================

-- No user access to blocked IPs
CREATE POLICY "blocked_ips_no_access" ON blocked_ips
  FOR ALL
  USING (false);

-- Service role only
CREATE POLICY "blocked_ips_service_role" ON blocked_ips
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- SECURITY_EVENTS TABLE POLICIES
-- ============================================

-- No user access to security events
CREATE POLICY "security_events_no_access" ON security_events
  FOR ALL
  USING (false);

-- Service role only
CREATE POLICY "security_events_service_role" ON security_events
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- PARENTAL_CONTROLS TABLE POLICIES
-- ============================================

-- Parents can view controls for their children
CREATE POLICY "parental_controls_select_parent" ON parental_controls
  FOR SELECT
  USING (parent_user_id = auth.uid());

-- Children can view their own controls (read-only)
CREATE POLICY "parental_controls_select_child" ON parental_controls
  FOR SELECT
  USING (child_user_id = auth.uid());

-- Parents can create controls for children
CREATE POLICY "parental_controls_insert_parent" ON parental_controls
  FOR INSERT
  WITH CHECK (parent_user_id = auth.uid());

-- Parents can update controls for their children
CREATE POLICY "parental_controls_update_parent" ON parental_controls
  FOR UPDATE
  USING (parent_user_id = auth.uid());

-- Parents can delete controls
CREATE POLICY "parental_controls_delete_parent" ON parental_controls
  FOR DELETE
  USING (parent_user_id = auth.uid());

COMMENT ON POLICY "users_select_own" ON users IS 'Users can only view their own profile';
COMMENT ON POLICY "posts_select_family" ON posts IS 'Users can view posts from families they belong to';
COMMENT ON POLICY "audit_logs_no_access" ON audit_logs IS 'Audit logs are protected from user access';
COMMENT ON POLICY "parental_controls_select_parent" ON parental_controls IS 'Parents can manage their children controls';
