<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
      {{ t('events.validationTimeline') }}
    </h3>
    <div class="relative">
      <!-- Ligne horizontale de progression -->
      <div class="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
      <div class="absolute top-5 left-5 h-0.5 bg-ifdd-bleu transition-all duration-500"
           :style="{ width: progressWidth }"></div>

      <!-- Timeline horizontale -->
      <div class="flex justify-between items-start relative">
        <div
          v-for="(step, index) in timelineSteps"
          :key="step.status"
          class="flex flex-col items-center"
          :class="getStepFlexClass(index)"
        >
          <!-- Icône de l'étape -->
          <div class="relative z-10 flex items-center justify-center w-10 h-10 rounded-full mb-3"
               :class="getStepIconClass(step.status)">
            <font-awesome-icon :icon="step.icon" class="text-sm" />
          </div>

          <!-- Texte de l'étape -->
          <div class="text-center">
            <p class="text-sm font-medium" :class="getStepTextClass(step.status)">
              {{ t(`events.status.${step.status}`) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-24">
              {{ t(`events.statusDescription.${step.status}`) }}
            </p>
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
  }
})

// Définition des étapes selon le schéma de base de données
const baseSteps = [
  { status: 'draft', icon: ['fas', 'edit'] },
  { status: 'submitted', icon: ['fas', 'paper-plane'] },
  { status: 'under_review', icon: ['fas', 'search'] }
]

// Logique de timeline selon le statut actuel
const timelineSteps = computed(() => {
  const steps = [...baseSteps]

  // Ajouter les étapes finales selon le statut actuel
  switch (props.currentStatus) {
    case 'approved':
      steps.push({ status: 'approved', icon: ['fas', 'check'] })
      break
    case 'rejected':
      steps.push({ status: 'rejected', icon: ['fas', 'times'] })
      break
    case 'cancelled':
      steps.push({ status: 'cancelled', icon: ['fas', 'ban'] })
      break
    case 'live':
      steps.push(
        { status: 'approved', icon: ['fas', 'check'] },
        { status: 'live', icon: ['fas', 'broadcast-tower'] }
      )
      break
    case 'completed':
      steps.push(
        { status: 'approved', icon: ['fas', 'check'] },
        { status: 'live', icon: ['fas', 'broadcast-tower'] },
        { status: 'completed', icon: ['fas', 'flag-checkered'] }
      )
      break
    default:
      // Pour draft, submitted, under_review - on ne montre que les étapes de base
      break
  }

  return steps
})

// Ordre logique des statuts pour calculer la progression
const statusOrder = [
  'draft', 'submitted', 'under_review', 'approved',
  'rejected', 'cancelled', 'live', 'completed'
]

const progressWidth = computed(() => {
  const currentIndex = statusOrder.indexOf(props.currentStatus)
  const totalSteps = timelineSteps.value.length

  if (currentIndex === -1 || totalSteps === 0) return '0%'

  // Pour les statuts de rejet/annulation, la progression s'arrête à under_review
  if (['rejected', 'cancelled'].includes(props.currentStatus)) {
    const underReviewIndex = timelineSteps.value.findIndex(step => step.status === 'under_review')
    return `${((underReviewIndex + 1) / totalSteps) * 100}%`
  }

  // Pour les autres statuts, calculer normalement
  const currentStepIndex = timelineSteps.value.findIndex(step => step.status === props.currentStatus)
  if (currentStepIndex === -1) return '0%'

  return `${((currentStepIndex + 1) / totalSteps) * 100}%`
})

const getStepFlexClass = (index) => {
  const totalSteps = timelineSteps.value.length
  if (totalSteps <= 4) {
    return 'flex-1'
  }
  // Pour plus de 4 étapes, ajuster l'espacement
  return index === 0 || index === totalSteps - 1 ? 'flex-shrink-0' : 'flex-1'
}

const getStepIconClass = (status) => {
  if (status === props.currentStatus) {
    // Couleurs spéciales pour les statuts finaux
    switch (status) {
      case 'rejected':
        return 'bg-red-500 text-white'
      case 'cancelled':
        return 'bg-orange-500 text-white'
      case 'approved':
        return 'bg-green-500 text-white'
      case 'live':
        return 'bg-purple-500 text-white'
      case 'completed':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-ifdd-bleu text-white'
    }
  }

  // Étapes déjà passées
  if (isStepCompleted(status)) {
    return 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
  }

  // Étapes futures
  return 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
}

const getStepTextClass = (status) => {
  if (status === props.currentStatus) {
    return 'text-gray-900 dark:text-white'
  }
  return 'text-gray-500 dark:text-gray-400'
}

const isStepCompleted = (status) => {
  const currentIndex = statusOrder.indexOf(props.currentStatus)
  const stepIndex = statusOrder.indexOf(status)

  // Pour les statuts de rejet/annulation, seules les étapes avant under_review sont complétées
  if (['rejected', 'cancelled'].includes(props.currentStatus)) {
    const underReviewIndex = statusOrder.indexOf('under_review')
    return stepIndex < underReviewIndex
  }

  // Pour les autres statuts, normal
  return stepIndex < currentIndex
}
</script>