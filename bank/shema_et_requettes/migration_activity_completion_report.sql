-- =============================================
-- Migration: Ajout des éléments de rapport d'activité
-- Date: 2025-11-17
-- Description: Ajoute les champs nécessaires pour le rapport de fin d'activité
--              - Compte rendu synthétique
--              - Support des témoignages pour les activités
-- =============================================

-- 1. Ajouter le type 'activity' au ENUM testimonial_context_type
-- Note: PostgreSQL ne permet pas de modifier directement un ENUM, il faut ajouter la valeur
ALTER TYPE testimonial_context_type ADD VALUE IF NOT EXISTS 'activity';

-- 2. Ajouter le champ completion_report à la table activities
-- Ce champ contiendra le compte rendu synthétique fourni par l'organisation
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS completion_report TEXT;

-- 3. Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.activities.completion_report IS
'Compte rendu synthétique de l''activité fourni par l''organisation après validation_status = completed';

-- =============================================
-- Notes d'utilisation:
-- =============================================
--
-- 1. COMPTE RENDU SYNTHÉTIQUE:
--    - Stocké dans activities.completion_report
--    - Rempli obligatoirement quand validation_status passe à 'completed'
--    - Type: TEXT (permet un compte rendu détaillé)
--
-- 2. TÉMOIGNAGES DES PARTICIPANTS:
--    - Utiliser la table user_testimonials avec context_type = 'activity'
--    - Le champ context_id doit référencer activities.id
--    - Minimum 2 témoignages requis
--    - Exemple d'insertion:
--      INSERT INTO user_testimonials (
--        user_id,
--        testimonial_text,
--        context_type,
--        context_id,
--        thematique_type
--      ) VALUES (
--        'uuid-participant',
--        'Mon témoignage sur cette activité...',
--        ARRAY['activity']::testimonial_context_type[],
--        'uuid-activité',
--        ARRAY['adaptation']::thematique_type[]
--      );
--
-- 3. PHOTOS:
--    - Utiliser la table media_gallery avec context_type = 'activity'
--    - Le champ context_id doit référencer activities.id
--    - Exemple d'insertion:
--      INSERT INTO media_gallery (
--        media_type,
--        media_url,
--        thumbnail_url,
--        title,
--        description,
--        context_type,
--        context_id,
--        uploaded_by
--      ) VALUES (
--        'photo',
--        'url-de-la-photo',
--        'url-miniature',
--        'Titre de la photo',
--        'Description',
--        'activity',
--        'uuid-activité',
--        'uuid-utilisateur'
--      );
--
-- 4. VALIDATION:
--    - Avant de passer validation_status à 'completed', vérifier:
--      a) completion_report IS NOT NULL AND completion_report != ''
--      b) Au moins 2 témoignages existent pour cette activité
--      c) Au moins 1 photo existe pour cette activité (si applicable)
-- =============================================
