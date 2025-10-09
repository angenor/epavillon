-- =============================================
-- MIGRATION PARTIE 1: Ajout du rôle "révisionniste" à l'enum
-- Date: 2025-10-09
-- Description: Ajoute le rôle révisionniste à l'enum user_role_type
-- NOTE: Cette partie doit être exécutée en premier et commitée
--       avant d'exécuter la partie 2
-- =============================================

-- Ajouter le nouveau rôle "révisionniste" à l'enum user_role_type
ALTER TYPE user_role_type ADD VALUE IF NOT EXISTS 'revisionniste';

-- =============================================
-- FIN DE LA PARTIE 1
-- Exécutez maintenant add_revisionniste_role_part2.sql
-- =============================================