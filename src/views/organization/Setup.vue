<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('organization.setup.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('organization.setup.subtitle') }}
        </p>
      </div>

      <!-- Steps Indicator -->
      <div class="mb-8">
        <div class="flex items-center">
          <div class="flex items-center text-blue-600 dark:text-blue-400">
            <div class="flex items-center justify-center w-8 h-8 border-2 border-blue-600 dark:border-blue-400 rounded-full">
              <span class="text-sm font-medium">1</span>
            </div>
            <span class="ml-2 text-sm font-medium">{{ t('organization.setup.step1') }}</span>
          </div>
          <div class="flex-1 mx-4 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
          <div :class="currentStep >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'" class="flex items-center">
            <div :class="currentStep >= 2 ? 'border-blue-600 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600'" class="flex items-center justify-center w-8 h-8 border-2 rounded-full">
              <span class="text-sm font-medium">2</span>
            </div>
            <span class="ml-2 text-sm font-medium">{{ t('organization.setup.step2') }}</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Search Existing Organizations -->
      <div v-show="currentStep === 1" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {{ t('organization.setup.searchTitle') }}
        </h2>

        <OrganizationSearch @select="selectOrganization" @create="goToCreateNew">
          <template #secondary-action>
            <button
              type="button"
              @click="goBack"
              class="cursor-pointer px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {{ t('common.back') }}
            </button>
          </template>
        </OrganizationSearch>

        <p v-if="selectError" class="mt-4 text-sm text-red-600 dark:text-red-400">
          {{ selectError }}
        </p>
      </div>

      <!-- Step 2: Create New Organization -->
      <div v-if="currentStep === 2" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {{ t('organization.setup.createTitle') }}
        </h2>

        <OrganizationForm
          :initial-name="pendingName"
          :cancel-label="t('common.back')"
          @saved="assignOrganization($event.id)"
          @cancel="currentStep = 1"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'
import OrganizationSearch from '@/components/organization/OrganizationSearch.vue'
import OrganizationForm from '@/components/organization/OrganizationForm.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { supabase } = useSupabase()
const authStore = useAuthStore()

const currentStep = ref(1)
const pendingName = ref('')
const selectError = ref('')

const redirectTo = () => route.query.redirect || '/events'

// Rattache l'utilisateur à l'organisation puis le renvoie vers sa destination
const assignOrganization = async (organizationId) => {
  try {
    selectError.value = ''
    const { error } = await supabase
      .from('users')
      .update({ organization_id: organizationId })
      .eq('id', authStore.user.id)

    if (error) throw error

    await authStore.fetchUser()
    router.push(redirectTo())
  } catch (error) {
    console.error('Error assigning organization:', error)
    selectError.value = t('organization.errors.saveFailed')
    currentStep.value = 1
  }
}

const selectOrganization = (organization) => assignOrganization(organization.organization_id)

const goBack = () => router.push(redirectTo())

const goToCreateNew = (name) => {
  pendingName.value = name
  currentStep.value = 2
}
</script>
