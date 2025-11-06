<!-- ⚠️ À INTÉGRER DANS Detail.vue À LA LIGNE 495 (après le modal d'inscription) ⚠️ -->

  <!-- Modal d'inscription Guest -->
  <div v-if="showGuestRegistrationModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('activity.guestRegistration.title') }}
          </h3>
          <button
            @click="closeGuestRegistrationModal"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <!-- Info -->
        <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="flex items-start gap-3">
            <font-awesome-icon :icon="['fas', 'info-circle']" class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div class="flex-1">
              <p class="text-sm text-blue-800 dark:text-blue-200">
                {{ t('activity.guestRegistration.info') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="registerAsGuest" class="space-y-4">
          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('activity.guestRegistration.email') }} *
            </label>
            <input
              v-model="guestRegistrationForm.email"
              type="email"
              required
              :class="[
                'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                guestFormErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              ]"
              :placeholder="t('activity.guestRegistration.emailPlaceholder')"
            />
            <p v-if="guestFormErrors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ guestFormErrors.email }}
            </p>
          </div>

          <!-- Prénom -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('activity.guestRegistration.firstName') }} *
            </label>
            <input
              v-model="guestRegistrationForm.firstName"
              type="text"
              required
              :class="[
                'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                guestFormErrors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              ]"
              :placeholder="t('activity.guestRegistration.firstNamePlaceholder')"
            />
            <p v-if="guestFormErrors.firstName" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ guestFormErrors.firstName }}
            </p>
          </div>

          <!-- Nom -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('activity.guestRegistration.lastName') }} *
            </label>
            <input
              v-model="guestRegistrationForm.lastName"
              type="text"
              required
              :class="[
                'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                guestFormErrors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              ]"
              :placeholder="t('activity.guestRegistration.lastNamePlaceholder')"
            />
            <p v-if="guestFormErrors.lastName" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ guestFormErrors.lastName }}
            </p>
          </div>

          <!-- Organisation (optionnel) -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('activity.guestRegistration.organization') }}
            </label>
            <input
              v-model="guestRegistrationForm.organization"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              :placeholder="t('activity.guestRegistration.organizationPlaceholder')"
            />
          </div>

          <!-- Pays (optionnel) -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('activity.guestRegistration.country') }}
            </label>
            <select
              v-model="guestRegistrationForm.countryId"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option :value="null">{{ t('activity.guestRegistration.selectCountry') }}</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ t('common.locale') === 'fr' ? country.name_fr : country.name_en }}
              </option>
            </select>
          </div>

          <!-- Boutons -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeGuestRegistrationModal"
              class="flex-1 px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer"
              :disabled="isRegistering"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="isRegistering"
            >
              <font-awesome-icon
                v-if="isRegistering"
                :icon="['fas', 'spinner']"
                class="animate-spin"
              />
              <span>{{ isRegistering ? t('activity.registering') : t('activity.guestRegistration.submit') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
