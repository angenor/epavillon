import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * PACO Webinar — données de configuration multi-sessions.
 *
 * Chaque session contient les champs non traduisibles (dates, URLs, panélistes).
 * Les libellés (titres, descriptions, rôles) sont dans i18n via `i18nPrefix`.
 *
 * @typedef {Object} SessionData
 * @property {number} edition
 * @property {string} date              ISO YYYY-MM-DD
 * @property {string} startTime         HH:MM
 * @property {string} endTime           HH:MM
 * @property {string} timezone
 * @property {string} language
 * @property {boolean} completed        true si la session est terminée
 * @property {string} coverImage
 * @property {string} bannerUrl
 * @property {string|null} replayUrl
 * @property {string} i18nPrefix        ex: 'paco.session1'
 * @property {Array} panelists
 * @property {Array} partners
 */

const COMMON_PARTNERS = [
  { id: 'ifdd', name: 'IFDD', logoUrl: '/logos/logo_paco/download.png' },
  { id: 'giz', name: 'GIZ', logoUrl: '/logos/logo_paco/gizlogo-unternehmen-de-rgb-300.jpg' },
  { id: 'iki', name: 'IKI', logoUrl: '/logos/logo_paco/csm_IKI_logo_GB_rgb_94743c4a81.png' },
  { id: 'bmu', name: 'BMU', logoUrl: '/logos/logo_paco/BMU_2018_supported_Office_Farbe_fr300s.jpg' },
  { id: 'pic', name: 'PIC', logoUrl: '/logos/logo_paco/Logo_PIC.png' },
]

const SESSIONS_DATA = [
  {
    edition: 1,
    date: '2026-03-26',
    startTime: '14:00',
    endTime: '15:30',
    timezone: 'GMT',
    language: 'fr',
    completed: true,
    coverImage: '/images/banniere_paco.jpg',
    bannerUrl: '/images/banniere_paco.jpg',
    replayUrl: 'https://www.youtube.com/embed/482HTq49tlQ?autoplay=1&mute=1',
    i18nPrefix: 'paco.session1',
    panelists: [
      { id: 'martin-phipps', name: 'Cécile MARTIN-PHIPPS', photoUrl: null, organization: 'IFDD', email: null },
      { id: 'houdanon', name: 'Roël Dire HOUDANON', photoUrl: null, organization: 'GIZ', email: null },
      { id: 'vallier', name: 'Frédéric VALLIER', photoUrl: null, organization: 'AIMF', email: null },
      { id: 'lazare', name: 'Albin LAZARE', photoUrl: null, organization: 'AIMF', email: null },
      { id: 'ayi-nkamgna', name: 'Monique AYI NKAMGNA', photoUrl: null, organization: 'REMCESS', email: null },
      { id: 'betchem', name: 'Jean Paul BETCHEM', photoUrl: null, organization: 'REMCESS', email: null },
      { id: 'sall', name: 'Aissata SALL', photoUrl: null, organization: 'CSE', email: null },
    ],
    partners: COMMON_PARTNERS,
  },
  {
    edition: 2,
    date: '2026-04-30',
    startTime: '14:00',
    endTime: '15:30',
    timezone: 'GMT',
    language: 'fr',
    completed: false,
    coverImage: '/images/image_paco_session_2_v2.jpg',
    bannerUrl: '/images/image_paco_session_2_v2.jpg',
    replayUrl: null,
    i18nPrefix: 'paco.session2',
    panelists: [
      { id: 'kiri', name: 'Tounao KIRI', photoUrl: '/images/tounao_kiri.jpg', organization: 'IFDD', email: null },
      { id: 'baglhi', name: 'Abdallah BAGLHI', photoUrl: '/images/1607849368193.jpeg', organization: 'PACO Bénin', email: null },
      { id: 'ka', name: 'Sokhna Dié KA', photoUrl: '/images/Sokhna.jpeg', organization: 'Natural Justice', email: null },
      { id: 'elisa-mairet', name: 'Elisa MAIRET', photoUrl: '/images/1740072412756.jpeg', organization: 'SUCO', email: null },
      { id: 'keita', name: 'Bakary KEITA', photoUrl: '/images/Bakary.jpeg', organization: "Projet Sectoriel Eau et Assainissement (PSEA) du Ministère de l'Hydraulique et de l'assainissement", email: null },
    ],
    partners: COMMON_PARTNERS,
  },
]

/**
 * Retourne le statut d'une session: 'upcoming' | 'live' | 'ended'
 * @param {SessionData} session
 * @returns {'upcoming' | 'live' | 'ended'}
 */
function getSessionStatus(session) {
  if (!session) return 'ended'
  if (session.completed) return 'ended'
  const now = new Date()
  const start = new Date(`${session.date}T${session.startTime}:00Z`)
  const end = new Date(`${session.date}T${session.endTime}:00Z`)
  if (now < start) return 'upcoming'
  if (now <= end) return 'live'
  return 'ended'
}

const STATUS_COLORS = { upcoming: 'green', live: 'amber', ended: 'gray' }

export function usePacoWebinarData() {
  const { t } = useI18n()

  const sessions = computed(() => SESSIONS_DATA)

  /**
   * La session "active" par défaut: la session la plus récente non terminée.
   * Si toutes les sessions sont terminées, retourne la dernière.
   */
  const currentSession = computed(() => {
    const upcoming = SESSIONS_DATA.filter(s => getSessionStatus(s) !== 'ended')
    if (upcoming.length > 0) {
      // Plus proche dans le temps
      return upcoming[0]
    }
    return SESSIONS_DATA[SESSIONS_DATA.length - 1]
  })

  const getStatusLabel = (status) => t(`paco.tabs.status.${status}`)
  const getStatusColor = (status) => STATUS_COLORS[status] || 'gray'

  return {
    sessions,
    currentSession,
    getSessionStatus,
    getStatusLabel,
    getStatusColor,
  }
}
