-- Script de création de la table user_favorite_documents
-- Cette table permet aux utilisateurs de marquer des documents de négociation comme favoris

-- Créer la table user_favorite_documents
CREATE TABLE IF NOT EXISTS public.user_favorite_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.negotiation_documents(id) ON DELETE CASCADE,
    favorited_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, document_id)
);

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_favorite_documents_user_id
    ON public.user_favorite_documents(user_id);

CREATE INDEX IF NOT EXISTS idx_user_favorite_documents_document_id
    ON public.user_favorite_documents(document_id);

CREATE INDEX IF NOT EXISTS idx_user_favorite_documents_favorited_at
    ON public.user_favorite_documents(favorited_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE public.user_favorite_documents ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Les utilisateurs peuvent voir leurs propres favoris
CREATE POLICY "Users can view own favorites"
    ON public.user_favorite_documents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Politique RLS : Les utilisateurs peuvent ajouter leurs propres favoris
CREATE POLICY "Users can insert own favorites"
    ON public.user_favorite_documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique RLS : Les utilisateurs peuvent supprimer leurs propres favoris
CREATE POLICY "Users can delete own favorites"
    ON public.user_favorite_documents
    FOR DELETE
    USING (auth.uid() = user_id);

-- Fonction pour basculer le statut favori d'un document
CREATE OR REPLACE FUNCTION public.toggle_document_favorite(p_document_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_exists BOOLEAN;
    v_result JSONB;
BEGIN
    -- Récupérer l'ID de l'utilisateur actuel
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
    END IF;

    -- Vérifier si le favori existe déjà
    SELECT EXISTS(
        SELECT 1 FROM public.user_favorite_documents
        WHERE user_id = v_user_id AND document_id = p_document_id
    ) INTO v_exists;

    IF v_exists THEN
        -- Supprimer le favori
        DELETE FROM public.user_favorite_documents
        WHERE user_id = v_user_id AND document_id = p_document_id;

        v_result := jsonb_build_object(
            'success', true,
            'action', 'removed',
            'is_favorited', false
        );
    ELSE
        -- Ajouter le favori
        INSERT INTO public.user_favorite_documents (user_id, document_id)
        VALUES (v_user_id, p_document_id);

        v_result := jsonb_build_object(
            'success', true,
            'action', 'added',
            'is_favorited', true
        );
    END IF;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le nombre de favoris d'un document
CREATE OR REPLACE FUNCTION public.get_document_favorites_count(p_document_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.user_favorite_documents
        WHERE document_id = p_document_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un document est dans les favoris de l'utilisateur actuel
CREATE OR REPLACE FUNCTION public.is_document_favorited(p_document_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1
        FROM public.user_favorite_documents
        WHERE user_id = auth.uid()
        AND document_id = p_document_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les permissions nécessaires
GRANT ALL ON public.user_favorite_documents TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_document_favorite(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_document_favorites_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_document_favorited(UUID) TO authenticated;

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.user_favorite_documents IS 'Table pour stocker les documents marqués comme favoris par les utilisateurs';
COMMENT ON COLUMN public.user_favorite_documents.id IS 'Identifiant unique du favori';
COMMENT ON COLUMN public.user_favorite_documents.user_id IS 'Référence vers l''utilisateur qui a marqué le document comme favori';
COMMENT ON COLUMN public.user_favorite_documents.document_id IS 'Référence vers le document de négociation marqué comme favori';
COMMENT ON COLUMN public.user_favorite_documents.favorited_at IS 'Date et heure où le document a été marqué comme favori';