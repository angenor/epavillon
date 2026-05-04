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

      <!-- Feature 006 : canal d'acquisition (referral source) -->
      <div>
        <label for="paco-quick-referral" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.referralSource.label') }} <span class="text-red-400">*</span>
        </label>
        <select
          id="paco-quick-referral"
          v-model="form.referralSource"
          required
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition cursor-pointer text-sm"
        >
          <option value="" disabled class="bg-gray-800 text-white">
            {{ t('paco.referralSource.placeholder') }}
          </option>
          <option
            v-for="option in referralSourceOptions"
            :key="option.value"
            :value="option.value"
            class="bg-gray-800 text-white"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Champ libre "Autre" (affiche uniquement si referralSource === 'other').
           Facultatif (FR-002b, quickstart §3.2) : max 120 caracteres. -->
      <div v-if="form.referralSource === 'other'">
        <label for="paco-quick-referral-other" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.referralSource.otherLabel') }}
        </label>
        <input
          id="paco-quick-referral-other"
          v-model="form.referralSourceOther"
          type="text"
          :maxlength="MAX_REFERRAL_OTHER_LENGTH"
          :placeholder="t('paco.referralSource.otherPlaceholder')"
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
        />
        <p class="mt-1 text-xs text-white/40 text-right">
          {{ form.referralSourceOther.length }} / {{ MAX_REFERRAL_OTHER_LENGTH }}
        </p>
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCountries } from '@/composables/useCountries'
import { registerPacoWithFallback } from '@/composables/paco/usePacoRegistration'
import {
  PACO_REFERRAL_SOURCES,
  MAX_REFERRAL_OTHER_LENGTH,
  referralSourceI18nKey
} from '@/composables/paco/referralSources'

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
  recordingConsent: false,
  // Feature 006 : canal d'acquisition (obligatoire cote Vue, nullable cote DB).
  referralSource: '',
  referralSourceOther: ''
})

// Liste des options referral : exposee via computed pour que le template
// puisse iterer. La cle i18n est derivee de la constante canonique.
const referralSourceOptions = computed(() =>
  PACO_REFERRAL_SOURCES.map((source) => ({
    value: source,
    label: t(referralSourceI18nKey(source))
  }))
)

// Reset du champ libre quand la source change pour ne pas garder un "other"
// fantome si l'utilisateur revient sur un choix principal.
watch(
  () => form.referralSource,
  (next) => {
    if (next !== 'other') {
      form.referralSourceOther = ''
    }
  }
)

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

  // Garde defensive : la CHECK constraint paco_demographic_data_age_profile_check
  // / _gender_check rejette toute valeur hors liste. Sans cette validation
  // explicite, certains navigateurs (autofill, soumission programmatique)
  // peuvent contourner l'attribut HTML5 `required` sur les radios et envoyer
  // une chaine vide a la RPC -> 23514 cote serveur, fallback inutile.
  if (!['male', 'female'].includes(form.gender) ||
      !['over_35', 'under_35'].includes(form.ageProfile)) {
    errorMessage.value = t('paco.errors.missingDemographic')
    submitting.value = false
    return
  }

  // Feature 006 : validation cote client du canal d'acquisition.
  // Seul le <select> est obligatoire (FR-001). Le champ libre "Precisez"
  // reste facultatif meme quand source === 'other' (cf. quickstart §3.2),
  // pour ne pas sur-contraindre l'utilisateur.
  if (!form.referralSource || !PACO_REFERRAL_SOURCES.includes(form.referralSource)) {
    errorMessage.value = t('paco.referralSource.required')
    submitting.value = false
    return
  }

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
    sessionEdition: props.sessionEdition,
    referralSource: form.referralSource,
    referralSourceOther: form.referralSourceOther
  })

  // Le status est uniquement utilisé pour la télémétrie / logging.
  if (result.status !== 'standard') {
    console.warn('[PACO] Registration completed via fallback path:', result.status, result.technicalError)
  }

  emit('registration-complete')
  submitting.value = false
}
</script>
