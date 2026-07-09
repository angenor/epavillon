<template>
  <div
    class="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-300 p-4"
  >
    <!-- Photo ou avatar placeholder (déposer l'image dans public/images/fphn2026/speakers/) -->
    <div class="relative w-16 h-16 shrink-0">
      <img
        v-if="!photoMissing"
        :src="speaker.photo"
        :alt="displayName"
        class="w-16 h-16 rounded-full object-cover object-top ring-2 ring-emerald-100 dark:ring-emerald-900"
        @error="photoMissing = true"
      />
      <div
        v-else
        class="w-16 h-16 rounded-full bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-950 dark:to-emerald-950 border-2 border-dashed border-sky-300 dark:border-sky-700 flex items-center justify-center"
        :title="t('fphn.speakers.photoPlaceholder')"
      >
        <span class="text-sm font-extrabold text-sky-700 dark:text-sky-300">{{ speaker.initials }}</span>
      </div>
    </div>

    <div class="min-w-0">
      <div class="flex items-center flex-wrap gap-1.5">
        <h3 class="font-bold text-sm text-gray-900 dark:text-white leading-snug">
          {{ displayName }}
        </h3>
        <span
          v-if="speaker.org"
          class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800"
        >
          {{ speaker.org }}
        </span>
        <span
          v-if="speaker.tbc"
          class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800"
        >
          {{ t('fphn.speakers.tbc') }}
        </span>
      </div>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {{ t(speaker.roleKey) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  /** { name?, nameKey?, roleKey, org?, photo, initials, tbc? } */
  speaker: { type: Object, required: true },
})

const { t } = useI18n()
const photoMissing = ref(false)

const displayName = computed(() => props.speaker.name || t(props.speaker.nameKey))
</script>
