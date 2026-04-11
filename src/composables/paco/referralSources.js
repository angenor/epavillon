// Feature 006 — source unique des canaux d'acquisition PACO.
// Cette liste pilote :
//   - l'ordre des <option> dans le <select> d'inscription (PacoQuickRegister.vue)
//   - l'ordre des segments + entrées de légende du donut chart (PacoReferralSourceChart.vue)
//   - l'ordre des buckets dans l'agrégation côté client (usePacoStats.js)
//
// Les clés sont stables, non traduites, et DOIVENT rester identiques à la
// CHECK constraint DB `check_referral_source_allowed` et aux entrées i18n
// `paco.referralSource.options.<key>` (fr/en).

/** @type {readonly string[]} */
export const PACO_REFERRAL_SOURCES = Object.freeze([
  'ifdd_website',
  'ifdd_linkedin',
  'ifdd_facebook',
  'ifdd_x',
  'email_newsletter',
  'other'
])

/**
 * Clé display-only utilisée UNIQUEMENT pour le bucket "Non renseigné" du
 * donut admin. Elle ne doit JAMAIS apparaître dans un INSERT/UPDATE.
 */
export const PACO_REFERRAL_NOT_SPECIFIED = 'not_specified'

/**
 * Longueur maximale du champ libre "Précisez" quand la source = 'other'.
 * Doit rester synchronisé avec la CHECK constraint DB
 * `check_referral_source_other_guard` (char_length <= 120).
 */
export const MAX_REFERRAL_OTHER_LENGTH = 120

/**
 * Retourne la clé i18n correspondant à une source canonique ou au bucket
 * "Non renseigné".
 *
 * @param {string} source
 * @returns {string}
 */
export function referralSourceI18nKey(source) {
  if (source === PACO_REFERRAL_NOT_SPECIFIED) {
    return 'paco.referralSource.notSpecified'
  }
  return `paco.referralSource.options.${source}`
}

/**
 * Palette du donut chart. Les couleurs sont choisies pour rester
 * visuellement distinctes entre elles ET pour conserver un gris neutre
 * sur `not_specified`, conformément à FR-009.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const PACO_REFERRAL_COLORS = Object.freeze({
  ifdd_website: '#2563eb', // blue-600
  ifdd_linkedin: '#0a66c2', // LinkedIn brand
  ifdd_facebook: '#1877f2', // Facebook brand
  ifdd_x: '#0f172a', // slate-900
  email_newsletter: '#059669', // emerald-600
  other: '#d97706', // amber-600
  not_specified: '#9ca3af' // gray-400 (neutral)
})

/**
 * Libellés FR canoniques utilisés par l'export CSV (résolution statique,
 * sans dépendance à vue-i18n côté composable). Le CSV admin est FR-only
 * par convention existante (voir usePacoCsvExport.js).
 *
 * @type {Readonly<Record<string, string>>}
 */
const REFERRAL_LABELS_FR = Object.freeze({
  ifdd_website: "Site web de l'IFDD",
  ifdd_linkedin: "LinkedIn de l'IFDD",
  ifdd_facebook: "Facebook de l'IFDD",
  ifdd_x: "X de l'IFDD",
  email_newsletter: 'Email / Newsletter',
  other: 'Autre'
})

/**
 * Retourne le libellé FR d'un canal canonique pour l'export CSV.
 * Retourne une chaîne vide si la clé est null/inconnue (cas historique).
 *
 * @param {string|null|undefined} key
 * @returns {string}
 */
export function getReferralSourceLabelFr(key) {
  if (!key) return ''
  return REFERRAL_LABELS_FR[key] || ''
}
