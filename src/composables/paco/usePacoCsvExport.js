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
  const exportToCsv = (registrants, filename = 'paco-inscrits') => {
    const headers = [
      'Session', 'Prénom', 'Nom', 'Email', 'Genre', "Profil d'âge",
      'Ville', 'Pays', 'Statut professionnel', 'Organisation', "Date d'inscription"
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
      escapeCsv(r.registrationDate ? new Date(r.registrationDate).toLocaleDateString('fr-FR') : '')
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
