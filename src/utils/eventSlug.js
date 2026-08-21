/**
 * Slugs d'événements pour des URLs lisibles : /events/CdP31
 *
 * Les anciens liens en UUID (/events/<uuid>) restent valides : la page de
 * détail accepte les deux formes.
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Le paramètre d'URL est-il un identifiant technique ?
 */
export const isUuid = (value) => UUID_PATTERN.test(String(value || '').trim())

/**
 * Retire accents, espaces et ponctuation : « CdP 31 » -> « CdP31 »
 * La décomposition NFD isole les diacritiques, que le filtre alphanumérique
 * élimine ensuite avec les autres séparateurs.
 */
const stripSeparators = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[^a-zA-Z0-9]/g, '')

/**
 * Slug affiché dans l'URL, construit depuis l'acronyme (casse conservée).
 * Retombe sur l'identifiant technique si l'événement n'a pas d'acronyme.
 */
export const buildEventSlug = (event) => stripSeparators(event?.acronym) || event?.id || ''

/**
 * Forme canonique utilisée pour comparer un paramètre d'URL à un acronyme,
 * insensible à la casse, aux espaces et à la ponctuation.
 */
export const normalizeEventSlug = (value) => stripSeparators(value).toLowerCase()

/**
 * Chemin de la page de détail d'un événement.
 */
export const eventDetailPath = (event) => `/events/${buildEventSlug(event)}`
