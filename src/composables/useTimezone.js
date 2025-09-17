import { ref } from 'vue'

// Liste des fuseaux horaires principaux avec leurs noms en français et anglais
const timezones = [
  // Afrique
  { value: 'Africa/Abidjan', label: { fr: 'Abidjan (GMT+0)', en: 'Abidjan (GMT+0)' } },
  { value: 'Africa/Accra', label: { fr: 'Accra (GMT+0)', en: 'Accra (GMT+0)' } },
  { value: 'Africa/Addis_Ababa', label: { fr: 'Addis-Abeba (GMT+3)', en: 'Addis Ababa (GMT+3)' } },
  { value: 'Africa/Algiers', label: { fr: 'Alger (GMT+1)', en: 'Algiers (GMT+1)' } },
  { value: 'Africa/Bamako', label: { fr: 'Bamako (GMT+0)', en: 'Bamako (GMT+0)' } },
  { value: 'Africa/Bangui', label: { fr: 'Bangui (GMT+1)', en: 'Bangui (GMT+1)' } },
  { value: 'Africa/Brazzaville', label: { fr: 'Brazzaville (GMT+1)', en: 'Brazzaville (GMT+1)' } },
  { value: 'Africa/Cairo', label: { fr: 'Le Caire (GMT+2)', en: 'Cairo (GMT+2)' } },
  { value: 'Africa/Casablanca', label: { fr: 'Casablanca (GMT+0)', en: 'Casablanca (GMT+0)' } },
  { value: 'Africa/Dakar', label: { fr: 'Dakar (GMT+0)', en: 'Dakar (GMT+0)' } },
  { value: 'Africa/Douala', label: { fr: 'Douala (GMT+1)', en: 'Douala (GMT+1)' } },
  { value: 'Africa/Johannesburg', label: { fr: 'Johannesburg (GMT+2)', en: 'Johannesburg (GMT+2)' } },
  { value: 'Africa/Kinshasa', label: { fr: 'Kinshasa (GMT+1)', en: 'Kinshasa (GMT+1)' } },
  { value: 'Africa/Lagos', label: { fr: 'Lagos (GMT+1)', en: 'Lagos (GMT+1)' } },
  { value: 'Africa/Libreville', label: { fr: 'Libreville (GMT+1)', en: 'Libreville (GMT+1)' } },
  { value: 'Africa/Lome', label: { fr: 'Lomé (GMT+0)', en: 'Lomé (GMT+0)' } },
  { value: 'Africa/Nairobi', label: { fr: 'Nairobi (GMT+3)', en: 'Nairobi (GMT+3)' } },
  { value: 'Africa/Niamey', label: { fr: 'Niamey (GMT+1)', en: 'Niamey (GMT+1)' } },
  { value: 'Africa/Nouakchott', label: { fr: 'Nouakchott (GMT+0)', en: 'Nouakchott (GMT+0)' } },
  { value: 'Africa/Ouagadougou', label: { fr: 'Ouagadougou (GMT+0)', en: 'Ouagadougou (GMT+0)' } },
  { value: 'Africa/Tunis', label: { fr: 'Tunis (GMT+1)', en: 'Tunis (GMT+1)' } },

  // Amérique
  { value: 'America/Montreal', label: { fr: 'Montréal (GMT-5)', en: 'Montreal (GMT-5)' } },
  { value: 'America/New_York', label: { fr: 'New York (GMT-5)', en: 'New York (GMT-5)' } },
  { value: 'America/Toronto', label: { fr: 'Toronto (GMT-5)', en: 'Toronto (GMT-5)' } },
  { value: 'America/Port-au-Prince', label: { fr: 'Port-au-Prince (GMT-5)', en: 'Port-au-Prince (GMT-5)' } },
  { value: 'America/Guadeloupe', label: { fr: 'Guadeloupe (GMT-4)', en: 'Guadeloupe (GMT-4)' } },
  { value: 'America/Martinique', label: { fr: 'Martinique (GMT-4)', en: 'Martinique (GMT-4)' } },
  { value: 'America/Mexico_City', label: { fr: 'Mexico (GMT-6)', en: 'Mexico City (GMT-6)' } },
  { value: 'America/Chicago', label: { fr: 'Chicago (GMT-6)', en: 'Chicago (GMT-6)' } },
  { value: 'America/Los_Angeles', label: { fr: 'Los Angeles (GMT-8)', en: 'Los Angeles (GMT-8)' } },
  { value: 'America/Vancouver', label: { fr: 'Vancouver (GMT-8)', en: 'Vancouver (GMT-8)' } },

  // Brésil
  { value: 'America/Belem', label: { fr: 'Belém (GMT-3)', en: 'Belém (GMT-3)' } },
  { value: 'America/Fortaleza', label: { fr: 'Fortaleza (GMT-3)', en: 'Fortaleza (GMT-3)' } },
  { value: 'America/Recife', label: { fr: 'Recife (GMT-3)', en: 'Recife (GMT-3)' } },
  { value: 'America/Salvador', label: { fr: 'Salvador (GMT-3)', en: 'Salvador (GMT-3)' } },
  { value: 'America/Sao_Paulo', label: { fr: 'São Paulo (GMT-3)', en: 'São Paulo (GMT-3)' } },
  { value: 'America/Rio_de_Janeiro', label: { fr: 'Rio de Janeiro (GMT-3)', en: 'Rio de Janeiro (GMT-3)' } },
  { value: 'America/Brasilia', label: { fr: 'Brasília (GMT-3)', en: 'Brasília (GMT-3)' } },
  { value: 'America/Manaus', label: { fr: 'Manaus (GMT-4)', en: 'Manaus (GMT-4)' } },
  { value: 'America/Porto_Velho', label: { fr: 'Porto Velho (GMT-4)', en: 'Porto Velho (GMT-4)' } },
  { value: 'America/Rio_Branco', label: { fr: 'Rio Branco (GMT-5)', en: 'Rio Branco (GMT-5)' } },

  // Autres Amérique du Sud
  { value: 'America/Buenos_Aires', label: { fr: 'Buenos Aires (GMT-3)', en: 'Buenos Aires (GMT-3)' } },
  { value: 'America/Lima', label: { fr: 'Lima (GMT-5)', en: 'Lima (GMT-5)' } },
  { value: 'America/Bogota', label: { fr: 'Bogotá (GMT-5)', en: 'Bogotá (GMT-5)' } },
  { value: 'America/Caracas', label: { fr: 'Caracas (GMT-4)', en: 'Caracas (GMT-4)' } },
  { value: 'America/Santiago', label: { fr: 'Santiago (GMT-3)', en: 'Santiago (GMT-3)' } },
  { value: 'America/Montevideo', label: { fr: 'Montevideo (GMT-3)', en: 'Montevideo (GMT-3)' } },
  { value: 'America/Asuncion', label: { fr: 'Asunción (GMT-3)', en: 'Asunción (GMT-3)' } },
  { value: 'America/La_Paz', label: { fr: 'La Paz (GMT-4)', en: 'La Paz (GMT-4)' } },
  { value: 'America/Quito', label: { fr: 'Quito (GMT-5)', en: 'Quito (GMT-5)' } },
  { value: 'America/Guyana', label: { fr: 'Georgetown (GMT-4)', en: 'Georgetown (GMT-4)' } },
  { value: 'America/Paramaribo', label: { fr: 'Paramaribo (GMT-3)', en: 'Paramaribo (GMT-3)' } },
  { value: 'America/Cayenne', label: { fr: 'Cayenne (GMT-3)', en: 'Cayenne (GMT-3)' } },

  // Europe
  { value: 'Europe/Paris', label: { fr: 'Paris (GMT+1)', en: 'Paris (GMT+1)' } },
  { value: 'Europe/Brussels', label: { fr: 'Bruxelles (GMT+1)', en: 'Brussels (GMT+1)' } },
  { value: 'Europe/Geneva', label: { fr: 'Genève (GMT+1)', en: 'Geneva (GMT+1)' } },
  { value: 'Europe/Luxembourg', label: { fr: 'Luxembourg (GMT+1)', en: 'Luxembourg (GMT+1)' } },
  { value: 'Europe/Monaco', label: { fr: 'Monaco (GMT+1)', en: 'Monaco (GMT+1)' } },
  { value: 'Europe/London', label: { fr: 'Londres (GMT+0)', en: 'London (GMT+0)' } },
  { value: 'Europe/Berlin', label: { fr: 'Berlin (GMT+1)', en: 'Berlin (GMT+1)' } },
  { value: 'Europe/Rome', label: { fr: 'Rome (GMT+1)', en: 'Rome (GMT+1)' } },
  { value: 'Europe/Madrid', label: { fr: 'Madrid (GMT+1)', en: 'Madrid (GMT+1)' } },
  { value: 'Europe/Athens', label: { fr: 'Athènes (GMT+2)', en: 'Athens (GMT+2)' } },
  { value: 'Europe/Bucharest', label: { fr: 'Bucarest (GMT+2)', en: 'Bucharest (GMT+2)' } },
  { value: 'Europe/Moscow', label: { fr: 'Moscou (GMT+3)', en: 'Moscow (GMT+3)' } },

  // Asie & Océanie
  { value: 'Asia/Dubai', label: { fr: 'Dubaï (GMT+4)', en: 'Dubai (GMT+4)' } },
  { value: 'Asia/Bangkok', label: { fr: 'Bangkok (GMT+7)', en: 'Bangkok (GMT+7)' } },
  { value: 'Asia/Singapore', label: { fr: 'Singapour (GMT+8)', en: 'Singapore (GMT+8)' } },
  { value: 'Asia/Hong_Kong', label: { fr: 'Hong Kong (GMT+8)', en: 'Hong Kong (GMT+8)' } },
  { value: 'Asia/Shanghai', label: { fr: 'Shanghai (GMT+8)', en: 'Shanghai (GMT+8)' } },
  { value: 'Asia/Tokyo', label: { fr: 'Tokyo (GMT+9)', en: 'Tokyo (GMT+9)' } },
  { value: 'Asia/Seoul', label: { fr: 'Séoul (GMT+9)', en: 'Seoul (GMT+9)' } },
  { value: 'Australia/Sydney', label: { fr: 'Sydney (GMT+10)', en: 'Sydney (GMT+10)' } },
  { value: 'Pacific/Auckland', label: { fr: 'Auckland (GMT+12)', en: 'Auckland (GMT+12)' } },
  { value: 'Pacific/Noumea', label: { fr: 'Nouméa (GMT+11)', en: 'Noumea (GMT+11)' } },
  { value: 'Pacific/Tahiti', label: { fr: 'Tahiti (GMT-10)', en: 'Tahiti (GMT-10)' } },

  // Océan Indien
  { value: 'Indian/Antananarivo', label: { fr: 'Antananarivo (GMT+3)', en: 'Antananarivo (GMT+3)' } },
  { value: 'Indian/Mauritius', label: { fr: 'Maurice (GMT+4)', en: 'Mauritius (GMT+4)' } },
  { value: 'Indian/Reunion', label: { fr: 'La Réunion (GMT+4)', en: 'Reunion (GMT+4)' } },

  // UTC
  { value: 'UTC', label: { fr: 'UTC (Temps universel coordonné)', en: 'UTC (Coordinated Universal Time)' } }
]

export function useTimezone() {
  const selectedTimezone = ref('')
  const userTimezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Obtenir la liste des fuseaux horaires triés par région
  const getTimezones = (locale = 'fr') => {
    return timezones.map(tz => ({
      value: tz.value,
      label: tz.label[locale] || tz.label.fr
    }))
  }

  // Obtenir les fuseaux horaires groupés par continent
  const getGroupedTimezones = (locale = 'fr') => {
    const groups = {
      'Africa': [],
      'America': [],
      'Europe': [],
      'Asia': [],
      'Australia': [],
      'Pacific': [],
      'Indian': [],
      'UTC': []
    }

    timezones.forEach(tz => {
      const continent = tz.value.split('/')[0]
      if (groups[continent]) {
        groups[continent].push({
          value: tz.value,
          label: tz.label[locale] || tz.label.fr
        })
      }
    })

    return groups
  }

  // Détecter automatiquement le fuseau horaire de l'utilisateur
  const detectUserTimezone = () => {
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    userTimezone.value = userTz

    // Vérifier si le fuseau horaire détecté est dans notre liste
    const found = timezones.find(tz => tz.value === userTz)
    if (found) {
      selectedTimezone.value = userTz
    } else {
      // Si non trouvé, utiliser UTC par défaut
      selectedTimezone.value = 'UTC'
    }

    return userTz
  }

  // Formater une date selon un fuseau horaire spécifique
  const formatDateTimeWithTimezone = (dateTime, timezone, locale = 'fr-FR') => {
    if (!dateTime) return ''

    const date = new Date(dateTime)
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
      timeZoneName: 'short'
    }

    return new Intl.DateTimeFormat(locale, options).format(date)
  }

  // Convertir une date locale vers UTC en tenant compte du fuseau horaire
  const convertToUTC = (localDateTime, timezone) => {
    if (!localDateTime || !timezone) return null

    // Créer un objet Date avec la date/heure locale
    const date = new Date(localDateTime)

    // Obtenir l'offset du fuseau horaire spécifié
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    return date.toISOString()
  }

  // Convertir une date UTC vers le fuseau horaire local
  const convertFromUTC = (utcDateTime, timezone) => {
    if (!utcDateTime || !timezone) return null

    const date = new Date(utcDateTime)

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const parts = formatter.formatToParts(date)
    const values = {}

    parts.forEach(part => {
      if (part.type !== 'literal') {
        values[part.type] = part.value
      }
    })

    // Reconstruire la chaîne datetime-local
    return `${values.year}-${values.month.padStart(2, '0')}-${values.day.padStart(2, '0')}T${values.hour.padStart(2, '0')}:${values.minute.padStart(2, '0')}`
  }

  // Obtenir l'offset GMT d'un fuseau horaire
  const getTimezoneOffset = (timezone) => {
    const date = new Date()
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
    const offset = (tzDate - utcDate) / (1000 * 60 * 60)

    return offset >= 0 ? `GMT+${offset}` : `GMT${offset}`
  }

  // Obtenir le label d'un fuseau horaire
  const getTimezoneLabel = (timezone, locale = 'fr') => {
    const tz = timezones.find(t => t.value === timezone)
    return tz ? tz.label[locale] || tz.label.fr : timezone
  }

  return {
    timezones,
    selectedTimezone,
    userTimezone,
    getTimezones,
    getGroupedTimezones,
    detectUserTimezone,
    formatDateTimeWithTimezone,
    convertToUTC,
    convertFromUTC,
    getTimezoneOffset,
    getTimezoneLabel
  }
}
