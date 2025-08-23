<template>
  <div class="admin-user-edit">
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
    
    <div v-else-if="user" class="space-y-6">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Modifier l'utilisateur
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">
          {{ user.first_name }} {{ user.last_name }}
        </p>
      </div>

      <!-- Formulaire de modification -->
      <form @submit.prevent="saveUser" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prénom
            </label>
            <input v-model="formData.first_name"
                   type="text"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom
            </label>
            <input v-model="formData.last_name"
                   type="text"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input v-model="formData.email"
                   type="email"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Téléphone
            </label>
            <input v-model="formData.phone"
                   type="tel"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Biographie
            </label>
            <textarea v-model="formData.biography"
                      rows="4"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </textarea>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <router-link :to="`/admin/users/${user.id}`"
                       class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
            Annuler
          </router-link>
          <button type="submit"
                  :disabled="isSaving"
                  class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
            {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Utilisateur non trouvé</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'

const route = useRoute()
const router = useRouter()
const { supabase } = useSupabase()
const { hasAdminRole } = useAdmin()

const isLoading = ref(true)
const isSaving = ref(false)
const user = ref(null)
const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  biography: ''
})

if (!hasAdminRole.value) {
  throw new Error('Accès non autorisé')
}

const loadUser = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    
    user.value = data
    formData.value = {
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
      phone: data.phone || '',
      biography: data.biography || ''
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'utilisateur:', error)
  } finally {
    isLoading.value = false
  }
}

const saveUser = async () => {
  isSaving.value = true
  
  try {
    const { error } = await supabase
      .from('users')
      .update(formData.value)
      .eq('id', route.params.id)

    if (error) throw error

    router.push(`/admin/users/${route.params.id}`)
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadUser()
})
</script>