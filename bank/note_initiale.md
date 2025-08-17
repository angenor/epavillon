Il semble qu'il manque la rubrique: "Réunion de la Francophonie"

    id 
    title TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    location TEXT,
    country_id UUID REFERENCES public.countries(id) NOT NULL,
    category session_category NOT NULL,
    zoom_meeting_id UUID REFERENCES public.zoom_meetings(id),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
    updated_at TIMESTAMPTZ DEFAULT NOW()