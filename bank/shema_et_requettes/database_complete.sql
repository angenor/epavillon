-- =============================================
-- Script SQL complet pour ePavilion2025 - Supabase
-- Institut de la Francophonie pour le Développement Durable (IFDD)
-- =============================================

-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour la recherche floue

-- =============================================
-- 1. GESTION DES PAYS
-- =============================================

-- Table des pays (pour éviter les redondances)
CREATE TABLE public.countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    continent TEXT,
    is_francophone BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. GESTION DES UTILISATEURS ET RÔLES
-- =============================================

-- Table des utilisateurs (étendue du auth.users de Supabase)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    email_pro TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    biography TEXT,
    profile_photo_url TEXT,
    profile_photo_thumbnail_url TEXT,
    country_id UUID REFERENCES public.countries(id),
    organization_id UUID,
    address TEXT, -- Remplace "position"
    is_organization_verified BOOLEAN DEFAULT FALSE,
    display_mode TEXT DEFAULT 'light' CHECK (display_mode IN ('light', 'dark', 'auto')),
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "live_events": true}'::jsonb,
    networking_visibility BOOLEAN DEFAULT TRUE,
    -- Statut de blocage/suspension
    is_blocked BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    blocked_by UUID REFERENCES public.users(id),
    blocked_at TIMESTAMPTZ,
    blocked_reason TEXT,
    suspended_by UUID REFERENCES public.users(id),
    suspended_at TIMESTAMPTZ,
    suspended_until TIMESTAMPTZ,
    suspension_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Types d'utilisateurs
CREATE TYPE user_role_type AS ENUM (
    'standard',
    'unfccc_focal_point',
    'negotiator',
    'trainer',
    'admin',
    'super_admin'
);

-- Table des rôles utilisateurs
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL,
    assigned_by UUID REFERENCES public.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role)
);

-- Table des négociateurs (informations spécifiques)
CREATE TABLE public.negotiators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    designation_year INTEGER NOT NULL,
    designated_by UUID REFERENCES public.users(id),
    total_designations INTEGER DEFAULT 1,
    specialization_themes TEXT[],
    cop_participations TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, designation_year)
);

-- Historique des concertations des négociateurs
CREATE TABLE public.negotiator_consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    negotiator_id UUID NOT NULL REFERENCES public.negotiators(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    city TEXT NOT NULL,
    country_id UUID REFERENCES public.countries(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. GESTION DES ORGANISATIONS
-- =============================================

-- Types d'organisations
CREATE TYPE organization_type AS ENUM (
    'public_national_institution',
    'international_organization',
    'regional_organization',
    'ngo_association',
    'private_sector'
);

-- Table des organisations
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    organization_type organization_type NOT NULL,
    logo_url TEXT,
    website TEXT,
    country_id UUID REFERENCES public.countries(id),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of UUID REFERENCES public.organizations(id),
    is_verified BOOLEAN DEFAULT FALSE, -- Organisation vérifiée par admin
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index simples pour les recherches
CREATE INDEX idx_organizations_name_lower ON public.organizations(LOWER(name));
CREATE INDEX idx_organizations_email ON public.organizations(email);
CREATE INDEX idx_organizations_is_active ON public.organizations(is_active);

-- Validation des organisations par les utilisateurs
CREATE TABLE public.organization_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    validated_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    validated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, validated_by)
);

-- Table des alias/variantes de noms d'organisations
CREATE TABLE public.organization_aliases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    alias_name TEXT NOT NULL,
    alias_normalized TEXT GENERATED ALWAYS AS (LOWER(TRIM(alias_name))) STORED,
    is_acronym BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, alias_normalized)
);

-- Index pour recherche rapide des alias
CREATE INDEX idx_org_aliases_normalized ON public.organization_aliases(alias_normalized);
CREATE INDEX idx_org_aliases_org ON public.organization_aliases(organization_id);

-- =============================================
-- 4. GESTION DES ÉVÉNEMENTS ET ACTIVITÉS
-- =============================================

-- Statuts des événements
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'suspended');
CREATE TYPE submission_status AS ENUM ('open', 'closed');
CREATE TYPE participation_mode AS ENUM ('online', 'hybrid', 'in_person');

-- Table des événements annuels
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    acronym TEXT,
    description TEXT NOT NULL,
    submission_deadline TIMESTAMPTZ NOT NULL,
    event_status event_status DEFAULT 'upcoming',
    submission_status submission_status DEFAULT 'open',
    banner_high_quality_32_9_url TEXT,
    banner_high_quality_16_9_url TEXT,
    banner_high_quality_1_1_url TEXT,
    banner_low_quality_32_9_url TEXT,
    banner_low_quality_16_9_url TEXT,
    banner_low_quality_1_1_url TEXT,
    participation_mode participation_mode NOT NULL,
    online_start_datetime TIMESTAMPTZ,
    online_end_datetime TIMESTAMPTZ,
    country_id UUID REFERENCES public.countries(id) NOT NULL,
    city TEXT NOT NULL,
    logo_url TEXT,
    address TEXT NOT NULL,,
    in_person_start_date DATE,
    in_person_end_date DATE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Contrainte pour s'assurer que les informations de localisation sont fournies pour les événements physiques
    CONSTRAINT check_location_for_physical_events CHECK (
        (participation_mode = 'online') 
        OR 
        (country_id IS NOT NULL AND city IS NOT NULL AND address IS NOT NULL)
    )
);

-- Types et catégories d'activités
CREATE TYPE activity_categories AS ENUM (
    'capacity_building',
    'results_sharing',
    'technological_innovation',
    'field_project',
    'best_practices',
    'awareness',
    'consultation'
);


CREATE TYPE activity_theme AS ENUM (
    'mitigation',
    'adaptation',
    'climate_resilience',
    'loss_and_damage',
    'clean_tech_innovations',
    'renewable_energy_land',
    'health_solidarity',
    'industry_transition',
    'transport_urbanization',
    'nature_oceans',
    'agriculture_food',
    'sustainable_livestock',
    'gender',
    'youth',
    'technology',
    'finance',
    'other'
);

-- Types d'activités
CREATE TYPE activity_type AS ENUM (
    'side_event',
    'country_day',
    'other'
);

CREATE TYPE activity_format AS ENUM ('online', 'in_person', 'hybrid');
CREATE TYPE validation_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled', 'live', 'completed');
CREATE TYPE activity_status AS ENUM ('live', 'completed', 'postponed');

-- Table des activités
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    submitted_by UUID NOT NULL REFERENCES public.users(id),
    activity_status activity_status DEFAULT NULL,
    title TEXT NOT NULL,
    -- acronym TEXT,
    country_id UUID REFERENCES public.countries(id),
    activity_type activity_type NOT NULL,
    objectives TEXT NOT NULL,
    detailed_presentation TEXT NOT NULL,
    format activity_format NOT NULL,
    main_themes activity_theme[] NOT NULL, -- Changé en tableau
    categories activity_categories[] NOT NULL, -- Changé en tableau
    proposed_start_date TIMESTAMPTZ NOT NULL,
    proposed_end_date TIMESTAMPTZ NOT NULL,
    final_start_date TIMESTAMPTZ,
    final_end_date TIMESTAMPTZ,
    validation_status validation_status DEFAULT 'draft',
    cover_image_high_url TEXT,
    cover_image_low_url TEXT,
    banner_url TEXT,
    zoom_meeting_id UUID, -- Lien vers la table zoom
    youtube_link TEXT,
    tags TEXT[], -- Tags stockés directement dans un tableau
    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.users(id),
    deleted_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Zoom pour stocker les informations de réunion
CREATE TABLE public.zoom_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id TEXT UNIQUE NOT NULL,
    registration_url TEXT,
    start_url TEXT,
    join_url TEXT,
    password TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des intervenants
CREATE TABLE public.activity_speakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    civility TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    position TEXT,
    organization TEXT,
    is_available_for_questions BOOLEAN DEFAULT TRUE, -- Disponibilité pour les questions
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pivot pour les connexions individuelles des intervenants
CREATE TABLE public.activity_speaker_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    speaker_id UUID NOT NULL REFERENCES public.activity_speakers(id) ON DELETE CASCADE,
    personal_join_url TEXT,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    last_joined_at TIMESTAMPTZ,
    UNIQUE(activity_id, speaker_id)
);

-- Table des inscriptions aux activités
CREATE TABLE public.activity_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    personal_join_url TEXT,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    attendance_duration INTEGER, -- en minutes
    UNIQUE(activity_id, user_id)
);

-- Documents supports des activités
CREATE TABLE public.activity_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES public.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historique des modifications d'activités (amélioré)
CREATE TABLE public.activity_modifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    old_value JSONB, -- Stockage flexible pour différents types
    new_value JSONB, -- Stockage flexible pour différents types
    old_value_type TEXT, -- 'text', 'date', 'array', etc.
    new_value_type TEXT,
    modified_by UUID REFERENCES public.users(id),
    modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions temps réel pendant les activités
CREATE TABLE public.activity_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    target_speakers UUID[], -- IDs des intervenants ciblés
    is_answered BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE, -- Pour modération
    is_disabled BOOLEAN DEFAULT FALSE, -- Question désactivée
    disabled_by UUID REFERENCES public.users(id), -- Qui a désactivé
    disabled_at TIMESTAMPTZ,
    disable_reason TEXT, -- Raison de la désactivation
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Réponses aux questions
CREATE TABLE public.activity_question_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.activity_questions(id) ON DELETE CASCADE,
    speaker_id UUID NOT NULL REFERENCES public.activity_speakers(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. ESPACE DE NÉGOCIATION CLIMATIQUE
-- =============================================

-- Types de sessions
CREATE TYPE session_category AS ENUM ('climate', 'biodiversity', 'desertification');

CREATE TYPE meeting_type AS ENUM ('Preparatory_Workshop', 'Francophone_Consultation', 'Innovation','Field_Training_Workshop');

-- Sessions de négociation
CREATE TABLE public.negotiation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    location TEXT,
    category session_category NOT NULL,
    is_ifdd_organized BOOLEAN DEFAULT TRUE,
    external_link TEXT,
    zoom_meeting_id UUID REFERENCES public.zoom_meetings(id),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inscriptions aux sessions
CREATE TABLE public.session_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.negotiation_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

-- Réunions de la Francophonie
CREATE TABLE public.francophonie_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    location TEXT,
    country_id UUID REFERENCES public.countries(id) NOT NULL,
    category session_category NOT NULL,
    meeting_type meeting_type NOT NULL,
    zoom_meeting_id UUID REFERENCES public.zoom_meetings(id),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inscriptions aux réunions de la Francophonie
CREATE TABLE public.francophonie_meeting_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.francophonie_meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);

-- Documents d'aide à la négociation
CREATE TYPE document_type AS ENUM ('negotiation_guide', 'technical_note', 'relevant_document', 'other');

CREATE TABLE public.negotiation_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    document_type document_type NOT NULL,
    category session_category NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. SYSTÈME DE RÉSEAUTAGE ET MESSAGERIE
-- =============================================

-- Demandes de connexion
CREATE TYPE connection_status_v2 AS ENUM ('pending', 'accepted', 'rejected', 'blocked', 'cancelled');

CREATE TABLE public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status connection_status_v2 DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, recipient_id)
);

-- Blocages et signalements
CREATE TABLE public.user_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- Messages instantanés
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groupes de messagerie
CREATE TABLE public.message_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membres des groupes
CREATE TABLE public.group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.message_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_admin BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Messages de groupe
CREATE TABLE public.group_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.message_groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rendez-vous
CREATE TYPE appointment_type AS ENUM ('video', 'audio', 'in_person');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    appointment_type appointment_type NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status appointment_status DEFAULT 'pending',
    meeting_link TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. FORMATIONS ET ÉVALUATIONS
-- =============================================

-- Table des formations
CREATE TYPE training_format AS ENUM ('online', 'hybrid');
CREATE TYPE training_category AS ENUM ('climate', 'desertification', 'biodiversity', 'other');

CREATE TABLE public.trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category training_category NOT NULL,
    format training_format NOT NULL,
    estimated_price DECIMAL(10, 2),
    target_audience TEXT NOT NULL,
    objectives TEXT[] NOT NULL, -- Objectifs de la formation
    methodology TEXT NOT NULL,
    banner_hd_url TEXT,
    banner_thumbnail_url TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des participants aux formations (pas seulement les négociateurs)
CREATE TABLE public.training_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress_percentage DECIMAL(5, 2) DEFAULT 0,
    certificate_url TEXT,
    UNIQUE(training_id, user_id)
);

-- Chapitres/Leçons
CREATE TABLE public.training_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(training_id, chapter_number)
);

-- Contenus des leçons
CREATE TABLE public.lesson_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES public.training_chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('document', 'video')),
    file_url TEXT,
    youtube_url TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progression des participants par chapitre/leçon
CREATE TABLE public.participant_chapter_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES public.training_participants(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES public.training_chapters(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    last_viewed_at TIMESTAMPTZ,
    minutes_watched INTEGER, -- Nombre de minutes visionnées (optionnel)
    UNIQUE(participant_id, chapter_id)
);

CREATE TABLE public.participant_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES public.training_participants(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lesson_contents(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    last_viewed_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    minutes_watched INTEGER, -- Nombre de minutes visionnées (optionnel)
    UNIQUE(participant_id, lesson_id)
);

-- Quiz temps réel
CREATE TABLE public.live_quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    allows_anonymous BOOLEAN DEFAULT FALSE, -- Permet les réponses anonymes
    time_limit_seconds INTEGER NOT NULL,
    scheduled_at TIMESTAMPTZ,
    question_order INTEGER[], -- Ordre des questions
    is_started BOOLEAN DEFAULT FALSE, -- Si le quiz a commencé
    started_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Souscriptions aux quiz (avant le démarrage)
CREATE TABLE public.quiz_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.live_quizzes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id), -- NULL si anonyme
    pseudo TEXT, -- Pseudo pour les participants anonymes
    display_name TEXT NOT NULL, -- Nom affiché (soit le nom de l'utilisateur, soit le pseudo)
    is_connected BOOLEAN DEFAULT TRUE, -- Si le participant est actuellement connecté
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    last_ping_at TIMESTAMPTZ DEFAULT NOW(), -- Pour détecter les déconnexions
    UNIQUE(quiz_id, user_id), -- Un utilisateur ne peut s'inscrire qu'une fois
    UNIQUE(quiz_id, pseudo), -- Un pseudo doit être unique par quiz
    CHECK ((user_id IS NOT NULL AND pseudo IS NULL) OR (user_id IS NULL AND pseudo IS NOT NULL))
);

-- Questions des quiz
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.live_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('multiple_choice', 'single_choice')),
    correct_answers TEXT[], -- Plusieurs bonnes réponses possibles
    options JSONB NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Réponses aux quiz
CREATE TABLE public.quiz_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.live_quizzes(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.quiz_subscriptions(id) ON DELETE CASCADE,
    answer TEXT[],
    is_correct BOOLEAN,
    response_time_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Résultats globaux des quiz
CREATE TABLE public.quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.live_quizzes(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.quiz_subscriptions(id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage DECIMAL(5, 2),
    total_time_seconds INTEGER,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(quiz_id, subscription_id)
);

-- Évaluations
CREATE TABLE public.evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    passing_score INTEGER NOT NULL DEFAULT 80,
    question_order INTEGER[], -- Ordre des questions
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions d'évaluation
CREATE TABLE public.evaluation_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('multiple_choice', 'open_ended')),
    correct_answers TEXT[], -- Plusieurs bonnes réponses possibles
    options JSONB,
    points INTEGER NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Réponses aux évaluations
CREATE TABLE public.evaluation_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.evaluation_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    answer TEXT[],
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Résultats des évaluations
CREATE TABLE public.evaluation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    percentage DECIMAL(5, 2),
    passed BOOLEAN,
    certificate_url TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. INNOVATIONS ET BONNES PRATIQUES
-- =============================================

-- Types de contenus
CREATE TYPE content_category AS ENUM ('innovation', 'best_practice');
CREATE TYPE application_sector AS ENUM ('agriculture', 'livestock', 'industry', 'other');

-- Table des innovations/bonnes pratiques
CREATE TABLE public.innovations_practices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    submitted_by UUID NOT NULL REFERENCES public.users(id),
    title TEXT NOT NULL,
    category content_category NOT NULL,
    cover_image_hd_16_9_url TEXT,
    cover_image_lg_16_9_url TEXT,
    cover_image_hd_1_1_url TEXT,
    cover_image_ld_1_1_url TEXT,
    youtube_video_url TEXT,
    preview_video_url TEXT,
    application_sector application_sector NOT NULL,
    detailed_description TEXT NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Types de contexte pour témoignages et commentaires
CREATE TYPE testimonial_context_type AS ENUM ('innovation_practice', 'training', 'event', 'platform');

-- Témoignages utilisateurs (multi-contexte)
CREATE TABLE public.user_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    photo_url TEXT,
    background_color TEXT,
    featured BOOLEAN DEFAULT FALSE,
    testimonial_text TEXT NOT NULL,
    context_type testimonial_context_type NOT NULL,
    context_id UUID, -- NULL si c'est pour la plateforme
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents techniques
CREATE TABLE public.technical_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    innovation_practice_id UUID NOT NULL REFERENCES public.innovations_practices(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Types de contexte pour commentaires
CREATE TYPE comment_context_type AS ENUM ('innovation_practice', 'training', 'event');

-- Commentaires publics (multi-contexte)
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    context_type comment_context_type NOT NULL,
    context_id UUID NOT NULL,
    is_moderated BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Système de notation
CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    innovation_practice_id UUID NOT NULL REFERENCES public.innovations_practices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(innovation_practice_id, user_id)
);

-- Types de réactions
CREATE TYPE reaction_type AS ENUM ('like', 'love', 'insightful', 'useful');

-- Réactions aux innovations/bonnes pratiques
CREATE TABLE public.innovation_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    innovation_practice_id UUID NOT NULL REFERENCES public.innovations_practices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    reaction_type reaction_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(innovation_practice_id, user_id, reaction_type)
);

-- =============================================
-- 9. FONCTIONNALITÉS MULTIMÉDIA
-- =============================================

-- Types de médias
CREATE TYPE media_type AS ENUM ('photo', 'video');
CREATE TYPE media_context AS ENUM ('training', 'activity', 'event');

-- Galerie multimédia
CREATE TABLE public.media_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_type media_type NOT NULL,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT,
    context_type media_context NOT NULL,
    context_id UUID NOT NULL,
    uploaded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Témoignages vidéo courts: nouvel element: detail_url et title
CREATE TABLE public.video_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detail_url TEXT NULL,
    title TEXT NULL, 
    context_type media_context NOT NULL,
    context_id UUID NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    duration_seconds INTEGER CHECK (duration_seconds <= 60),
    user_id UUID NOT NULL REFERENCES public.users(id),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. SYSTÈME DE NOTIFICATIONS
-- =============================================

-- Types de notifications
CREATE TYPE notification_type AS ENUM (
    'activity_validation',
    'connection_request',
    'message_received',
    'appointment_request',
    'training_reminder',
    'event_reminder',
    'system_announcement',
    'newsletter'
);

-- Table des notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de messages
CREATE TABLE public.message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    variables TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. OUTILS D'ADMINISTRATION
-- =============================================

-- Types de questions de sondage
CREATE TYPE poll_question_type AS ENUM ('text', 'multiple_choice', 'single_choice', 'yes_no', 'open_ended');

-- Sondages en temps réel
CREATE TABLE public.polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    question_type poll_question_type NOT NULL,
    options JSONB NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closes_at TIMESTAMPTZ
);

-- Réponses aux sondages
CREATE TABLE public.poll_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id), -- NULL si anonyme
    selected_options TEXT[], -- Pour supporter les choix multiples
    text_response TEXT, -- Pour les réponses ouvertes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Types de cibles pour newsletters
CREATE TYPE newsletter_target_type AS ENUM ('all_users', 'country', 'organization', 'message_group', 'activity', 'training', 'event');

-- Listes de newsletters
CREATE TABLE public.newsletter_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abonnements aux newsletters
CREATE TABLE public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID REFERENCES public.newsletter_lists(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT, -- Pour les non-utilisateurs
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    UNIQUE(list_id, user_id),
    UNIQUE(list_id, email)
);

-- Campagnes de newsletters
CREATE TABLE public.newsletter_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    target_type newsletter_target_type NOT NULL,
    target_id UUID, -- ID spécifique selon target_type
    target_list_id UUID REFERENCES public.newsletter_lists(id),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historique des emails automatiques
CREATE TABLE public.email_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES public.users(id),
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_id UUID REFERENCES public.message_templates(id),
    campaign_id UUID REFERENCES public.newsletter_campaigns(id),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('sent', 'failed', 'pending'))
);

-- =============================================
-- CONTRAINTES ET INDEX
-- =============================================

-- Index pour améliorer les performances
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_organization ON public.users(organization_id);
CREATE INDEX idx_users_country ON public.users(country_id);
CREATE INDEX idx_activities_event ON public.activities(event_id);
CREATE INDEX idx_activities_organization ON public.activities(organization_id);
CREATE INDEX idx_activities_validation_status ON public.activities(validation_status);
CREATE INDEX idx_activities_deleted ON public.activities(is_deleted);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id, is_read);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_connections_users ON public.connections(requester_id, recipient_id, status);
CREATE INDEX idx_negotiators_user ON public.negotiators(user_id);
CREATE INDEX idx_training_participants ON public.training_participants(training_id, user_id);
CREATE INDEX idx_comments_context ON public.comments(context_type, context_id);
CREATE INDEX idx_testimonials_context ON public.user_testimonials(context_type, context_id);
CREATE INDEX idx_events_country ON public.events(country_id);
CREATE INDEX idx_francophonie_meetings_country ON public.francophonie_meetings(country_id);
CREATE INDEX idx_francophonie_meetings_category ON public.francophonie_meetings(category);
CREATE INDEX idx_francophonie_meetings_dates ON public.francophonie_meetings(start_datetime, end_datetime);
CREATE INDEX idx_francophonie_meeting_registrations_meeting ON public.francophonie_meeting_registrations(meeting_id);
CREATE INDEX idx_francophonie_meeting_registrations_user ON public.francophonie_meeting_registrations(user_id);

-- Triggers pour mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON public.trainings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_innovations_practices_updated_at BEFORE UPDATE ON public.innovations_practices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_groups_updated_at BEFORE UPDATE ON public.message_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_francophonie_meetings_updated_at BEFORE UPDATE ON public.francophonie_meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour incrémenter le compteur de vues
CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.innovations_practices 
    SET view_count = view_count + 1
    WHERE id = NEW.innovation_practice_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- À appeler depuis l'application lors de la consultation d'une innovation

-- =============================================
-- POLITIQUES DE SÉCURITÉ RLS (Row Level Security)
-- =============================================

-- Activation RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.francophonie_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.francophonie_meeting_registrations ENABLE ROW LEVEL SECURITY;

-- Politiques pour les pays (lecture pour tous)
CREATE POLICY "Countries are viewable by all" ON public.countries
    FOR SELECT USING (true);

-- Politiques pour les rôles utilisateurs
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Politiques pour les utilisateurs
-- Politique spéciale pour l'inscription
CREATE POLICY "Allow users to insert their own profile during signup" 
ON public.users 
FOR INSERT 
WITH CHECK (
  -- Permettre l'insertion si l'ID correspond à l'utilisateur qui vient de s'authentifier
  auth.uid() = id
);

-- Politique pour la lecture du profil
CREATE POLICY "Users can read own profile" 
ON public.users 
FOR SELECT 
USING (
  auth.uid() = id OR
  -- Optionnel : permettre la lecture des profils publics
  (networking_visibility = true AND auth.role() = 'authenticated')
);

-- Politique pour la mise à jour
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique pour les administrateurs
CREATE POLICY "Admins can do everything" 
ON public.users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- Politiques pour les messages
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages to connections" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.connections 
            WHERE ((requester_id = auth.uid() AND recipient_id = messages.recipient_id) 
            OR (recipient_id = auth.uid() AND requester_id = messages.recipient_id))
            AND status = 'accepted'
        )
        AND NOT EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (is_blocked = TRUE OR is_suspended = TRUE)
        )
    );

-- Politiques pour les organisations
CREATE POLICY "public_view_organizations" ON public.organizations
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "authenticated_create_organizations" ON public.organizations
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()
    );

CREATE POLICY "creator_update_organizations" ON public.organizations
    FOR UPDATE 
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Politiques pour les événements publics
CREATE POLICY "Published events are viewable by all" ON public.events
    FOR SELECT USING (event_status != 'suspended');

CREATE POLICY "Only admins can create events" ON public.events
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    ) WITH CHECK (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Politiques pour les activités (mises à jour avec les corrections de fix_activities_update_policies.sql)
-- Politique SELECT (lecture)
CREATE POLICY "activities_select_policy" ON public.activities
    FOR SELECT USING (true); -- Tout le monde peut lire les activités

-- Politique INSERT (création)
CREATE POLICY "activities_insert_policy" ON public.activities
    FOR INSERT WITH CHECK (submitted_by = auth.uid());

-- Politique UPDATE (modification) - Corrigée pour résoudre les problèmes de permissions
CREATE POLICY "activities_update_policy" ON public.activities
    FOR UPDATE 
    USING (
        submitted_by = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    )
    WITH CHECK (
        submitted_by = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Politique DELETE (suppression)
CREATE POLICY "activities_delete_policy" ON public.activities
    FOR DELETE USING (
        submitted_by = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Politiques pour les inscriptions aux activités
CREATE POLICY "Users can view their own registrations" ON public.activity_registrations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can register to activities" ON public.activity_registrations
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politiques pour les questions d'activités
CREATE POLICY "Users can view activity questions" ON public.activity_questions
    FOR SELECT USING (is_visible = TRUE);

CREATE POLICY "Users can ask questions" ON public.activity_questions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politiques pour les participants aux formations
CREATE POLICY "Users can view their own training participation" ON public.training_participants
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can enroll in trainings" ON public.training_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politiques pour les commentaires
CREATE POLICY "Approved comments are viewable by all" ON public.comments
    FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "Users can create comments" ON public.comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politiques pour les témoignages
CREATE POLICY "Testimonials are viewable by all" ON public.user_testimonials
    FOR SELECT USING (true);

CREATE POLICY "Users can create testimonials" ON public.user_testimonials
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politiques pour les newsletters
CREATE POLICY "Users can manage their own subscriptions" ON public.newsletter_subscriptions
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour les réunions de la Francophonie
CREATE POLICY "Francophonie meetings are viewable by all authenticated users" ON public.francophonie_meetings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can create francophonie meetings" ON public.francophonie_meetings
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

CREATE POLICY "Users can update their own francophonie meetings" ON public.francophonie_meetings
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    ) WITH CHECK (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

CREATE POLICY "Users can delete their own francophonie meetings" ON public.francophonie_meetings
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Politiques pour les inscriptions aux réunions de la Francophonie
CREATE POLICY "Users can view their own francophonie meeting registrations" ON public.francophonie_meeting_registrations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all francophonie meeting registrations" ON public.francophonie_meeting_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

CREATE POLICY "Users can register to francophonie meetings" ON public.francophonie_meeting_registrations
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own francophonie meeting registrations" ON public.francophonie_meeting_registrations
    FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- FONCTIONS UTILITAIRES
-- =============================================

-- Fonction pour vérifier si un utilisateur a un rôle spécifique
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name user_role_type)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = $1 
        AND role = $2 
        AND is_active = TRUE
        AND (valid_until IS NULL OR valid_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour générer les tokens de recherche
CREATE OR REPLACE FUNCTION generate_search_tokens(input_text TEXT)
RETURNS TEXT[] AS $$
DECLARE
    tokens TEXT[];
    cleaned_text TEXT;
BEGIN
    -- Nettoyer le texte
    cleaned_text := LOWER(TRIM(input_text));
    
    -- Remplacer les caractères spéciaux par des espaces
    cleaned_text := REGEXP_REPLACE(cleaned_text, '[^a-z0-9à-ÿ]+', ' ', 'g');
    
    -- Diviser en mots
    tokens := STRING_TO_ARRAY(cleaned_text, ' ');
    
    -- Supprimer les mots vides et les doublons
    tokens := ARRAY(
        SELECT DISTINCT unnest(tokens) 
        WHERE LENGTH(unnest(tokens)) > 2
    );
    
    RETURN tokens;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour détecter les organisations en doublon
CREATE OR REPLACE FUNCTION check_organization_duplicate()
RETURNS TRIGGER AS $$
DECLARE
    similar_org RECORD;
    similarity_threshold FLOAT := 0.6;
BEGIN
    -- Générer les tokens de recherche
    NEW.name_search_tokens := generate_search_tokens(NEW.name);
    
    -- Recherche exacte d'abord (nom normalisé)
    SELECT id, name, 1.0 as score INTO similar_org
    FROM public.organizations
    WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND name_normalized = NEW.name_normalized
    AND is_active = TRUE
    AND is_duplicate = FALSE
    LIMIT 1;
    
    -- Si pas de correspondance exacte, recherche floue
    IF NOT FOUND THEN
        SELECT id, name, similarity(name, NEW.name) as score INTO similar_org
        FROM public.organizations
        WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND is_active = TRUE
        AND is_duplicate = FALSE
        AND similarity(name, NEW.name) > similarity_threshold
        ORDER BY similarity(name, NEW.name) DESC
        LIMIT 1;
    END IF;
    
    -- Si une organisation similaire est trouvée
    IF FOUND AND similar_org.score > similarity_threshold THEN
        -- Ne marquer comme doublon que si ce n'est pas vérifié
        IF NEW.is_verified = FALSE THEN
            NEW.is_duplicate = TRUE;
            NEW.duplicate_of = similar_org.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_org_duplicate_trigger
BEFORE INSERT OR UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION check_organization_duplicate();

-- Fonction de recherche d'organisations avec gestion des alias
-- Fonction de recherche simplifiée pour éviter les erreurs RLS
CREATE OR REPLACE FUNCTION search_organizations_simple(search_text TEXT)
RETURNS TABLE (
    organization_id UUID,
    name TEXT,
    organization_type organization_type,
    is_verified BOOLEAN
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Retourner directement les résultats sans logique complexe
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.organization_type,
        o.is_verified
    FROM organizations o
    WHERE 
        o.is_active = TRUE
        AND (
            o.name ILIKE '%' || search_text || '%'
            OR o.email ILIKE '%' || search_text || '%'
        )
    ORDER BY o.name
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Vue consolidée des organisations pour faciliter les requêtes
CREATE OR REPLACE VIEW public.v_organizations_consolidated AS
SELECT 
    o.id,
    o.name,
    o.name_normalized,
    o.email,
    o.organization_type,
    o.country_id,
    c.name_fr as country_name_fr,
    c.name_en as country_name_en,
    o.is_active,
    o.is_verified,
    o.is_duplicate,
    o.duplicate_of,
    parent_org.name as duplicate_of_name,
    COUNT(DISTINCT ov.validated_by) as validation_count,
    COUNT(DISTINCT oa.id) as alias_count,
    ARRAY_AGG(DISTINCT oa.alias_name) FILTER (WHERE oa.alias_name IS NOT NULL) as aliases,
    o.created_at,
    o.updated_at
FROM public.organizations o
LEFT JOIN public.countries c ON o.country_id = c.id
LEFT JOIN public.organizations parent_org ON o.duplicate_of = parent_org.id
LEFT JOIN public.organization_validations ov ON o.id = ov.organization_id
LEFT JOIN public.organization_aliases oa ON o.id = oa.organization_id
GROUP BY 
    o.id, o.name, o.name_normalized, o.email, o.organization_type, 
    o.country_id, c.name_fr, c.name_en, o.is_active, o.is_verified, 
    o.is_duplicate, o.duplicate_of, parent_org.name, o.created_at, o.updated_at;

-- Fonction pour obtenir le nombre total de désignations d'un négociateur
CREATE OR REPLACE FUNCTION update_negotiator_designation_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.negotiators 
    SET total_designations = (
        SELECT COUNT(*) FROM public.negotiators WHERE user_id = NEW.user_id
    )
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_designation_count_trigger
AFTER INSERT ON public.negotiators
FOR EACH ROW EXECUTE FUNCTION update_negotiator_designation_count();

-- Fonction pour gérer l'inscription automatique des nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    country_id,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    null, -- country_id sera mis à jour plus tard
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users pour l'inscription automatique
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- DONNÉES INITIALES
-- =============================================

-- Insertion des templates de messages par défaut
INSERT INTO public.message_templates (name, subject, body, variables) VALUES
('activity_approved', 'Votre activité a été approuvée', 'Bonjour {first_name},\n\nNous avons le plaisir de vous informer que votre activité "{activity_title}" a été approuvée.\n\nCordialement,\nL''équipe ePavilion', ARRAY['first_name', 'activity_title']),
('activity_rejected', 'Votre activité n''a pas été retenue', 'Bonjour {first_name},\n\nNous regrettons de vous informer que votre activité "{activity_title}" n''a pas été retenue.\n\nRaison: {reason}\n\nCordialement,\nL''équipe ePavilion', ARRAY['first_name', 'activity_title', 'reason']),
('connection_request', 'Nouvelle demande de connexion', 'Bonjour {first_name},\n\n{requester_name} souhaite se connecter avec vous sur ePavilion.\n\nCordialement,\nL''équipe ePavilion', ARRAY['first_name', 'requester_name']),
('newsletter_subscription', 'Inscription à la newsletter confirmée', 'Bonjour {first_name},\n\nVotre inscription à la newsletter "{newsletter_name}" a été confirmée.\n\nCordialement,\nL''équipe ePavilion', ARRAY['first_name', 'newsletter_name']),
('activity_reminder', 'Rappel: Votre activité commence bientôt', 'Bonjour {first_name},\n\nRappel: L''activité "{activity_title}" commence dans {time_until}.\n\nLien de connexion: {join_link}\n\nCordialement,\nL''équipe ePavilion', ARRAY['first_name', 'activity_title', 'time_until', 'join_link'])
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- COMMENTAIRES DE DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.users IS 'Table principale des utilisateurs étendant auth.users de Supabase avec gestion de blocage/suspension';
COMMENT ON TABLE public.countries IS 'Table de référence des pays pour éviter les redondances';
COMMENT ON TABLE public.organizations IS 'Organisations partenaires avec détection de doublons et gestion des alias';
COMMENT ON TABLE public.organization_aliases IS 'Alias et variantes de noms pour les organisations (acronymes, noms alternatifs)';
COMMENT ON FUNCTION search_organizations IS 'Recherche intelligente d''organisations avec gestion des alias et recherche floue';
COMMENT ON VIEW public.v_organizations_consolidated IS 'Vue consolidée des organisations avec toutes leurs informations et relations';
COMMENT ON TABLE public.events IS 'Événements annuels organisés par l''IFDD';
COMMENT ON TABLE public.activities IS 'Activités soumises avec support de soft delete et tags';
COMMENT ON TABLE public.negotiators IS 'Informations spécifiques aux négociateurs climatiques';
COMMENT ON TABLE public.trainings IS 'Formations en ligne ouvertes à tous les utilisateurs';
COMMENT ON TABLE public.training_participants IS 'Participants aux formations (pas seulement négociateurs)';
COMMENT ON TABLE public.innovations_practices IS 'Innovations et bonnes pratiques avec compteur de vues et réactions';
COMMENT ON TABLE public.zoom_meetings IS 'Informations des réunions Zoom pour activités et sessions';
COMMENT ON TABLE public.activity_registrations IS 'Inscriptions des utilisateurs aux activités';
COMMENT ON TABLE public.activity_questions IS 'Questions en temps réel pendant les activités';
COMMENT ON TABLE public.newsletter_lists IS 'Listes de diffusion pour newsletters ciblées';
COMMENT ON TABLE public.poll_responses IS 'Réponses aux sondages avec support anonyme';
COMMENT ON COLUMN public.events.country_id IS 'Pays où se déroule l''événement (référence vers la table countries)';
COMMENT ON COLUMN public.events.city IS 'Ville où se déroule l''événement';
COMMENT ON COLUMN public.events.address IS 'Adresse complète de l''événement';
COMMENT ON TABLE public.francophonie_meetings IS 'Réunions de la Francophonie avec localisation et support Zoom';
COMMENT ON TABLE public.francophonie_meeting_registrations IS 'Inscriptions des utilisateurs aux réunions de la Francophonie';
COMMENT ON COLUMN public.francophonie_meetings.country_id IS 'Pays où se déroule la réunion (référence obligatoire vers la table countries)';
COMMENT ON COLUMN public.francophonie_meetings.category IS 'Catégorie de la réunion (climate, biodiversity, desertification)';
COMMENT ON COLUMN public.francophonie_meetings.zoom_meeting_id IS 'Référence optionnelle vers les informations Zoom si la réunion est en ligne';