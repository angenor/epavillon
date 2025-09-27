l'ancienne structure de ma base de donnée est @migration/ancienne_plateforme/old_doc.md les données peuvent fetcher via api à l'adress https://epavillonclimatique.francophonie.org/api/getdocs je veux faire une migration vers la nouvelle plateforme dont la struction du document est:

CREATE TABLE public.negotiation_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    document_type document_type NOT NULL,
    category session_category NOT NULL,
    is_migrate BOOLEAN,
    description TEXT,
    cover_image_url TEXT,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

NB: categorie et type on été inversé

je veux que tu crees une interface pour effectuer la migration, elle sera effectué au nom de l'utilisateur authentifié(uploaded_by), la migration démarre lorsqu'on clique sur un bouton. les données pdf, image de coverture reste sur l'ancien serveur(base url: https://epavillonclimatique.francophonie.org/).
Je veux pouvoir revenir en arrière en cas de mauvaise migration.
