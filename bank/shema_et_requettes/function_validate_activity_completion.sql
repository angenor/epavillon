-- =============================================
-- Fonction: validate_activity_completion
-- Description: Valide qu'une activité possède tous les éléments requis
--              avant d'être marquée comme 'completed'
-- =============================================

CREATE OR REPLACE FUNCTION validate_activity_completion(activity_id UUID)
RETURNS TABLE (
    is_valid BOOLEAN,
    missing_elements TEXT[]
) AS $$
DECLARE
    has_report BOOLEAN;
    testimonials_count INTEGER;
    photos_count INTEGER;
    missing TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Vérifier le compte rendu
    SELECT (completion_report IS NOT NULL AND completion_report != '')
    INTO has_report
    FROM activities
    WHERE id = activity_id;

    IF NOT has_report THEN
        missing := array_append(missing, 'compte_rendu');
    END IF;

    -- Compter les témoignages
    SELECT COUNT(*)
    INTO testimonials_count
    FROM user_testimonials
    WHERE 'activity' = ANY(context_type)
      AND context_id = activity_id;

    IF testimonials_count < 2 THEN
        missing := array_append(missing, 'témoignages (minimum 2, trouvés: ' || testimonials_count || ')');
    END IF;

    -- Compter les photos
    SELECT COUNT(*)
    INTO photos_count
    FROM media_gallery
    WHERE context_type = 'activity'
      AND context_id = activity_id
      AND media_type = 'photo';

    IF photos_count < 1 THEN
        missing := array_append(missing, 'photos (minimum 1, trouvées: ' || photos_count || ')');
    END IF;

    -- Retourner le résultat
    RETURN QUERY SELECT
        (array_length(missing, 1) IS NULL),
        missing;
END;
$$ LANGUAGE plpgsql;

-- Exemple d'utilisation :
-- SELECT * FROM validate_activity_completion('uuid-de-votre-activité');

-- Résultat attendu :
-- | is_valid | missing_elements                    |
-- |----------|-------------------------------------|
-- | false    | {compte_rendu, témoignages (minimum 2, trouvés: 0)} |
