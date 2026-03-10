<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('paco.admin.chartTitle') }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('paco.admin.chartSubtitle') }}
        </p>
      </div>
      <div class="flex gap-2">
        <button
          v-for="mode in modes"
          :key="mode.key"
          @click="activeMode = mode.key"
          class="cursor-pointer px-3 py-1.5 text-sm font-medium rounded-lg transition"
          :class="activeMode === mode.key
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
        >
          {{ mode.label }}
        </button>
      </div>
    </div>

    <div v-if="!data.length" class="flex items-center justify-center h-80">
      <p class="text-gray-400 dark:text-gray-500">{{ t('paco.admin.noRegistrants') }}</p>
    </div>

    <div v-else ref="chartDiv" class="h-80"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

const props = defineProps({
  data: { type: Array, required: true }
})

const { t, locale } = useI18n()

const chartDiv = ref(null)
const activeMode = ref('day')

let root = null

const modes = computed(() => [
  { key: 'hour', label: t('paco.admin.chartByHour') },
  { key: 'day', label: t('paco.admin.chartByDay') },
  { key: 'month', label: t('paco.admin.chartByMonth') }
])

const groupedData = computed(() => {
  const groups = {}

  props.data.forEach(r => {
    if (!r.registrationDate) return
    const d = new Date(r.registrationDate)
    let key

    if (activeMode.value === 'hour') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:00`
    } else if (activeMode.value === 'day') {
      key = d.toISOString().split('T')[0]
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }

    groups[key] = (groups[key] || 0) + 1
  })

  return Object.entries(groups)
    .map(([key, count]) => {
      let date
      if (activeMode.value === 'month') {
        date = new Date(key + '-01').getTime()
      } else {
        date = new Date(key).getTime()
      }
      return { date, value: count }
    })
    .sort((a, b) => a.date - b.date)
})

const destroyChart = () => {
  if (root) {
    root.dispose()
    root = null
  }
}

const createChart = () => {
  destroyChart()
  if (!chartDiv.value || !groupedData.value.length) return

  root = am5.Root.new(chartDiv.value)
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(am5xy.XYChart.new(root, {
    panX: true,
    panY: false,
    wheelX: 'panX',
    wheelY: 'zoomX',
    pinchZoomX: true
  }))

  const baseInterval = activeMode.value === 'hour'
    ? { timeUnit: 'hour', count: 1 }
    : activeMode.value === 'day'
      ? { timeUnit: 'day', count: 1 }
      : { timeUnit: 'month', count: 1 }

  const dateFormat = activeMode.value === 'hour'
    ? 'dd/MM HH:mm'
    : activeMode.value === 'day'
      ? 'dd/MM/yyyy'
      : 'MMM yyyy'

  const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
    baseInterval,
    renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 60 }),
    tooltip: am5.Tooltip.new(root, {}),
    dateFormats: {
      hour: 'HH:mm',
      day: 'dd MMM',
      month: 'MMM yyyy'
    }
  }))

  const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererY.new(root, {}),
    min: 0,
    maxPrecision: 0
  }))

  const tooltipLabel = locale.value === 'fr'
    ? `{valueY} inscription(s)\n{valueX.formatDate('${dateFormat}')}`
    : `{valueY} registration(s)\n{valueX.formatDate('${dateFormat}')}`

  const series = chart.series.push(am5xy.ColumnSeries.new(root, {
    name: 'Registrations',
    xAxis,
    yAxis,
    valueYField: 'value',
    valueXField: 'date',
    tooltip: am5.Tooltip.new(root, { labelText: tooltipLabel })
  }))

  series.columns.template.setAll({
    cornerRadiusTL: 4,
    cornerRadiusTR: 4,
    strokeOpacity: 0
  })

  series.columns.template.adapters.add('fill', (fill, target) => {
    return chart.get('colors').getIndex(series.columns.indexOf(target))
  })

  series.data.setAll(groupedData.value)

  chart.set('cursor', am5xy.XYCursor.new(root, { behavior: 'zoomX' }))

  series.appear(1000)
  chart.appear(1000, 100)
}

watch(activeMode, async () => {
  await nextTick()
  createChart()
})

watch(() => props.data, async () => {
  await nextTick()
  createChart()
}, { deep: true })

onMounted(() => {
  if (props.data.length) {
    createChart()
  }
})

onUnmounted(() => {
  destroyChart()
})
</script>
