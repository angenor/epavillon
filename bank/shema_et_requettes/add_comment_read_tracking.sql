-- =============================================
-- MIGRATION: Système de suivi de lecture des commentaires
-- Date: 2025-10-10
-- Description: Ajoute une table pour suivre quels commentaires ont été lus par quels révisionnistes
-- PRÉREQUIS: add_revisionniste_role_part2.sql doit avoir été exécuté
-- =============================================

-- =============================================
-- 1. TABLE DE SUIVI DES COMMENTAIRES LUS
-- =============================================

-- Table pour suivre quels commentaires ont été lus par quels révisionnistes
CREATE TABLE IF NOT EXISTS public.revision_comment_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES public.revision_comments(id) ON DELETE CASCADE,
    revisionniste_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    -- Contrainte unique: un révisionniste ne peut avoir qu'un seul enregistrement de lecture par commentaire
    UNIQUE(comment_id, revisionniste_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_comment_reads_comment ON public.revision_comment_reads(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reads_user ON public.revision_comment_reads(revisionniste_id);
CREATE INDEX IF NOT EXISTS idx_comment_reads_read_at ON public.revision_comment_reads(read_at DESC);

-- =============================================
-- 2. FONCTION POUR MARQUER UN COMMENTAIRE COMME LU
-- =============================================

CREATE OR REPLACE FUNCTION mark_comment_as_read(
    p_comment_id UUID,
    p_revisionniste_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Insérer l'enregistrement de lecture (ignore si déjà existant)
    INSERT INTO public.revision_comment_reads (
        comment_id,
        revisionniste_id,
        read_at
    )
    VALUES (
        p_comment_id,
        p_revisionniste_id,
        NOW()
    )
    ON CONFLICT (comment_id, revisionniste_id) DO NOTHING;
    -- On ne met pas à jour read_at si déjà lu, on garde la première lecture
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. FONCTION POUR MARQUER TOUS LES COMMENTAIRES D'UNE ACTIVITÉ COMME LUS
-- =============================================

CREATE OR REPLACE FUNCTION mark_activity_comments_as_read(
    p_activity_id UUID,
    p_revisionniste_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Marquer tous les commentaires de l'activité comme lus
    INSERT INTO public.revision_comment_reads (comment_id, revisionniste_id, read_at)
    SELECT
        rc.id as comment_id,
        p_revisionniste_id,
        NOW()
    FROM public.revision_comments rc
    WHERE rc.activity_id = p_activity_id
      AND (
          -- Commentaire partagé avec ce révisionniste
          p_revisionniste_id = ANY(rc.shared_with_revisionists)
          -- Ou commentaire créé par ce révisionniste
          OR rc.created_by = p_revisionniste_id
      )
    ON CONFLICT (comment_id, revisionniste_id) DO NOTHING;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. VUE POUR FACILITER LES REQUÊTES DE COMMENTAIRES NON LUS
-- =============================================

-- Vue pour obtenir le nombre de commentaires non lus par révisionniste et par activité
CREATE OR REPLACE VIEW public.v_unread_comments_by_activity AS
SELECT
    rc.activity_id,
    ur.user_id as revisionniste_id,
    COUNT(DISTINCT rc.id) as unread_count
FROM public.revision_comments rc
CROSS JOIN (
    -- Tous les révisionnistes actifs
    SELECT DISTINCT user_id
    FROM public.user_roles
    WHERE role = 'revisionniste' AND is_active = true
) ur
WHERE (
    -- Commentaires partagés avec le révisionniste
    ur.user_id = ANY(rc.shared_with_revisionists)
    -- Ou commentaires créés par le révisionniste (pour voir ses propres commentaires)
    OR rc.created_by = ur.user_id
)
-- Exclure les commentaires déjà lus
AND NOT EXISTS (
    SELECT 1 FROM public.revision_comment_reads rcr
    WHERE rcr.comment_id = rc.id
      AND rcr.revisionniste_id = ur.user_id
)
GROUP BY rc.activity_id, ur.user_id;

-- Vue pour obtenir les détails des commentaires avec statut de lecture
CREATE OR REPLACE VIEW public.v_comments_with_read_status AS
SELECT
    rc.*,
    CASE
        WHEN rcr.id IS NOT NULL THEN true
        ELSE false
    END as is_read,
    rcr.read_at
FROM public.revision_comments rc
LEFT JOIN public.revision_comment_reads rcr
    ON rc.id = rcr.comment_id
    AND rcr.revisionniste_id = auth.uid();

-- =============================================
-- 5. POLITIQUES RLS (ROW LEVEL SECURITY)
-- =============================================

-- Activer RLS sur la nouvelle table
ALTER TABLE public.revision_comment_reads ENABLE ROW LEVEL SECURITY;

-- Les révisionnistes peuvent voir leurs propres lectures
CREATE POLICY "Revisionists can view own comment reads" ON public.revision_comment_reads
    FOR SELECT USING (
        revisionniste_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Les révisionnistes peuvent enregistrer leurs lectures
CREATE POLICY "Revisionists can record comment reads" ON public.revision_comment_reads
    FOR INSERT WITH CHECK (
        revisionniste_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'revisionniste'
            AND is_active = true
        )
    );

-- Les admins peuvent supprimer les enregistrements de lecture
CREATE POLICY "Admins can delete comment reads" ON public.revision_comment_reads
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- =============================================
-- 6. COMMENTAIRES DE DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.revision_comment_reads IS 'Suivi des commentaires lus par les révisionnistes pour gérer les notifications de nouveaux commentaires';
COMMENT ON FUNCTION mark_comment_as_read IS 'Marque un commentaire spécifique comme lu par un révisionniste';
COMMENT ON FUNCTION mark_activity_comments_as_read IS 'Marque tous les commentaires d''une activité comme lus par un révisionniste';
COMMENT ON VIEW public.v_unread_comments_by_activity IS 'Nombre de commentaires non lus par révisionniste et par activité';
COMMENT ON VIEW public.v_comments_with_read_status IS 'Commentaires avec leur statut de lecture pour l''utilisateur connecté';

-- =============================================
-- 7. GRANTS DE PERMISSIONS
-- =============================================

-- Permettre l'exécution des fonctions aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION mark_comment_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_activity_comments_as_read TO authenticated;

-- Permettre l'accès aux vues
GRANT SELECT ON public.v_unread_comments_by_activity TO authenticated;
GRANT SELECT ON public.v_comments_with_read_status TO authenticated;

-- =============================================
-- FIN DE LA MIGRATION
-- =============================================
