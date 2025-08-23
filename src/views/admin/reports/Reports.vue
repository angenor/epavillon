<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ t('common.loading') }}...</p>
    </div>
  </div>

  <div v-else class="admin-reports">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Rapports et Analyses
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-300">
        Rapports statistiques et analyses d'utilisation de la plateforme
      </p>
    </div>

    <!-- Métriques générales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Utilisateurs actifs</div>
        <div class="mt-1 text-2xl font-bold text-blue-600">{{ metrics.activeUsers }}</div>
        <div class="text-xs text-green-600 mt-1">+12% ce mois</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Activités créées</div>
        <div class="mt-1 text-2xl font-bold text-green-600">{{ metrics.activitiesCreated }}</div>
        <div class="text-xs text-green-600 mt-1">+8% ce mois</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Organisations</div>
        <div class="mt-1 text-2xl font-bold text-purple-600">{{ metrics.organizations }}</div>
        <div class="text-xs text-green-600 mt-1">+3% ce mois</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Événements</div>
        <div class="mt-1 text-2xl font-bold text-orange-600">{{ metrics.events }}</div>
        <div class="text-xs text-blue-600 mt-1">Stable</div>
      </div>
    </div>

    <!-- Rapports disponibles -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Rapports d'utilisation -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Rapports d'Utilisation</h2>
        <div class="space-y-3">
          <button v-for="report in usageReports" :key="report.key"
                  @click="generateReport(report.key)"
                  class="w-full flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">{{ report.name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ report.description }}</div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Rapports financiers -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Rapports Financiers</h2>
        <div class="space-y-3">
          <button v-for="report in financialReports" :key="report.key"
                  @click="generateReport(report.key)"
                  class="w-full flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">{{ report.name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ report.description }}</div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Graphiques et analyses -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Analyses Graphiques</h2>
        <div class="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <p class="text-gray-500 dark:text-gray-400">Graphique d'évolution des utilisateurs</p>
        </div>
      </div>

      <!-- Exportations -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Exportations de Données</h2>
        <div class="space-y-3">
          <button v-for="export_type in exportTypes" :key="export_type.key"
                  @click="exportData(export_type.key)"
                  :disabled="isExporting"
                  class="w-full flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">{{ export_type.name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ export_type.format }}</div>
            </div>
            <svg v-if="!isExporting" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAdmin } from '@/composables/useAdmin'

const { t } = useI18n()
const { supabase } = useSupabase()
const { hasAdminRole, isLoadingRoles, loadUserRoles } = useAdmin()

const isExporting = ref(false)

const metrics = ref({
  activeUsers: 0,
  activitiesCreated: 0,
  organizations: 0,
  events: 0
})

const usageReports = [
  {
    key: 'user_activity',
    name: 'Activité des Utilisateurs',
    description: 'Statistiques de connexion et d\'utilisation'
  },
  {
    key: 'content_creation',
    name: 'Création de Contenu',
    description: 'Activités et événements créés par période'
  },
  {
    key: 'engagement',
    name: 'Engagement Communautaire',
    description: 'Interactions et participation aux événements'
  }
]

const financialReports = [
  {
    key: 'revenue',
    name: 'Revenus et Abonnements',
    description: 'Analyse des revenus par période'
  },
  {
    key: 'cost_analysis',
    name: 'Analyse des Coûts',
    description: 'Répartition des coûts opérationnels'
  },
  {
    key: 'roi',
    name: 'Retour sur Investissement',
    description: 'ROI par fonctionnalité et service'
  }
]

const exportTypes = [
  {
    key: 'users_csv',
    name: 'Liste des Utilisateurs',
    format: 'Format CSV'
  },
  {
    key: 'activities_json',
    name: 'Données d\'Activités',
    format: 'Format JSON'
  },
  {
    key: 'full_backup',
    name: 'Sauvegarde Complète',
    format: 'Format SQL'
  }
]

// Vérification des permissions (attendre le chargement des rôles)
const checkAccess = async () => {
  await loadUserRoles()
  
  if (!hasAdminRole.value) {
    throw new Error('Accès non autorisé')
  }
}

const loadMetrics = async () => {
  try {
    // Charger les métriques depuis la base de données
    const [usersResult, activitiesResult, orgsResult, eventsResult] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('activities').select('*', { count: 'exact', head: true }),
      supabase.from('organizations').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true })
    ])

    metrics.value = {
      activeUsers: usersResult.count || 0,
      activitiesCreated: activitiesResult.count || 0,
      organizations: orgsResult.count || 0,
      events: eventsResult.count || 0
    }
  } catch (error) {
    console.error('Erreur lors du chargement des métriques:', error)
  }
}

const generateReport = (reportKey) => {
  console.log(`Génération du rapport: ${reportKey}`)
  // TODO: Implémenter la génération de rapports
}

const exportData = async (exportKey) => {
  isExporting.value = true
  
  try {
    console.log(`Export des données: ${exportKey}`)
    // TODO: Implémenter l'export de données
    
    // Simulation d'un délai d'export
    await new Promise(resolve => setTimeout(resolve, 2000))
    
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
  } finally {
    isExporting.value = false
  }
}

onMounted(async () => {
  try {
    await checkAccess()
    await loadMetrics()
  } catch (error) {
    console.error('Erreur:', error)
    if (error.message === 'Accès non autorisé') {
      throw error
    }
  }
})
</script>