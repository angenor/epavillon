<template>
  <div>
    <h2 class="text-xl font-bold text-white mb-1">
      {{ t('paco.register.title') }}
    </h2>
    <p class="text-sm text-white/50 mb-3">
      {{ t('paco.quickRegister.subtitle') }}
    </p>

    <!-- Session badge (read-only) -->
    <div class="mb-5 flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/15 border border-green-400/30">
      <font-awesome-icon :icon="['fas', 'calendar-check']" class="text-green-400 text-sm" />
      <span class="text-xs font-semibold text-green-200 uppercase tracking-wide">
        {{ t('paco.register.sessionLabel') }}
      </span>
      <span class="text-sm text-white/90">
        {{ t('paco.register.sessionBadge', { edition: sessionEdition, date: sessionDateLabel }) }}
      </span>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-3">
      <!-- Name fields -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="paco-quick-firstname" class="block text-sm font-medium text-white/70 mb-1">
            {{ t('paco.register.firstNameLabel') }} <span class="text-red-400">*</span>
          </label>
          <input
            id="paco-quick-firstname"
            v-model="form.firstName"
            type="text"
            :placeholder="t('paco.register.firstNamePlaceholder')"
            required
            class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
          />
        </div>
        <div>
          <label for="paco-quick-lastname" class="block text-sm font-medium text-white/70 mb-1">
            {{ t('paco.register.lastNameLabel') }} <span class="text-red-400">*</span>
          </label>
          <input
            id="paco-quick-lastname"
            v-model="form.lastName"
            type="text"
            :placeholder="t('paco.register.lastNamePlaceholder')"
            required
            class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
          />
        </div>
      </div>

      <!-- Email -->
      <div>
        <label for="paco-quick-email" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.register.emailLabel') }} <span class="text-red-400">*</span>
        </label>
        <input
          id="paco-quick-email"
          v-model="form.email"
          type="email"
          :placeholder="t('paco.emailCheck.emailPlaceholder')"
          required
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
        />
      </div>

      <!-- Gender -->
      <div>
        <label class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.demographic.genderLabel') }} <span class="text-red-400">*</span>
        </label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer text-sm text-white/80">
            <input type="radio" v-model="form.gender" value="male" required class="accent-green-500" />
            {{ t('paco.demographic.male') }}
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-sm text-white/80">
            <input type="radio" v-model="form.gender" value="female" required class="accent-green-500" />
            {{ t('paco.demographic.female') }}
          </label>
        </div>
      </div>

      <!-- Age Profile -->
      <div>
        <label class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.demographic.ageProfileLabel') }} <span class="text-red-400">*</span>
        </label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer text-sm text-white/80">
            <input type="radio" v-model="form.ageProfile" value="over_35" required class="accent-green-500" />
            {{ t('paco.demographic.over35') }}
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-sm text-white/80">
            <input type="radio" v-model="form.ageProfile" value="under_35" required class="accent-green-500" />
            {{ t('paco.demographic.under35') }}
          </label>
        </div>
      </div>

      <!-- City -->
      <div>
        <label for="paco-quick-city" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.demographic.cityLabel') }} <span class="text-red-400">*</span>
        </label>
        <input
          id="paco-quick-city"
          v-model="form.city"
          type="text"
          :placeholder="t('paco.demographic.cityPlaceholder')"
          required
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
        />
      </div>

      <!-- Country -->
      <div>
        <label for="paco-quick-country" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.register.countryLabel') }} <span class="text-red-400">*</span>
        </label>
        <select
          id="paco-quick-country"
          v-model="form.countryId"
          required
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition cursor-pointer text-sm"
        >
          <option value="" disabled class="bg-gray-800 text-white">{{ t('paco.register.countryPlaceholder') }}</option>
          <option v-for="country in countries" :key="country.id" :value="country.id" class="bg-gray-800 text-white">
            {{ locale === 'fr' ? country.name_fr : country.name_en }}
          </option>
        </select>
      </div>

      <!-- Professional Status -->
      <div>
        <label for="paco-quick-status" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.demographic.professionalStatusLabel') }} <span class="text-red-400">*</span>
        </label>
        <select
          id="paco-quick-status"
          v-model="form.professionalStatus"
          required
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition cursor-pointer text-sm"
        >
          <option value="" disabled class="bg-gray-800 text-white">{{ t('paco.demographic.professionalStatusPlaceholder') }}</option>
          <option value="employed" class="bg-gray-800 text-white">{{ t('paco.demographic.employed') }}</option>
          <option value="student" class="bg-gray-800 text-white">{{ t('paco.demographic.student') }}</option>
          <option value="unemployed" class="bg-gray-800 text-white">{{ t('paco.demographic.unemployed') }}</option>
          <option value="entrepreneur" class="bg-gray-800 text-white">{{ t('paco.demographic.entrepreneur') }}</option>
        </select>
      </div>

      <!-- Organization -->
      <div>
        <label for="paco-quick-org" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.register.organizationLabel') }} <span class="text-red-400">*</span>
        </label>
        <input
          id="paco-quick-org"
          v-model="form.organizationName"
          type="text"
          :placeholder="t('paco.register.organizationPlaceholder')"
          required
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
        />
      </div>

      <!-- Recording Consent -->
      <div>
        <label class="flex items-start gap-2 cursor-pointer text-sm text-white/80">
          <input
            type="checkbox"
            v-model="form.recordingConsent"
            required
            class="accent-green-500 mt-0.5 shrink-0"
          />
          <span>{{ t('paco.demographic.recordingConsent') }}</span>
        </label>
      </div>

      <!-- Error message -->
      <p v-if="errorMessage" class="text-sm text-red-300">
        {{ errorMessage }}
      </p>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="submitting"
        class="w-full cursor-pointer bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ submitting ? t('paco.register.submitting') : t('paco.register.submit') }}
      </button>
    </form>

    <!-- Contact support -->
    <div class="mt-4 pt-4 border-t border-white/10">
      <p class="text-xs text-white/40 text-center leading-relaxed mb-1">
        {{ t('paco.quickRegister.helpText') }}
      </p>
      <div class="flex items-center justify-center gap-1">
        <a :href="supportMailto" class="text-xs text-green-400 hover:text-green-300 hover:underline transition">
          Fidele.Ananivi@francophonie.org
        </a>
        <button
          @click="copyEmail"
          class="text-green-400 hover:text-green-300 cursor-pointer transition p-0.5"
          :title="t('paco.join.copyLink')"
        >
          <font-awesome-icon :icon="['fas', emailCopied ? 'check' : 'copy']" class="text-xs" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCountries } from '@/composables/useCountries'
import { registerPacoWithFallback } from '@/composables/paco/usePacoRegistration'

const { t, locale } = useI18n()

const props = defineProps({
  sessionEdition: { type: Number, required: true }
})

const emit = defineEmits(['registration-complete'])

const sessionDateLabel = computed(() =>
  t(`paco.session${props.sessionEdition}.dateLabel`)
)

const { countries, fetchCountries } = useCountries()

const supportMailto = 'mailto:Fidele.Ananivi@francophonie.org?cc=Angenor99@gmail.com&subject=Aide%20inscription%20webinaire%20PACO'

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  gender: '',
  ageProfile: '',
  city: '',
  countryId: '',
  professionalStatus: '',
  organizationName: '',
  recordingConsent: false
})

const submitting = ref(false)
const errorMessage = ref('')
const emailCopied = ref(false)

function copyEmail() {
  navigator.clipboard.writeText('Fidele.Ananivi@francophonie.org').then(() => {
    emailCopied.value = true
    setTimeout(() => { emailCopied.value = false }, 2000)
  }).catch(() => {})
}

onMounted(() => {
  fetchCountries()
})

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''

  // registerPacoWithFallback ne lève jamais d'exception : elle encapsule
  // la cascade RPC standard → RPC de secours → localStorage uniquement.
  // L'utilisateur n'est jamais bloqué, aucune erreur n'est affichée.
  const result = await registerPacoWithFallback({
    email: form.email,
    firstName: form.firstName,
    lastName: form.lastName,
    gender: form.gender,
    ageProfile: form.ageProfile,
    city: form.city,
    countryId: form.countryId,
    professionalStatus: form.professionalStatus,
    organizationName: form.organizationName,
    recordingConsent: form.recordingConsent,
    sessionEdition: props.sessionEdition
  })

  // Le status est uniquement utilisé pour la télémétrie / logging.
  if (result.status !== 'standard') {
    console.warn('[PACO] Registration completed via fallback path:', result.status, result.technicalError)
  }

  emit('registration-complete')
  submitting.value = false
}
</script>
