-- Vérifier les rôles de l'utilisateur spécifique
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    ur.role,
    ur.is_active,
    ur.valid_until,
    ur.assigned_at,
    CASE 
        WHEN ur.valid_until IS NULL OR ur.valid_until > NOW() THEN 'Valide'
        ELSE 'Expiré'
    END as status
FROM public.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.id = '9a9ec732-7daf-4bec-8c4a-17d8109e06a8'
ORDER BY ur.assigned_at DESC;

-- Vérifier toutes les entrées dans user_roles pour cet utilisateur
SELECT * FROM public.user_roles 
WHERE user_id = '9a9ec732-7daf-4bec-8c4a-17d8109e06a8';

-- Test de la fonction de vérification de rôle
SELECT has_role('9a9ec732-7daf-4bec-8c4a-17d8109e06a8', 'super_admin') as has_super_admin_role;