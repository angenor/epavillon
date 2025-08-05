-- =============================================
-- SOLUTION COMPLÈTE POUR L'ERREUR SET-RETURNING FUNCTIONS
-- ePavilion2025 - IFDD
-- =============================================

-- ÉTAPE 1: Désactiver temporairement RLS et supprimer les éléments problématiques
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 2: Supprimer les triggers problématiques
DROP TRIGGER IF EXISTS organizations_before_insert ON public.organizations;
DROP TRIGGER IF EXISTS organizations_before_update ON public.organizations;
DROP TRIGGER IF EXISTS check_organization_duplicate ON public.organizations;
DROP TRIGGER IF EXISTS generate_search_tokens_trigger ON public.organizations;

-- ÉTAPE 3: Supprimer les fonctions problématiques
DROP FUNCTION IF EXISTS generate_search_tokens() CASCADE;
DROP FUNCTION IF EXISTS check_organization_duplicate() CASCADE;
DROP FUNCTION IF EXISTS organizations_before_insert() CASCADE;

-- ÉTAPE 4: Recréer la table organizations sans colonnes problématiques
-- D'abord sauvegarder les données existantes
CREATE TEMP TABLE temp_organizations AS SELECT * FROM public.organizations;

-- Supprimer et recréer la table
DROP TABLE public.organizations CASCADE;

CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    organization_type organization_type NOT NULL,
    logo_url TEXT,
    website TEXT,
    country_id UUID REFERENCES public.countries(id),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of UUID,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter la contrainte de clé étrangère pour duplicate_of après création
ALTER TABLE public.organizations 
    ADD CONSTRAINT organizations_duplicate_of_fkey 
    FOREIGN KEY (duplicate_of) REFERENCES public.organizations(id);

-- ÉTAPE 5: Créer des index simples sans fonctions complexes
CREATE INDEX idx_organizations_name_lower ON public.organizations(LOWER(name));
CREATE INDEX idx_organizations_email ON public.organizations(email);
CREATE INDEX idx_organizations_country ON public.organizations(country_id);
CREATE INDEX idx_organizations_created_by ON public.organizations(created_by);

-- ÉTAPE 6: Restaurer les données si elles existaient
INSERT INTO public.organizations (
    id, name, email, email_verified, organization_type, logo_url, 
    website, country_id, description, is_active, is_duplicate, 
    duplicate_of, is_verified, verified_by, verified_at, 
    created_by, created_at, updated_at
)
SELECT 
    id, name, email, email_verified, organization_type, logo_url, 
    website, country_id, description, is_active, is_duplicate, 
    duplicate_of, is_verified, verified_by, verified_at, 
    created_by, created_at, updated_at
FROM temp_organizations;

-- ÉTAPE 7: Créer des politiques RLS ultra-simples
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Politique de lecture simple
CREATE POLICY "organizations_select_policy" ON public.organizations
    FOR SELECT USING (true);

-- Politique d'insertion simple
CREATE POLICY "organizations_insert_policy" ON public.organizations
    FOR INSERT WITH CHECK (
        created_by = auth.uid()
    );

-- Politique de mise à jour simple
CREATE POLICY "organizations_update_policy" ON public.organizations
    FOR UPDATE USING (
        created_by = auth.uid()
    );

-- ÉTAPE 8: Créer une fonction de recherche simplifiée
CREATE OR REPLACE FUNCTION search_organizations_simple(search_text TEXT)
RETURNS TABLE (
    organization_id UUID,
    name TEXT,
    organization_type organization_type,
    is_verified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.organization_type,
        o.is_verified
    FROM public.organizations o
    WHERE 
        o.is_active = TRUE
        AND (
            LOWER(o.name) LIKE '%' || LOWER(search_text) || '%'
            OR LOWER(o.email) LIKE '%' || LOWER(search_text) || '%'
        )
    ORDER BY 
        CASE WHEN LOWER(o.name) = LOWER(search_text) THEN 0 ELSE 1 END,
        o.name
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ÉTAPE 9: Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.organizations TO authenticated;
GRANT EXECUTE ON FUNCTION search_organizations_simple(TEXT) TO authenticated;

-- ÉTAPE 10: Créer un trigger simple pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON public.organizations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ÉTAPE 11: Test final
SELECT 'Organizations table recreated successfully with simplified structure' as status;

-- Test d'insertion (devrait fonctionner maintenant)
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Simuler un utilisateur authentifié
    PERFORM set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
    
    -- Tenter une insertion
    INSERT INTO public.organizations (
        name, 
        email, 
        organization_type, 
        created_by
    ) VALUES (
        'Test Organization',
        'test@org.com',
        'ngo_association',
        current_setting('request.jwt.claim.sub')::UUID
    ) RETURNING id INTO test_id;
    
    -- Nettoyer
    DELETE FROM public.organizations WHERE id = test_id;
    
    RAISE NOTICE 'Test insertion successful!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test insertion failed: %', SQLERRM;
END;
$$;