l'ancienne structure des users de ma base de donnée est @migration/ancienne_plateforme/old_user.md (plateforme laravel fortify + jetstream + InertiaJs). Les anciens utilisateurs peuvent etre fetché via https://epavillonclimatique.francophonie.org/api/users (fetch pagginé de 100 à 100) (format des dates: exemple 2025-02-25T15:13:27.000000Z).
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
- seule les utilisateurs qui n'ont pas encore recréé un profile sur la nouvelle plateforme(superbase) seront migré
- si l'utilisateur existe déjà dans ma nouvelle bd(superbase), on met juste à jour ses champs "created_at" et "updated_at" afin de respecter son ancienneté
- Celà sous entend qu'ils faut migrer avec "created_at" et "updated_at" parce qu'il est important de conserver l'ancienneté
- il existe une table auth.users de superbase dont je ne maitrise pas les fonction, merci prendre celà en compte
- Dans l'ancienne plateforme laravel, les pays n'étaient renseignés, donc tu peux laisser le champ pays à NULL


voici un exemple de fetch pagginé de 2 à 2:
{"current_page":1,"data":[{"id":46,"name":"de P\u00e9tigny","prenom":"Bertrand","titre":"Directeur g\u00e9n\u00e9ral","photo_url":"images_uploades\/V1XGssUMAYo92LsaWxEW1OoCHqYT1XH7CuaLMm5v.jpg","telephone":null,"email":"info@saom.ca","biographie":null,"token_peerjs":"3bba4332-37ef-4452-a322-d8c1fcd2c6b5","intervenant_id":19,"pays_id":null,"organisation_id":19,"point_focal_id":null,"apprenant_id":null,"formateur_id":0,"email_verified_at":"2021-10-24T21:30:53.000000Z","current_team_id":null,"profile_photo_path":null,"created_at":"2021-10-24T21:30:53.000000Z","updated_at":"2021-11-07T18:08:02.000000Z","is_admin":null,"profile_photo_url":"https:\/\/ui-avatars.com\/api\/?name=d+P&color=7F9CF5&background=EBF4FF"},{"id":53,"name":"ATTIG BAHAR","prenom":"Faten","titre":"Dr.","photo_url":"images_uploades\/GIfNNgp136C4f3W1ebD6LXDAftitdAahcynp9fXH.png","telephone":null,"email":"faten.bahar@gmail.com","biographie":null,"token_peerjs":"4a47b0fd-79ec-4094-95f1-6b0d4711a5b6","intervenant_id":26,"pays_id":null,"organisation_id":26,"point_focal_id":null,"apprenant_id":null,"formateur_id":0,"email_verified_at":"2021-10-25T12:06:43.000000Z","current_team_id":null,"profile_photo_path":null,"created_at":"2021-10-25T12:06:43.000000Z","updated_at":"2021-11-06T01:20:06.000000Z","is_admin":null,"profile_photo_url":"https:\/\/ui-avatars.com\/api\/?name=A+B&color=7F9CF5&background=EBF4FF"}],"first_page_url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=1","from":1,"last_page":1278,"last_page_url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=1278","links":[{"url":null,"label":"&laquo; Pr\u00e9c\u00e9dent","active":false},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=1","label":"1","active":true},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=2","label":"2","active":false},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=3","label":"3","active":false},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=4","label":"4","active":false},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=5","label":"5","active":false},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=6","label":"6","active":false},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=7","label":"7","active":false},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=8","label":"8","active":false},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=9","label":"9","active":false},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=10","label":"10","active":false},{"url":null,"label":"...","active":false},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=1277","label":"1277","active":false},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=1278","label":"1278","active":false},{"url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=2","label":"Suivant &raquo;","active":false}],"next_page_url":"https:\/\/epavillonclimatique.francophonie.org\/api\/users?page=2","path":"https:\/\/epavillonclimatique.francophonie.org\/api\/users","per_page":2,"prev_page_url":null,"to":2,"total":2556}
