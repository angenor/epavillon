l'ancienne structure des users de ma base de donnée est @migration/ancienne_plateforme/old_user.md (plateforme laravel fortify + jetstream + InertiaJs). Les anciens utilisateurs peuvent etre fetché via https://epavillonclimatique.francophonie.org/api/users (il y'a 2556 lignes actuellement) (format des dates: exemple 2025-02-25T15:13:27.000000Z).
je veux faire une migration vers ma plateforme actuel(superbase) ou tu es actuellement dont la struction des users est:
-- Table des utilisateurs (étendue du auth.users de Supabase)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    email_pro TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    biography TEXT,
    profile_photo_url TEXT,
    profile_photo_thumbnail_url TEXT,
    country_id UUID REFERENCES public.countries(id),
    organization_id UUID,
    address TEXT, -- Remplace "position"
    is_organization_verified BOOLEAN DEFAULT FALSE,
    display_mode TEXT DEFAULT 'light' CHECK (display_mode IN ('light', 'dark', 'auto')),
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "live_events": true}'::jsonb,
    networking_visibility BOOLEAN DEFAULT TRUE,
    -- Statut de blocage/suspension
    is_blocked BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    blocked_by UUID REFERENCES public.users(id),
    blocked_at TIMESTAMPTZ,
    blocked_reason TEXT,
    suspended_by UUID REFERENCES public.users(id),
    suspended_at TIMESTAMPTZ,
    suspended_until TIMESTAMPTZ,
    suspension_reason TEXT,
    is_migrate BOOLEAN, -- est TRUE lorsque la donnée provient d'une migration
    laravel_user_id BIGINT UNIQUE -- id dans l'ancienne plateforme Laravel
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


je veux que tu crees une interface pour effectuer la migration, la migration démarre lorsqu'on clique sur un bouton. les anciens fichiers(image de profil) restent sur l'ancien serveur(base url: https://epavillonclimatique.francophonie.org/).
Je veux pouvoir revenir en arrière en cas de mauvaise migration. Je veux migrer les user dans l'objectif qu'ils réinitialisent leurs mot de passe.

# NB
- seule les utilisateurs dont le champ email_verified_at n'est pas NULL et qui n'ai pas encore recréé un profile sur la nouvelle plateforme(superbase) seront migré
- si l'utilisateur existe déjà dans ma nouvelle bd(superbase), on met juste à jour ses champs "created_at" et "updated_at" afin de respecter son ancienneté
- Celà sous entend qu'ils faut migrer avec "created_at" et "updated_at" parce qu'il est important de conserver l'ancienneté
- il existe une table auth.users de superbase dont je ne maitrise pas les fonction, merci prendre celà en compte
