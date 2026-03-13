import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Webinar #3 configuration data
 * Non-translatable fields (dates, URLs, emails, names) are here.
 * Translatable fields (titles, descriptions, roles) are in i18n under paco.presentation.*
 */
const WEBINAR_DATA = {
  edition: 3,
  date: '2026-03-26',
  startTime: '14:00',
  endTime: '15:30',
  timezone: 'GMT',
  language: 'fr',
  bannerUrl: '/images/banniere_paco.jpg',

  panelists: [
    {
      id: 'martin-phipps',
      name: 'Cécile MARTIN-PHIPPS',
      photoUrl: null,
      organization: 'IFDD',
      email: null,
    },
    {
      id: 'houdanon',
      name: 'Roël Dire HOUDANON',
      photoUrl: null,
      organization: 'GIZ',
      email: null,
    },
    {
      id: 'vallier',
      name: 'Frédéric VALLIER',
      photoUrl: null,
      organization: 'AIMF',
      email: null,
    },
    {
      id: 'lazare',
      name: 'Albin LAZARE',
      photoUrl: null,
      organization: 'AIMF',
      email: null,
    },
    {
      id: 'ayi-nkamgna',
      name: 'Monique AYI NKAMGNA',
      photoUrl: null,
      organization: 'REMCESS',
      email: null,
    },
    {
      id: 'betchem',
      name: 'Jean Paul BETCHEM',
      photoUrl: null,
      organization: 'REMCESS',
      email: null,
    },
    {
      id: 'sall',
      name: 'Aissata SALL',
      photoUrl: null,
      organization: 'CSE',
      email: null,
    },
  ],

  partners: [
    { id: 'ifdd', name: 'IFDD', logoUrl: '/logos/logo_paco/download.png' },
    { id: 'giz', name: 'GIZ', logoUrl: '/logos/logo_paco/gizlogo-unternehmen-de-rgb-300.jpg' },
    { id: 'iki', name: 'IKI', logoUrl: '/logos/logo_paco/csm_IKI_logo_GB_rgb_94743c4a81.png' },
    { id: 'bmu', name: 'BMU', logoUrl: '/logos/logo_paco/BMU_2018_supported_Office_Farbe_fr300s.jpg' },
    { id: 'pic', name: 'PIC', logoUrl: '/logos/logo_paco/Logo_PIC.png' },
  ],
}

export function usePacoWebinarData() {
  const { t } = useI18n()

  const status = computed(() => {
    const now = new Date()
    const start = new Date(`${WEBINAR_DATA.date}T${WEBINAR_DATA.startTime}:00Z`)
    const end = new Date(`${WEBINAR_DATA.date}T${WEBINAR_DATA.endTime}:00Z`)

    if (now < start) return 'upcoming'
    if (now <= end) return 'live'
    return 'ended'
  })

  const statusLabel = computed(() => t(`paco.presentation.status.${status.value}`))

  const statusColor = computed(() => {
    const colors = { upcoming: 'green', live: 'amber', ended: 'gray' }
    return colors[status.value]
  })

  return {
    webinar: WEBINAR_DATA,
    status,
    statusLabel,
    statusColor,
  }
}
