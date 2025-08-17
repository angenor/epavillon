-- Migration pour permettre l'accès public aux profils avec networking_visibility = true
-- Fichier: enable_public_profiles_policy.sql

-- Supprimer les anciennes politiques restrictives pour les profils publics
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;

-- Créer une nouvelle politique pour permettre l'accès public aux profils avec networking_visibility = true
CREATE POLICY "Public profiles are viewable by everyone" ON users
    FOR SELECT
    USING (
        networking_visibility = true 
        AND is_blocked = false 
        AND is_suspended = false
    );

-- Politique pour permettre aux utilisateurs de voir leur propre profil complet
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Politique pour les organisations (accès public en lecture)
DROP POLICY IF EXISTS "Public organizations are viewable" ON organizations;
CREATE POLICY "Public organizations are viewable" ON organizations
    FOR SELECT
    USING (is_active = true);

-- Politique pour les pays (accès public en lecture)
DROP POLICY IF EXISTS "Public countries are viewable" ON countries;
CREATE POLICY "Public countries are viewable" ON countries
    FOR SELECT
    USING (true); -- Tous les pays sont publics

-- Politique pour les rôles utilisateur (accès public pour les profils publics)
DROP POLICY IF EXISTS "Public user roles are viewable" ON user_roles;
CREATE POLICY "Public user roles are viewable" ON user_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_roles.user_id 
            AND users.networking_visibility = true 
            AND users.is_blocked = false 
            AND users.is_suspended = false
        ) OR auth.uid() = user_id
    );

-- Politique pour les données de négociateurs (accès public pour les profils publics)
DROP POLICY IF EXISTS "Public negotiators are viewable" ON negotiators;
CREATE POLICY "Public negotiators are viewable" ON negotiators
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = negotiators.user_id 
            AND users.networking_visibility = true 
            AND users.is_blocked = false 
            AND users.is_suspended = false
        ) OR auth.uid() = user_id
    );

-- Politique pour les activités (accès public pour les activités approuvées)
DROP POLICY IF EXISTS "Public activities are viewable" ON activities;
CREATE POLICY "Public activities are viewable" ON activities
    FOR SELECT
    USING (
        validation_status = 'approved' 
        AND is_deleted = false
        AND (
            EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = activities.submitted_by 
                AND users.networking_visibility = true 
                AND users.is_blocked = false 
                AND users.is_suspended = false
            ) OR auth.uid() = submitted_by
        )
    );

-- Politique pour les formations (accès public pour les formations actives)
DROP POLICY IF EXISTS "Public trainings are viewable" ON trainings;
CREATE POLICY "Public trainings are viewable" ON trainings
    FOR SELECT
    USING (
        is_active = true
        AND (
            EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = trainings.created_by 
                AND users.networking_visibility = true 
                AND users.is_blocked = false 
                AND users.is_suspended = false
            ) OR auth.uid() = created_by
        )
    );

-- Politique pour les connexions (gestion des demandes de connexion)
DROP POLICY IF EXISTS "Users can manage their connections" ON connections;
CREATE POLICY "Users can manage their connections" ON connections
    FOR ALL
    USING (
        auth.uid() = requester_id OR auth.uid() = recipient_id
    );

-- Politique pour les notifications (accès privé uniquement)
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
CREATE POLICY "Users can view their notifications" ON notifications
    FOR ALL
    USING (auth.uid() = user_id);

-- Mise à jour des commentaires de documentation
COMMENT ON POLICY "Public profiles are viewable by everyone" ON users IS 
'Permet l''accès public aux profils avec networking_visibility=true, non bloqués et non suspendus';

COMMENT ON POLICY "Public organizations are viewable" ON organizations IS 
'Permet l''accès public en lecture aux organisations actives';

COMMENT ON POLICY "Public countries are viewable" ON countries IS 
'Permet l''accès public en lecture à tous les pays';

COMMENT ON POLICY "Public user roles are viewable" ON user_roles IS 
'Permet l''accès aux rôles pour les profils publics ou propriétaires';

COMMENT ON POLICY "Public negotiators are viewable" ON negotiators IS 
'Permet l''accès aux données de négociateurs pour les profils publics';

COMMENT ON POLICY "Public activities are viewable" ON activities IS 
'Permet l''accès aux activités approuvées des profils publics';

COMMENT ON POLICY "Public trainings are viewable" ON trainings IS 
'Permet l''accès aux formations actives des profils publics';