-- =============================================
-- Correction des problèmes de relations et politiques RLS
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

-- 2. SUPPRIMER TOUTES LES ANCIENNES POLITIQUES RLS pour éviter la récursion
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can manage their own profile" ON users;

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

-- Organizations - Accès public en lecture
DROP POLICY IF EXISTS "Public organizations are viewable" ON organizations;
CREATE POLICY "Organizations are publicly viewable" ON organizations
    FOR SELECT
    USING (is_active = true);

-- Countries - Accès public en lecture
DROP POLICY IF EXISTS "Public countries are viewable" ON countries;
CREATE POLICY "Countries are publicly viewable" ON countries
    FOR SELECT
    USING (true);

-- User roles - Accès public pour les profils publics
DROP POLICY IF EXISTS "Public user roles are viewable" ON user_roles;
CREATE POLICY "User roles are publicly viewable" ON user_roles
    FOR SELECT
    USING (
        is_active = true
    );

-- Negotiators - Accès public
DROP POLICY IF EXISTS "Public negotiators are viewable" ON negotiators;
CREATE POLICY "Negotiators are publicly viewable" ON negotiators
    FOR SELECT
    USING (true);

-- Activities - Accès public pour les activités approuvées
DROP POLICY IF EXISTS "Public activities are viewable" ON activities;
CREATE POLICY "Approved activities are publicly viewable" ON activities
    FOR SELECT
    USING (
        validation_status = 'approved' 
        AND is_deleted = false
    );

-- Trainings - Accès public pour les formations actives
DROP POLICY IF EXISTS "Public trainings are viewable" ON trainings;
CREATE POLICY "Active trainings are publicly viewable" ON trainings
    FOR SELECT
    USING (
        is_active = true
    );

-- 5. ACTIVER RLS SUR TOUTES LES TABLES CONCERNÉES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiators ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

-- 6. CRÉER DES INDEX POUR AMÉLIORER LES PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_country_id ON users(country_id);
CREATE INDEX IF NOT EXISTS idx_users_blocked_suspended ON users(is_blocked, is_suspended);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);

-- 7. COMMENTAIRES DE DOCUMENTATION
COMMENT ON POLICY "All registered users are publicly viewable" ON users IS 
'Permet l''accès public à tous les utilisateurs inscrits non bloqués et non suspendus';

COMMENT ON POLICY "Organizations are publicly viewable" ON organizations IS 
'Permet l''accès public en lecture aux organisations actives';

COMMENT ON POLICY "Countries are publicly viewable" ON countries IS 
'Permet l''accès public en lecture à tous les pays';

COMMENT ON POLICY "User roles are publicly viewable" ON user_roles IS 
'Permet l''accès public aux rôles actifs';

COMMENT ON POLICY "Negotiators are publicly viewable" ON negotiators IS 
'Permet l''accès public aux données de négociateurs';

COMMENT ON POLICY "Approved activities are publicly viewable" ON activities IS 
'Permet l''accès public aux activités approuvées';

COMMENT ON POLICY "Active trainings are publicly viewable" ON trainings IS 
'Permet l''accès public aux formations actives';