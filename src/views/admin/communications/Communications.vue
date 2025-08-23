<template>
  <div class="admin-communications">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Communications
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-300">
        Gestion des communications, newsletters et notifications système
      </p>
    </div>

    <!-- Statistiques de communication -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Newsletters envoyées</div>
        <div class="mt-1 text-2xl font-bold text-blue-600">{{ stats.newslettersSent }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Notifications système</div>
        <div class="mt-1 text-2xl font-bold text-green-600">{{ stats.systemNotifications }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Taux d'ouverture</div>
        <div class="mt-1 text-2xl font-bold text-orange-600">{{ stats.openRate }}%</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Messages actifs</div>
        <div class="mt-1 text-2xl font-bold text-purple-600">{{ stats.activeMessages }}</div>
      </div>
    </div>

    <!-- Onglets de communication -->
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
        <!-- Newsletter -->
        <div v-if="activeTab === 'newsletters'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Gestion des Newsletters</h3>
            <button class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              Nouvelle Newsletter
            </button>
          </div>
          <div v-if="isLoadingNewsletters" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          </div>
          <div v-else-if="newsletters.length === 0" class="text-center py-8">
            <p class="text-gray-500 dark:text-gray-400">Aucune newsletter envoyée</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="newsletter in newsletters" :key="newsletter.id" 
                 class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ newsletter.subject }}</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Envoyée le {{ formatDate(newsletter.sent_at) }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <span class="text-sm text-green-600">{{ newsletter.recipients_count }} destinataires</span>
                  <span class="text-sm text-blue-600">{{ newsletter.open_rate }}% ouverture</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications système -->
        <div v-else-if="activeTab === 'notifications'">
          <h3 class="text-lg font-semibold mb-4">Notifications Système</h3>
          <p class="text-gray-500 dark:text-gray-400">Configuration des notifications automatiques</p>
        </div>

        <!-- Messages à bannière -->
        <div v-else-if="activeTab === 'banners'">
          <h3 class="text-lg font-semibold mb-4">Messages Bannière</h3>
          <p class="text-gray-500 dark:text-gray-400">Gestion des messages d'information généraux</p>
        </div>

        <!-- Emails de masse -->
        <div v-else-if="activeTab === 'bulk_emails'">
          <h3 class="text-lg font-semibold mb-4">Emails de Masse</h3>
          <p class="text-gray-500 dark:text-gray-400">Envoi d'emails ciblés aux utilisateurs</p>
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

const activeTab = ref('newsletters')
const isLoadingNewsletters = ref(true)
const newsletters = ref([])

const stats = ref({
  newslettersSent: 0,
  systemNotifications: 0,
  openRate: 0,
  activeMessages: 0
})

const tabs = [
  { key: 'newsletters', label: 'Newsletters' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'banners', label: 'Messages Bannière' },
  { key: 'bulk_emails', label: 'Emails de Masse' }
]

if (!hasAdminRole.value) {
  throw new Error('Accès non autorisé')
}

const loadStats = async () => {
  try {
    // TODO: Charger les vraies statistiques depuis la base de données
    stats.value = {
      newslettersSent: 25,
      systemNotifications: 148,
      openRate: 68,
      activeMessages: 3
    }
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

const loadNewsletters = async () => {
  try {
    // TODO: Charger les newsletters depuis la base de données
    newsletters.value = []
  } catch (error) {
    console.error('Erreur lors du chargement des newsletters:', error)
  } finally {
    isLoadingNewsletters.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadNewsletters()
  ])
})
</script>