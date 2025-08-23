<template>
  <div class="admin-event-detail">
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
    
    <div v-else-if="event" class="space-y-6">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ event.title }}
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              {{ event.acronym }} - {{ event.year }}
            </p>
          </div>
          <div class="flex space-x-3">
            <span :class="getStatusClass(event.event_status)"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
              {{ event.event_status }}
            </span>
            <span :class="getSubmissionClass(event.submission_status)"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
              {{ event.submission_status === 'open' ? 'Soumissions ouvertes' : 'Soumissions fermées' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Informations de l'événement -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Description</h2>
            <div class="prose dark:prose-invert max-w-none">
              {{ event.description }}
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Détails</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Mode</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ event.participation_mode }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline soumissions</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ formatDateTime(event.submission_deadline) }}
                </dd>
              </div>
              <div v-if="event.city">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Lieu</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ event.city }}, {{ event.country?.name_fr }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Créé le</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ formatDate(event.created_at) }}
                </dd>
              </div>
            </dl>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Actions</h3>
            <div class="space-y-3">
              <button @click="toggleSubmissions"
                      :class="[
                        'w-full px-4 py-2 rounded-lg',
                        event.submission_status === 'open' 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      ]">
                {{ event.submission_status === 'open' ? 'Fermer les soumissions' : 'Ouvrir les soumissions' }}
              </button>
              <button @click="changeEventStatus"
                      class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Changer le statut
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Événement non trouvé</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'

const route = useRoute()
const { supabase } = useSupabase()
const { hasAdminRole } = useAdmin()

const isLoading = ref(true)
const event = ref(null)

if (!hasAdminRole.value) {
  throw new Error('Accès non autorisé')
}

const loadEvent = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        country:countries(id, name_fr)
      `)
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    event.value = data
  } catch (error) {
    console.error('Erreur lors du chargement de l\'événement:', error)
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('fr-FR')
}

const toggleSubmissions = async () => {
  const newStatus = event.value.submission_status === 'open' ? 'closed' : 'open'
  
  try {
    const { error } = await supabase
      .from('events')
      .update({ submission_status: newStatus })
      .eq('id', event.value.id)

    if (error) throw error
    event.value.submission_status = newStatus
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  }
}

const changeEventStatus = () => {
  console.log('Changer le statut de l\'événement')
}

onMounted(() => {
  loadEvent()
})
</script>