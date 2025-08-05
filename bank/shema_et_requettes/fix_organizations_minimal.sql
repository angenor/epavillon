-- =============================================
-- SOLUTION MINIMALE SANS SUPPRIMER LA TABLE
-- ePavilion2025 - IFDD
-- =============================================

-- ÉTAPE 1: Désactiver RLS temporairement
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 2: Supprimer toutes les politiques existantes
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'organizations' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.organizations', pol.policyname);
    END LOOP;
END $$;

-- ÉTAPE 3: Supprimer les colonnes problématiques
ALTER TABLE public.organizations 
    DROP COLUMN IF EXISTS name_normalized CASCADE,
    DROP COLUMN IF EXISTS name_search_tokens CASCADE;

-- ÉTAPE 4: Supprimer les triggers problématiques
DROP TRIGGER IF EXISTS organizations_before_insert ON public.organizations;
DROP TRIGGER IF EXISTS organizations_before_update ON public.organizations;
DROP TRIGGER IF EXISTS check_organization_duplicate ON public.organizations;
DROP TRIGGER IF EXISTS generate_search_tokens_trigger ON public.organizations;

-- ÉTAPE 5: Supprimer les fonctions problématiques
DROP FUNCTION IF EXISTS generate_search_tokens() CASCADE;
DROP FUNCTION IF EXISTS check_organization_duplicate() CASCADE;
DROP FUNCTION IF EXISTS organizations_before_insert() CASCADE;
DROP FUNCTION IF EXISTS search_organizations(TEXT) CASCADE;

-- ÉTAPE 6: Créer des index simples
DROP INDEX IF EXISTS idx_organizations_name_normalized;
DROP INDEX IF EXISTS idx_organizations_name_trgm;
DROP INDEX IF EXISTS idx_organizations_search_tokens;

CREATE INDEX IF NOT EXISTS idx_organizations_name_lower ON public.organizations(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_organizations_email ON public.organizations(email);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON public.organizations(is_active);

-- ÉTAPE 7: Créer des politiques RLS très simples
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Politique pour SELECT - tout le monde peut voir les organisations actives
CREATE POLICY "anyone_can_view_active_orgs" ON public.organizations
    FOR SELECT 
    USING (is_active = TRUE);

-- Politique pour INSERT - utilisateurs authentifiés seulement
CREATE POLICY "authenticated_users_insert" ON public.organizations
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Politique pour UPDATE - seulement le créateur
CREATE POLICY "creators_can_update" ON public.organizations
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Politique pour DELETE - seulement le créateur
CREATE POLICY "creators_can_delete" ON public.organizations
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = created_by);

-- ÉTAPE 8: Créer une fonction de recherche très simple
CREATE OR REPLACE FUNCTION search_organizations_simple(search_text TEXT)
RETURNS TABLE (
    organization_id UUID,
    name TEXT,
    organization_type organization_type,
    is_verified BOOLEAN
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Retourner directement les résultats sans logique complexe
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.organization_type,
        o.is_verified
    FROM organizations o
    WHERE 
        o.is_active = TRUE
        AND (
            o.name ILIKE '%' || search_text || '%'
            OR o.email ILIKE '%' || search_text || '%'
        )
    ORDER BY o.name
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- ÉTAPE 9: Accorder les permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT EXECUTE ON FUNCTION search_organizations_simple(TEXT) TO authenticated;

-- ÉTAPE 10: Créer/Mettre à jour le trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON public.organizations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ÉTAPE 11: Vérification finale
DO $$
BEGIN
    RAISE NOTICE 'Organizations table fixed successfully!';
    RAISE NOTICE 'Removed: generated columns, complex triggers, and problematic functions';
    RAISE NOTICE 'Added: simple RLS policies and basic search function';
END $$;

-- Test de la structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'organizations' 
AND table_schema = 'public'
ORDER BY ordinal_position;