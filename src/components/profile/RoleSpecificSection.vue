<template>
  <div>
    <!-- Section Négociateur -->
    <NegotiatorSection
      v-if="userStore.isNegotiator"
      :user-id="userId"
    />
    
    <!-- Section Point Focal UNFCCC -->
    <FocalPointSection
      v-else-if="userStore.isFocalPoint"
      :user-id="userId"
      @designate-negotiator="handleDesignateNegotiator"
      @manage-negotiators="handleManageNegotiators"
      @view-reports="handleViewReports"
    />
    
    <!-- Section Formateur -->
    <TrainerSection
      v-else-if="userStore.isTrainer"
      :user-id="userId"
      @create-formation="handleCreateFormation"
      @manage-formations="handleManageFormations"
      @view-analytics="handleViewAnalytics"
    />
    
    <!-- Section par défaut pour les utilisateurs sans rôle spécifique -->
    <div v-else class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
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
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'
import NegotiatorSection from './NegotiatorSection.vue'
import FocalPointSection from './FocalPointSection.vue'
import TrainerSection from './TrainerSection.vue'

const { t } = useI18n()
const { success, info } = useToast()
const userStore = useUserStore()

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
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
</script>