<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Total Registrants -->
    <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
      <div class="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-6"></div>
      <div class="relative">
        <div class="flex items-center gap-2 mb-3">
          <font-awesome-icon :icon="['fas', 'users']" class="text-white/80" />
          <p class="text-sm font-medium text-white/80">{{ t('paco.admin.totalRegistrants') }}</p>
        </div>
        <p class="text-4xl font-extrabold">{{ stats.total }}</p>
        <div class="mt-3 flex items-center gap-1.5 text-xs text-white/70">
          <font-awesome-icon :icon="['fas', 'chart-pie']" class="text-[10px]" />
          <span>{{ t('paco.admin.withDemographics') }}: {{ stats.withDemographics }}</span>
        </div>
      </div>
    </div>

    <!-- Gender Distribution -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div class="flex items-center gap-2 mb-3">
        <font-awesome-icon :icon="['fas', 'venus-mars']" class="text-pink-500" />
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('paco.admin.genderDistribution') }}</p>
      </div>
      <div class="space-y-3">
        <div>
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-300">{{ t('paco.admin.percentMale') }}</span>
            <span class="text-sm font-bold text-gray-900 dark:text-white">{{ stats.gender.male }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" :style="{ width: stats.gender.male + '%' }"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-300">{{ t('paco.admin.percentFemale') }}</span>
            <span class="text-sm font-bold text-gray-900 dark:text-white">{{ stats.gender.female }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-pink-500 h-2 rounded-full transition-all duration-500" :style="{ width: stats.gender.female + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Age Distribution -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div class="flex items-center gap-2 mb-3">
        <font-awesome-icon :icon="['fas', 'calendar-alt']" class="text-emerald-500" />
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('paco.admin.ageDistribution') }}</p>
      </div>
      <div class="space-y-3">
        <div>
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-300">{{ t('paco.admin.percentUnder35') }}</span>
            <span class="text-sm font-bold text-gray-900 dark:text-white">{{ stats.ageProfile.under35 }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-green-500 h-2 rounded-full transition-all duration-500" :style="{ width: stats.ageProfile.under35 + '%' }"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-300">{{ t('paco.admin.percentOver35') }}</span>
            <span class="text-sm font-bold text-gray-900 dark:text-white">{{ stats.ageProfile.over35 }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-amber-500 h-2 rounded-full transition-all duration-500" :style="{ width: stats.ageProfile.over35 + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Professional Status Distribution -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div class="flex items-center gap-2 mb-3">
        <font-awesome-icon :icon="['fas', 'briefcase']" class="text-amber-500" />
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('paco.admin.statusDistribution') }}</p>
      </div>
      <div class="space-y-2">
        <div v-for="(value, key) in stats.professionalStatus" :key="key" class="flex items-baseline gap-1">
          <span class="text-sm text-gray-600 dark:text-gray-300 shrink-0">{{ statusLabel(key) }}</span>
          <span class="flex-1 overflow-hidden whitespace-nowrap text-xs text-gray-300 dark:text-gray-600 tracking-widest">{{ '_'.repeat(50) }}</span>
          <span class="text-sm font-bold text-gray-900 dark:text-white shrink-0">{{ value }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  stats: { type: Object, required: true }
})

const statusLabel = (value) => {
  if (!value) return t('paco.admin.notSpecified')
  const map = {
    employed: t('paco.admin.percentEmployed'),
    student: t('paco.admin.percentStudent'),
    entrepreneur: t('paco.admin.percentEntrepreneur'),
    unemployed: t('paco.admin.percentUnemployed')
  }
  return map[value] || t('paco.admin.notSpecified')
}
</script>
