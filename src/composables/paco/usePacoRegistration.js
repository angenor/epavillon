import { ref } from 'vue'
import { supabase } from '@/composables/useSupabase'
import { PACO_ACTIVITY_ID } from '@/composables/paco/constants'
import {
  PACO_REFERRAL_SOURCES,
  MAX_REFERRAL_OTHER_LENGTH
} from '@/composables/paco/referralSources'

const PENDING_REGISTRATION_KEY = 'paco_pending_registration'
const PENDING_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

// Clé legacy (mono-session, pré-multi-sessions)
const LEGACY_PACO_REGISTERED_KEY = 'paco_registration_complete'
// Clés actuelles indexées par session
const PACO_REGISTERED_PREFIX = 'paco_registered_session_'
// Préfixe des données d'inscription persistées par session
const PACO_REGISTRATION_DATA_PREFIX = 'paco_registration_data_session_'

/**
 * Migrate the legacy localStorage key to the per-session key for session 1.
 * Idempotent: safe to call multiple times.
 */
export function migrateLegacyLocalStorage() {
  if (typeof localStorage === 'undefined') return
  if (localStorage.getItem(LEGACY_PACO_REGISTERED_KEY) === '1') {
    localStorage.setItem(`${PACO_REGISTERED_PREFIX}1`, '1')
    localStorage.removeItem(LEGACY_PACO_REGISTERED_KEY)
  }
}

/**
 * Mark PACO registration as complete in localStorage for a given session.
 * @param {number} sessionEdition
 */
export function markPacoRegistered(sessionEdition) {
  if (!sessionEdition) return
  localStorage.setItem(`${PACO_REGISTERED_PREFIX}${sessionEdition}`, '1')
}

/**
 * Check if PACO registration is marked complete in localStorage for a given session.
 * @param {number} sessionEdition
 * @returns {boolean}
 */
export function isPacoRegisteredLocally(sessionEdition) {
  if (!sessionEdition) return false
  return localStorage.getItem(`${PACO_REGISTERED_PREFIX}${sessionEdition}`) === '1'
}

/**
 * Save pending registration data to sessionStorage.
 * @param {Object} data - { userId, email, name, demographicData, timestamp? }
 */
export function savePendingRegistration(data) {
  const payload = {
    ...data,
    timestamp: data.timestamp || new Date().toISOString()
  }
  localStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(payload))
}

/**
 * Retrieve pending registration from sessionStorage.
 * Returns null if missing, expired (>24h), or userId mismatch.
 * @param {string} [currentUserId] - optional userId to validate against
 * @returns {Object|null}
 */
export function getPendingRegistration(currentUserId) {
  try {
    const raw = localStorage.getItem(PENDING_REGISTRATION_KEY)
    if (!raw) return null

    const data = JSON.parse(raw)
    if (!data || !data.userId || !data.timestamp) return null

    // Check expiration
    const age = Date.now() - new Date(data.timestamp).getTime()
    if (age > PENDING_MAX_AGE_MS) {
      clearPendingRegistration()
      return null
    }

    // Check userId match if provided
    if (currentUserId && data.userId !== currentUserId) {
      return null
    }

    return data
  } catch {
    return null
  }
}

/**
 * Remove pending registration from sessionStorage.
 */
export function clearPendingRegistration() {
  localStorage.removeItem(PENDING_REGISTRATION_KEY)
}

/**
 * Persiste localement les données d'inscription PACO pour une session donnée.
 * Utilisé à la fois par le flux standard et le flux de secours — dans tous les
 * cas on stocke l'état côté client pour que l'utilisateur voie l'écran de
 * confirmation et le bouton « Rejoindre » au prochain chargement.
 *
 * @param {Object} params
 * @param {string|null} params.registrationId
 * @param {string} params.email
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {number} params.sessionEdition
 */
function persistLocalRegistration({
  registrationId,
  email,
  firstName,
  lastName,
  sessionEdition,
  referralSource = null,
  referralSourceOther = null
}) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(
    `${PACO_REGISTRATION_DATA_PREFIX}${sessionEdition}`,
    JSON.stringify({
      registrationId,
      email,
      firstName,
      lastName,
      sessionEdition,
      // Feature 006 : stockage du canal pour tracabilite cote client
      // (utile quand la branche local_only est la seule a avoir connaissance
      // de l'inscription — permet un rattrapage manuel si l'utilisateur
      // revient sur la page).
      referralSource,
      referralSourceOther,
      registeredAt: new Date().toISOString()
    })
  )
  markPacoRegistered(sessionEdition)
}

/**
 * @typedef {Object} PacoRegistrationInput
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {'male'|'female'} gender
 * @property {'under_35'|'over_35'} ageProfile
 * @property {string} city
 * @property {string} countryId
 * @property {'employed'|'student'|'unemployed'|'entrepreneur'} professionalStatus
 * @property {string} organizationName
 * @property {boolean} recordingConsent
 * @property {number} sessionEdition
 * @property {'ifdd_website'|'ifdd_linkedin'|'ifdd_facebook'|'ifdd_x'|'email_newsletter'|'other'} referralSource
 * @property {string|null} [referralSourceOther]
 */

/**
 * Normalise le couple (referralSource, referralSourceOther) avant envoi RPC.
 * - Si la source est invalide/absente, on renvoie { referralSource: null, referralSourceOther: null }
 *   pour laisser la couche serveur decider (CHECK constraint accepte NULL).
 * - Si la source n'est pas 'other', referralSourceOther est nullifie.
 * - Sinon, on trim + tronque a MAX_REFERRAL_OTHER_LENGTH caracteres (defensive).
 *
 * @param {string|null|undefined} source
 * @param {string|null|undefined} other
 * @returns {{ referralSource: string|null, referralSourceOther: string|null }}
 */
function sanitizeReferral(source, other) {
  if (!source || !PACO_REFERRAL_SOURCES.includes(source)) {
    return { referralSource: null, referralSourceOther: null }
  }
  if (source !== 'other') {
    return { referralSource: source, referralSourceOther: null }
  }
  const trimmed = typeof other === 'string' ? other.trim() : ''
  if (!trimmed) {
    return { referralSource: 'other', referralSourceOther: null }
  }
  return {
    referralSource: 'other',
    referralSourceOther: trimmed.slice(0, MAX_REFERRAL_OTHER_LENGTH)
  }
}

/**
 * @typedef {Object} PacoRegistrationResult
 * @property {'standard'|'fallback'|'local_only'} status
 * @property {string|null} registrationId
 * @property {string|null} technicalError
 */

/**
 * Tente une inscription PACO en garantissant que l'utilisateur n'est jamais
 * bloqué, même en cas d'échec technique de la RPC standard.
 *
 * Ordre des tentatives :
 *   1. RPC `register_paco_quick` (chemin nominal)
 *   2. Si (1) échoue : RPC `register_paco_fallback` (inscription de secours)
 *   3. Si (2) échoue : localStorage-only (flag uniquement, pas de trace DB)
 *
 * Dans tous les cas, retourne une promesse *résolue* (jamais rejetée). Le
 * composant appelant se fie uniquement au champ `status` pour son affichage.
 *
 * @param {PacoRegistrationInput} input
 * @returns {Promise<PacoRegistrationResult>}
 */
export async function registerPacoWithFallback(input) {
  const normalizedEmail = (input.email || '').toLowerCase().trim()
  const { referralSource, referralSourceOther } = sanitizeReferral(
    input.referralSource,
    input.referralSourceOther
  )

  // Étape 1 — RPC standard
  let technicalError = null
  try {
    const { data: registrationId, error: rpcError } = await supabase.rpc('register_paco_quick', {
      p_email: normalizedEmail,
      p_first_name: input.firstName,
      p_last_name: input.lastName,
      p_gender: input.gender,
      p_age_profile: input.ageProfile,
      p_city: input.city,
      p_country_id: input.countryId,
      p_professional_status: input.professionalStatus,
      p_organization: input.organizationName,
      p_recording_consent: input.recordingConsent,
      p_session_edition: input.sessionEdition,
      p_referral_source: referralSource,
      p_referral_source_other: referralSourceOther
    })

    if (rpcError) throw rpcError

    persistLocalRegistration({
      registrationId: registrationId || null,
      email: normalizedEmail,
      firstName: input.firstName,
      lastName: input.lastName,
      sessionEdition: input.sessionEdition,
      referralSource,
      referralSourceOther
    })

    return {
      status: 'standard',
      registrationId: registrationId || null,
      technicalError: null
    }
  } catch (err) {
    technicalError = err?.message || String(err)
    console.warn('[PACO] register_paco_quick failed, trying fallback:', technicalError)
  }

  // Étape 2 — RPC de secours
  const fallbackPayload = {
    email: normalizedEmail,
    firstName: input.firstName,
    lastName: input.lastName,
    organization: input.organizationName,
    sessionEdition: input.sessionEdition,
    countryId: input.countryId,
    demographic: {
      gender: input.gender,
      ageProfile: input.ageProfile,
      city: input.city,
      professionalStatus: input.professionalStatus,
      organization: input.organizationName,
      recordingConsent: input.recordingConsent
    },
    // Feature 006 : duplication referral dans le payload pour tracabilite
    // (la RPC duplique egalement cote serveur, cette entree est un filet
    // de securite si l'appel RPC echoue et qu'on tombe en local_only).
    referralSource,
    referralSourceOther,
    capturedAt: new Date().toISOString(),
    clientVersion: 'paco-fallback-v2'
  }

  try {
    const { data: fallbackRegistrationId, error: fallbackError } = await supabase.rpc(
      'register_paco_fallback',
      {
        p_email: normalizedEmail,
        p_session_edition: input.sessionEdition,
        p_fallback_payload: fallbackPayload,
        p_error_message: technicalError,
        p_referral_source: referralSource,
        p_referral_source_other: referralSourceOther
      }
    )

    if (fallbackError) throw fallbackError

    persistLocalRegistration({
      registrationId: fallbackRegistrationId || null,
      email: normalizedEmail,
      firstName: input.firstName,
      lastName: input.lastName,
      sessionEdition: input.sessionEdition,
      referralSource,
      referralSourceOther
    })

    return {
      status: 'fallback',
      registrationId: fallbackRegistrationId || null,
      technicalError
    }
  } catch (fallbackErr) {
    const fallbackMessage = fallbackErr?.message || String(fallbackErr)
    technicalError = `${technicalError || 'unknown'} / ${fallbackMessage}`
  }

  // Étape 3 — localStorage uniquement (aucune trace DB)
  console.error('[PACO] fallback double failure, persisting local_only:', technicalError)
  persistLocalRegistration({
    registrationId: null,
    email: normalizedEmail,
    firstName: input.firstName,
    lastName: input.lastName,
    sessionEdition: input.sessionEdition,
    referralSource,
    referralSourceOther
  })

  return {
    status: 'local_only',
    registrationId: null,
    technicalError
  }
}

/**
 * Marque une inscription de secours comme « rattrapée » par l'équipe admin
 * (envoi manuel du lien, correction des données, etc.).
 *
 * Le filtre `fallback_payload IS NOT NULL` empêche de marquer une inscription
 * standard comme rattrapée. Le filtre `recovered_at IS NULL` garantit
 * l'idempotence (un second appel retourne `not_found_or_already_recovered`).
 *
 * @param {string} registrationId UUID de la ligne activity_registrations
 * @returns {Promise<{ success: boolean, error: string | null }>}
 */
export async function markRegistrationRecovered(registrationId) {
  if (!registrationId) {
    return { success: false, error: 'invalid_registration_id' }
  }

  try {
    const { data, error: updateError } = await supabase
      .from('activity_registrations')
      .update({ recovered_at: new Date().toISOString() })
      .eq('id', registrationId)
      .not('fallback_payload', 'is', null)
      .is('recovered_at', null)
      .select('id')

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'not_found_or_already_recovered' }
    }

    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err?.message || String(err) }
  }
}

/**
 * Finalize a PACO registration after email verification.
 * Reads pending data from sessionStorage, registers for the webinar, inserts demographic data, then clears storage.
 * @param {string} userId
 * @returns {Promise<{ success: boolean, registrationId: string|null }>}
 */
export async function finalizePacoRegistration(userId) {
  const pending = getPendingRegistration(userId)
  if (!pending) {
    return { success: false, registrationId: null }
  }

  try {
    const { registerForPaco, insertDemographicData } = usePacoRegistration()

    const registrationId = await registerForPaco(userId)
    if (!registrationId) {
      return { success: false, registrationId: null }
    }

    if (pending.demographicData) {
      const demographicSaved = await insertDemographicData(registrationId, pending.demographicData)
      if (!demographicSaved) {
        // Demographics failed — don't clear pending data, let user fill the form manually
        return { success: false, registrationId }
      }
    }

    clearPendingRegistration()
    return { success: true, registrationId }
  } catch (err) {
    console.error('Error finalizing PACO registration:', err)
    return { success: false, registrationId: null }
  }
}

export function usePacoRegistration() {
  const loading = ref(false)
  const error = ref(null)
  const isRegistered = ref(false)

  /**
   * Check if an email corresponds to an existing user account.
   * Uses the RPC function check_paco_email (SECURITY DEFINER, accessible to anon).
   * @param {string} email
   * @returns {Promise<boolean>} true if the email exists
   */
  const checkEmailExists = async (email) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase.rpc('check_paco_email', {
        email_input: email.toLowerCase().trim()
      })

      if (rpcError) throw rpcError
      return !!data
    } catch (err) {
      console.error('Error checking email:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if a user is already registered for a specific PACO session.
   * @param {string} userId
   * @param {number} sessionEdition
   * @returns {Promise<boolean>} true if registered for the given session
   */
  const checkPacoRegistration = async (userId, sessionEdition) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('activity_registrations')
        .select('id')
        .eq('activity_id', PACO_ACTIVITY_ID)
        .eq('user_id', userId)
        .eq('session_edition', sessionEdition)
        .maybeSingle()

      if (queryError) throw queryError

      isRegistered.value = !!data
      return !!data
    } catch (err) {
      console.error('Error checking PACO registration:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Register a user for the PACO webinar activity.
   * @param {string} userId
   * @returns {Promise<string|null>} registration_id (UUID) on success, null on failure
   */
  const registerForPaco = async (userId) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('activity_registrations')
        .insert({
          activity_id: PACO_ACTIVITY_ID,
          user_id: userId,
          registration_type: 'user'
        })
        .select('id')
        .single()

      if (insertError) {
        // Unique constraint violation means already registered
        if (insertError.code === '23505') {
          isRegistered.value = true
          const { data: existing } = await supabase
            .from('activity_registrations')
            .select('id')
            .eq('activity_id', PACO_ACTIVITY_ID)
            .eq('user_id', userId)
            .single()
          return existing?.id || null
        }
        throw insertError
      }

      isRegistered.value = true
      return data?.id || null
    } catch (err) {
      console.error('Error registering for PACO:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Insert demographic data for a PACO registration.
   * @param {string} registrationId - UUID from activity_registrations
   * @param {Object} demographicData - { gender, ageProfile, city, countryId, professionalStatus, organization, recordingConsent }
   * @returns {Promise<boolean>} true if insert succeeded
   */
  const insertDemographicData = async (registrationId, demographicData) => {
    try {
      const { error: insertError } = await supabase
        .from('paco_demographic_data')
        .insert({
          registration_id: registrationId,
          gender: demographicData.gender,
          age_profile: demographicData.ageProfile,
          city: demographicData.city.trim(),
          country_id: demographicData.countryId,
          professional_status: demographicData.professionalStatus,
          organization: demographicData.organization?.trim() || null,
          recording_consent: demographicData.recordingConsent
        })

      if (insertError) {
        if (insertError.code === '23505') {
          console.warn('Demographic data already exists for this registration')
          return true
        }
        throw insertError
      }

      return true
    } catch (err) {
      console.error('Error inserting demographic data:', err)
      return false
    }
  }

  return {
    loading,
    error,
    isRegistered,
    checkEmailExists,
    checkPacoRegistration,
    registerForPaco,
    insertDemographicData
  }
}
