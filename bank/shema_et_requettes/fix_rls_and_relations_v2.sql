-- =============================================
-- Correction des problèmes de relations et politiques RLS (Version 2)
-- Script sécurisé qui vérifie l'existence des politiques
-- =============================================

-- 1. AJOUT DE LA CONTRAINTE MANQUANTE pour organization_id
-- (si elle n'existe pas déjà)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_organization_id_fkey'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT users_organization_id_fkey 
        FOREIGN KEY (organization_id) 
        REFERENCES public.organizations(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. SUPPRIMER TOUTES LES POLITIQUES EXISTANTES pour la table users
-- Liste exhaustive de toutes les politiques possibles
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Supprimer toutes les politiques existantes pour la table users
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
    END LOOP;
END $$;

-- 3. CRÉER DES POLITIQUES RLS SIMPLES ET NON-RÉCURSIVES

-- Politique pour l'accès public en lecture (TOUS les utilisateurs inscrits sont visibles)
CREATE POLICY "All registered users are publicly viewable" ON users
    FOR SELECT
    USING (
        -- Tous les utilisateurs non bloqués et non suspendus sont visibles
        is_blocked = false 
        AND is_suspended = false
    );

-- Politique pour que les utilisateurs puissent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Politique pour l'insertion (lors de l'inscription)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Politique pour la suppression (seulement pour les admins ou le propriétaire)
CREATE POLICY "Users can delete own profile" ON users
    FOR DELETE
    USING (auth.uid() = id);

-- 4. POLITIQUES POUR LES TABLES LIÉES

-- Organizations - Supprimer et recréer
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'organizations' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.organizations', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Organizations are publicly viewable" ON organizations
    FOR SELECT
    USING (is_active = true);

-- Countries - Supprimer et recréer
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'countries' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.countries', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Countries are publicly viewable" ON countries
    FOR SELECT
    USING (true);

-- User roles - Supprimer et recréer
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_roles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "User roles are publicly viewable" ON user_roles
    FOR SELECT
    USING (is_active = true);

-- Negotiators - Supprimer et recréer
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'negotiators' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.negotiators', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Negotiators are publicly viewable" ON negotiators
    FOR SELECT
    USING (true);

-- Activities - Supprimer et recréer si la table existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'activities' 
        AND table_schema = 'public'
    ) THEN
        -- Supprimer les anciennes politiques
        FOR pol IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE tablename = 'activities' 
            AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.activities', pol.policyname);
        END LOOP;
        
        -- Créer la nouvelle politique
        CREATE POLICY "Approved activities are publicly viewable" ON activities
            FOR SELECT
            USING (
                validation_status = 'approved' 
                AND is_deleted = false
            );
    END IF;
END $$;

-- Trainings - Supprimer et recréer si la table existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'trainings' 
        AND table_schema = 'public'
    ) THEN
        -- Supprimer les anciennes politiques
        FOR pol IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE tablename = 'trainings' 
            AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.trainings', pol.policyname);
        END LOOP;
        
        -- Créer la nouvelle politique
        CREATE POLICY "Active trainings are publicly viewable" ON trainings
            FOR SELECT
            USING (is_active = true);
    END IF;
END $$;

-- 5. ACTIVER RLS SUR TOUTES LES TABLES CONCERNÉES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiators ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur activities et trainings si elles existent
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'activities' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'trainings' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 6. CRÉER DES INDEX POUR AMÉLIORER LES PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_country_id ON users(country_id);
CREATE INDEX IF NOT EXISTS idx_users_blocked_suspended ON users(is_blocked, is_suspended);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);

-- 7. AFFICHER UN MESSAGE DE CONFIRMATION
DO $$ 
BEGIN
    RAISE NOTICE 'Politiques RLS mises à jour avec succès!';
    RAISE NOTICE 'Tous les utilisateurs non bloqués sont maintenant visibles publiquement.';
END $$;

-- 8. VÉRIFICATION - Afficher les politiques créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'organizations', 'countries', 'user_roles', 'negotiators')
ORDER BY tablename, policyname;