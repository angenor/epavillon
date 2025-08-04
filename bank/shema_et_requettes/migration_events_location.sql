-- Migration pour restructurer les informations de localisation des événements
-- Remplace in_person_location par country_id, city et address pour tous les modes de participation

-- 1. Ajouter les nouvelles colonnes
ALTER TABLE public.events 
ADD COLUMN country_id UUID REFERENCES public.countries(id),
ADD COLUMN city TEXT,
ADD COLUMN address TEXT;

-- 2. Migrer les données existantes si nécessaire
-- Note: Cette étape suppose que in_person_location contient une adresse complète
-- Vous devrez peut-être ajuster cette logique selon le format actuel des données
UPDATE public.events 
SET 
    address = in_person_location
WHERE in_person_location IS NOT NULL;

-- 3. Supprimer l'ancienne colonne
ALTER TABLE public.events 
DROP COLUMN in_person_location;

-- 4. Ajouter des commentaires pour clarifier l'utilisation
COMMENT ON COLUMN public.events.country_id IS 'Pays où se déroule l''événement (référence vers la table countries)';
COMMENT ON COLUMN public.events.city IS 'Ville où se déroule l''événement';
COMMENT ON COLUMN public.events.address IS 'Adresse complète de l''événement';

-- 5. Optionnel: Ajouter des contraintes si nécessaire pour les événements en personne ou hybrides
-- Note: Cette contrainte s'assure que les informations de localisation sont fournies pour les événements physiques
ALTER TABLE public.events
ADD CONSTRAINT check_location_for_physical_events 
CHECK (
    (participation_mode = 'online') 
    OR 
    (country_id IS NOT NULL AND city IS NOT NULL AND address IS NOT NULL)
);

-- 6. Créer un index pour améliorer les performances des requêtes par pays
CREATE INDEX idx_events_country ON public.events(country_id);