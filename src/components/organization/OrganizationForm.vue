<template>
  <form @submit.prevent="handleSubmit" class="space-y-6" novalidate>
    <!-- Organization Name -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('organization.fields.name') }} *
      </label>
      <input
        v-model="form.name"
        type="text"
        :placeholder="t('organization.placeholders.name')"
        :class="[inputClass, errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600']"
        @input="clearError('name')"
      />
      <p v-if="errors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.name }}
      </p>
    </div>

    <!-- Organization Acronym -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('organization.fields.acronym') }}
      </label>
      <input
        v-model="form.acronym"
        type="text"
        :placeholder="t('organization.placeholders.acronym')"
        :class="[inputClass, 'border-gray-300 dark:border-gray-600']"
      />
    </div>

    <!-- Organization Email -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('organization.fields.email') }} *
      </label>
      <input
        v-model="form.email"
        type="email"
        :placeholder="t('organization.placeholders.email')"
        :class="[inputClass, errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600']"
        @input="clearError('email')"
      />
      <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.email }}
      </p>
    </div>

    <!-- Organization Type -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('organization.fields.type') }} *
      </label>
      <select
        v-model="form.organization_type"
        :class="[inputClass, errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600']"
        @change="clearError('type')"
      >
        <option value="">{{ t('organization.placeholders.selectType') }}</option>
        <option v-for="type in ORGANIZATION_TYPES" :key="type" :value="type">
          {{ t(`organization.types.${type}`) }}
        </option>
      </select>
      <p v-if="errors.type" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.type }}
      </p>
    </div>

    <!-- Country -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('organization.fields.country') }} *
      </label>
      <select
        v-model="form.country_id"
        :class="[inputClass, errors.country ? 'border-red-500' : 'border-gray-300 dark:border-gray-600']"
        @change="clearError('country')"
      >
        <option value="">{{ t('organization.placeholders.selectCountry') }}</option>
        <option v-for="country in countries" :key="country.id" :value="country.id">
          {{ locale === 'en' ? country.name_en || country.name_fr : country.name_fr }}
        </option>
      </select>
      <p v-if="errors.country" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.country }}
      </p>
    </div>

    <!-- Organization Logo -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('organization.fields.logo') }} *
      </label>
      <div class="flex items-center space-x-4">
        <div class="flex-shrink-0 cursor-pointer" @click="logoInput.click()">
          <img
            v-if="logoPreview"
            :src="logoPreview"
            :alt="t('organization.fields.logo')"
            class="h-20 w-20 object-contain rounded-lg border border-gray-300 dark:border-gray-600 bg-white"
          />
          <div
            v-else
            :class="['h-20 w-20 rounded-lg border-2 border-dashed flex items-center justify-center',
                     errors.logo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600']"
          >
            <font-awesome-icon :icon="['fas', 'image']" class="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div class="flex-1">
          <input
            ref="logoInput"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            class="hidden"
            @change="selectLogo($event.target.files[0])"
          />
          <button
            type="button"
            @click="logoInput.click()"
            class="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {{ logoPreview ? t('organization.fields.changeLogo') : t('organization.fields.chooseLogo') }}
          </button>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {{ t('organization.fields.logoHelp') }}
          </p>
          <p v-if="errors.logo" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.logo }}
          </p>
        </div>
      </div>
    </div>

    <!-- Website (Optional) -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('organization.fields.website') }}
      </label>
      <input
        v-model="form.website"
        type="text"
        @blur="formatWebsite"
        :placeholder="t('organization.placeholders.website')"
        :class="[inputClass, 'border-gray-300 dark:border-gray-600']"
      />
    </div>

    <!-- Description (Optional) -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('organization.fields.description') }}
      </label>
      <textarea
        v-model="form.description"
        rows="3"
        :placeholder="t('organization.placeholders.description')"
        :class="[inputClass, 'border-gray-300 dark:border-gray-600']"
      />
    </div>

    <!-- Submit Error -->
    <div
      v-if="submitError"
      class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300"
    >
      {{ submitError }}
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between pt-2">
      <button
        type="button"
        @click="emit('cancel')"
        class="cursor-pointer px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {{ cancelLabel || t('common.cancel') }}
      </button>
      <button
        type="submit"
        :disabled="submitting"
        class="cursor-pointer px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span v-if="!submitting">
          {{ isEdit ? t('organization.form.save') : t('organization.setup.create') }}
        </span>
        <span v-else class="flex items-center">
          <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin mr-2" />
          {{ isEdit ? t('organization.form.saving') : t('organization.setup.creating') }}
        </span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCountries } from '@/composables/useCountries'
import { useOrganizationForm, ORGANIZATION_TYPES } from '@/composables/useOrganizationForm'

const props = defineProps({
  // Organisation à modifier ; null pour une création
  organization: {
    type: Object,
    default: null
  },
  // Nom pré-rempli en création (ex : texte saisi dans la recherche)
  initialName: {
    type: String,
    default: ''
  },
  cancelLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['saved', 'cancel'])

const { t, locale } = useI18n()
const { countries, fetchCountries } = useCountries()
const {
  form,
  isEdit,
  logoPreview,
  errors,
  submitError,
  submitting,
  selectLogo,
  formatWebsite,
  save
} = useOrganizationForm(props.organization)

const logoInput = ref(null)

const inputClass = 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors'

const clearError = (field) => {
  delete errors.value[field]
}

if (!isEdit.value && props.initialName) {
  form.name = props.initialName
}

const handleSubmit = async () => {
  const organization = await save()
  if (organization) {
    emit('saved', organization)
    return
  }

  await nextTick()
  document.querySelector('.text-red-600, .text-red-700')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

onMounted(() => {
  fetchCountries()
})
</script>
