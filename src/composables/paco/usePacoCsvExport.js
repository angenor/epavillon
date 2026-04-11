import { getReferralSourceLabelFr } from '@/composables/paco/referralSources'

/**
 * Composable for exporting PACO registrant data to CSV.
 * Generates a CSV with BOM for Excel compatibility.
 */
export function usePacoCsvExport() {
  const GENDER_MAP = { male: 'Homme', female: 'Femme' }
  const AGE_MAP = { over_35: 'Plus de 35 ans', under_35: 'Moins de 35 ans' }
  const STATUS_MAP = {
    employed: 'Salarié',
    student: 'Étudiant',
    unemployed: 'Sans emploi',
    entrepreneur: 'Entrepreneur'
  }

  const escapeCsv = (value) => {
    if (value == null) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  /**
   * Export registrants array to CSV and trigger download.
   * @param {Array} registrants - flat registrant objects from usePacoStats
   * @param {string} filename - desired filename (without extension)
   */
  /**
   * Determine the CSV type label for a registrant based on its fallback state.
   * - 'fallback_pending' : ligne de secours non rattrapée
   * - 'fallback_recovered' : ligne de secours déjà rattrapée
   * - 'standard' : inscription standard (chemin nominal)
   */
  const getTypeLabel = (r) => {
    if (!r.isFallback) return 'Standard'
    return r.recoveredAt ? 'Secours rattrapé' : 'Secours en attente'
  }

  const exportToCsv = (registrants, filename = 'paco-inscrits') => {
    // Feature 006 : deux nouvelles colonnes inserees entre "Organisation"
    // et "Date d'inscription" pour garder la chronologie coherente.
    const headers = [
      'Session', 'Prénom', 'Nom', 'Email', 'Genre', "Profil d'âge",
      'Ville', 'Pays', 'Statut professionnel', 'Organisation',
      "Canal d'acquisition", 'Canal — précision',
      "Date d'inscription",
      'Type', 'Erreur technique', 'Rattrapé le', 'Payload JSON (secours)'
    ]

    const rows = registrants.map(r => [
      escapeCsv(r.sessionEdition != null ? `Session ${r.sessionEdition}` : ''),
      escapeCsv(r.firstName),
      escapeCsv(r.lastName),
      escapeCsv(r.email),
      escapeCsv(GENDER_MAP[r.gender] || ''),
      escapeCsv(AGE_MAP[r.ageProfile] || ''),
      escapeCsv(r.city),
      escapeCsv(r.countryFr),
      escapeCsv(STATUS_MAP[r.professionalStatus] || ''),
      escapeCsv(r.organization),
      // Feature 006 : libelle FR derive de la cle canonique ; chaine vide
      // si NULL (lignes historiques anterieures a la feature 006).
      escapeCsv(getReferralSourceLabelFr(r.referralSource)),
      escapeCsv(r.referralSourceOther || ''),
      escapeCsv(r.registrationDate ? new Date(r.registrationDate).toLocaleDateString('fr-FR') : ''),
      escapeCsv(getTypeLabel(r)),
      escapeCsv(r.fallbackError || ''),
      escapeCsv(r.recoveredAt ? new Date(r.recoveredAt).toLocaleDateString('fr-FR') : ''),
      escapeCsv(r.fallbackPayload ? JSON.stringify(r.fallbackPayload) : '')
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return { exportToCsv }
}
