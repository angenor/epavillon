<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('admin.dashboard.organizationTypes') }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ t('admin.dashboard.organizationTypesSubtitle') }}
      </p>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center h-80">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>

    <div v-else ref="chartDiv" class="h-80"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import { useAdminEvent } from '@/composables/useAdminEvent'
import * as am5 from '@amcharts/amcharts5'
import * as am5percent from '@amcharts/amcharts5/percent'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

const { t } = useI18n()
const { supabase } = useSupabase()
const { selectedEventId } = useAdminEvent()

const chartDiv = ref(null)
const isLoading = ref(true)
const chartData = ref([])

let root = null
let chart = null

const organizationTypeLabels = {
  'public_national_institution': 'Institutions publiques nationales',
  'international_organization': 'Organisations internationales',
  'regional_organization': 'Organisations régionales',
  'ngo_association': 'ONG/Associations',
  'private_sector': 'Secteur privé'
}

const organizationTypeColors = {
  'public_national_institution': '#3B82F6',
  'international_organization': '#10B981',
  'regional_organization': '#F59E0B',
  'ngo_association': '#EF4444',
  'private_sector': '#8B5CF6'
}

const loadOrganizationTypesData = async () => {
  try {
    let query = supabase
      .from('organizations')
      .select('organization_type')
      .eq('is_active', true)

    // Restreindre aux organisations ayant une activité sur l'événement sélectionné
    if (selectedEventId.value) {
      const { data: activityOrgs, error: activityError } = await supabase
        .from('activities')
        .select('organization_id')
        .eq('event_id', selectedEventId.value)
        .eq('is_deleted', false)
        .not('organization_id', 'is', null)

      if (activityError) throw activityError

      const organizationIds = [...new Set((activityOrgs || []).map(a => a.organization_id))]

      if (organizationIds.length === 0) {
        chartData.value = []
        return
      }

      query = query.in('id', organizationIds)
    }

    const { data, error } = await query

    if (error) throw error

    // Compter les types d'organisations
    const typeCounts = {}

    data.forEach(org => {
      const type = org.organization_type
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    // Convertir en format pour amCharts5
    chartData.value = Object.entries(typeCounts).map(([type, count]) => ({
      type: type,
      label: organizationTypeLabels[type] || type,
      value: count,
      color: am5.color(organizationTypeColors[type] || '#6B7280')
    }))

  } catch (error) {
    console.error('Erreur lors du chargement des types d\'organisations:', error)
  } finally {
    isLoading.value = false
  }
}

const createChart = () => {
  if (!chartDiv.value) return

  // Créer root
  root = am5.Root.new(chartDiv.value)

  // Appliquer le thème
  root.setThemes([am5themes_Animated.new(root)])

  // Créer le graphique en secteurs
  chart = root.container.children.push(am5percent.PieChart.new(root, {
    layout: root.verticalLayout,
    innerRadius: am5.percent(50)
  }))

  // Créer la série
  const series = chart.series.push(am5percent.PieSeries.new(root, {
    valueField: "value",
    categoryField: "label",
    alignLabels: true
  }))

  // Configuration des slices
  series.slices.template.setAll({
    strokeWidth: 3,
    stroke: am5.color("#ffffff")
  })

  series.slices.template.states.create("hover", {
    scale: 1.05
  })

  // Configuration des labels
  series.labels.template.setAll({
    text: "{category}: {value} ({valuePercentTotal.formatNumber('#.0')}%)",
    textType: "circular",
    centerX: 0,
    centerY: 0
  })

  // Tooltip
  series.slices.template.set("tooltipText", "{category}: {value} organisations ({valuePercentTotal.formatNumber('#.0')}%)")

  // Légende
  const legend = chart.children.push(am5.Legend.new(root, {
    centerX: am5.percent(50),
    x: am5.percent(50),
    marginTop: 15,
    marginBottom: 15
  }))

  legend.data.setAll(series.dataItems)

  // Charger les données
  series.data.setAll(chartData.value)

  // Animer l'apparition
  series.appear(1000, 100)
}

const destroyChart = () => {
  if (root) {
    root.dispose()
    root = null
    chart = null
  }
}

watch(() => chartData.value, () => {
  if (chart) {
    const series = chart.series.getIndex(0)
    if (series) {
      series.data.setAll(chartData.value)
    }
  }
}, { deep: true })

// Recharger le graphique lorsque l'événement sélectionné change
watch(selectedEventId, async () => {
  isLoading.value = true
  await loadOrganizationTypesData()
  if (!chart) {
    createChart()
  }
})

onMounted(async () => {
  await loadOrganizationTypesData()
  if (!isLoading.value) {
    createChart()
  }
})

onUnmounted(() => {
  destroyChart()
})
</script>