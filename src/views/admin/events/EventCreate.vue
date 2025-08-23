<template>
  <div class="admin-event-create">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Créer un Événement
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-300">
        Créer un nouvel événement annuel
      </p>
    </div>

    <form @submit.prevent="createEvent" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre de l'événement *
            </label>
            <input v-model="formData.title"
                   type="text"
                   required
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Acronyme
            </label>
            <input v-model="formData.acronym"
                   type="text"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Année *
            </label>
            <input v-model.number="formData.year"
                   type="number"
                   :min="new Date().getFullYear()"
                   required
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mode de participation *
            </label>
            <select v-model="formData.participation_mode"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Sélectionner...</option>
              <option value="online">En ligne</option>
              <option value="hybrid">Hybride</option>
              <option value="in_person">Présentiel</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea v-model="formData.description"
                    rows="4"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date limite de soumission *
          </label>
          <input v-model="formData.submission_deadline"
                 type="datetime-local"
                 required
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>

        <!-- Localisation pour événements physiques -->
        <div v-if="formData.participation_mode !== 'online'" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Localisation</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ville *
              </label>
              <input v-model="formData.city"
                     type="text"
                     required
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pays *
              </label>
              <select v-model="formData.country_id"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">Sélectionner un pays...</option>
                <option v-for="country in countries" :key="country.id" :value="country.id">
                  {{ country.name_fr }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse complète *
            </label>
            <textarea v-model="formData.address"
                      rows="2"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <router-link to="/admin/events"
                       class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
            Annuler
          </router-link>
          <button type="submit"
                  :disabled="isSaving"
                  class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
            {{ isSaving ? 'Création...' : 'Créer l\'événement' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { supabase } = useSupabase()
const { hasAdminRole } = useAdmin()
const { currentUser } = useAuth()

const isSaving = ref(false)
const countries = ref([])

const formData = ref({
  title: '',
  acronym: '',
  year: new Date().getFullYear() + 1,
  description: '',
  submission_deadline: '',
  participation_mode: '',
  city: '',
  country_id: '',
  address: ''
})

if (!hasAdminRole.value) {
  throw new Error('Accès non autorisé')
}

const loadCountries = async () => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name_fr')
      .order('name_fr')

    if (error) throw error
    countries.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des pays:', error)
  }
}

const createEvent = async () => {
  isSaving.value = true
  
  try {
    const eventData = {
      ...formData.value,
      created_by: currentUser.value?.id,
      event_status: 'upcoming',
      submission_status: 'open'
    }

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (error) throw error

    router.push(`/admin/events/${data.id}`)
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadCountries()
})
</script>