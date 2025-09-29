<template>
  <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        <div class="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg mr-3">
          <font-awesome-icon
            icon="shield-alt"
            class="w-5 h-5 text-white"
          />
        </div>
        {{ t('profile.roleSpecific.admin.title') || 'Administration' }}
      </h3>
      <button
        v-if="isSuperAdmin"
        @click="navigateToDashboard"
        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
      >
        <font-awesome-icon
          icon="tachometer-alt"
          class="mr-2"
        />
        {{ t('profile.roleSpecific.admin.goToDashboard') || 'Tableau de bord admin' }}
      </button>
    </div>

    <div class="p-6">
      <!-- Statistiques d'administration -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div class="flex items-center mb-2">
            <font-awesome-icon
              icon="users"
              class="text-orange-600 dark:text-orange-400 mr-2"
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('profile.roleSpecific.admin.totalUsers') || 'Utilisateurs totaux' }}
            </span>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalUsers }}</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div class="flex items-center mb-2">
            <font-awesome-icon
              icon="calendar-check"
              class="text-blue-600 dark:text-blue-400 mr-2"
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('profile.roleSpecific.admin.activeEvents') || 'Événements actifs' }}
            </span>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeEvents }}</p>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div class="flex items-center mb-2">
            <font-awesome-icon
              icon="graduation-cap"
              class="text-green-600 dark:text-green-400 mr-2"
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('profile.roleSpecific.admin.activeTrainings') || 'Formations actives' }}
            </span>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeTrainings }}</p>
        </div>
      </div>

      <!-- Actions d'administration -->
      <div class="space-y-4">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {{ t('profile.roleSpecific.admin.quickActions') || 'Actions rapides' }}
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            @click="navigateToUsers"
            class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
              <font-awesome-icon
                icon="users-cog"
                class="text-orange-600 dark:text-orange-400"
              />
            </div>
            <div class="text-left">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t('profile.roleSpecific.admin.manageUsers') || 'Gérer les utilisateurs' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ t('profile.roleSpecific.admin.manageUsersDesc') || 'Gérer les comptes et permissions' }}
              </div>
            </div>
          </button>

          <button
            @click="navigateToOrganizations"
            class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
              <font-awesome-icon
                icon="building"
                class="text-blue-600 dark:text-blue-400"
              />
            </div>
            <div class="text-left">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t('profile.roleSpecific.admin.manageOrganizations') || 'Gérer les organisations' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ t('profile.roleSpecific.admin.manageOrganizationsDesc') || 'Valider et gérer les organisations' }}
              </div>
            </div>
          </button>

          <button
            @click="navigateToReports"
            class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
              <font-awesome-icon
                icon="chart-bar"
                class="text-purple-600 dark:text-purple-400"
              />
            </div>
            <div class="text-left">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t('profile.roleSpecific.admin.viewReports') || 'Voir les rapports' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ t('profile.roleSpecific.admin.viewReportsDesc') || 'Statistiques et analyses' }}
              </div>
            </div>
          </button>

          <button
            @click="navigateToContent"
            class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
              <font-awesome-icon
                icon="file-alt"
                class="text-green-600 dark:text-green-400"
              />
            </div>
            <div class="text-left">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t('profile.roleSpecific.admin.manageContent') || 'Gérer le contenu' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ t('profile.roleSpecific.admin.manageContentDesc') || 'Modérer les activités et formations' }}
              </div>
            </div>
          </button>

          <button
            v-if="isSuperAdmin"
            @click="navigateToSettings"
            class="flex items-center p-3 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
              <font-awesome-icon
                icon="cogs"
                class="text-red-600 dark:text-red-400"
              />
            </div>
            <div class="text-left">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t('profile.roleSpecific.admin.systemSettings') || 'Paramètres système' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ t('profile.roleSpecific.admin.systemSettingsDesc') || 'Configuration avancée (Super Admin)' }}
              </div>
            </div>
          </button>

          <button
            v-if="isSuperAdmin"
            @click="navigateToRoles"
            class="flex items-center p-3 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
              <font-awesome-icon
                icon="user-shield"
                class="text-red-600 dark:text-red-400"
              />
            </div>
            <div class="text-left">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t('profile.roleSpecific.admin.manageRoles') || 'Gérer les rôles' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ t('profile.roleSpecific.admin.manageRolesDesc') || 'Assigner et révoquer des rôles (Super Admin)' }}
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Alertes récentes -->
      <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {{ t('profile.roleSpecific.admin.recentAlerts') || 'Alertes récentes' }}
        </h4>
        <div class="space-y-2 text-sm">
          <div class="flex items-center text-yellow-600 dark:text-yellow-400">
            <font-awesome-icon
              icon="exclamation-triangle"
              class="mr-2"
            />
            <span>{{ t('profile.roleSpecific.admin.noAlerts') || 'Aucune alerte pour le moment' }}</span>
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
import { useUserStore } from '@/stores/user'
import { supabase } from '@/composables/useSupabase'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

defineProps({
  userId: {
    type: String,
    required: true
  }
})

// Statistiques
const totalUsers = ref(0)
const activeEvents = ref(0)
const activeTrainings = ref(0)

// Vérifier si l'utilisateur est super admin
const isSuperAdmin = computed(() => {
  return userStore.userRoles.some(r => r.role === 'super_admin' && r.is_active)
})

// Méthodes de navigation
const navigateToUsers = () => router.push('/admin/users')
const navigateToOrganizations = () => router.push('/admin/organizations')
const navigateToReports = () => router.push('/admin/reports')
const navigateToContent = () => router.push('/admin/content')
const navigateToSettings = () => router.push('/admin')
const navigateToRoles = () => router.push('/admin/roles')
const navigateToDashboard = () => router.push('/admin')

// Charger les statistiques
const loadStatistics = async () => {
  try {
    // Compter le nombre total d'utilisateurs
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    totalUsers.value = usersCount || 0

    // Compter les événements actifs (événements futurs ou en cours)
    const now = new Date().toISOString()
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('end_date', now)

    activeEvents.value = eventsCount || 0

    // Compter les formations actives
    const { count: trainingsCount } = await supabase
      .from('trainings')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('end_date', now)

    activeTrainings.value = trainingsCount || 0

  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

// Charger les statistiques au montage
onMounted(() => {
  loadStatistics()
})
</script>