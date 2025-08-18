<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- En-tête du profil -->
    <div class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center space-x-6">
          <!-- Photo de profil -->
          <div class="flex-shrink-0">
            <div class="relative">
              <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
                <img
                  v-if="user?.profile_photo_url"
                  :src="user.profile_photo_url"
                  :alt="`${user.first_name} ${user.last_name}`"
                  class="w-full h-full object-cover"
                >
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-green-500"
                >
                  <span class="text-2xl font-bold text-white">
                    {{ getInitials(user?.first_name, user?.last_name) }}
                  </span>
                </div>
              </div>
              <!-- Badge de vérification -->
              <div
                v-if="user?.is_organization_verified"
                class="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800"
              >
                <font-awesome-icon
                  icon="check"
                  class="text-white text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Informations utilisateur -->
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {{ user?.first_name || authStore.user?.email?.split('@')[0] || 'Utilisateur' }} {{ user?.last_name || '' }}
            </h1>
            <p
              v-if="user?.biography"
              class="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2"
            >
              {{ user.biography }}
            </p>
            <p
              v-else
              class="text-gray-500 dark:text-gray-400 mt-1 text-sm italic"
            >
              {{ t('profile.personalInfo.noBiography') }}
            </p>
            <div class="flex items-center mt-2 space-x-4">
              <!-- Email si pas d'autres infos -->
              <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <font-awesome-icon
                  icon="envelope"
                  class="mr-1"
                />
                {{ user?.email || authStore.user?.email || 'Email non disponible' }}
              </div>
              <!-- Pays -->
              <div
                v-if="userCountry"
                class="flex items-center text-sm text-gray-500 dark:text-gray-400"
              >
                <font-awesome-icon
                  icon="map-marker-alt"
                  class="mr-1"
                />
                {{ userCountry.name_fr }}
              </div>
              <!-- Organisation -->
              <div
                v-if="userOrganization"
                class="flex items-center text-sm text-gray-500 dark:text-gray-400"
              >
                <font-awesome-icon
                  icon="building"
                  class="mr-1"
                />
                {{ userOrganization.name }}
              </div>
            </div>
            <!-- Badges de rôles -->
            <div class="flex flex-wrap gap-2 mt-3">
              <span
                v-for="role in userRoles"
                :key="role.role"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getRoleBadgeClass(role.role)"
              >
                {{ t(`profile.roles.${role.role}`) }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex-shrink-0">
            <button
              @click="isEditing = true"
              class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <font-awesome-icon
                icon="edit"
                class="mr-2"
              />
              {{ t('profile.actions.editProfile') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Navigation par onglets -->
      <div class="mb-8">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'profile'"
              :class="[
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
            >
              {{ t('profile.tabs.information') }}
            </button>
            <button
              @click="activeTab = 'settings'"
              :class="[
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
            >
              {{ t('profile.tabs.settings') }}
            </button>
            <button
              @click="activeTab = 'role-specific'"
              :class="[
                activeTab === 'role-specific'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
            >
              {{ t('profile.tabs.roleSpecific') }}
            </button>
            <button
              @click="activeTab = 'connections'"
              :class="[
                activeTab === 'connections'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
            >
              {{ t('profile.tabs.connections') }}
            </button>
          </nav>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Section Informations du Profil -->
          <div v-if="activeTab === 'profile'" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('profile.sections.profileInfo') }}
              </h2>
            </div>
            <div class="p-6">
              <ProfileInfoSection
                :user="user"
                :user-country="userCountry"
                :user-organization="userOrganization"
                :is-editing="isEditing"
                @update:user="handleUserUpdate"
                @cancel-edit="isEditing = false"
                @save="handleSaveProfile"
              />
            </div>
          </div>

          <!-- Section Paramètres et Préférences -->
          <div v-if="activeTab === 'settings'">
            <ProfileSettingsSection
              @manage-blocked-users="handleManageBlockedUsers"
            />
          </div>

          <!-- Section Spécifique par Rôle -->
          <div v-if="activeTab === 'role-specific'">
            <RoleSpecificSection
              :user-id="authStore.user?.id"
            />
          </div>

          <!-- Section Connexions -->
          <div v-if="activeTab === 'connections'">
            <ConnectionsList />
          </div>
        </div>

        <!-- Colonne latérale -->
        <div class="space-y-6">
          <!-- Demandes de connexion -->
          <ConnectionRequestsSection />
          
          <!-- Statistiques rapides -->
          <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {{ t('profile.sections.quickStats') }}
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {{ t('profile.stats.activitiesSubmitted') }}
                </span>
                <span class="font-semibold text-gray-900 dark:text-white">-</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {{ t('profile.stats.activitiesParticipated') }}
                </span>
                <span class="font-semibold text-gray-900 dark:text-white">-</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {{ t('profile.stats.trainingsCompleted') }}
                </span>
                <span class="font-semibold text-gray-900 dark:text-white">-</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {{ t('profile.stats.connections') }}
                </span>
                <span class="font-semibold text-gray-900 dark:text-white">{{ connectionsCount }}</span>
              </div>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {{ t('profile.sections.quickActions') }}
            </h3>
            <div class="space-y-3">
              <button class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex items-center">
                <font-awesome-icon
                  icon="plus"
                  class="mr-3 text-gray-400"
                />
                {{ t('profile.quickActions.submitActivity') }}
              </button>
              <button class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex items-center">
                <font-awesome-icon
                  icon="graduation-cap"
                  class="mr-3 text-gray-400"
                />
                {{ t('profile.quickActions.enrollTraining') }}
              </button>
              <button class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex items-center">
                <font-awesome-icon
                  icon="envelope"
                  class="mr-3 text-gray-400"
                />
                {{ t('profile.quickActions.sendMessage') }}
              </button>
              <button class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex items-center">
                <font-awesome-icon
                  icon="calendar"
                  class="mr-3 text-gray-400"
                />
                {{ t('profile.quickActions.scheduleAppointment') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'
import ProfileInfoSection from '@/components/profile/ProfileInfoSection.vue'
import ProfileSettingsSection from '@/components/profile/ProfileSettingsSection.vue'
import RoleSpecificSection from '@/components/profile/RoleSpecificSection.vue'
import ConnectionRequestsSection from '@/components/profils/ConnectionRequestsSection.vue'
import ConnectionsList from '@/components/profils/ConnectionsList.vue'
import { useConnections } from '@/composables/useConnections'

const { t } = useI18n()
const { success, error } = useToast()
const authStore = useAuthStore()
const userStore = useUserStore()

// Composable pour les connexions
const { connectionsCount, getAcceptedConnections } = useConnections()

const isEditing = ref(false)
const activeTab = ref('profile')

// Données utilisateur
const user = computed(() => authStore.profile)
const userRoles = computed(() => authStore.profile?.user_roles || [])
const userCountry = computed(() => authStore.profile?.country)
const userOrganization = computed(() => userStore.userOrganization)

// Méthodes
const getInitials = (firstName, lastName) => {
  if (!firstName || !lastName) return 'U'
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const getRoleBadgeClass = (role) => {
  const baseClasses = 'bg-opacity-10 border'
  const roleClasses = {
    'standard': 'bg-gray-500 text-gray-700 dark:text-gray-300 border-gray-500',
    'unfccc_focal_point': 'bg-blue-500 text-blue-700 dark:text-blue-300 border-blue-500',
    'negotiator': 'bg-purple-500 text-purple-700 dark:text-purple-300 border-purple-500',
    'trainer': 'bg-green-500 text-green-700 dark:text-green-300 border-green-500',
    'admin': 'bg-orange-500 text-orange-700 dark:text-orange-300 border-orange-500',
    'super_admin': 'bg-red-500 text-red-700 dark:text-red-300 border-red-500'
  }
  return `${baseClasses} ${roleClasses[role] || roleClasses.standard}`
}

const handleUserUpdate = (updatedUser) => {
  // Logique de mise à jour locale temporaire
  console.log('User updated:', updatedUser)
}

const handleSaveProfile = async (updatedData) => {
  try {
    console.log('Profile.vue - Sauvegarde avec données:', updatedData) // Debug
    
    await userStore.updateProfile({
      ...updatedData,
      id: authStore.user?.id
    })
    
    // Recharger le profil
    await authStore.fetchProfile(authStore.user?.id)
    isEditing.value = false
    
    // Afficher un message de succès
    success(t('common.saveSuccess'))
  } catch (err) {
    console.error('Error updating profile:', err)
    // Afficher un message d'erreur
    error(t('common.saveError'))
  }
}

const handleManageBlockedUsers = () => {
  // TODO: Implémenter la gestion des utilisateurs bloqués
  // Cela pourrait ouvrir une modal ou naviguer vers une page dédiée
  console.log('Manage blocked users - à implémenter plus tard')
}

// Chargement initial
onMounted(async () => {
  if (authStore.user?.id) {
    await userStore.loadUserData(authStore.user.id)
    // Charger l'organisation si elle existe
    if (authStore.profile?.organization_id) {
      await loadOrganizationData()
    }
    // Charger le nombre de connexions pour les statistiques
    await getAcceptedConnections()
  }
})

// Watcher pour recharger l'organisation quand elle change
watch(() => authStore.profile?.organization_id, async (newOrgId, oldOrgId) => {
  if (newOrgId && newOrgId !== oldOrgId) {
    await loadOrganizationData()
  }
})

// Fonction pour charger les données de l'organisation (comme dans Create.vue)
const loadOrganizationData = async () => {
  if (authStore.profile?.organization_id) {
    try {
      const { supabase } = await import('@/composables/useSupabase')
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, email, organization_type, is_active')
        .eq('id', authStore.profile.organization_id)
        .single()
      
      if (error) {
        console.error('Erreur lors du chargement de l\'organisation:', error)
        return
      }
      
      userStore.setUserOrganization(data)
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'organisation:', error)
    }
  }
}
</script>