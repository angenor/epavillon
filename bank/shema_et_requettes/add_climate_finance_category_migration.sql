-- =============================================
-- MIGRATION: Ajouter 'climate_finance' à session_category
-- Date: 2025-01-15
-- Description: Ajoute la catégorie "finance climat" à l'ENUM session_category
-- =============================================

-- Commencer la transaction
BEGIN;

-- Ajouter la nouvelle valeur 'climate_finance' à l'ENUM session_category
ALTER TYPE session_category ADD VALUE 'climate_finance';

-- Vérifier que la nouvelle valeur a été ajoutée
-- (Cette requête peut être exécutée pour confirmer)
-- SELECT unnest(enum_range(NULL::session_category)) AS category;

-- Optionnel: Insérer quelques exemples de sessions avec la nouvelle catégorie
-- (Décommenter si vous voulez ajouter des données d'exemple)
/*
INSERT INTO public.negotiation_sessions (
    title,
    description,
    start_datetime,
    end_datetime,
    location,
    category,
    is_ifdd_organized
) VALUES 
(
    'Atelier sur le financement climatique',
    'Session de formation sur les mécanismes de financement climatique international',
    '2024-06-15 09:00:00+00',
    '2024-06-15 17:00:00+00',
    'Siège de l''IFDD, Québec',
    'climate_finance',
    TRUE
),
(
    'Table ronde: Fonds Vert pour le Climat',
    'Discussion sur l''accès au financement du Fonds Vert pour le Climat pour les pays francophones',
    '2024-07-20 14:00:00+00',
    '2024-07-20 16:00:00+00',
    'En ligne',
    'climate_finance',
    TRUE
);
*/

-- Confirmer la transaction
COMMIT;

-- Message de confirmation
-- SELECT 'Migration terminée: catégorie climate_finance ajoutée avec succès' AS status;