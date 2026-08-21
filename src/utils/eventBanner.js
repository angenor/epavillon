/**
 * Résolution de la bannière d'un événement.
 *
 * Les bannières vivent dans six colonnes (trois ratios × deux qualités) et un
 * événement n'en renseigne généralement qu'une. Ces helpers cherchent d'abord
 * le ratio demandé, puis se rabattent sur les autres plutôt que de ne rien
 * afficher.
 */

import { DEFAULT_SHARE_IMAGE } from '@/utils/seo'

const BANNER_FIELDS = {
  '16_9': [
    'banner_low_quality_16_9_url',
    'banner_high_quality_16_9_url',
    'banner_high_quality_32_9_url',
    'banner_low_quality_32_9_url'
  ],
  '32_9': [
    'banner_high_quality_32_9_url',
    'banner_low_quality_32_9_url',
    'banner_high_quality_16_9_url',
    'banner_low_quality_16_9_url'
  ],
  '1_1': [
    'banner_high_quality_1_1_url',
    'banner_low_quality_1_1_url',
    'banner_high_quality_16_9_url',
    'banner_low_quality_16_9_url'
  ]
}

/**
 * Première bannière renseignée pour le ratio demandé, sinon null.
 */
export const getEventBanner = (event, ratio = '16_9') => {
  if (!event) return null

  const fields = BANNER_FIELDS[ratio] || BANNER_FIELDS['16_9']
  const found = fields.map(field => event[field]).find(Boolean)

  return found || event.banner || null
}

/**
 * Idem, avec repli sur une image par défaut.
 */
export const getEventBannerOrDefault = (event, ratio = '16_9', fallback = DEFAULT_SHARE_IMAGE) =>
  getEventBanner(event, ratio) || fallback
