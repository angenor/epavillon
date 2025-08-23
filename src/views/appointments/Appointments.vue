<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('appointments.title') }}
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {{ t('appointments.description') }}
            </p>
          </div>
          <button 
            @click="showNewAppointmentModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            {{ t('appointments.newAppointment') }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="px-4 sm:px-0">
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div v-if="loading" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
            
            <div v-else-if="appointments.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0v1m0 0v8a1 1 0 01-1 1H6a1 1 0 01-1-1V9a1 1 0 011-1h2z"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {{ t('appointments.noAppointments') }}
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ t('appointments.noAppointmentsDescription') }}
              </p>
            </div>

            <div v-else class="space-y-4">
              <!-- Liste des rendez-vous -->
              <div v-for="appointment in appointments" :key="appointment.id"
                   class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                      {{ appointment.title }}
                    </h3>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {{ appointment.description }}
                    </p>
                    <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0v1m0 0v8a1 1 0 01-1 1H6a1 1 0 01-1-1V9a1 1 0 011-1h2z"/>
                        </svg>
                        {{ formatDate(appointment.scheduled_at) }}
                      </div>
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        {{ appointment.participant_name }}
                      </div>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="getStatusClass(appointment.status)">
                        {{ t(`appointments.status.${appointment.status}`) }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="editAppointment(appointment)"
                      class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button 
                      @click="deleteAppointment(appointment.id)"
                      class="p-2 text-red-400 hover:text-red-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour nouveau rendez-vous -->
    <div v-if="showNewAppointmentModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showNewAppointmentModal = false"></div>
        
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              {{ t('appointments.newAppointment') }}
            </h3>
            
            <p class="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
              {{ t('appointments.comingSoon') }}
            </p>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              @click="showNewAppointmentModal = false"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm">
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// État
const loading = ref(true)
const appointments = ref([])
const showNewAppointmentModal = ref(false)

// Méthodes
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const getStatusClass = (status) => {
  switch (status) {
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

const editAppointment = (appointment) => {
  // TODO: Implémenter l'édition
  console.log('Edit appointment:', appointment)
}

const deleteAppointment = async (appointmentId) => {
  // TODO: Implémenter la suppression
  console.log('Delete appointment:', appointmentId)
}

const loadAppointments = async () => {
  loading.value = true
  try {
    // TODO: Charger les rendez-vous depuis Supabase
    // Pour l'instant, données de test
    appointments.value = []
  } catch (error) {
    console.error('Erreur lors du chargement des rendez-vous:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAppointments()
})
</script>