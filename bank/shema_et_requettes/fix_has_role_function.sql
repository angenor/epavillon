-- Corriger la fonction has_role pour éviter l'ambiguïté
-- D'abord supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS has_role(uuid, user_role_type);

-- Créer la nouvelle fonction avec des noms de paramètres non ambigus
CREATE OR REPLACE FUNCTION has_role(input_user_id UUID, role_name user_role_type)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = input_user_id 
        AND ur.role = role_name 
        AND ur.is_active = TRUE
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;