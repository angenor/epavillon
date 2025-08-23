<template>
  <div class="admin-content">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Modération du Contenu
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-300">
        Gestion des commentaires, témoignages et contenus utilisateurs
      </p>
    </div>

    <!-- Statistiques de modération -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Commentaires en attente</div>
        <div class="mt-1 text-2xl font-bold text-yellow-600">{{ stats.pendingComments }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Témoignages en attente</div>
        <div class="mt-1 text-2xl font-bold text-blue-600">{{ stats.pendingTestimonials }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Innovations publiées</div>
        <div class="mt-1 text-2xl font-bold text-green-600">{{ stats.publishedInnovations }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Signalements</div>
        <div class="mt-1 text-2xl font-bold text-red-600">{{ stats.reports }}</div>
      </div>
    </div>

    <!-- Onglets de modération -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          <button v-for="tab in tabs" :key="tab.key"
                  @click="activeTab = tab.key"
                  :class="[
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === tab.key
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                  ]">
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div class="p-6">
        <!-- Contenu selon l'onglet actif -->
        <div v-if="activeTab === 'comments'">
          <h3 class="text-lg font-semibold mb-4">Commentaires en modération</h3>
          <div v-if="isLoadingComments" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          </div>
          <div v-else-if="comments.length === 0" class="text-center py-8">
            <p class="text-gray-500 dark:text-gray-400">Aucun commentaire en attente</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="comment in comments" :key="comment.id" 
                 class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ comment.user?.first_name }} {{ comment.user?.last_name }}
                  </span>
                  <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    {{ formatDate(comment.created_at) }}
                  </span>
                </div>
                <div class="flex space-x-2">
                  <button @click="approveComment(comment)"
                          class="text-green-600 hover:text-green-800 text-sm font-medium">
                    Approuver
                  </button>
                  <button @click="rejectComment(comment)"
                          class="text-red-600 hover:text-red-800 text-sm font-medium">
                    Rejeter
                  </button>
                </div>
              </div>
              <p class="text-gray-700 dark:text-gray-300 mb-2">{{ comment.content }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Contexte: {{ comment.context_type }} - ID: {{ comment.context_id }}
              </p>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'testimonials'">
          <h3 class="text-lg font-semibold mb-4">Témoignages en attente</h3>
          <p class="text-gray-500 dark:text-gray-400">Fonctionnalité à implémenter</p>
        </div>

        <div v-else-if="activeTab === 'innovations'">
          <h3 class="text-lg font-semibold mb-4">Innovations et bonnes pratiques</h3>
          <p class="text-gray-500 dark:text-gray-400">Fonctionnalité à implémenter</p>
        </div>

        <div v-else-if="activeTab === 'reports'">
          <h3 class="text-lg font-semibold mb-4">Signalements</h3>
          <p class="text-gray-500 dark:text-gray-400">Fonctionnalité à implémenter</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'

const { supabase } = useSupabase()
const { hasAdminRole } = useAdmin()

const activeTab = ref('comments')
const isLoadingComments = ref(true)
const comments = ref([])

const stats = ref({
  pendingComments: 0,
  pendingTestimonials: 0,
  publishedInnovations: 0,
  reports: 0
})

const tabs = [
  { key: 'comments', label: 'Commentaires' },
  { key: 'testimonials', label: 'Témoignages' },
  { key: 'innovations', label: 'Innovations' },
  { key: 'reports', label: 'Signalements' }
]

if (!hasAdminRole.value) {
  throw new Error('Accès non autorisé')
}

const loadStats = async () => {
  try {
    // Commentaires en attente
    const { count: pendingComments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('is_moderated', false)

    stats.value.pendingComments = pendingComments || 0

    // TODO: Charger autres statistiques
    stats.value.pendingTestimonials = 0
    stats.value.publishedInnovations = 0
    stats.value.reports = 0
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

const loadComments = async () => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(first_name, last_name)
      `)
      .eq('is_moderated', false)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    comments.value = data || []
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires:', error)
  } finally {
    isLoadingComments.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const approveComment = async (comment) => {
  try {
    const { error } = await supabase
      .from('comments')
      .update({ 
        is_moderated: true, 
        is_approved: true 
      })
      .eq('id', comment.id)

    if (error) throw error

    // Retirer de la liste
    comments.value = comments.value.filter(c => c.id !== comment.id)
    stats.value.pendingComments--
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error)
  }
}

const rejectComment = async (comment) => {
  try {
    const { error } = await supabase
      .from('comments')
      .update({ 
        is_moderated: true, 
        is_approved: false 
      })
      .eq('id', comment.id)

    if (error) throw error

    // Retirer de la liste
    comments.value = comments.value.filter(c => c.id !== comment.id)
    stats.value.pendingComments--
  } catch (error) {
    console.error('Erreur lors du rejet:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadComments()
  ])
})
</script>