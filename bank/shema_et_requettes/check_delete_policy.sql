-- =============================================
-- SCRIPT DE VÉRIFICATION: Vérifier la politique DELETE
-- Date: 2025-10-10
-- Description: Vérifie si la politique DELETE existe pour revisionniste_activity_views
-- =============================================

-- Vérifier les politiques existantes sur la table revisionniste_activity_views
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'revisionniste_activity_views'
ORDER BY policyname;

-- =============================================
-- RÉSULTAT ATTENDU:
-- Vous devriez voir une ligne avec:
-- - policyname: "Revisionists can delete own activity views"
-- - cmd: "DELETE"
--
-- Si cette ligne n'existe PAS, vous devez exécuter:
-- add_delete_policy_activity_views.sql
-- =============================================
