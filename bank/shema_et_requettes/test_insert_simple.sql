-- =============================================
-- Test simple d'insertion de témoignage
-- =============================================

-- 1. D'abord, désactiver temporairement RLS pour permettre le test
ALTER TABLE public.user_testimonials DISABLE ROW LEVEL SECURITY;

-- 2. Insérer un témoignage de test directement
INSERT INTO public.user_testimonials (
    user_id,
    testimonial_text,
    context_type,
    featured,
    background_color
) VALUES (
    (SELECT id FROM auth.users LIMIT 1), -- Prendre le premier utilisateur disponible
    'Test témoignage - créé via SQL',
    'platform',
    false,
    '#10B981'
) RETURNING *;

-- 3. Vérifier que l'insertion a fonctionné
SELECT * FROM public.user_testimonials 
WHERE testimonial_text = 'Test témoignage - créé via SQL';

-- 4. Réactiver RLS
ALTER TABLE public.user_testimonials ENABLE ROW LEVEL SECURITY;

-- 5. Maintenant, tester avec RLS activé (devrait échouer si pas de politique correcte)
-- Ce test va probablement échouer, c'est normal
BEGIN;
    INSERT INTO public.user_testimonials (
        user_id,
        testimonial_text,
        context_type,
        featured
    ) VALUES (
        (SELECT id FROM auth.users LIMIT 1),
        'Test avec RLS - devrait échouer',
        'platform',
        false
    );
ROLLBACK;

-- 6. Solution alternative : créer une politique temporaire super permissive
DROP POLICY IF EXISTS "temp_allow_all" ON public.user_testimonials;
CREATE POLICY "temp_allow_all" 
ON public.user_testimonials
FOR ALL 
USING (true)
WITH CHECK (true);

-- 7. Tester à nouveau avec la politique permissive
INSERT INTO public.user_testimonials (
    user_id,
    testimonial_text,
    context_type,
    featured
) VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'Test avec politique permissive',
    'platform',
    false
) RETURNING *;

-- 8. Vérifier tous les témoignages
SELECT 
    t.id,
    t.user_id,
    t.testimonial_text,
    t.context_type,
    t.created_at,
    u.email as user_email,
    u.first_name,
    u.last_name
FROM public.user_testimonials t
LEFT JOIN public.users u ON t.user_id = u.id
ORDER BY t.created_at DESC;

-- 9. IMPORTANT : Après les tests, supprimer la politique permissive et remettre les bonnes
DROP POLICY IF EXISTS "temp_allow_all" ON public.user_testimonials;

-- Recréer les politiques correctes
CREATE POLICY "public_read_testimonials" 
ON public.user_testimonials
FOR SELECT 
USING (true);

CREATE POLICY "authenticated_insert_testimonials" 
ON public.user_testimonials
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = user_testimonials.user_id
    )
);

CREATE POLICY "owner_update_testimonials" 
ON public.user_testimonials
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_delete_testimonials" 
ON public.user_testimonials
FOR DELETE 
USING (auth.uid() = user_id);

-- 10. Nettoyer les données de test
DELETE FROM public.user_testimonials 
WHERE testimonial_text LIKE 'Test%';