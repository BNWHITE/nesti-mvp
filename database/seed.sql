-- Seed data for Nesti MVP
-- This data is for testing purposes only

-- Note: You'll need to create test users through the Supabase Auth UI or API first
-- Then update the UUIDs below with your actual user IDs

-- Sample Activities (public)
INSERT INTO activities (title, category, description, emoji, location, distance, date, price, rating, reviews_count, tags, is_public)
VALUES
  ('Stage de Football', 'Sport', 'Stage de football pour enfants de 8 à 12 ans. Encadrement professionnel.', '⚽', '2.3 km', '2.3 km', 'Mer 15 Mars', 45.00, 4.5, 23, ARRAY['Famille', 'Sport', 'Enfants'], true),
  ('Atelier Cuisine', 'Cuisine', 'Découvrez les secrets de la cuisine française en famille.', '👨‍🍳', '1.5 km', '1.5 km', 'Sam 18 Mars', 35.00, 4.8, 45, ARRAY['Famille', 'Cuisine', 'Créatif'], true),
  ('Sortie au Parc', 'Nature', 'Journée découverte nature avec activités pour toute la famille.', '🌳', '3.8 km', '3.8 km', 'Dim 19 Mars', 0.00, 4.3, 67, ARRAY['Famille', 'Nature', 'Gratuit'], true),
  ('Atelier Poterie', 'Art', 'Créez vos propres œuvres en céramique en famille.', '🏺', '2.1 km', '2.1 km', 'Sam 25 Mars', 30.00, 4.6, 34, ARRAY['Famille', 'Art', 'Créatif'], true),
  ('Piscine Municipale', 'Sport', 'Séances de natation familiale tous les week-ends.', '🏊', '1.8 km', '1.8 km', 'Tous les week-ends', 10.00, 4.4, 89, ARRAY['Famille', 'Sport', 'Aquatique'], true),
  ('Cinéma en Famille', 'Culture', 'Séances spéciales pour les familles le dimanche matin.', '🎬', '2.7 km', '2.7 km', 'Dim 12 Mars', 8.00, 4.7, 156, ARRAY['Famille', 'Culture', 'Divertissement'], true);

-- Sample data for families, posts, and events will be created by users through the app
-- The schema is ready to accept all data with proper RLS policies

-- Index creation for better performance
CREATE INDEX IF NOT EXISTS idx_posts_family_id ON posts(family_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_family_id ON events(family_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
