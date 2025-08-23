<template>
  <div class="admin-events">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Événements
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">
          Administration des événements annuels
        </p>
      </div>
      <router-link to="/admin/events/create"
                   class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
        Créer un événement
      </router-link>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>
      
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Événement
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Année
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Soumissions
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="event in events" :key="event.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ event.title }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ event.acronym }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ event.year }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(event.event_status)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ event.event_status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getSubmissionClass(event.submission_status)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ event.submission_status === 'open' ? 'Ouvertes' : 'Fermées' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <router-link :to="`/admin/events/${event.id}`"
                             class="text-orange-600 hover:text-orange-900">
                    Voir
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'

const { supabase } = useSupabase()
const { hasAdminRole } = useAdmin()

const isLoading = ref(true)
const events = ref([])

if (!hasAdminRole.value) {
  throw new Error('Accès non autorisé')
}

const loadEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('year', { ascending: false })

    if (error) throw error
    events.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des événements:', error)
  } finally {
    isLoading.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800'
  }
  return classes[status] || classes.upcoming
}

const getSubmissionClass = (status) => {
  return status === 'open' 
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800'
}

onMounted(() => {
  loadEvents()
})
</script>