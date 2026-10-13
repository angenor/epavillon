<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="fixed inset-0 bg-gray-500/75 transition-opacity" @click="close"></div>

      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full z-10">
        <!-- En-tête -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('admin.organizations.create.title') }}
          </h3>
          <button type="button" @click="close" class="cursor-pointer text-gray-400 hover:text-gray-500">
            <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
          </button>
        </div>

        <div class="px-6 py-5 space-y-6">
          <!-- Étape 1 : utilisateur à assigner -->
          <section>
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              1. {{ t('admin.organizations.create.assignee') }}
            </h4>

            <!-- Utilisateur sélectionné -->
            <div
              v-if="selectedUser"
              class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ selectedUser.first_name }} {{ selectedUser.last_name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ selectedUser.email }}</p>
                <p v-if="selectedUser.organization" class="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  {{ t('admin.organizations.create.replacesCurrent', { name: selectedUser.organization.name }) }}
                </p>
              </div>
              <button
                v-if="!createdOrganization"
                type="button"
                @click="selectedUser = null"
                class="cursor-pointer ml-3 text-sm text-orange-600 dark:text-orange-400 hover:underline"
              >
                {{ t('admin.organizations.create.changeUser') }}
              </button>
            </div>

            <!-- Recherche d'utilisateur -->
            <div v-else>
              <div class="relative">
                <input
                  v-model="userQuery"
                  type="text"
                  @input="onUserQueryInput"
                  :placeholder="t('admin.organizations.create.userSearchPlaceholder')"
                  class="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                />
                <font-awesome-icon :icon="['fas', 'search']" class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <font-awesome-icon
                  v-if="isSearching"
                  :icon="['fas', 'spinner']"
                  class="absolute right-3 top-3 w-4 h-4 text-gray-400 animate-spin"
                />
              </div>

              <ul
                v-if="searchResults.length > 0"
                class="mt-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg divide-y divide-gray-200 dark:divide-gray-600"
              >
                <li v-for="user in searchResults" :key="user.id">
                  <button
                    type="button"
                    @click="selectedUser = user"
                    class="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.first_name }} {{ user.last_name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ user.email }}
                      <span v-if="user.organization"> · {{ user.organization.name }}</span>
                    </p>
                  </button>
                </li>
              </ul>
              <p
                v-else-if="userQuery.trim().length >= 2 && !isSearching"
                class="mt-2 text-sm text-gray-500 dark:text-gray-400"
              >
                {{ t('admin.organizations.create.noUser') }}
              </p>
            </div>
          </section>

          <!-- Étape 2 : informations de l'organisation -->
          <section v-if="selectedUser && !createdOrganization">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              2. {{ t('admin.organizations.create.details') }}
            </h4>
            <OrganizationForm @saved="onOrganizationCreated" @cancel="close" />
          </section>

          <!-- Échec de l'assignation : l'organisation existe déjà -->
          <div
            v-if="assignError"
            class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p class="text-sm text-red-700 dark:text-red-300">{{ assignError }}</p>
            <button
              type="button"
              @click="assign"
              :disabled="isAssigning"
              class="cursor-pointer mt-3 px-4 py-2 text-sm text-white bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <font-awesome-icon v-if="isAssigning" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
              {{ t('admin.organizations.create.retryAssign') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useUserSearch } from '@/composables/useUserSearch'
import { useToast } from '@/composables/useToast'
import OrganizationForm from '@/components/organization/OrganizationForm.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'created'])

const { t } = useI18n()
const { supabase } = useSupabase()
const toast = useToast()
const { searchUsers, searchResults, isSearching } = useUserSearch()

const userQuery = ref('')
const selectedUser = ref(null)
const createdOrganization = ref(null)
const isAssigning = ref(false)
const assignError = ref('')

let searchTimeout = null

const onUserQueryInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => searchUsers(userQuery.value), 300)
}

// Rattache l'utilisateur à l'organisation et lui en transfère la propriété,
// pour qu'il puisse ensuite la modifier lui-même (logo, nom…)
const assign = async () => {
  isAssigning.value = true
  assignError.value = ''
  try {
    const organizationId = createdOrganization.value.id
    const userId = selectedUser.value.id

    const { error: orgError } = await supabase
      .from('organizations')
      .update({ created_by: userId })
      .eq('id', organizationId)
    if (orgError) throw orgError

    const { error: userError } = await supabase
      .from('users')
      .update({ organization_id: organizationId })
      .eq('id', userId)
    if (userError) throw userError

    toast.success(t('admin.organizations.create.success', {
      name: createdOrganization.value.name,
      user: `${selectedUser.value.first_name} ${selectedUser.value.last_name}`
    }))
    emit('close')
  } catch (error) {
    console.error('Erreur lors de l\'assignation de l\'organisation:', error)
    assignError.value = t('admin.organizations.create.assignFailed', { message: error.message })
  } finally {
    isAssigning.value = false
  }
}

const onOrganizationCreated = async (organization) => {
  createdOrganization.value = organization
  // L'organisation existe désormais : la liste doit l'afficher même si l'assignation échoue
  emit('created', organization)
  await assign()
}

const close = () => {
  if (isAssigning.value) return
  emit('close')
}

watch(() => props.show, (isShown) => {
  if (!isShown) return
  userQuery.value = ''
  searchResults.value = []
  selectedUser.value = null
  createdOrganization.value = null
  assignError.value = ''
})
</script>
