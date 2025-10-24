-- =====================================================
-- Politique RLS pour permettre aux soumissionnaires
-- de créer des commentaires sur leurs propres activités
-- Date: 2025-10-24
-- =====================================================

-- Ajouter une politique pour que les soumissionnaires puissent créer des commentaires
DROP POLICY IF EXISTS "Submitters can create comments on own activities" ON public.revision_comments;

CREATE POLICY "Submitters can create comments on own activities" ON public.revision_comments
    FOR INSERT WITH CHECK (
        created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.activities
            WHERE id = activity_id
            AND submitted_by = auth.uid()
        )
    );

COMMENT ON POLICY "Submitters can create comments on own activities" ON public.revision_comments IS
'Permet aux soumissionnaires de créer des commentaires sur leurs propres activités pour communiquer avec les révisionnistes';
