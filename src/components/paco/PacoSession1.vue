<template>
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-start">
    <!-- Left: PACO Info -->
    <div class="lg:col-span-3 order-2 lg:order-1">
      <PacoPresentation :session-data="sessionData" />
    </div>

    <!-- Right: Replay panel sticky -->
    <div class="lg:col-span-2 lg:sticky lg:top-24 order-1 lg:order-2 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-white/20 lg:scrollbar-track-transparent">
      <div class="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20">
        <!-- Replay header -->
        <div class="mb-4 flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'circle-play']" class="text-green-400" />
          <h2 class="text-lg font-bold text-white">{{ t(`${sessionData.i18nPrefix}.replayTitle`) }}</h2>
        </div>

        <!-- Date / heure -->
        <div class="mb-5 space-y-2">
          <div class="flex items-center gap-2 text-sm text-white/80">
            <font-awesome-icon :icon="['fas', 'calendar-days']" class="text-green-400 text-xs" />
            <span>{{ t(`${sessionData.i18nPrefix}.dateLabel`) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-white/80">
            <font-awesome-icon :icon="['fas', 'clock']" class="text-green-400 text-xs" />
            <span>{{ t(`${sessionData.i18nPrefix}.timeLabel`) }}</span>
          </div>
        </div>

        <!-- Replay video container -->
        <div v-if="sessionData.replayUrl" class="relative">
          <!-- Skeleton loader -->
          <div
            v-if="iframeLoading"
            class="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 z-10"
          >
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
            <p class="text-white/60 text-sm">{{ t(`${sessionData.i18nPrefix}.replayLoading`) }}</p>
          </div>

          <!-- Error state -->
          <div
            v-else-if="iframeError"
            class="bg-red-500/10 border border-red-400/30 rounded-2xl p-6 text-center"
          >
            <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="text-red-400 text-2xl mb-2" />
            <p class="text-sm text-red-300">{{ t(`${sessionData.i18nPrefix}.replayError`) }}</p>
          </div>

          <iframe
            v-show="!iframeError"
            :src="sessionData.replayUrl"
            :title="t(`${sessionData.i18nPrefix}.replayTitle`)"
            class="w-full aspect-video rounded-2xl border border-white/10 bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
            @load="onIframeLoad"
            @error="onIframeError"
          ></iframe>
        </div>

        <!-- No replay yet -->
        <div
          v-else
          class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
        >
          <font-awesome-icon :icon="['fas', 'video-slash']" class="text-white/30 text-2xl mb-2" />
          <p class="text-sm text-white/60">{{ t(`${sessionData.i18nPrefix}.replayUnavailable`) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PacoPresentation from '@/components/paco/PacoPresentation.vue'

defineProps({
  sessionData: { type: Object, required: true }
})

const { t } = useI18n()

const iframeLoading = ref(true)
const iframeError = ref(false)

function onIframeLoad() {
  iframeLoading.value = false
}

function onIframeError() {
  iframeLoading.value = false
  iframeError.value = true
}
</script>
