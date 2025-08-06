<template>
  <div class="h-full w-80 backdrop-blur-sm shadow-2xl flex flex-col">
    <!-- Header -->
    <div class="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-bold text-white font-maverick">
        {{ "Cop 29" }}
      </h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-ifdd-bleu"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 p-6">
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p class="text-sm text-red-600 dark:text-red-400">{{ t('common.error') }}: {{ error }}</p>
      </div>
    </div>

    <!-- Activités -->
    <RouterLink to="#" v-else class="flex-1 overflow-y-auto">
      <div class="max-h-1/4 text-white bg-white/40 rounded-xl mx-1 mt-1 py-2 px-3 overflow-hidden">
        <div class=" font-bold text-xl">Titre de l'activité</div>
        <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, eum fuga.</div>
        <div class="flex mt-2 text-gray-100 justify-between">
          <div class=" rounded-full border border-green-500 font-bold px-2 text-sm">Demain à 15h30</div>
          <!-- Nom de l'organisation qui organise l'activité -->
          <div class="text-sm">Organisation</div>
          <!-- logo de l'organisation qui organise l'activité -->
          <img src="#" alt="">
        </div>
      </div>
    </RouterLink>
    <!-- Voir toutes les activités -->
    <button></button>

    <!-- Formations 1/5 max -->
     <RouterLink to="/formations">
      <!-- Titre de la formation -->
       <div></div>
       <!-- Date de debut & date de fin -->
        <div></div>
     </RouterLink>
     <!-- Voir toutes les Formations -->
    <button></button>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'
import { useActivities } from '@/composables/useActivities'
import { RouterLink } from 'vue-router'

export default {
  name: 'UpcomingActivities',
  setup() {
    const { t, locale } = useI18n()
    const { 
      events, 
      trainings, 
      loading, 
      error, 
      fetchAllUpcoming,
      formatDate,
      formatTime,
      getEventStatus
    } = useActivities()

    // Charger les données au montage
    onMounted(async () => {
      await fetchAllUpcoming()
    })

    // Formater la date d'un événement
    const formatEventDate = (event) => {
      if (event.online_start_datetime) {
        const date = formatDate(event.online_start_datetime)
        const time = formatTime(event.online_start_datetime)
        return `${date} • ${time}`
      } else if (event.in_person_start_date) {
        return formatDate(event.in_person_start_date)
      }
      return ''
    }

    // Obtenir le nom du pays selon la langue
    const getCountryName = (country) => {
      if (!country) return ''
      return locale.value === 'fr' ? country.name_fr : country.name_en
    }

    // Obtenir la classe de statut
    const getEventStatusClass = (event) => {
      const status = getEventStatus(event)
      switch (status) {
        case 'ongoing':
          return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
        case 'upcoming':
          return 'bg-ifdd-bleu text-white'
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
      }
    }

    // Obtenir le label de catégorie
    const getCategoryLabel = (category) => {
      return t(`activities.categories.${category}`)
    }

    // Calculer la durée d'une formation
    const getTrainingDuration = (training) => {
      if (!training.start_date || !training.end_date) return ''
      
      const start = new Date(training.start_date)
      const end = new Date(training.end_date)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 7) {
        return t('activities.duration.days', { count: diffDays })
      } else if (diffDays < 30) {
        const weeks = Math.ceil(diffDays / 7)
        return t('activities.duration.weeks', { count: weeks })
      } else {
        const months = Math.ceil(diffDays / 30)
        return t('activities.duration.months', { count: months })
      }
    }

    return { 
      t,
      events,
      trainings,
      loading,
      error,
      formatEventDate,
      formatDate,
      getCountryName,
      getEventStatus,
      getEventStatusClass,
      getCategoryLabel,
      getTrainingDuration
    }
  }
}
</script>