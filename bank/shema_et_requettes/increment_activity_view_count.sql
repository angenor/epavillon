-- Fonction pour incrémenter le compteur de vues d'une activité de manière atomique
-- Cette fonction évite les race conditions en utilisant une opération atomique

CREATE OR REPLACE FUNCTION increment_activity_view_count(activity_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.activities
  SET
    activites_view_count = COALESCE(activites_view_count, 0) + 1,
    last_viewed_at = NOW()
  WHERE id = activity_uuid;
END;
$$;

-- Commentaire sur la fonction
COMMENT ON FUNCTION increment_activity_view_count(UUID) IS
'Incrémente le compteur de vues d''une activité de manière atomique et met à jour la date de dernière vue';

-- Donner les permissions d'exécution aux utilisateurs authentifiés et anonymes
GRANT EXECUTE ON FUNCTION increment_activity_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_activity_view_count(UUID) TO anon;
