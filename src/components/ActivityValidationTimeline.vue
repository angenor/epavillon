<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
      {{ t('events.validationTimeline') }}
    </h3>
    <div class="relative">
      <!-- Conteneur principal du timeline -->
      <div class="relative min-h-[180px]">

        <!-- Lignes de connexion -->
        <svg class="absolute inset-0 w-full h-full" style="z-index: 1;">
          <!-- Ligne principale (Brouillon -> Soumis -> En examen) -->
          <line
            x1="40" y1="20"
            x2="50%" y2="20"
            :stroke="currentStatus !== 'draft' ? '#3b82f6' : '#d1d5db'"
            stroke-width="2"
            class="transition-all duration-500"/>

          <!-- Ligne de bifurcation vers Approuvé -->
          <line
            v-if="showBifurcation"
            x1="50%" y1="20"
            x2="65%" y2="20"
            :stroke="isApprovedPath ? '#10b981' : '#d1d5db'"
            stroke-width="2"/>

          <!-- Ligne de bifurcation vers Rejeté -->
          <line
            v-if="showBifurcation"
            x1="50%" y1="20"
            x2="65%" y2="100"
            :stroke="isRejectedPath ? '#ef4444' : '#d1d5db'"
            stroke-width="2"/>

          <!-- Ligne de bifurcation Approuvé vers Annulé -->
          <line
            v-if="showBifurcation"
            x1="65%" y1="20"
            x2="75%" y2="-40"
            :stroke="isCancelledPath ? '#f97316' : '#d1d5db'"
            stroke-width="2"/>

          <!-- Ligne Approuvé -> En cours -->
          <line
            v-if="showFullPath && showBifurcation && !isCancelledPath"
            x1="65%" y1="20"
            x2="80%" y2="20"
            :stroke="currentStatus === 'live' || currentStatus === 'completed' ? '#10b981' : '#d1d5db'"
            stroke-width="2"/>

          <!-- Ligne En cours -> Terminé -->
          <line
            v-if="showFullPath && showBifurcation && !isCancelledPath"
            x1="80%" y1="20"
            x2="95%" y2="20"
            :stroke="currentStatus === 'completed' ? '#10b981' : '#d1d5db'"
            stroke-width="2"/>
        </svg>

        <!-- Étapes du timeline -->
        <div class="relative" style="z-index: 10;">

          <!-- Étapes principales alignées horizontalement -->
          <div class="flex items-start">

            <!-- Brouillon -->
            <div class="absolute left-[20px]" style="top: 0;">
              <div class="flex flex-col items-center">
                <div class="relative z-10 flex items-center justify-center w-10 h-10 rounded-full"
                     :class="getStepIconClass('draft')">
                  <font-awesome-icon :icon="['fas', 'edit']" class="text-sm" />
                </div>
                <div class="text-center mt-2">
                  <p class="text-sm font-medium" :class="getStepTextClass('draft')">
                    {{ t('events.status.draft') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Soumis -->
            <div class="absolute left-[25%]" style="top: 0; transform: translateX(-50%);">
              <div class="flex flex-col items-center">
                <div class="relative z-10 flex items-center justify-center w-10 h-10 rounded-full"
                     :class="getStepIconClass('submitted')">
                  <font-awesome-icon :icon="['fas', 'paper-plane']" class="text-sm" />
                </div>
                <div class="text-center mt-2">
                  <p class="text-sm font-medium" :class="getStepTextClass('submitted')">
                    {{ t('events.status.submitted') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- En examen -->
            <div class="absolute left-[50%]" style="top: 0; transform: translateX(-50%);">
              <div class="flex flex-col items-center">
                <div class="relative z-10 flex items-center justify-center w-10 h-10 rounded-full"
                     :class="getStepIconClass('under_review')">
                  <font-awesome-icon :icon="['fas', 'search']" class="text-sm" />
                </div>
                <div class="text-center mt-2">
                  <p class="text-sm font-medium" :class="getStepTextClass('under_review')">
                    {{ t('events.status.under_review') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Approuvé (branche du haut) -->
            <div v-if="showBifurcation" class="absolute left-[65%]" style="top: 0; transform: translateX(-50%);">
              <div class="flex flex-col items-center">
                <div class="relative z-10 flex items-center justify-center w-10 h-10 rounded-full"
                     :class="getPathStepClass('approved')">
                  <font-awesome-icon :icon="['fas', 'check']" class="text-sm" />
                </div>
                <div class="text-center mt-2">
                  <p class="text-sm font-medium" :class="getPathTextClass('approved')">
                    {{ t('events.status.approved') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- En cours -->
            <div v-if="showFullPath && showBifurcation && !isCancelledPath" class="absolute left-[80%]" style="top: 0; transform: translateX(-50%);">
              <div class="flex flex-col items-center">
                <div class="relative z-10 flex items-center justify-center w-10 h-10 rounded-full"
                     :class="getPathStepClass('live')">
                  <font-awesome-icon :icon="['fas', 'broadcast-tower']" class="text-sm" />
                </div>
                <div class="text-center mt-2">
                  <p class="text-sm font-medium" :class="getPathTextClass('live')">
                    {{ t('events.status.live') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Terminé -->
            <div v-if="showFullPath && showBifurcation && !isCancelledPath" class="absolute left-[95%]" style="top: 0; transform: translateX(-50%);">
              <div class="flex flex-col items-center">
                <div class="relative z-10 flex items-center justify-center w-10 h-10 rounded-full"
                     :class="getPathStepClass('completed')">
                  <font-awesome-icon :icon="['fas', 'flag-checkered']" class="text-sm" />
                </div>
                <div class="text-center mt-2">
                  <p class="text-sm font-medium" :class="getPathTextClass('completed')">
                    {{ t('events.status.completed') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Rejeté (branche du bas) -->
            <div v-if="showBifurcation" class="absolute left-[65%]" style="top: 80px; transform: translateX(-50%);">
              <div class="flex flex-col items-center">
                <div class="relative z-10 flex items-center justify-center w-10 h-10 rounded-full"
                     :class="getPathStepClass('rejected')">
                  <font-awesome-icon :icon="['fas', 'times']" class="text-sm" />
                </div>
                <div class="text-center mt-2">
                  <p class="text-sm font-medium" :class="getPathTextClass('rejected')">
                    {{ t('events.status.rejected') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Annulé (branche du haut après Approuvé) -->
            <div v-if="showBifurcation" class="absolute left-[75%]" style="top: -60px; transform: translateX(-50%);">
              <div class="flex flex-col items-center">
                <div class="relative z-10 flex items-center justify-center w-10 h-10 rounded-full"
                     :class="getPathStepClass('cancelled')">
                  <font-awesome-icon :icon="['fas', 'ban']" class="text-sm" />
                </div>
                <div class="text-center mt-2">
                  <p class="text-sm font-medium" :class="getPathTextClass('cancelled')">
                    {{ t('events.status.cancelled') }}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  currentStatus: {
    type: String,
    required: true,
    validator: (value) => [
      'draft', 'submitted', 'under_review', 'approved',
      'rejected', 'cancelled', 'live', 'completed'
    ].includes(value)
  },
  showFullPath: {
    type: Boolean,
    default: true // Afficher le chemin complet (En cours, Terminé)
  }
})

// Étapes principales avant la bifurcation
const mainSteps = [
  { status: 'draft', icon: ['fas', 'edit'] },
  { status: 'submitted', icon: ['fas', 'paper-plane'] },
  { status: 'under_review', icon: ['fas', 'search'] }
]

// Afficher la bifurcation dès l'étape de soumission
const showBifurcation = computed(() => {
  const afterSubmitStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'live', 'completed']
  return afterSubmitStatuses.includes(props.currentStatus)
})

// Détecter si on est sur le chemin approuvé
const isApprovedPath = computed(() => {
  return ['approved', 'live', 'completed'].includes(props.currentStatus)
})

// Détecter si on est sur le chemin rejeté
const isRejectedPath = computed(() => {
  return props.currentStatus === 'rejected'
})

// Détecter si on est sur le chemin annulé
const isCancelledPath = computed(() => {
  return props.currentStatus === 'cancelled'
})

// Ordre logique des statuts pour calculer la progression
const statusOrder = [
  'draft', 'submitted', 'under_review', 'approved',
  'rejected', 'cancelled', 'live', 'completed'
]

// Calcul de la largeur de progression active sur la ligne principale
const activeProgressWidth = computed(() => {
  const mainStatusOrder = ['draft', 'submitted', 'under_review']

  // Si on est dans les étapes principales
  if (mainStatusOrder.includes(props.currentStatus)) {
    const index = mainStatusOrder.indexOf(props.currentStatus)
    return `${((index + 1) / 3) * 60 - 5}%`
  }

  // Si on a dépassé l'examen, la ligne principale est complète
  if (['approved', 'rejected', 'live', 'completed'].includes(props.currentStatus)) {
    return 'calc(60% - 20px)'
  }

  return '0%'
})

// Nouvelle fonction pour styliser les étapes des chemins
const getPathStepClass = (status) => {
  // Si c'est le statut actuel
  if (status === props.currentStatus) {
    switch (status) {
      case 'approved':
        return 'bg-green-500 text-white border-2 border-green-500'
      case 'rejected':
        return 'bg-red-500 text-white border-2 border-red-500'
      case 'cancelled':
        return 'bg-orange-500 text-white border-2 border-orange-500'
      case 'live':
        return 'bg-purple-500 text-white border-2 border-purple-500'
      case 'completed':
        return 'bg-blue-500 text-white border-2 border-blue-500'
      default:
        return 'bg-ifdd-bleu text-white border-2 border-ifdd-bleu'
    }
  }

  // Si on est sur le bon chemin et l'étape est passée (validée)
  if (isApprovedPath.value && ['approved', 'live', 'completed'].includes(status)) {
    const order = ['approved', 'live', 'completed']
    const currentIndex = order.indexOf(props.currentStatus)
    const stepIndex = order.indexOf(status)
    if (stepIndex !== -1 && currentIndex !== -1 && stepIndex < currentIndex) {
      return 'bg-green-500 text-white'
    }
  }

  // Étape future ou sur un autre chemin
  return 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
}

// Nouvelle fonction pour le texte des chemins
const getPathTextClass = (status) => {
  if (status === props.currentStatus) {
    return 'text-gray-900 dark:text-white'
  }

  // Si on est sur le chemin approuvé
  if (isApprovedPath.value && ['approved', 'live', 'completed'].includes(status)) {
    return 'text-gray-700 dark:text-gray-300'
  }

  // Si on est sur le chemin rejeté
  if (isRejectedPath.value && status === 'rejected') {
    return 'text-red-600 dark:text-red-400'
  }

  // Si on est sur le chemin annulé
  if (isCancelledPath.value && status === 'cancelled') {
    return 'text-orange-600 dark:text-orange-400'
  }

  return 'text-gray-400 dark:text-gray-500'
}

const getStepIconClass = (status) => {
  const mainStatusOrder = ['draft', 'submitted', 'under_review']
  const currentIndex = mainStatusOrder.indexOf(props.currentStatus)
  const stepIndex = mainStatusOrder.indexOf(status)

  // Si c'est l'étape actuelle
  if (status === props.currentStatus) {
    return 'bg-ifdd-bleu text-white border-2 border-ifdd-bleu'
  }

  // Si l'étape est passée (validée)
  if (stepIndex !== -1 && currentIndex !== -1 && stepIndex < currentIndex) {
    return 'bg-green-500 text-white'
  }

  // Si on est dans un statut avancé (approved, rejected, live, completed)
  if (['approved', 'rejected', 'live', 'completed'].includes(props.currentStatus)) {
    // Toutes les étapes principales sont validées
    if (mainStatusOrder.includes(status)) {
      return 'bg-green-500 text-white'
    }
  }

  // Étape future
  return 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
}

const getStepTextClass = (status) => {
  if (status === props.currentStatus) {
    return 'text-gray-900 dark:text-white'
  }
  return 'text-gray-500 dark:text-gray-400'
}

const isStepCompleted = (status) => {
  const mainStatusOrder = ['draft', 'submitted', 'under_review']
  const currentIndex = mainStatusOrder.indexOf(props.currentStatus)
  const stepIndex = mainStatusOrder.indexOf(status)

  // Si on est dans les étapes principales
  if (currentIndex !== -1 && stepIndex !== -1) {
    return stepIndex < currentIndex
  }

  // Si on est dans un statut avancé, toutes les étapes principales sont complétées
  if (['approved', 'rejected', 'live', 'completed'].includes(props.currentStatus)) {
    return mainStatusOrder.includes(status)
  }

  return false
}
</script>