<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('admin.activities.datesManager.title') || 'Gestion des dates des activités' }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ t('admin.activities.datesManager.subtitle') || 'Organisez les dates par glisser-déposer' }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Filtre par statut -->
          <select
            v-model="eventType"
            @change="updateEventsCopie"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white text-sm">
            <option value="all">{{ t('admin.activities.datesManager.allActivities') || 'Toutes les activités' }} ({{ events.length }})</option>
            <option value="submitted">{{ t('admin.activities.datesManager.submitted') || 'En révision' }} ({{ events.filter(e => ['submitted', 'under_review'].includes(e.class)).length }})</option>
            <option value="approved">{{ t('admin.activities.datesManager.approved') || 'Approuvées' }} ({{ events.filter(e => e.class === 'approved').length }})</option>
            <option value="rejected">{{ t('admin.activities.datesManager.rejected') || 'Rejetées' }} ({{ events.filter(e => e.class === 'rejected').length }})</option>
            <option value="cancelled">{{ t('admin.activities.datesManager.cancelled') || 'Annulées' }} ({{ events.filter(e => e.class === 'cancelled').length }})</option>
          </select>

          <!-- Bouton Enregistrer (affiché uniquement si des modifications existent) -->
          <button
            v-if="pendingChanges.length > 0 && messageSave !== 'saving'"
            @click="saveChanges"
            class="cursor-pointer px-5 py-2 bg-ifdd-yellow hover:bg-yellow-400 active:bg-yellow-300 text-ifdd-green3 font-bold rounded-lg shadow-md transition-all duration-150 flex items-center gap-2">
            <span>{{ t('common.save') || 'Enregistrer' }}</span>
            <span class="bg-ifdd-red text-white rounded-full px-2 py-0.5 text-xs font-extrabold">
              {{ pendingChanges.length }}
            </span>
          </button>

          <!-- État d'enregistrement -->
          <div v-if="messageSave === 'saving'" class="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <svg class="h-5 w-5 animate-spin text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {{ t('common.saving') || 'Enregistrement...' }}
            </span>
          </div>

          <div v-else-if="messageSave === 'success'" class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium">
            {{ t('common.saved') || 'Enregistré' }}
          </div>

          <div v-else-if="messageSave === 'error'" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">
            {{ t('common.error') || 'Erreur' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Calendrier Vue-Cal en fullscreen -->
    <div class="flex-1 overflow-hidden p-4">
      <vue-cal
        ref="vuecal"
        :events="eventsCopie"
        v-model:active-view="activeView"
        :disable-views="['years']"
        :editable-events="{ drag: true, resize: true, create: false }"
        :time-from="7 * 60"
        :time-to="20 * 60"
        :time-cell-height="70"
        :snap-to-time="15"
        locale="fr"
        today-button
        @event-duration-change="onEventDurationChange"
        @event-drop="onEventDrop"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full">

        <!-- Template personnalisé pour les événements -->
        <template #event="{ event }">
          <div
            @dblclick="viewActivity(event.activity)"
            @mouseenter="activityHover = event"
            @mouseleave="activityHover = null"
            class="h-full p-2 rounded-md transition-all cursor-pointer hover:shadow-lg"
            :title="event.title">

            <!-- Logo de l'organisation -->
            <div class="flex items-center gap-2 mb-1">
              <img
                v-if="event.logo_url"
                :src="event.logo_url"
                :alt="event.organization"
                class="w-6 h-6 rounded-full object-contain bg-white">
              <div class="flex-1 font-bold text-xs truncate">
                {{ event.title }}
              </div>
            </div>

            <!-- Informations temporelles -->
            <div class="text-xs space-y-0.5">
              <div class="font-semibold">
                {{ event.start.format('DD/MM/YYYY HH:mm') }} - {{ event.end.formatTime('HH:mm') }}
              </div>

              <!-- Dates proposées initiales si différentes -->
              <div
                v-if="hasDateChanged(event)"
                class="line-through italic opacity-75"
                :title="'Date proposée initialement'">
                {{ event.start_proposed.format('DD/MM/YYYY HH:mm') }} - {{ event.end_proposed.formatTime('HH:mm') }}
              </div>
            </div>

            <!-- Localisation -->
            <div v-if="event.location" class="flex items-center gap-1 mt-1 text-xs opacity-90">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="truncate">{{ event.location }}</span>
            </div>
          </div>
        </template>
      </vue-cal>
    </div>

    <!-- Popup d'information au survol -->
    <div
      :class="activityHover ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'"
      class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 w-96 transition-all duration-200 border border-gray-200 dark:border-gray-700">
      <div v-if="activityHover" class="space-y-3">
        <!-- Header avec logo -->
        <div class="flex items-start gap-3">
          <img
            v-if="activityHover.logo_url"
            :src="activityHover.logo_url"
            :alt="activityHover.organization"
            class="w-16 h-16 rounded-lg object-contain bg-gray-50 dark:bg-gray-700 p-1">
          <div class="flex-1">
            <h3 class="font-bold text-gray-900 dark:text-white line-clamp-2">
              {{ activityHover.title }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ activityHover.organization }}
            </p>
          </div>
        </div>

        <!-- Informations supplémentaires -->
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>{{ activityHover.location }}</span>
          </div>

          <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <span class="px-2 py-1 rounded-md text-xs font-medium"
                  :class="getStatusBadgeClass(activityHover.class)">
              {{ getStatusText(activityHover.class) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import VueCal from 'vue-cal'
import 'vue-cal/style.css'

const { t } = useI18n()
const router = useRouter()
const { supabase } = useSupabase()

// État
const vuecal = ref(null)
const activeView = ref('month')
const eventType = ref('all')
const events = ref([])
const eventsCopie = ref([])
const activityHover = ref(null)
const pendingChanges = ref([])
const messageSave = ref(null)

// Charger les activités depuis la base de données
const loadActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        id,
        title,
        proposed_start_date,
        proposed_end_date,
        final_start_date,
        final_end_date,
        validation_status,
        organization:organizations(
          id,
          name,
          logo_url,
          country:countries(name_fr)
        )
      `)
      .eq('is_deleted', false)
      .not('proposed_start_date', 'is', null)
      .not('proposed_end_date', 'is', null)
      .order('proposed_start_date', { ascending: true })

    if (error) throw error

    // Transformer les données pour vue-cal
    events.value = (data || []).map(activity => {
      const startDate = activity.final_start_date || activity.proposed_start_date
      const endDate = activity.final_end_date || activity.proposed_end_date

      return {
        id: activity.id,
        title: activity.organization?.name || 'Sans organisation',
        organization: activity.organization?.name || 'Sans organisation',
        logo_url: activity.organization?.logo_url,
        location: activity.organization?.country?.name_fr || '',

        // Dates proposées par l'organisation
        start_proposed: new Date(activity.proposed_start_date),
        end_proposed: new Date(activity.proposed_end_date),

        // Dates actuelles (finales ou proposées)
        start: new Date(startDate),
        end: new Date(endDate),

        // Statut pour le style
        class: mapValidationStatus(activity.validation_status),

        // Données complètes de l'activité
        activity: activity
      }
    })

    updateEventsCopie()
  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error)
  }
}

// Mapper le statut de validation vers les classes CSS
const mapValidationStatus = (status) => {
  const mapping = {
    'draft': 'draft',
    'submitted': 'submitted',
    'under_review': 'submitted',
    'approved': 'approved',
    'rejected': 'rejected',
    'cancelled': 'cancelled',
    'live': 'approved',
    'completed': 'approved'
  }
  return mapping[status] || 'draft'
}

// Filtrer les événements selon le type sélectionné
const updateEventsCopie = () => {
  if (eventType.value === 'all') {
    eventsCopie.value = events.value
  } else if (eventType.value === 'submitted') {
    eventsCopie.value = events.value.filter(e => ['submitted', 'under_review'].includes(e.class))
  } else {
    eventsCopie.value = events.value.filter(e => e.class === eventType.value)
  }
}

// Vérifier si les dates ont changé
const hasDateChanged = (event) => {
  return (
    event.start.getTime() !== event.start_proposed.getTime() ||
    event.end.getTime() !== event.end_proposed.getTime()
  )
}

// Gérer le changement de durée (redimensionnement)
const onEventDurationChange = (eventData) => {
  messageSave.value = null
  const event = eventData.event

  // Vérifier si la date a vraiment changé
  const oldEvent = events.value.find(e => e.id === event.id)
  if (oldEvent && oldEvent.end.getTime() !== event.end.getTime()) {
    addOrUpdatePendingChange(event)
  }
}

// Gérer le déplacement d'événement (glisser-déposer)
const onEventDrop = (eventData) => {
  messageSave.value = null
  const event = eventData.event

  // Vérifier si la date a vraiment changé
  const oldEvent = events.value.find(e => e.id === event.id)
  if (oldEvent && oldEvent.start.getTime() !== event.start.getTime()) {
    addOrUpdatePendingChange(event)
  }
}

// Ajouter ou mettre à jour une modification en attente
const addOrUpdatePendingChange = (event) => {
  // Retirer l'ancienne modification si elle existe
  pendingChanges.value = pendingChanges.value.filter(change => change.id !== event.id)

  // Ajouter la nouvelle modification
  pendingChanges.value.push({
    id: event.id,
    final_start_date: event.start.toISOString(),
    final_end_date: event.end.toISOString()
  })

  // Mettre à jour aussi dans events.value pour cohérence
  const index = events.value.findIndex(e => e.id === event.id)
  if (index !== -1) {
    events.value[index].start = new Date(event.start)
    events.value[index].end = new Date(event.end)
  }
}

// Enregistrer toutes les modifications
const saveChanges = async () => {
  messageSave.value = 'saving'

  try {
    // Pour chaque modification, mettre à jour la base de données
    for (const change of pendingChanges.value) {
      // 1. Mettre à jour la table activities
      const { error: activityError } = await supabase
        .from('activities')
        .update({
          final_start_date: change.final_start_date,
          final_end_date: change.final_end_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', change.id)

      if (activityError) throw activityError

      // 2. Enregistrer dans activity_modifications
      const { error: modificationError } = await supabase
        .from('activity_modifications')
        .insert([
          {
            activity_id: change.id,
            field_name: 'final_start_date',
            new_value: change.final_start_date,
            new_value_type: 'date',
            modified_at: new Date().toISOString()
          },
          {
            activity_id: change.id,
            field_name: 'final_end_date',
            new_value: change.final_end_date,
            new_value_type: 'date',
            modified_at: new Date().toISOString()
          }
        ])

      if (modificationError) throw modificationError
    }

    messageSave.value = 'success'
    pendingChanges.value = []

    // Masquer le message après 3 secondes
    setTimeout(() => {
      messageSave.value = null
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
    messageSave.value = 'error'

    setTimeout(() => {
      messageSave.value = null
    }, 3000)
  }
}

// Voir les détails d'une activité
const viewActivity = (activity) => {
  router.push(`/admin/activities/${activity.id}`)
}

// Classes CSS pour les badges de statut
const getStatusBadgeClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    submitted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
  return classes[status] || classes.draft
}

// Texte du statut
const getStatusText = (status) => {
  const texts = {
    draft: t('admin.activities.statuses.draft') || 'Brouillon',
    submitted: t('admin.activities.statuses.submitted') || 'En révision',
    approved: t('admin.activities.statuses.approved') || 'Approuvée',
    rejected: t('admin.activities.statuses.rejected') || 'Rejetée',
    cancelled: t('admin.activities.statuses.cancelled') || 'Annulée'
  }
  return texts[status] || texts.draft
}

// Chargement initial
onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
/* Styles personnalisés pour vue-cal */
:deep(.vuecal__event) {
  cursor: pointer;
  border-radius: 0.375rem;
  overflow: hidden;
}

/* Couleurs par statut */
:deep(.vuecal__event.draft) {
  background-color: rgba(156, 163, 175, 0.9);
  color: #fff;
}

:deep(.vuecal__event.submitted) {
  background-color: rgba(251, 191, 36, 0.9);
  color: #78350f;
}

:deep(.vuecal__event.approved) {
  background-color: rgba(34, 197, 94, 0.9);
  color: #fff;
}

:deep(.vuecal__event.rejected) {
  background-color: rgba(239, 68, 68, 0.9);
  color: #fff;
}

:deep(.vuecal__event.cancelled) {
  background-color: rgba(75, 85, 99, 0.9);
  color: #fff;
}

/* Header du calendrier */
:deep(.vuecal__header) {
  background-color: #255033;
  color: white;
  border-radius: 0.75rem 0.75rem 0 0;
}

/* Cellules du calendrier */
:deep(.vuecal__cell) {
  min-height: 80px;
}

/* Vue mois */
:deep(.vuecal--month-view .vuecal__cell) {
  height: 100px;
}

/* Bouton aujourd'hui */
:deep(.vuecal__today-btn) {
  background-color: #f59e0b;
  color: white;
  font-weight: 600;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
}

/* Dark mode pour vue-cal */
.dark :deep(.vuecal) {
  background-color: #1f2937;
  color: #f3f4f6;
}

.dark :deep(.vuecal__cell) {
  border-color: #374151;
}

.dark :deep(.vuecal__title) {
  color: #f3f4f6;
}

.dark :deep(.vuecal__weekdays-headings) {
  background-color: #111827;
  border-color: #374151;
}
</style>
