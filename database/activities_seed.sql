-- Seed data for activities table
-- Real activities from Île-de-France and Rennes for the Discover page

INSERT INTO activities (title, description, category, location, age_min, age_max, duration_min, difficulty, is_public) VALUES
('Atelier Cuisine en Famille', 'Apprenez à cuisiner ensemble des recettes simples et délicieuses', 'cuisine', 'Paris', 5, 99, 120, 'facile', true),
('Escape Game Familial', 'Résolvez des énigmes en équipe dans un univers fantastique', 'jeux', 'Paris', 10, 99, 60, 'moyen', true),
('Balade à Vélo au Bois de Vincennes', 'Parcours vélo adapté aux familles avec aires de pique-nique', 'sport', 'Paris 12ème', 6, 99, 180, 'facile', true),
('Visite du Musée d''Histoire Naturelle', 'Découvrez les dinosaures et la biodiversité', 'culture', 'Paris 5ème', 3, 99, 120, 'facile', true),
('Atelier Poterie Parent-Enfant', 'Créez vos propres œuvres en argile', 'art', 'Rennes', 6, 99, 90, 'facile', true),
('Accrobranche Forest Jump', 'Parcours dans les arbres adaptés à tous les âges', 'sport', 'Rennes', 4, 99, 180, 'moyen', true),
('Cinéma en Plein Air', 'Séances de films familiaux sous les étoiles', 'culture', 'Île-de-France', 0, 99, 120, 'facile', true),
('Cours de Natation Familial', 'Apprenez à nager en s''amusant avec vos enfants', 'sport', 'Paris', 4, 99, 60, 'facile', true),
('Atelier Jardinage Urbain', 'Initiez vos enfants au jardinage en ville', 'nature', 'Paris', 5, 99, 90, 'facile', true),
('Laser Game en Famille', 'Affrontez-vous dans une arène futuriste', 'jeux', 'Île-de-France', 7, 99, 45, 'facile', true),
('Visite Guidée du Château de Versailles', 'Découvrez l''histoire de France à travers ce château emblématique', 'culture', 'Versailles', 8, 99, 150, 'facile', true),
('Atelier Pâtisserie pour Enfants', 'Les enfants deviennent pâtissiers le temps d''un après-midi', 'cuisine', 'Paris', 5, 12, 90, 'facile', true),
('Randonnée en Forêt de Fontainebleau', 'Découverte de la nature et pique-nique en famille', 'nature', 'Fontainebleau', 6, 99, 240, 'moyen', true),
('Visite de la Cité des Sciences', 'Expositions scientifiques interactives pour toute la famille', 'culture', 'Paris 19ème', 3, 99, 180, 'facile', true),
('Cours d''Initiation à la Danse', 'Cours de danse moderne adaptés aux familles', 'sport', 'Rennes', 5, 99, 60, 'facile', true),
('Atelier Théâtre Parent-Enfant', 'Improvisations et jeux théâtraux en famille', 'art', 'Paris', 7, 99, 90, 'facile', true),
('Karting Familial', 'Session de karting sur circuit sécurisé', 'sport', 'Île-de-France', 8, 99, 45, 'moyen', true),
('Atelier Construction Lego', 'Construisez ensemble des créations géantes en Lego', 'jeux', 'Paris', 4, 99, 120, 'facile', true),
('Visite du Parc Zoologique', 'Découverte des animaux du monde entier', 'nature', 'Paris 12ème', 2, 99, 180, 'facile', true),
('Bowling en Famille', 'Partie de bowling conviviale pour tous les âges', 'jeux', 'Rennes', 5, 99, 90, 'facile', true),
('Atelier Photographie', 'Initiez-vous à la photo en famille', 'art', 'Paris', 10, 99, 120, 'moyen', true),
('Parcours Trampoline Park', 'Sautez et amusez-vous sur des trampolines géants', 'sport', 'Île-de-France', 4, 99, 60, 'facile', true),
('Visite de Ferme Pédagogique', 'Rencontrez les animaux de la ferme et apprenez leur mode de vie', 'nature', 'Rennes', 2, 99, 120, 'facile', true),
('Atelier Origami', 'Apprenez l''art du pliage japonais', 'art', 'Paris', 6, 99, 60, 'facile', true),
('Mini-Golf Familial', 'Parcours de mini-golf ludique et coloré', 'jeux', 'Île-de-France', 4, 99, 60, 'facile', true)
ON CONFLICT DO NOTHING;
