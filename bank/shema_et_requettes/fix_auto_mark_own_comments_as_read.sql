-- =============================================
-- FIX: Marquer automatiquement les commentaires comme lus pour leur créateur
-- Date: 2025-10-11
-- Description: Ajoute un trigger pour marquer automatiquement un commentaire comme lu
--              pour l'utilisateur qui l'a créé, évitant ainsi qu'il apparaisse comme non lu
-- =============================================

-- =============================================
-- 1. FONCTION POUR MARQUER AUTOMATIQUEMENT UN COMMENTAIRE COMME LU POUR SON CRÉATEUR
-- =============================================

CREATE OR REPLACE FUNCTION auto_mark_own_comment_as_read()
RETURNS TRIGGER AS $$
BEGIN
    -- Marquer automatiquement le commentaire comme lu pour son créateur
    INSERT INTO public.revision_comment_reads (
        comment_id,
        revisionniste_id,
        read_at
    )
    VALUES (
        NEW.id,
        NEW.created_by,
        NOW()
    )
    ON CONFLICT (comment_id, revisionniste_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. TRIGGER POUR APPELER LA FONCTION APRÈS INSERTION D'UN COMMENTAIRE
-- =============================================

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS auto_mark_comment_as_read_trigger ON public.revision_comments;

-- Créer le trigger
CREATE TRIGGER auto_mark_comment_as_read_trigger
AFTER INSERT ON public.revision_comments
FOR EACH ROW
EXECUTE FUNCTION auto_mark_own_comment_as_read();

-- =============================================
-- 3. COMMENTAIRES DE DOCUMENTATION
-- =============================================

COMMENT ON FUNCTION auto_mark_own_comment_as_read IS
'Marque automatiquement un commentaire comme lu pour son créateur lors de la création';

-- =============================================
-- FIN DU FIX
-- =============================================
