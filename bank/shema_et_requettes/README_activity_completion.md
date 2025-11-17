# Guide : Rapport de fin d'activité

## Vue d'ensemble

Lorsqu'une organisation termine son activité (`validation_status = 'completed'`), elle doit fournir les éléments suivants :

1. ✅ **Un compte rendu synthétique** de l'activité
2. ✅ **Deux témoignages** provenant des participants
3. ✅ **Des photos** prises lors de l'activité

## Structure de la base de données

### 1. Compte rendu synthétique

**Table:** `activities`
**Champ:** `completion_report` (TEXT)

```sql
-- Exemple de mise à jour
UPDATE activities
SET
    completion_report = 'Voici le compte rendu détaillé de notre activité...',
    validation_status = 'completed'
WHERE id = 'uuid-activité';
```

### 2. Témoignages des participants

**Table:** `user_testimonials`
**Type de contexte:** `'activity'` (ajouté au type ENUM `testimonial_context_type`)

```sql
-- Exemple d'insertion d'un témoignage
INSERT INTO user_testimonials (
    user_id,
    testimonial_text,
    context_type,
    context_id,
    thematique_type,
    photo_url,
    featured
) VALUES (
    'uuid-du-participant',
    'Cette activité a été très enrichissante et m''a permis de...',
    ARRAY['activity']::testimonial_context_type[],
    'uuid-de-lactivité',
    ARRAY['adaptation']::thematique_type[],
    'url-photo-participant',
    false
);

-- Récupérer les témoignages d'une activité
SELECT * FROM user_testimonials
WHERE 'activity' = ANY(context_type)
  AND context_id = 'uuid-de-lactivité';
```

### 3. Photos de l'activité

**Table:** `media_gallery`
**Type de contexte:** `'activity'` (déjà existant)

```sql
-- Exemple d'insertion d'une photo
INSERT INTO media_gallery (
    media_type,
    media_url,
    thumbnail_url,
    title,
    description,
    context_type,
    context_id,
    uploaded_by
) VALUES (
    'photo',
    'https://storage.exemple.com/photos/activite-photo-1.jpg',
    'https://storage.exemple.com/photos/activite-photo-1-thumb.jpg',
    'Photo de groupe lors de l''atelier',
    'Les participants lors de la session de brainstorming',
    'activity',
    'uuid-de-lactivité',
    'uuid-utilisateur-qui-upload'
);

-- Récupérer les photos d'une activité
SELECT * FROM media_gallery
WHERE context_type = 'activity'
  AND context_id = 'uuid-de-lactivité'
  AND media_type = 'photo';
```

## Validation avant de marquer comme 'completed'

Avant de permettre à une organisation de marquer son activité comme 'completed', il faut vérifier que tous les éléments sont présents :

```sql
-- Fonction de validation
CREATE OR REPLACE FUNCTION validate_activity_completion(activity_id UUID)
RETURNS TABLE (
    is_valid BOOLEAN,
    missing_elements TEXT[]
) AS $$
DECLARE
    has_report BOOLEAN;
    testimonials_count INTEGER;
    photos_count INTEGER;
    missing TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Vérifier le compte rendu
    SELECT (completion_report IS NOT NULL AND completion_report != '')
    INTO has_report
    FROM activities
    WHERE id = activity_id;

    IF NOT has_report THEN
        missing := array_append(missing, 'compte_rendu');
    END IF;

    -- Compter les témoignages
    SELECT COUNT(*)
    INTO testimonials_count
    FROM user_testimonials
    WHERE 'activity' = ANY(context_type)
      AND context_id = activity_id;

    IF testimonials_count < 2 THEN
        missing := array_append(missing, 'témoignages (minimum 2, trouvés: ' || testimonials_count || ')');
    END IF;

    -- Compter les photos
    SELECT COUNT(*)
    INTO photos_count
    FROM media_gallery
    WHERE context_type = 'activity'
      AND context_id = activity_id
      AND media_type = 'photo';

    IF photos_count < 1 THEN
        missing := array_append(missing, 'photos (minimum 1, trouvées: ' || photos_count || ')');
    END IF;

    -- Retourner le résultat
    RETURN QUERY SELECT
        (array_length(missing, 1) IS NULL),
        missing;
END;
$$ LANGUAGE plpgsql;

-- Exemple d'utilisation
SELECT * FROM validate_activity_completion('uuid-de-lactivité');
```

## Workflow recommandé dans l'application Vue

### 1. Page de soumission du rapport (Vue component)

```vue
<template>
  <div class="activity-completion-form">
    <h2>{{ $t('activity.completion.title') }}</h2>

    <!-- Compte rendu -->
    <div class="form-section">
      <label>{{ $t('activity.completion.report') }}</label>
      <textarea
        v-model="completionReport"
        rows="10"
        required
      ></textarea>
    </div>

    <!-- Témoignages -->
    <div class="form-section">
      <h3>{{ $t('activity.completion.testimonials') }} (2 requis)</h3>
      <TestimonialForm
        v-for="(testimonial, index) in testimonials"
        :key="index"
        v-model="testimonials[index]"
      />
      <button @click="addTestimonial" v-if="testimonials.length < 2">
        {{ $t('activity.completion.addTestimonial') }}
      </button>
    </div>

    <!-- Photos -->
    <div class="form-section">
      <h3>{{ $t('activity.completion.photos') }}</h3>
      <PhotoUploader
        v-model="photos"
        :activity-id="activityId"
      />
    </div>

    <!-- Validation -->
    <div class="validation-summary" v-if="validationResult">
      <p v-if="validationResult.is_valid" class="success">
        ✅ Tous les éléments sont présents
      </p>
      <div v-else class="error">
        ❌ Éléments manquants :
        <ul>
          <li v-for="missing in validationResult.missing_elements" :key="missing">
            {{ missing }}
          </li>
        </ul>
      </div>
    </div>

    <button
      @click="submitCompletion"
      :disabled="!canSubmit"
      class="btn-primary"
    >
      {{ $t('activity.completion.submit') }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const { supabase } = useSupabase()
const props = defineProps(['activityId'])

const completionReport = ref('')
const testimonials = ref([{}, {}]) // 2 témoignages minimum
const photos = ref([])
const validationResult = ref(null)

const canSubmit = computed(() => {
  return validationResult.value?.is_valid === true
})

async function validateCompletion() {
  const { data, error } = await supabase
    .rpc('validate_activity_completion', { activity_id: props.activityId })

  if (!error) {
    validationResult.value = data[0]
  }
  return !error && data[0]?.is_valid
}

async function submitCompletion() {
  // 1. Sauvegarder le compte rendu
  await supabase
    .from('activities')
    .update({
      completion_report: completionReport.value,
      validation_status: 'completed'
    })
    .eq('id', props.activityId)

  // 2. Sauvegarder les témoignages
  for (const testimonial of testimonials.value) {
    await supabase
      .from('user_testimonials')
      .insert({
        user_id: testimonial.user_id,
        testimonial_text: testimonial.text,
        context_type: ['activity'],
        context_id: props.activityId,
        thematique_type: testimonial.themes
      })
  }

  // 3. Les photos sont déjà sauvegardées via PhotoUploader

  // 4. Valider et rediriger
  const isValid = await validateCompletion()
  if (isValid) {
    // Rediriger vers la page de l'activité
    router.push(`/activities/${props.activityId}`)
  }
}
</script>
```

### 2. Composable pour la gestion du rapport

```javascript
// src/composables/useActivityCompletion.js
import { ref } from 'vue'
import { useSupabase } from './useSupabase'

export function useActivityCompletion(activityId) {
  const { supabase } = useSupabase()
  const validationResult = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function validateCompletion() {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .rpc('validate_activity_completion', { activity_id: activityId })

      if (err) throw err
      validationResult.value = data[0]
      return data[0]?.is_valid
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function submitReport(reportData) {
    loading.value = true
    error.value = null

    try {
      // 1. Mettre à jour le compte rendu
      const { error: updateError } = await supabase
        .from('activities')
        .update({
          completion_report: reportData.report
        })
        .eq('id', activityId)

      if (updateError) throw updateError

      // 2. Ajouter les témoignages
      for (const testimonial of reportData.testimonials) {
        const { error: testimonialError } = await supabase
          .from('user_testimonials')
          .insert({
            user_id: testimonial.userId,
            testimonial_text: testimonial.text,
            context_type: ['activity'],
            context_id: activityId,
            thematique_type: testimonial.themes,
            photo_url: testimonial.photoUrl
          })

        if (testimonialError) throw testimonialError
      }

      // 3. Valider que tout est en place
      const isValid = await validateCompletion()

      if (isValid) {
        // 4. Marquer comme completed
        const { error: statusError } = await supabase
          .from('activities')
          .update({ validation_status: 'completed' })
          .eq('id', activityId)

        if (statusError) throw statusError
      }

      return isValid
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function getCompletionData() {
    loading.value = true
    error.value = null

    try {
      // Récupérer le compte rendu
      const { data: activity, error: activityError } = await supabase
        .from('activities')
        .select('completion_report')
        .eq('id', activityId)
        .single()

      if (activityError) throw activityError

      // Récupérer les témoignages
      const { data: testimonials, error: testimonialsError } = await supabase
        .from('user_testimonials')
        .select('*, users(first_name, last_name)')
        .contains('context_type', ['activity'])
        .eq('context_id', activityId)

      if (testimonialsError) throw testimonialsError

      // Récupérer les photos
      const { data: photos, error: photosError } = await supabase
        .from('media_gallery')
        .select('*')
        .eq('context_type', 'activity')
        .eq('context_id', activityId)
        .eq('media_type', 'photo')

      if (photosError) throw photosError

      return {
        report: activity.completion_report,
        testimonials,
        photos
      }
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    validationResult,
    loading,
    error,
    validateCompletion,
    submitReport,
    getCompletionData
  }
}
```

## Fichiers de traduction (i18n)

### Français (`src/locales/fr/index.js`)

```javascript
export default {
  // ... autres traductions
  activity: {
    completion: {
      title: 'Rapport de fin d\'activité',
      report: 'Compte rendu synthétique',
      reportPlaceholder: 'Décrivez les résultats, les apprentissages et l\'impact de votre activité...',
      testimonials: 'Témoignages des participants',
      addTestimonial: 'Ajouter un témoignage',
      photos: 'Photos de l\'activité',
      submit: 'Soumettre le rapport',
      validation: {
        success: 'Tous les éléments sont présents',
        missing: 'Éléments manquants',
        reportRequired: 'Le compte rendu est requis',
        testimonialsRequired: 'Minimum 2 témoignages requis',
        photosRequired: 'Au moins 1 photo requise'
      }
    }
  }
}
```

### Anglais (`src/locales/en/index.js`)

```javascript
export default {
  // ... other translations
  activity: {
    completion: {
      title: 'Activity Completion Report',
      report: 'Summary Report',
      reportPlaceholder: 'Describe the results, learnings and impact of your activity...',
      testimonials: 'Participant Testimonials',
      addTestimonial: 'Add Testimonial',
      photos: 'Activity Photos',
      submit: 'Submit Report',
      validation: {
        success: 'All elements are present',
        missing: 'Missing elements',
        reportRequired: 'Summary report is required',
        testimonialsRequired: 'Minimum 2 testimonials required',
        photosRequired: 'At least 1 photo required'
      }
    }
  }
}
```

## Migration de la base de données

Pour appliquer ces changements à votre base de données Supabase :

```bash
# Exécuter le script de migration
# Ouvrir le SQL Editor dans Supabase et exécuter le contenu de :
# bank/shema_et_requettes/migration_activity_completion_report.sql
```

Ou via l'interface Supabase :
1. Aller dans le **SQL Editor**
2. Copier le contenu de `migration_activity_completion_report.sql`
3. Exécuter la requête
4. Créer la fonction `validate_activity_completion` fournie ci-dessus
