<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('admin.dashboard.submissionsPerDay') }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ t('admin.dashboard.submissionsPerDaySubtitle') }}
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
import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

const { t } = useI18n()
const { supabase } = useSupabase()

const chartDiv = ref(null)
const isLoading = ref(true)
const chartData = ref([])

let root = null
let chart = null

const loadSubmissionsData = async () => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('created_at')
      .not('created_at', 'is', null)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Grouper les soumissions par jour
    const dailySubmissions = {}

    data.forEach(activity => {
      const date = new Date(activity.created_at).toISOString().split('T')[0]
      dailySubmissions[date] = (dailySubmissions[date] || 0) + 1
    })

    // Convertir en format pour amCharts5
    chartData.value = Object.entries(dailySubmissions).map(([date, count]) => ({
      date: new Date(date).getTime(),
      value: count
    })).sort((a, b) => a.date - b.date)

  } catch (error) {
    console.error('Erreur lors du chargement des données de soumissions:', error)
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

  // Créer le graphique
  chart = root.container.children.push(am5xy.XYChart.new(root, {
    panX: true,
    panY: true,
    wheelX: "panX",
    wheelY: "zoomX",
    pinchZoomX: true
  }))

  // Créer les axes
  const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
    maxZoomCount: 50,
    baseInterval: {
      timeUnit: "day",
      count: 1
    },
    renderer: am5xy.AxisRendererX.new(root, {}),
    tooltip: am5.Tooltip.new(root, {})
  }))

  const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererY.new(root, {}),
    tooltip: am5.Tooltip.new(root, {})
  }))

  // Créer la série
  const series = chart.series.push(am5xy.LineSeries.new(root, {
    name: "Soumissions",
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: "value",
    valueXField: "date",
    tooltip: am5.Tooltip.new(root, {
      labelText: "{valueY} soumissions le {valueX.formatDate('dd/MM/yyyy')}"
    })
  }))

  // Ajouter des points sur la ligne
  series.bullets.push(function () {
    return am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, {
        strokeWidth: 2,
        radius: 5,
        stroke: series.get("stroke"),
        fill: am5.color("#ffffff")
      })
    })
  })

  // Charger les données
  series.data.setAll(chartData.value)

  // Animer l'apparition
  series.appear(1000)
  chart.appear(1000, 100)
}

const destroyChart = () => {
  if (root) {
    root.dispose()
    root = null
    chart = null
  }
}

watch(() => chartData.value, () => {
  if (chart && chartData.value.length > 0) {
    const series = chart.series.getIndex(0)
    if (series) {
      series.data.setAll(chartData.value)
    }
  }
}, { deep: true })

onMounted(async () => {
  await loadSubmissionsData()
  if (!isLoading.value) {
    createChart()
  }
})

onUnmounted(() => {
  destroyChart()
})
</script>