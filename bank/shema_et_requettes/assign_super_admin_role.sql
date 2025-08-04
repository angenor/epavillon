-- Attribuer le rôle super_admin à l'utilisateur spécifié
-- ID utilisateur: 9a9ec732-7daf-4bec-8c4a-17d8109e06a8

-- Vérifier d'abord si l'utilisateur n'a pas déjà ce rôle
DO $$
BEGIN
    -- Vérifier si le rôle existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = '9a9ec732-7daf-4bec-8c4a-17d8109e06a8'
        AND role = 'super_admin'
        AND is_active = true
    ) THEN
        -- Insérer le rôle super_admin
        INSERT INTO public.user_roles (
            user_id, 
            role, 
            assigned_by, 
            assigned_at, 
            is_active
        ) VALUES (
            '9a9ec732-7daf-4bec-8c4a-17d8109e06a8',
            'super_admin',
            '9a9ec732-7daf-4bec-8c4a-17d8109e06a8', -- Auto-assigné pour le premier super_admin
            NOW(),
            true
        );
        
        RAISE NOTICE 'Rôle super_admin attribué avec succès à l''utilisateur %', '9a9ec732-7daf-4bec-8c4a-17d8109e06a8';
    ELSE
        RAISE NOTICE 'L''utilisateur % a déjà le rôle super_admin actif', '9a9ec732-7daf-4bec-8c4a-17d8109e06a8';
    END IF;
END
$$;

-- Vérifier le résultat
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    ur.role,
    ur.assigned_at,
    ur.is_active
FROM public.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.id = '9a9ec732-7daf-4bec-8c4a-17d8109e06a8'
AND ur.role = 'super_admin';