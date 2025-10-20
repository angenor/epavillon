/**
 * Composable pour gérer le SEO (meta tags, structured data, etc.)
 */

import { onMounted, onUnmounted, watch } from 'vue'

/**
 * Met à jour les meta tags de la page
 * @param {Object} seoData - Données SEO
 * @param {string} seoData.title - Titre de la page
 * @param {string} seoData.description - Description de la page
 * @param {string} seoData.image - URL de l'image de partage
 * @param {string} seoData.url - URL canonique de la page
 * @param {string} seoData.type - Type de contenu (website, article, event, etc.)
 * @param {Object} seoData.structuredData - Données structurées JSON-LD
 * @param {string} seoData.locale - Locale de la page (fr, en, etc.)
 * @param {Object} seoData.twitter - Données spécifiques Twitter
 * @param {Object} seoData.og - Données spécifiques Open Graph
 */
export function useSEO(seoData = {}) {
  const metaTags = []
  let structuredDataScript = null

  /**
   * Nettoie le HTML pour les meta descriptions
   */
  const stripHtml = (html) => {
    if (!html) return ''
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  /**
   * Tronque un texte à une longueur donnée
   */
  const truncate = (text, length) => {
    if (!text) return ''
    const clean = stripHtml(text)
    if (clean.length <= length) return clean
    return clean.substring(0, length).trim() + '...'
  }

  /**
   * Crée ou met à jour un meta tag
   */
  const setMetaTag = (attributes) => {
    // Déterminer la clé pour identifier le meta tag
    const key = attributes.property || attributes.name

    // Vérifier si le tag existe déjà
    let element = document.querySelector(`meta[${attributes.property ? 'property' : 'name'}="${key}"]`)

    if (element) {
      // Mettre à jour le contenu
      element.setAttribute('content', attributes.content)
    } else {
      // Créer un nouveau tag
      element = document.createElement('meta')
      Object.entries(attributes).forEach(([attr, value]) => {
        element.setAttribute(attr, value)
      })
      document.head.appendChild(element)
      metaTags.push(element)
    }

    return element
  }

  /**
   * Met à jour le titre de la page
   */
  const setTitle = (title) => {
    if (title) {
      document.title = title
    }
  }

  /**
   * Met à jour le lien canonique
   */
  const setCanonical = (url) => {
    if (!url) return

    let link = document.querySelector('link[rel="canonical"]')

    if (link) {
      link.setAttribute('href', url)
    } else {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      link.setAttribute('href', url)
      document.head.appendChild(link)
      metaTags.push(link)
    }
  }

  /**
   * Ajoute les données structurées JSON-LD
   */
  const setStructuredData = (data) => {
    if (!data) return

    // Supprimer l'ancien script s'il existe
    if (structuredDataScript) {
      structuredDataScript.remove()
    }

    // Créer le nouveau script
    structuredDataScript = document.createElement('script')
    structuredDataScript.setAttribute('type', 'application/ld+json')
    structuredDataScript.textContent = JSON.stringify(data)
    document.head.appendChild(structuredDataScript)
  }

  /**
   * Met à jour tous les meta tags SEO
   */
  const updateSEO = (data = {}) => {
    const {
      title = '',
      description = '',
      image = '',
      url = '',
      type = 'website',
      locale = 'fr_FR',
      structuredData = null,
      twitter = {},
      og = {}
    } = data

    // Titre de la page
    const fullTitle = title ? `${title} | e-Pavillon Climatique` : 'e-Pavillon Climatique - IFDD'
    setTitle(fullTitle)

    // Description (max 160 caractères pour Google)
    const metaDescription = truncate(description, 160)

    // Meta tags de base
    if (description) {
      setMetaTag({ name: 'description', content: metaDescription })
    }

    // URL canonique
    if (url) {
      setCanonical(url)
    }

    // Open Graph tags
    setMetaTag({ property: 'og:title', content: title || fullTitle })
    if (description) {
      setMetaTag({ property: 'og:description', content: metaDescription })
    }
    setMetaTag({ property: 'og:type', content: og.type || type })
    if (url) {
      setMetaTag({ property: 'og:url', content: url })
    }
    if (image) {
      setMetaTag({ property: 'og:image', content: image })
      setMetaTag({ property: 'og:image:secure_url', content: image })
      setMetaTag({ property: 'og:image:alt', content: title || 'e-Pavillon Climatique' })
    }
    setMetaTag({ property: 'og:locale', content: locale })
    setMetaTag({ property: 'og:site_name', content: 'e-Pavillon Climatique - IFDD' })

    // Twitter Card tags
    setMetaTag({ name: 'twitter:card', content: twitter.card || 'summary_large_image' })
    setMetaTag({ name: 'twitter:title', content: title || fullTitle })
    if (description) {
      setMetaTag({ name: 'twitter:description', content: metaDescription })
    }
    if (image) {
      setMetaTag({ name: 'twitter:image', content: image })
      setMetaTag({ name: 'twitter:image:alt', content: title || 'e-Pavillon Climatique' })
    }

    // Meta tags additionnels pour le SEO
    setMetaTag({ name: 'robots', content: 'index, follow' })
    setMetaTag({ name: 'googlebot', content: 'index, follow' })

    // Données structurées JSON-LD
    if (structuredData) {
      setStructuredData(structuredData)
    }
  }

  /**
   * Nettoie les meta tags créés
   */
  const cleanup = () => {
    metaTags.forEach(tag => {
      if (tag && tag.parentNode) {
        tag.parentNode.removeChild(tag)
      }
    })
    metaTags.length = 0

    if (structuredDataScript && structuredDataScript.parentNode) {
      structuredDataScript.parentNode.removeChild(structuredDataScript)
      structuredDataScript = null
    }
  }

  // Appliquer les données SEO au montage
  onMounted(() => {
    if (Object.keys(seoData).length > 0) {
      updateSEO(seoData)
    }
  })

  // Nettoyer au démontage
  onUnmounted(() => {
    cleanup()
  })

  // Observer les changements réactifs des données SEO
  if (seoData && typeof seoData === 'object') {
    watch(() => seoData, (newData) => {
      if (newData && Object.keys(newData).length > 0) {
        updateSEO(newData)
      }
    }, { deep: true, immediate: false })
  }

  return {
    updateSEO,
    setTitle,
    setMetaTag,
    setCanonical,
    setStructuredData,
    cleanup,
    stripHtml,
    truncate
  }
}

/**
 * Génère les données structurées JSON-LD pour un événement
 * @param {Object} event - Données de l'événement
 * @param {string} event.title - Titre de l'événement
 * @param {string} event.description - Description
 * @param {string} event.start_date - Date de début
 * @param {string} event.end_date - Date de fin
 * @param {string} event.city - Ville
 * @param {string} event.address - Adresse
 * @param {string} event.participation_mode - Mode de participation
 * @param {string} event.banner - Image de l'événement
 * @param {string} event.url - URL de l'événement
 * @param {Object} country - Pays de l'événement
 * @returns {Object} - Données structurées JSON-LD
 */
export function generateEventStructuredData(event, country = null) {
  const stripHtml = (html) => {
    if (!html) return ''
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  // Déterminer la date de début et de fin
  const startDate = event.online_start_datetime || event.in_person_start_date || event.start_date
  const endDate = event.online_end_datetime || event.in_person_end_date || event.end_date

  // Base du structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: stripHtml(event.description),
    startDate: startDate,
    endDate: endDate,
    eventStatus: event.event_status === 'cancelled'
      ? 'https://schema.org/EventCancelled'
      : event.event_status === 'ongoing' || event.event_status === 'upcoming'
      ? 'https://schema.org/EventScheduled'
      : 'https://schema.org/EventPostponed',
    eventAttendanceMode: event.participation_mode === 'online'
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : event.participation_mode === 'in_person'
      ? 'https://schema.org/OfflineEventAttendanceMode'
      : 'https://schema.org/MixedEventAttendanceMode',
    image: event.banner_high_quality_16_9_url || event.banner || '',
    organizer: {
      '@type': 'Organization',
      name: 'IFDD - Institut de la Francophonie pour le Développement Durable',
      url: 'https://www.ifdd.francophonie.org'
    }
  }

  // Ajouter l'URL si disponible
  if (event.url) {
    structuredData.url = event.url
  }

  // Ajouter le lieu si événement en présentiel ou hybride
  if (event.participation_mode !== 'online' && event.city) {
    structuredData.location = {
      '@type': 'Place',
      name: event.city,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressCountry: country?.name_fr || ''
      }
    }

    if (event.address) {
      structuredData.location.address.streetAddress = event.address
    }
  } else if (event.participation_mode === 'online') {
    // Pour les événements en ligne
    structuredData.location = {
      '@type': 'VirtualLocation',
      url: event.url || window.location.href
    }
  }

  return structuredData
}
