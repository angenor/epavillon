-- Seed data for events and activities
-- Note: This script assumes the database structure from database_complete.sql

-- First, let's insert some events
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

-- First we need some organizations and users for activities
-- Use existing user Franck NGOUANDI
-- Note: This assumes the user already exists in auth.users
INSERT INTO users (id, email, first_name, last_name, created_at, updated_at)
VALUES ('9a9ec732-7daf-4bec-8c4a-17d8109e06a8', 'angenor99@gmail.com', 'Franck', 'NGOUANDI', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create some organizations if they don't exist
INSERT INTO organizations (name, email, organization_type, description, logo_url, website, created_at, updated_at)
VALUES 
(
    'Institut de la Francophonie pour le Développement Durable',
    'contact@ifdd.francophonie.org',
    'international_organization',
    'L''IFDD est l''organe subsidiaire de l''OIF voué au développement durable.',
    '/logo-ifdd.png',
    'https://www.ifdd.francophonie.org',
    NOW(),
    NOW()
),
(
    'Organisation Internationale de la Francophonie',
    'contact@francophonie.org',
    'international_organization',
    'L''OIF regroupe 88 États et gouvernements qui partagent la langue française.',
    NULL,
    'https://www.francophonie.org',
    NOW(),
    NOW()
),
(
    'Programme des Nations Unies pour l''Environnement',
    'info@unep.org',
    'international_organization',
    'Le PNUE est la principale autorité mondiale en matière d''environnement.',
    NULL,
    'https://www.unep.org',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert activities for the events
-- Activities for COP29
WITH cop29_event AS (
    SELECT id FROM events WHERE title LIKE 'COP29%' LIMIT 1
),
ifdd_org AS (
    SELECT id FROM organizations WHERE name LIKE '%Institut de la Francophonie%' LIMIT 1
),
oif_org AS (
    SELECT id FROM organizations WHERE name LIKE '%Organisation Internationale de la Francophonie%' LIMIT 1
),
default_user AS (
    SELECT id FROM users WHERE email = 'angenor99@gmail.com' LIMIT 1
)
INSERT INTO activities (
    event_id, 
    organization_id, 
    submitted_by,
    title, 
    activity_type, 
    objectives,
    detailed_presentation,
    format,
    main_themes,
    categories,
    proposed_start_date,
    proposed_end_date,
    validation_status,
    created_at, 
    updated_at
)
VALUES
(
    (SELECT id FROM cop29_event),
    (SELECT id FROM ifdd_org),
    (SELECT id FROM default_user),
    'Session plénière d''ouverture - Enjeux et ambitions de la COP29',
    'consultation',
    'Présenter les enjeux majeurs de la COP29 et définir les ambitions collectives pour la conférence.',
    'Session inaugurale de la COP29 avec les discours des chefs d''État et de gouvernement sur les ambitions climatiques et les engagements nationaux. Cette session marquera le début officiel des négociations et établira le ton pour les deux semaines de conférences.',
    'hybrid',
    ARRAY['mitigation', 'adaptation']::activity_theme[],
    ARRAY['consultation', 'awareness']::activity_type[],
    '2024-11-11 10:00:00',
    '2024-11-11 12:00:00',
    'approved',
    NOW(),
    NOW()
),
(
    (SELECT id FROM cop29_event),
    (SELECT id FROM ifdd_org),
    (SELECT id FROM default_user),
    'Atelier francophone sur le financement climatique',
    'capacity_building',
    'Renforcer les capacités des pays francophones en matière de financement climatique.',
    'Atelier dédié aux pays francophones pour discuter des mécanismes de financement climatique, l''accès aux fonds verts et les stratégies de mobilisation des ressources. L''atelier comprendra des sessions pratiques sur la préparation de projets bancables.',
    'in_person',
    ARRAY['finance', 'climate_resilience']::activity_theme[],
    ARRAY['capacity_building', 'best_practices']::activity_type[],
    '2024-11-13 14:00:00',
    '2024-11-13 17:00:00',
    'approved',
    NOW(),
    NOW()
);

-- Activities for COP16 Biodiversité
WITH cop16_event AS (
    SELECT id FROM events WHERE title LIKE 'COP16 Biodiversité%' LIMIT 1
),
pnue_org AS (
    SELECT id FROM organizations WHERE name LIKE '%Programme des Nations Unies%' LIMIT 1
)
INSERT INTO activities (
    event_id, 
    organization_id, 
    submitted_by,
    title, 
    activity_type, 
    objectives,
    detailed_presentation,
    format,
    main_themes,
    categories,
    proposed_start_date,
    proposed_end_date,
    validation_status,
    created_at, 
    updated_at
)
VALUES
(
    (SELECT id FROM cop16_event),
    (SELECT id FROM pnue_org),
    (SELECT id FROM users WHERE email = 'angenor99@gmail.com' LIMIT 1),
    'Cérémonie d''ouverture - Biodiversité et peuples',
    'awareness',
    'Célébrer le lien entre biodiversité et cultures autochtones.',
    'Cérémonie d''ouverture mettant en lumière le lien entre biodiversité et cultures autochtones, avec des performances traditionnelles colombiennes. La cérémonie soulignera l''importance des savoirs traditionnels dans la conservation de la biodiversité.',
    'in_person',
    ARRAY['nature_oceans', 'other']::activity_theme[],
    ARRAY['awareness', 'consultation']::activity_type[],
    '2024-10-21 09:00:00',
    '2024-10-21 10:30:00',
    'approved',
    NOW(),
    NOW()
);

-- Update events to have proper banner images
UPDATE events 
SET banner_high_quality_1_1_url = '/images/example/event_banniere_par_defaut_32_9.jpg'
WHERE banner_high_quality_1_1_url IS NULL;

-- Create some countries if needed for activities
INSERT INTO countries (name, name_en, code_iso2, code_iso3, code_numeric, created_at, updated_at)
VALUES 
('France', 'France', 'FR', 'FRA', '250', NOW(), NOW()),
('Canada', 'Canada', 'CA', 'CAN', '124', NOW(), NOW()),
('Sénégal', 'Senegal', 'SN', 'SEN', '686', NOW(), NOW())
ON CONFLICT (code_iso2) DO NOTHING;