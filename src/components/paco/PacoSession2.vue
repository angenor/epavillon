<template>
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-start">
    <!-- Left: PACO Info -->
    <div class="lg:col-span-3 order-2 lg:order-1">
      <PacoPresentation :session-data="sessionData" />
    </div>

    <!-- Right: Registration / Join panel sticky -->
    <div class="lg:col-span-2 lg:sticky lg:top-24 order-1 lg:order-2 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-white/20 lg:scrollbar-track-transparent">
      <div class="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20">
        <!-- Countdown -->
        <PacoCountdown :session-data="sessionData" />

        <!-- Loading skeleton -->
        <div v-if="pageLoading" class="space-y-4">
          <div class="h-6 bg-white/10 rounded-lg animate-pulse"></div>
          <div class="h-4 bg-white/10 rounded-lg animate-pulse w-3/4"></div>
          <div class="space-y-2 mt-4">
            <div class="h-10 bg-white/10 rounded-xl animate-pulse"></div>
            <div class="h-10 bg-white/10 rounded-xl animate-pulse"></div>
            <div class="h-10 bg-white/10 rounded-xl animate-pulse"></div>
          </div>
        </div>

        <!-- Registration form -->
        <PacoQuickRegister
          v-else-if="step === 'form'"
          :session-edition="sessionData.edition"
          @registration-complete="$emit('registration-complete')"
        />

        <!-- Join section -->
        <PacoJoinSection
          v-else-if="step === 'join'"
          :session-data="sessionData"
        />

        <!-- Inscriptions suspendues (30 min après la fin de la session) -->
        <div v-else-if="step === 'closed'" class="text-center py-4">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-4">
            <font-awesome-icon :icon="['fas', 'lock']" class="text-white/60 text-xl" />
          </div>
          <h2 class="text-xl font-bold text-white mb-2">
            {{ t('paco.register.closedTitle') }}
          </h2>
          <p class="text-sm text-white/60">
            {{ t('paco.register.closedMessage') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import PacoPresentation from '@/components/paco/PacoPresentation.vue'
import PacoCountdown from '@/components/paco/PacoCountdown.vue'
import PacoQuickRegister from '@/components/paco/PacoQuickRegister.vue'
import PacoJoinSection from '@/components/paco/PacoJoinSection.vue'

const { t } = useI18n()

defineProps({
  sessionData: { type: Object, required: true },
  step: { type: String, required: true },
  pageLoading: { type: Boolean, default: false }
})

defineEmits(['registration-complete'])
</script>
