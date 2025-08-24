<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <!-- Icône d'erreur -->
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900">
            <svg class="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
            </svg>
          </div>

          <!-- Titre et message -->
          <div class="mt-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('error.403.title') }}
            </h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {{ t('error.403.message') }}
            </p>
          </div>

          <!-- Détails -->
          <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ t('error.403.details') }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 space-y-4">
            <!-- Retour à l'accueil -->
            <router-link to="/" 
                       class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              {{ t('error.403.backHome') }}
            </router-link>

            <!-- Contacter l'administrateur -->
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('error.403.needAccess') }}
                <a href="mailto:admin@ifdd.francophonie.org" 
                   class="text-orange-600 hover:text-orange-500 dark:text-orange-400 font-medium">
                  {{ t('error.403.contactAdmin') }}
                </a>
              </p>
            </div>

            <!-- Informations utilisateur si connecté -->
            <div v-if="currentUser" class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ t('error.403.connectedAs') }}: {{ currentUser.first_name }} {{ currentUser.last_name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ t('error.403.currentRoles') }}: {{ userRoles.join(', ') || t('error.403.noRoles') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { useUserRoles } from '@/composables/useUserRoles'

const { t } = useI18n()
const { currentUser } = useAuth()
const { getUserRoles } = useUserRoles()

const userRoles = ref([])

const loadUserRoles = async () => {
  if (currentUser.value) {
    try {
      const roles = await getUserRoles(currentUser.value.id)
      userRoles.value = roles
        .filter(role => role.is_active && (!role.valid_until || new Date(role.valid_until) > new Date()))
        .map(role => t(`admin.roles.types.${role.role}`))
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error)
    }
  }
}

onMounted(() => {
  loadUserRoles()
})
</script>