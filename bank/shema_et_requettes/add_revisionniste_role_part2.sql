-- =============================================
-- MIGRATION PARTIE 2: Système de révision complet
-- Date: 2025-10-09
-- Description: Ajoute les tables et politiques pour le système de révision
-- PRÉREQUIS: add_revisionniste_role_part1.sql doit avoir été exécuté
-- =============================================

-- =============================================
-- 1. TABLE DES COMMENTAIRES DE RÉVISION
-- =============================================

-- Table pour les commentaires de révision sur les activités non validées
CREATE TABLE IF NOT EXISTS public.revision_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    -- Destinataires du commentaire (révisionnistes et/ou soumissionnaire)
    shared_with_revisionists UUID[], -- Liste des IDs des révisionnistes
    shared_with_submitter BOOLEAN DEFAULT FALSE, -- Si partagé avec le soumissionnaire
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
    -- Note: La validation du rôle révisionniste est gérée par les politiques RLS
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_revision_comments_activity ON public.revision_comments(activity_id);
CREATE INDEX IF NOT EXISTS idx_revision_comments_created_by ON public.revision_comments(created_by);
CREATE INDEX IF NOT EXISTS idx_revision_comments_created_at ON public.revision_comments(created_at DESC);

-- Trigger pour mise à jour automatique de updated_at
CREATE TRIGGER update_revision_comments_updated_at
BEFORE UPDATE ON public.revision_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 2. TABLE DES ACTIVITÉS VUES PAR LES RÉVISIONNISTES
-- =============================================

-- Table pour suivre quelles activités ont été vues par quels révisionnistes
CREATE TABLE IF NOT EXISTS public.revisionniste_activity_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    revisionniste_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    first_viewed_at TIMESTAMPTZ DEFAULT NOW(),
    last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
    view_count INTEGER DEFAULT 1,
    -- Contrainte unique: un révisionniste ne peut avoir qu'un seul enregistrement par activité
    UNIQUE(activity_id, revisionniste_id)
    -- Note: La validation du rôle révisionniste est gérée par les politiques RLS
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_revisionniste_views_activity ON public.revisionniste_activity_views(activity_id);
CREATE INDEX IF NOT EXISTS idx_revisionniste_views_user ON public.revisionniste_activity_views(revisionniste_id);
CREATE INDEX IF NOT EXISTS idx_revisionniste_views_last_viewed ON public.revisionniste_activity_views(last_viewed_at DESC);

-- =============================================
-- 3. TABLE DES NOTES DES ACTIVITÉS
-- =============================================

-- Table pour les notes attribuées par les révisionnistes
CREATE TABLE IF NOT EXISTS public.activity_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    revisionniste_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating DECIMAL(4,2) NOT NULL CHECK (rating >= 0 AND rating <= 20), -- Note sur 20
    comment TEXT, -- Commentaire optionnel accompagnant la note
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Contrainte unique: un révisionniste ne peut donner qu'une seule note par activité
    UNIQUE(activity_id, revisionniste_id)
    -- Note: La validation du rôle révisionniste est gérée par les politiques RLS
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_activity_ratings_activity ON public.activity_ratings(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_ratings_revisionniste ON public.activity_ratings(revisionniste_id);
CREATE INDEX IF NOT EXISTS idx_activity_ratings_rating ON public.activity_ratings(rating DESC);
CREATE INDEX IF NOT EXISTS idx_activity_ratings_created_at ON public.activity_ratings(created_at DESC);

-- Trigger pour mise à jour automatique de updated_at
CREATE TRIGGER update_activity_ratings_updated_at
BEFORE UPDATE ON public.activity_ratings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. FONCTION POUR CALCULER LA NOTE MOYENNE D'UNE ACTIVITÉ
-- =============================================

CREATE OR REPLACE FUNCTION get_activity_average_rating(activity_uuid UUID)
RETURNS TABLE (
    average_rating DECIMAL(4,2),
    total_ratings INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(AVG(rating), 0)::DECIMAL(4,2) as average_rating,
        COUNT(*)::INTEGER as total_ratings
    FROM public.activity_ratings
    WHERE activity_id = activity_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. FONCTION POUR ENREGISTRER/METTRE À JOUR UNE VUE D'ACTIVITÉ
-- =============================================

CREATE OR REPLACE FUNCTION record_activity_view(
    p_activity_id UUID,
    p_revisionniste_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Insérer ou mettre à jour l'enregistrement de vue
    INSERT INTO public.revisionniste_activity_views (
        activity_id,
        revisionniste_id,
        first_viewed_at,
        last_viewed_at,
        view_count
    )
    VALUES (
        p_activity_id,
        p_revisionniste_id,
        NOW(),
        NOW(),
        1
    )
    ON CONFLICT (activity_id, revisionniste_id)
    DO UPDATE SET
        last_viewed_at = NOW(),
        view_count = public.revisionniste_activity_views.view_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. VUE POUR FACILITER LES REQUÊTES DE CLASSEMENT
-- =============================================

-- Vue pour obtenir les activités avec leurs notes moyennes et classement
CREATE OR REPLACE VIEW public.v_activities_with_ratings AS
SELECT
    a.id as activity_id,
    a.title,
    a.event_id,
    a.organization_id,
    a.submitted_by,
    a.validation_status,
    a.created_at,
    COALESCE(AVG(ar.rating), 0) as average_rating,
    COUNT(ar.id) as total_ratings,
    -- Classement basé sur la note moyenne (ordre décroissant)
    RANK() OVER (PARTITION BY a.event_id ORDER BY COALESCE(AVG(ar.rating), 0) DESC) as ranking_by_rating
FROM public.activities a
LEFT JOIN public.activity_ratings ar ON a.id = ar.activity_id
GROUP BY a.id, a.title, a.event_id, a.organization_id, a.submitted_by, a.validation_status, a.created_at;

-- =============================================
-- 7. POLITIQUES RLS (ROW LEVEL SECURITY)
-- =============================================

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.revision_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisionniste_activity_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_ratings ENABLE ROW LEVEL SECURITY;

-- Politiques pour revision_comments
-- Les révisionnistes peuvent voir les commentaires qui leur sont destinés
CREATE POLICY "Revisionists can view shared comments" ON public.revision_comments
    FOR SELECT USING (
        auth.uid() = ANY(shared_with_revisionists)
        OR (shared_with_submitter = true AND auth.uid() IN (
            SELECT submitted_by FROM public.activities WHERE id = activity_id
        ))
        OR auth.uid() = created_by
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Les révisionnistes peuvent créer des commentaires
CREATE POLICY "Revisionists can create comments" ON public.revision_comments
    FOR INSERT WITH CHECK (
        created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'revisionniste'
            AND is_active = true
        )
    );

-- Les révisionnistes peuvent modifier leurs propres commentaires
CREATE POLICY "Revisionists can update own comments" ON public.revision_comments
    FOR UPDATE USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Les révisionnistes peuvent supprimer leurs propres commentaires
CREATE POLICY "Revisionists can delete own comments" ON public.revision_comments
    FOR DELETE USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Politiques pour revisionniste_activity_views
-- Les révisionnistes peuvent voir leurs propres vues
CREATE POLICY "Revisionists can view own activity views" ON public.revisionniste_activity_views
    FOR SELECT USING (
        revisionniste_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Les révisionnistes peuvent enregistrer leurs vues
CREATE POLICY "Revisionists can record activity views" ON public.revisionniste_activity_views
    FOR INSERT WITH CHECK (
        revisionniste_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'revisionniste'
            AND is_active = true
        )
    );

-- Les révisionnistes peuvent mettre à jour leurs vues
CREATE POLICY "Revisionists can update own activity views" ON public.revisionniste_activity_views
    FOR UPDATE USING (revisionniste_id = auth.uid())
    WITH CHECK (revisionniste_id = auth.uid());

-- Politiques pour activity_ratings
-- Tout le monde peut voir les notes (pour classement public)
CREATE POLICY "Everyone can view activity ratings" ON public.activity_ratings
    FOR SELECT USING (true);

-- Les révisionnistes peuvent créer des notes
CREATE POLICY "Revisionists can create ratings" ON public.activity_ratings
    FOR INSERT WITH CHECK (
        revisionniste_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'revisionniste'
            AND is_active = true
        )
    );

-- Les révisionnistes peuvent modifier leurs propres notes
CREATE POLICY "Revisionists can update own ratings" ON public.activity_ratings
    FOR UPDATE USING (revisionniste_id = auth.uid())
    WITH CHECK (revisionniste_id = auth.uid());

-- Les révisionnistes peuvent supprimer leurs propres notes
CREATE POLICY "Revisionists can delete own ratings" ON public.activity_ratings
    FOR DELETE USING (
        revisionniste_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- =============================================
-- 8. MISE À JOUR DE LA POLITIQUE DES ACTIVITÉS
-- =============================================

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "activities_select_policy" ON public.activities;

-- Créer la nouvelle politique qui inclut les révisionnistes
CREATE POLICY "activities_select_policy" ON public.activities
    FOR SELECT USING (
        -- Tout le monde peut lire les activités publiques
        validation_status IN ('approved', 'live', 'completed')
        -- Les révisionnistes peuvent voir les activités soumises mais non validées
        OR (validation_status IN ('submitted', 'under_review')
            AND EXISTS (
                SELECT 1 FROM public.user_roles
                WHERE user_id = auth.uid()
                AND role = 'revisionniste'
                AND is_active = true
            ))
        -- Les utilisateurs peuvent voir leurs propres activités
        OR submitted_by = auth.uid()
        -- Les admins peuvent tout voir
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- =============================================
-- 9. COMMENTAIRES DE DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.revision_comments IS 'Commentaires de révision sur les activités non validées, partagés entre révisionnistes et/ou soumissionnaires';
COMMENT ON TABLE public.revisionniste_activity_views IS 'Suivi des activités vues par les révisionnistes pour éviter les doublons de consultation';
COMMENT ON TABLE public.activity_ratings IS 'Notes sur 20 attribuées par les révisionnistes pour classer les activités';
COMMENT ON VIEW public.v_activities_with_ratings IS 'Vue consolidée des activités avec leurs notes moyennes et classement';
COMMENT ON FUNCTION get_activity_average_rating IS 'Calcule la note moyenne et le nombre total de notes pour une activité';
COMMENT ON FUNCTION record_activity_view IS 'Enregistre ou met à jour la vue d''une activité par un révisionniste';

-- =============================================
-- FIN DE LA MIGRATION PARTIE 2
-- =============================================