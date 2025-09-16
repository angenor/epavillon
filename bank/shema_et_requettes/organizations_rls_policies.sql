-- Script pour configurer les politiques RLS (Row-Level Security) pour la table organizations
-- Date: 2025-09-16

-- Activer RLS sur la table organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique des organisations actives
CREATE POLICY "Public organizations are viewable by everyone"
ON public.organizations
FOR SELECT
USING (is_active = true);

-- Politique pour permettre aux utilisateurs authentifiés de créer des organisations
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
);

-- Politique pour permettre aux utilisateurs de modifier leur propre organisation
CREATE POLICY "Users can update their own organizations"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.organization_id = organizations.id
  )
);

-- Politique pour les administrateurs - accès complet
CREATE POLICY "Admins have full access to organizations"
ON public.organizations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- Permissions pour le bucket de stockage
-- Note: Ces commandes doivent être exécutées dans la console Supabase Storage

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('epavillonp', 'epavillonp', true)
-- ON CONFLICT (id) DO UPDATE SET public = true;

-- Politique pour permettre aux utilisateurs authentifiés d'uploader dans le dossier logo
-- CREATE POLICY "Authenticated users can upload logos"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'epavillonp' AND (storage.foldername(name))[1] = 'logo');

-- Politique pour permettre la lecture publique des logos
-- CREATE POLICY "Public can view logos"
-- ON storage.objects
-- FOR SELECT
-- USING (bucket_id = 'epavillonp' AND (storage.foldername(name))[1] = 'logo');