<template>
  <div class="space-y-6">
    <!-- Debug: Affichage des rôles actuels -->
    <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
        {{ t('profile.roleSpecific.debug.currentRoles') || 'Debug: Rôles actuels' }}
      </h3>
      <div class="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
        <p>Nombre de rôles dans userStore: {{ userStore.userRoles.length }}</p>
        <p>Rôles: {{ userStore.userRoles.map(r => r.role).join(', ') || 'Aucun' }}</p>
        <p>isNegotiator: {{ userStore.isNegotiator }}</p>
        <p>isFocalPoint: {{ userStore.isFocalPoint }}</p>
        <p>isTrainer: {{ userStore.isTrainer }}</p>
        <p>isAdmin: {{ userStore.isAdmin }}</p>
      </div>
      <!-- Boutons de test pour ajouter des rôles temporairement -->
      <div class="mt-4 flex gap-2 flex-wrap">
        <button
          @click="testAddRole('negotiator')"
          class="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer"
        >
          + Négociateur (Test)
        </button>
        <button
          @click="testAddRole('unfccc_focal_point')"
          class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          + Point Focal (Test)
        </button>
        <button
          @click="testAddRole('trainer')"
          class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
        >
          + Formateur (Test)
        </button>
        <button
          @click="testAddRole('admin')"
          class="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 cursor-pointer"
        >
          + Admin (Test)
        </button>
        <button
          @click="testAddRole('super_admin')"
          class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
        >
          + Super Admin (Test)
        </button>
        <button
          @click="testClearRoles"
          class="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer"
        >
          Effacer tous (Test)
        </button>
      </div>
    </div>

    <!-- Section Négociateur -->
    <NegotiatorSection
      v-if="userStore.isNegotiator"
      :user-id="userId"
    />

    <!-- Section Point Focal UNFCCC -->
    <FocalPointSection
      v-if="userStore.isFocalPoint"
      :user-id="userId"
      @designate-negotiator="handleDesignateNegotiator"
      @manage-negotiators="handleManageNegotiators"
      @view-reports="handleViewReports"
    />

    <!-- Section Formateur -->
    <TrainerSection
      v-if="userStore.isTrainer"
      :user-id="userId"
      @create-formation="handleCreateFormation"
      @manage-formations="handleManageFormations"
      @view-analytics="handleViewAnalytics"
    />

    <!-- Section Admin -->
    <AdminSection
      v-if="userStore.isAdmin"
      :user-id="userId"
      @manage-users="handleManageUsers"
      @manage-organizations="handleManageOrganizations"
      @view-reports="handleViewAdminReports"
      @manage-content="handleManageContent"
      @system-settings="handleSystemSettings"
      @manage-roles="handleManageRoles"
    />

    <!-- Section par défaut pour les utilisateurs sans rôle spécifique -->
    <div v-if="!userStore.isNegotiator && !userStore.isFocalPoint && !userStore.isTrainer && !userStore.isAdmin" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
            <font-awesome-icon
              icon="user"
              class="w-5 h-5 text-gray-600 dark:text-gray-400"
            />
          </div>
          {{ t('profile.roleSpecific.standard.title') }}
        </h3>
      </div>
      <div class="p-6">
        <div class="text-center py-8">
          <font-awesome-icon
            icon="info-circle"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ t('profile.roleSpecific.standard.noSpecificRole') }}
          </h4>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            {{ t('profile.roleSpecific.standard.description') }}
          </p>
          
          <!-- Actions pour demander des rôles -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <button
              @click="requestRole('negotiator')"
              class="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-3">
                <font-awesome-icon
                  icon="gavel"
                  class="w-6 h-6 text-purple-600 dark:text-purple-400"
                />
              </div>
              <div class="font-medium text-gray-900 dark:text-white text-sm">
                {{ t('profile.roleSpecific.standard.becomeNegotiator') }}
              </div>
            </button>
            
            <button
              @click="requestRole('trainer')"
              class="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mb-3">
                <font-awesome-icon
                  icon="chalkboard-teacher"
                  class="w-6 h-6 text-green-600 dark:text-green-400"
                />
              </div>
              <div class="font-medium text-gray-900 dark:text-white text-sm">
                {{ t('profile.roleSpecific.standard.becomeTrainer') }}
              </div>
            </button>
            
            <button
              @click="requestRole('unfccc_focal_point')"
              class="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-3">
                <font-awesome-icon
                  icon="user-tie"
                  class="w-6 h-6 text-blue-600 dark:text-blue-400"
                />
              </div>
              <div class="font-medium text-gray-900 dark:text-white text-sm">
                {{ t('profile.roleSpecific.standard.becomeFocalPoint') }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import NegotiatorSection from './NegotiatorSection.vue'
import FocalPointSection from './FocalPointSection.vue'
import TrainerSection from './TrainerSection.vue'
import AdminSection from './AdminSection.vue'

const { t } = useI18n()
const { success, info } = useToast()
const userStore = useUserStore()
const authStore = useAuthStore()

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

// Debug: Afficher les rôles au montage et surveiller les changements
onMounted(async () => {
  console.log('RoleSpecificSection - User ID:', props.userId)
  console.log('RoleSpecificSection - User Roles from userStore BEFORE sync:', userStore.userRoles)
  console.log('RoleSpecificSection - User Roles from authStore:', authStore.profile?.user_roles)

  // Forcer le chargement des rôles depuis authStore
  if (authStore.profile?.user_roles && authStore.profile.user_roles.length > 0) {
    console.log('RoleSpecificSection - Synchronizing roles from authStore')
    userStore.setUserRoles(authStore.profile.user_roles)
    console.log('RoleSpecificSection - User Roles from userStore AFTER sync:', userStore.userRoles)
  }

  console.log('RoleSpecificSection - isNegotiator:', userStore.isNegotiator)
  console.log('RoleSpecificSection - isFocalPoint:', userStore.isFocalPoint)
  console.log('RoleSpecificSection - isTrainer:', userStore.isTrainer)
  console.log('RoleSpecificSection - isAdmin:', userStore.isAdmin)
})

// Méthodes pour les actions des négociateurs
const handleDesignateNegotiator = () => {
  // TODO: Ouvrir une modal pour désigner un nouveau négociateur
  info(t('profile.roleSpecific.actions.designateNegotiator'))
}

const handleManageNegotiators = () => {
  // TODO: Naviguer vers la page de gestion des négociateurs
  info(t('profile.roleSpecific.actions.manageNegotiators'))
}

const handleViewReports = () => {
  // TODO: Naviguer vers la page des rapports
  info(t('profile.roleSpecific.actions.viewReports'))
}

// Méthodes pour les actions des formateurs
const handleCreateFormation = () => {
  // TODO: Naviguer vers la page de création de formation
  info(t('profile.roleSpecific.actions.createFormation'))
}

const handleManageFormations = () => {
  // TODO: Naviguer vers la page de gestion des formations
  info(t('profile.roleSpecific.actions.manageFormations'))
}

const handleViewAnalytics = () => {
  // TODO: Naviguer vers la page d'analytics des formations
  info(t('profile.roleSpecific.actions.viewAnalytics'))
}

// Méthode pour demander un rôle
const requestRole = (role) => {
  // TODO: Implémenter la logique de demande de rôle
  const roleNames = {
    'negotiator': t('profile.roles.negotiator'),
    'trainer': t('profile.roles.trainer'),
    'unfccc_focal_point': t('profile.roles.unfccc_focal_point')
  }

  info(t('profile.roleSpecific.actions.requestRole', { role: roleNames[role] }))
  console.log(`Request role: ${role}`)
}

// Méthodes pour les actions d'administration
const handleManageUsers = () => {
  info(t('profile.roleSpecific.actions.manageUsers') || 'Gestion des utilisateurs')
}

const handleManageOrganizations = () => {
  info(t('profile.roleSpecific.actions.manageOrganizations') || 'Gestion des organisations')
}

const handleViewAdminReports = () => {
  info(t('profile.roleSpecific.actions.viewAdminReports') || 'Consultation des rapports')
}

const handleManageContent = () => {
  info(t('profile.roleSpecific.actions.manageContent') || 'Gestion du contenu')
}

const handleSystemSettings = () => {
  info(t('profile.roleSpecific.actions.systemSettings') || 'Paramètres système (Super Admin)')
}

const handleManageRoles = () => {
  info(t('profile.roleSpecific.actions.manageRoles') || 'Gestion des rôles (Super Admin)')
}

// Méthodes de test pour ajouter/supprimer des rôles temporairement
const testAddRole = (role) => {
  const currentRoles = [...userStore.userRoles]
  const roleExists = currentRoles.some(r => r.role === role)

  if (!roleExists) {
    currentRoles.push({
      id: `test-${Date.now()}`,
      user_id: props.userId,
      role: role,
      is_active: true,
      assigned_at: new Date().toISOString()
    })
    userStore.setUserRoles(currentRoles)
    console.log(`Test: Added role ${role}`, currentRoles)
  }
}

const testClearRoles = () => {
  userStore.setUserRoles([])
  console.log('Test: Cleared all roles')
}
</script>