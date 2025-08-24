-- =============================================
-- Migration: Transformer context_type en tableau pour user_testimonials
-- Date: 2025-08-24
-- Objectif: Permettre la sélection multiple de contextes pour les témoignages
-- =============================================

-- Commencer une transaction pour pouvoir rollback en cas d'erreur
BEGIN;

-- Étape 1: Ajouter une nouvelle colonne temporaire de type tableau
ALTER TABLE public.user_testimonials 
ADD COLUMN context_type_new testimonial_context_type[];

-- Étape 2: Migrer les données existantes vers la nouvelle colonne
-- Chaque valeur unique devient un tableau avec un seul élément
UPDATE public.user_testimonials 
SET context_type_new = ARRAY[context_type];

-- Étape 3: Vérifier que toutes les données ont été migrées correctement
DO $$
DECLARE
    unmigrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unmigrated_count
    FROM public.user_testimonials 
    WHERE context_type_new IS NULL;
    
    IF unmigrated_count > 0 THEN
        RAISE EXCEPTION 'Migration échouée: % enregistrements non migrés', unmigrated_count;
    END IF;
    
    RAISE NOTICE 'Vérification réussie: toutes les données ont été migrées';
END $$;

-- Étape 4: Supprimer l'ancien index
DROP INDEX IF EXISTS idx_testimonials_context;

-- Étape 5: Supprimer l'ancienne colonne
ALTER TABLE public.user_testimonials 
DROP COLUMN context_type;

-- Étape 6: Renommer la nouvelle colonne
ALTER TABLE public.user_testimonials 
RENAME COLUMN context_type_new TO context_type;

-- Étape 7: Ajouter la contrainte NOT NULL sur la nouvelle colonne
ALTER TABLE public.user_testimonials 
ALTER COLUMN context_type SET NOT NULL;

-- Étape 8: Créer les nouveaux index optimisés pour les tableaux
CREATE INDEX idx_testimonials_context ON public.user_testimonials USING GIN (context_type);
CREATE INDEX idx_testimonials_context_id ON public.user_testimonials(context_id);

-- Étape 9: Vérification finale des données
DO $$
DECLARE
    total_count INTEGER;
    valid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM public.user_testimonials;
    
    SELECT COUNT(*) INTO valid_count 
    FROM public.user_testimonials 
    WHERE context_type IS NOT NULL 
    AND array_length(context_type, 1) > 0;
    
    IF total_count != valid_count THEN
        RAISE EXCEPTION 'Migration incomplète: % total, % valides', total_count, valid_count;
    END IF;
    
    RAISE NOTICE 'Migration réussie: % témoignages migrés avec succès', total_count;
END $$;

-- Confirmer la transaction
COMMIT;

-- =============================================
-- Exemples d'utilisation après migration
-- =============================================

-- Exemple 1: Créer un témoignage avec un seul contexte (comme avant)
-- INSERT INTO public.user_testimonials (user_id, testimonial_text, context_type, context_id)
-- VALUES (
--     'user-uuid-here',
--     'Excellent formation !',
--     ARRAY['training'::testimonial_context_type],
--     'training-uuid-here'
-- );

-- Exemple 2: Créer un témoignage avec plusieurs contextes
-- INSERT INTO public.user_testimonials (user_id, testimonial_text, context_type, context_id)
-- VALUES (
--     'user-uuid-here',
--     'Plateforme géniale, formations et événements de qualité !',
--     ARRAY['training'::testimonial_context_type, 'event'::testimonial_context_type, 'platform'::testimonial_context_type],
--     NULL  -- NULL car plusieurs contextes
-- );

-- Exemple 3: Rechercher des témoignages par contexte
-- SELECT * FROM public.user_testimonials 
-- WHERE 'training'::testimonial_context_type = ANY(context_type);

-- Exemple 4: Rechercher des témoignages avec plusieurs contextes spécifiques
-- SELECT * FROM public.user_testimonials 
-- WHERE context_type && ARRAY['training'::testimonial_context_type, 'event'::testimonial_context_type];

-- =============================================
-- Script de rollback (à exécuter SEULEMENT si nécessaire)
-- =============================================

-- ATTENTION: Ce rollback ne fonctionne que si tous les témoignages 
-- n'ont qu'un seul contexte dans leur tableau
/*
BEGIN;

-- Ajouter une colonne temporaire pour l'ancien format
ALTER TABLE public.user_testimonials 
ADD COLUMN context_type_old testimonial_context_type;

-- Migrer seulement les témoignages avec un seul contexte
UPDATE public.user_testimonials 
SET context_type_old = context_type[1]
WHERE array_length(context_type, 1) = 1;

-- Vérifier qu'il n'y a pas de témoignages avec plusieurs contextes
DO $$
DECLARE
    multi_context_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO multi_context_count
    FROM public.user_testimonials 
    WHERE array_length(context_type, 1) > 1;
    
    IF multi_context_count > 0 THEN
        RAISE EXCEPTION 'Rollback impossible: % témoignages ont plusieurs contextes', multi_context_count;
    END IF;
END $$;

-- Supprimer les index actuels
DROP INDEX IF EXISTS idx_testimonials_context;
DROP INDEX IF EXISTS idx_testimonials_context_id;

-- Supprimer l'ancienne colonne tableau
ALTER TABLE public.user_testimonials DROP COLUMN context_type;

-- Renommer la colonne de rollback
ALTER TABLE public.user_testimonials RENAME COLUMN context_type_old TO context_type;

-- Ajouter la contrainte NOT NULL
ALTER TABLE public.user_testimonials ALTER COLUMN context_type SET NOT NULL;

-- Recréer l'ancien index
CREATE INDEX idx_testimonials_context ON public.user_testimonials(context_type, context_id);

COMMIT;
*/