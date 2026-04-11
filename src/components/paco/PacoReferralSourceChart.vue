<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('paco.referralSource.chartTitle') }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('paco.referralSource.chartSubtitle') }}
        </p>
      </div>
      <div class="text-right">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {{ t('paco.admin.totalRegistrants') }}
        </p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ total }}
        </p>
      </div>
    </div>

    <div v-if="!total" class="flex items-center justify-center h-80">
      <p class="text-gray-400 dark:text-gray-500">{{ t('paco.admin.noRegistrants') }}</p>
    </div>

    <div v-else ref="chartDiv" class="h-80"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import * as am5 from '@amcharts/amcharts5'
import * as am5percent from '@amcharts/amcharts5/percent'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import {
  PACO_REFERRAL_COLORS,
  referralSourceI18nKey
} from '@/composables/paco/referralSources'

const props = defineProps({
  /**
   * Resultat de `buildReferralSourceBreakdown` dans usePacoStats :
   * { buckets: [{ key, count }], total: number }
   */
  breakdown: {
    type: Object,
    required: true,
    default: () => ({ buckets: [], total: 0 })
  }
})

const { t } = useI18n()

const chartDiv = ref(null)
let root = null

const total = computed(() => props.breakdown?.total || 0)

/**
 * Prepare les donnees pour amCharts 5. Chaque bucket conserve son
 * ordre canonique et sa couleur dediee (PACO_REFERRAL_COLORS).
 * Les categories a 0 sont affichees dans la legende mais n'occupent
 * pas de segment visible — amCharts gere cela nativement via
 * `hideSmall` desactive + value = 0.
 */
const chartData = computed(() => {
  const buckets = props.breakdown?.buckets || []
  return buckets.map((b) => ({
    category: t(referralSourceI18nKey(b.key)),
    value: b.count,
    sliceSettings: {
      fill: am5.color(PACO_REFERRAL_COLORS[b.key] || '#9ca3af')
    }
  }))
})

const destroyChart = () => {
  if (root) {
    root.dispose()
    root = null
  }
}

const createChart = () => {
  destroyChart()
  if (!chartDiv.value || !total.value) return

  root = am5.Root.new(chartDiv.value)
  root.setThemes([am5themes_Animated.new(root)])

  // Donut chart : innerRadius fixe la zone centrale.
  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
      innerRadius: am5.percent(55)
    })
  )

  const series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: 'value',
      categoryField: 'category',
      alignLabels: false
    })
  )

  // Couleurs par bucket (chaque slice porte sa couleur dans `sliceSettings`)
  series.slices.template.setAll({
    strokeOpacity: 0,
    templateField: 'sliceSettings'
  })

  // Labels internes : pourcentage uniquement pour les slices > 5 %
  series.labels.template.setAll({
    text: "{valuePercentTotal.formatNumber('0.0')}%",
    inside: true,
    radius: 10,
    fill: am5.color(0xffffff),
    fontSize: 12,
    fontWeight: '600',
    oversizedBehavior: 'hide'
  })

  series.ticks.template.setAll({ visible: false })

  // Tooltip detaille : libelle + count + %
  series.slices.template.set(
    'tooltipText',
    "{category}: [bold]{value}[/] ({valuePercentTotal.formatNumber('0.0')}%)"
  )

  series.data.setAll(chartData.value)

  // Legende horizontale : toutes les 6 categories sont toujours listees
  // meme quand value = 0 (FR-008).
  const legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50,
      marginTop: 15,
      marginBottom: 15,
      layout: root.horizontalLayout,
      useDefaultMarker: true
    })
  )
  legend.labels.template.setAll({
    fontSize: 12,
    fill: am5.color(0x6b7280)
  })
  legend.valueLabels.template.setAll({
    fontSize: 12,
    fill: am5.color(0x374151)
  })
  legend.data.setAll(series.dataItems)

  series.appear(1000, 100)
}

watch(
  () => props.breakdown,
  async () => {
    await nextTick()
    createChart()
  },
  { deep: true }
)

onMounted(() => {
  if (total.value) {
    createChart()
  }
})

onUnmounted(() => {
  destroyChart()
})
</script>
