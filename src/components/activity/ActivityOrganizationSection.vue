<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
        <font-awesome-icon :icon="['fas', 'building']" class="mr-3 text-ifdd-bleu" />
        {{ t('activity.organization.title') }}
      </h2>
      <div v-if="mode === 'view'" class="flex flex-wrap justify-end gap-2">
        <button
          v-if="canEdit"
          type="button"
          @click="mode = 'edit'"
          class="cursor-pointer inline-flex items-center px-3 py-2 text-sm bg-ifdd-bleu text-white rounded-lg hover:bg-ifdd-bleu-fonce transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'pen']" class="mr-2" />
          {{ t('activity.organization.edit') }}
        </button>
        <button
          type="button"
          @click="mode = 'search'"
          :disabled="changing"
          class="cursor-pointer inline-flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <font-awesome-icon :icon="['fas', changing ? 'spinner' : 'exchange-alt']" :class="['mr-2', { 'animate-spin': changing }]" />
          {{ t('activity.organization.change') }}
        </button>
      </div>
    </div>

    <div class="p-6">
      <!-- Consultation -->
      <template v-if="mode === 'view'">
        <div v-if="organization" class="flex items-start gap-4">
          <img
            v-if="organization.logo_url"
            :src="organization.logo_url"
            :alt="organization.name"
            class="h-20 w-20 flex-shrink-0 object-contain rounded-lg border border-gray-200 dark:border-gray-600 bg-white"
          />
          <div
            v-else
            class="h-20 w-20 flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
          >
            <font-awesome-icon :icon="['fas', 'building']" class="w-8 h-8 text-gray-400" />
          </div>

          <div class="min-w-0 space-y-1">
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ organization.name }}
              <span v-if="organization.acronym" class="text-gray-500 dark:text-gray-400 font-normal">
                ({{ organization.acronym }})
              </span>
            </p>
            <p v-if="organization.organization_type" class="text-sm text-gray-600 dark:text-gray-400">
              {{ t(`organization.types.${organization.organization_type}`) }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400 break-all">
              <font-awesome-icon :icon="['fas', 'envelope']" class="mr-2 text-gray-400" />{{ organization.email }}
            </p>
            <a
              v-if="organization.website"
              :href="organization.website"
              target="_blank"
              rel="noopener noreferrer"
              class="block text-sm text-ifdd-bleu hover:underline break-all"
            >
              <font-awesome-icon :icon="['fas', 'globe']" class="mr-2" />{{ organization.website }}
            </a>
          </div>
        </div>

        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('activity.organization.none') }}
        </p>

        <!-- Logo manquant : seul le créateur peut l'ajouter -->
        <div
          v-if="canEdit && !organization.logo_url"
          class="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start"
        >
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p class="ml-3 text-sm text-amber-800 dark:text-amber-300">
            {{ t('activity.organization.missingLogo') }}
          </p>
        </div>

        <!-- Organisation créée par un autre utilisateur -->
        <div
          v-if="organization && !canEdit"
          class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start"
        >
          <font-awesome-icon :icon="['fas', 'info-circle']" class="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
          <p class="ml-3 text-sm text-blue-800 dark:text-blue-300">
            {{ t('activity.organization.notCreatorInfo') }}
          </p>
        </div>
      </template>

      <!-- Modification (créateur uniquement) -->
      <template v-else-if="mode === 'edit'">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">
          {{ t('activity.organization.editTitle') }}
        </h3>
        <OrganizationForm
          :organization="organization"
          @saved="onOrganizationUpdated"
          @cancel="mode = 'view'"
        />
      </template>

      <!-- Changement : recherche d'une organisation existante -->
      <template v-else-if="mode === 'search'">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">
          {{ t('activity.organization.changeTitle') }}
        </h3>
        <OrganizationSearch
          :exclude-id="organization?.id"
          @select="onOrganizationChosen($event.organization_id)"
          @create="startCreation"
        >
          <template #secondary-action>
            <button
              type="button"
              @click="mode = 'view'"
              class="cursor-pointer px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
          </template>
        </OrganizationSearch>
      </template>

      <!-- Changement : création d'une nouvelle organisation -->
      <template v-else-if="mode === 'create'">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">
          {{ t('organization.setup.createTitle') }}
        </h3>
        <OrganizationForm
          :initial-name="pendingName"
          :cancel-label="t('common.back')"
          @saved="onOrganizationChosen($event.id)"
          @cancel="mode = 'search'"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import OrganizationForm from '@/components/organization/OrganizationForm.vue'
import OrganizationSearch from '@/components/organization/OrganizationSearch.vue'

const props = defineProps({
  organization: {
    type: Object,
    default: null
  },
  // L'utilisateur est le créateur de l'organisation (cf. policy RLS creator_update_organizations)
  canEdit: {
    type: Boolean,
    default: false
  },
  // Changement d'organisation en cours d'enregistrement par le parent
  changing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change', 'updated'])

const { t } = useI18n()

// 'view' | 'edit' | 'search' | 'create'
const mode = ref('view')
const pendingName = ref('')

const startCreation = (name) => {
  pendingName.value = name
  mode.value = 'create'
}

const onOrganizationUpdated = (organization) => {
  mode.value = 'view'
  emit('updated', organization)
}

// Ouvre directement le formulaire (créateur) ou la recherche (autres) pour corriger le logo manquant
const openLogoFix = () => {
  mode.value = props.canEdit ? 'edit' : 'search'
}

defineExpose({ openLogoFix })

const onOrganizationChosen = (organizationId) => {
  mode.value = 'view'
  emit('change', organizationId)
}
</script>
