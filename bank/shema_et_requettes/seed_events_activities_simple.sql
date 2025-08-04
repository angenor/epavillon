-- Seed data for events and activities (simplified version)
-- This version avoids trigger issues

-- First, insert events only
INSERT INTO events (year, title, description, submission_deadline, event_status, submission_status, 
                   banner_high_quality_32_9_url, banner_high_quality_16_9_url,
                   participation_mode, in_person_location, in_person_start_date, in_person_end_date,
                   online_start_datetime, online_end_datetime, created_at, updated_at)
VALUES 
(
    2024,
    'COP29 - Conférence sur le climat de Bakou',
    'La 29e Conférence des Parties (COP29) de la Convention-cadre des Nations unies sur les changements climatiques (CCNUCC) se tiendra à Bakou, en Azerbaïdjan. Cet événement majeur réunira les dirigeants mondiaux, les négociateurs, les experts et la société civile pour discuter des actions urgentes nécessaires pour lutter contre le changement climatique.',
    '2024-10-15 23:59:59',
    'upcoming',
    'open',
    '/images/example/event_banniere_par_defaut_32_9.jpg',
    '/images/example/event_banniere_par_defaut_16_9.jpeg',
    'hybrid',
    'Bakou, Azerbaïdjan',
    '2024-11-11',
    '2024-11-22',
    '2024-11-11 09:00:00',
    '2024-11-22 18:00:00',
    NOW(),
    NOW()
),
(
    2024,
    'COP16 Biodiversité - Cali',
    'La 16e Conférence des Parties à la Convention sur la diversité biologique (COP16) se déroulera à Cali, en Colombie. Cette conférence cruciale vise à évaluer les progrès réalisés dans la mise en œuvre du Cadre mondial de la biodiversité de Kunming-Montréal et à accélérer les actions pour stopper et inverser la perte de biodiversité.',
    '2024-09-30 23:59:59',
    'ongoing',
    'closed',
    '/images/example/event_banniere_par_defaut_32_9.jpg',
    '/images/example/event_banniere_par_defaut_16_9.jpeg',
    'in_person',
    'Cali, Colombie',
    '2024-10-21',
    '2024-11-01',
    NULL,
    NULL,
    NOW(),
    NOW()
),
(
    2025,
    'Forum mondial de l''eau 2025',
    'Le 10e Forum mondial de l''eau rassemblera des experts, des décideurs politiques et des acteurs de la société civile du monde entier pour discuter des défis liés à l''eau et des solutions innovantes. Le thème principal sera "L''eau pour la prospérité partagée".',
    '2025-03-31 23:59:59',
    'upcoming',
    'open',
    '/images/example/event_banniere_par_defaut_32_9.jpg',
    '/images/example/event_banniere_par_defaut_16_9.jpeg',
    'hybrid',
    'Bali, Indonésie',
    '2025-05-18',
    '2025-05-23',
    '2025-05-18 09:00:00',
    '2025-05-23 18:00:00',
    NOW(),
    NOW()
),
(
    2024,
    'Sommet africain sur le climat 2024',
    'Le Sommet africain sur le climat réunit les leaders africains et les partenaires internationaux pour discuter des solutions climatiques adaptées au contexte africain. Focus sur l''adaptation, le financement climatique et la transition énergétique juste.',
    '2024-08-15 23:59:59',
    'completed',
    'closed',
    '/images/example/event_banniere_par_defaut_32_9.jpg',
    '/images/example/event_banniere_par_defaut_16_9.jpeg',
    'hybrid',
    'Nairobi, Kenya',
    '2024-09-04',
    '2024-09-06',
    '2024-09-04 09:00:00',
    '2024-09-06 18:00:00',
    NOW(),
    NOW()
);

-- Update any events that don't have the 1:1 banner
UPDATE events 
SET banner_high_quality_1_1_url = '/images/example/event_banniere_par_defaut_32_9.jpg'
WHERE banner_high_quality_1_1_url IS NULL;

-- Add user profile if not exists
INSERT INTO users (id, email, first_name, last_name, created_at, updated_at)
VALUES ('9a9ec732-7daf-4bec-8c4a-17d8109e06a8', 'angenor99@gmail.com', 'Franck', 'NGOUANDI', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create some basic countries
INSERT INTO countries (name, name_en, code_iso2, code_iso3, code_numeric, created_at, updated_at)
VALUES 
('France', 'France', 'FR', 'FRA', '250', NOW(), NOW()),
('Canada', 'Canada', 'CA', 'CAN', '124', NOW(), NOW()),
('Sénégal', 'Senegal', 'SN', 'SEN', '686', NOW(), NOW()),
('Azerbaïdjan', 'Azerbaijan', 'AZ', 'AZE', '031', NOW(), NOW()),
('Colombie', 'Colombia', 'CO', 'COL', '170', NOW(), NOW()),
('Indonésie', 'Indonesia', 'ID', 'IDN', '360', NOW(), NOW()),
('Kenya', 'Kenya', 'KE', 'KEN', '404', NOW(), NOW())
ON CONFLICT (code_iso2) DO NOTHING;