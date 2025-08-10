-- =============================================
-- Correction des politiques RLS pour les témoignages
-- =============================================

-- Activer RLS sur la table video_testimonials
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;

-- Politiques pour video_testimonials
-- Permettre à tous de voir les vidéos approuvées
CREATE POLICY "Approved video testimonials are viewable by all" 
ON public.video_testimonials
FOR SELECT 
USING (is_approved = true);

-- Permettre aux utilisateurs de voir leurs propres vidéos (même non approuvées)
CREATE POLICY "Users can view their own video testimonials" 
ON public.video_testimonials
FOR SELECT 
USING (user_id = auth.uid());

-- Permettre aux utilisateurs de créer des témoignages vidéo
CREATE POLICY "Users can create video testimonials" 
ON public.video_testimonials
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Permettre aux utilisateurs de mettre à jour leurs propres vidéos
CREATE POLICY "Users can update their own video testimonials" 
ON public.video_testimonials
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Permettre aux admins de tout faire
CREATE POLICY "Admins can manage all video testimonials" 
ON public.video_testimonials
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

-- Vérifier et corriger les politiques pour user_testimonials
-- D'abord, supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Testimonials are viewable by all" ON public.user_testimonials;
DROP POLICY IF EXISTS "Users can create testimonials" ON public.user_testimonials;

-- Recréer les politiques pour user_testimonials avec plus de détails
CREATE POLICY "All testimonials are viewable by everyone" 
ON public.user_testimonials
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create testimonials" 
ON public.user_testimonials
FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
);

CREATE POLICY "Users can update their own testimonials" 
ON public.user_testimonials
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own testimonials" 
ON public.user_testimonials
FOR DELETE 
USING (user_id = auth.uid());

-- Permettre aux admins de tout gérer
CREATE POLICY "Admins can manage all testimonials" 
ON public.user_testimonials
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

-- Fonction helper pour debug (optionnel)
CREATE OR REPLACE FUNCTION check_user_auth()
RETURNS TABLE (
    current_user_id UUID,
    is_authenticated BOOLEAN,
    has_user_profile BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid() as current_user_id,
        (auth.uid() IS NOT NULL) as is_authenticated,
        EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid()) as has_user_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions pour exécuter la fonction
GRANT EXECUTE ON FUNCTION check_user_auth() TO authenticated;