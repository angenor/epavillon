-- Ajout des politiques DELETE manquantes pour les posts de la communauté
-- Ces politiques permettent aux utilisateurs de supprimer leurs propres posts

-- Politique DELETE pour les témoignages utilisateurs
CREATE POLICY "Users can delete own testimonials" ON public.user_testimonials
    FOR DELETE USING (user_id = auth.uid());

-- Politique UPDATE manquante pour les témoignages utilisateurs
CREATE POLICY "Users can update own testimonials" ON public.user_testimonials
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Politique DELETE pour les témoignages vidéo
CREATE POLICY "Users can delete own video testimonials" ON public.video_testimonials
    FOR DELETE USING (user_id = auth.uid());

-- Politique UPDATE pour les témoignages vidéo
CREATE POLICY "Users can update own video testimonials" ON public.video_testimonials
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Politique SELECT pour les témoignages vidéo
CREATE POLICY "Video testimonials are viewable by all" ON public.video_testimonials
    FOR SELECT USING (is_approved = true);

-- Politique INSERT pour les témoignages vidéo
CREATE POLICY "Users can create video testimonials" ON public.video_testimonials
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politique DELETE pour les innovations et bonnes pratiques
CREATE POLICY "Users can delete own innovations practices" ON public.innovations_practices
    FOR DELETE USING (submitted_by = auth.uid());

-- Politique UPDATE pour les innovations et bonnes pratiques
CREATE POLICY "Users can update own innovations practices" ON public.innovations_practices
    FOR UPDATE USING (submitted_by = auth.uid())
    WITH CHECK (submitted_by = auth.uid());

-- Politique SELECT pour les innovations et bonnes pratiques
CREATE POLICY "Innovations practices are viewable by all" ON public.innovations_practices
    FOR SELECT USING (is_published = true);

-- Politique INSERT pour les innovations et bonnes pratiques
CREATE POLICY "Users can create innovations practices" ON public.innovations_practices
    FOR INSERT WITH CHECK (submitted_by = auth.uid());

-- Activer RLS sur les tables si ce n'est pas déjà fait
ALTER TABLE public.user_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovations_practices ENABLE ROW LEVEL SECURITY;