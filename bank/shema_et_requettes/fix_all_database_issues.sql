-- =============================================
-- COMPREHENSIVE FIX FOR ALL DATABASE ISSUES
-- ePavilion2025 - IFDD
-- =============================================

-- 1. FIRST: Fix the search_organizations function (ambiguous column reference)
CREATE OR REPLACE FUNCTION search_organizations(search_query TEXT)
RETURNS TABLE (
    organization_id UUID,
    name TEXT,
    matched_name TEXT,
    match_type TEXT,
    similarity_score FLOAT,
    is_verified BOOLEAN,
    is_duplicate BOOLEAN
) AS $$
BEGIN
    -- Normaliser la requête
    search_query := LOWER(TRIM(search_query));
    
    RETURN QUERY
    SELECT * FROM (
        -- Correspondance exacte sur le nom principal
        SELECT DISTINCT
            o.id as organization_id,
            o.name,
            o.name as matched_name,
            'exact_name'::TEXT as match_type,
            1.0::FLOAT as similarity_score,
            o.is_verified,
            o.is_duplicate
        FROM public.organizations o
        WHERE o.name_normalized = search_query
            AND o.is_active = TRUE
        
        UNION
        
        -- Correspondance exacte sur les alias
        SELECT DISTINCT
            o.id as organization_id,
            o.name,
            oa.alias_name as matched_name,
            'exact_alias'::TEXT as match_type,
            1.0::FLOAT as similarity_score,
            o.is_verified,
            o.is_duplicate
        FROM public.organizations o
        JOIN public.organization_aliases oa ON o.id = oa.organization_id
        WHERE oa.alias_normalized = search_query
            AND o.is_active = TRUE
        
        UNION
        
        -- Recherche floue sur le nom principal
        SELECT DISTINCT
            o.id as organization_id,
            o.name,
            o.name as matched_name,
            'fuzzy_name'::TEXT as match_type,
            similarity(o.name, search_query) as similarity_score,
            o.is_verified,
            o.is_duplicate
        FROM public.organizations o
        WHERE similarity(o.name, search_query) > 0.3
            AND o.is_active = TRUE
        
        UNION
        
        -- Recherche floue sur les alias
        SELECT DISTINCT
            o.id as organization_id,
            o.name,
            oa.alias_name as matched_name,
            'fuzzy_alias'::TEXT as match_type,
            similarity(oa.alias_name, search_query) as similarity_score,
            o.is_verified,
            o.is_duplicate
        FROM public.organizations o
        JOIN public.organization_aliases oa ON o.id = oa.organization_id
        WHERE similarity(oa.alias_name, search_query) > 0.3
            AND o.is_active = TRUE
    ) results
    ORDER BY 
        CASE 
            WHEN results.match_type IN ('exact_name', 'exact_alias') THEN 0
            ELSE 1
        END,
        results.similarity_score DESC,
        results.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. SECOND: Completely remove and recreate RLS policies for organizations
-- Drop all existing policies
DROP POLICY IF EXISTS "Everyone can view active organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can update their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organizations are viewable by all authenticated users" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

-- Disable RLS temporarily to avoid conflicts
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create simple, non-conflicting policies
CREATE POLICY "public_view_organizations" ON public.organizations
    FOR SELECT 
    USING (is_active = TRUE);

CREATE POLICY "authenticated_create_organizations" ON public.organizations
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()
    );

CREATE POLICY "creator_update_organizations" ON public.organizations
    FOR UPDATE 
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- 3. THIRD: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.organizations TO authenticated;
GRANT INSERT ON public.organizations TO authenticated;
GRANT UPDATE ON public.organizations TO authenticated;

-- Grant permissions for the search function
GRANT EXECUTE ON FUNCTION search_organizations(TEXT) TO authenticated;

-- 4. FOURTH: Verify the fix
SELECT 'Database fixes applied successfully. Organizations table and search function should now work.' as status;

-- Test the search function (this should not error)
SELECT COUNT(*) as test_search_count FROM search_organizations('test');