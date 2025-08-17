/**
 * Fonction de debounce pour limiter l'exécution d'une fonction
 */
export function debounce(func, wait, immediate) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * Formatte une date en format local
 */
export function formatDate(date, locale = 'fr-FR', options = {}) {
  if (!date) return ''
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  return new Date(date).toLocaleDateString(locale, { ...defaultOptions, ...options })
}

/**
 * Formatte un nombre
 */
export function formatNumber(number, locale = 'fr-FR') {
  if (typeof number !== 'number') return '0'
  return new Intl.NumberFormat(locale).format(number)
}

/**
 * Génère une chaîne aléatoire
 */
export function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Vérifie si une URL est valide
 */
export function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Tronque un texte à une longueur donnée
 */
export function truncateText(text, length = 100, suffix = '...') {
  if (!text || text.length <= length) return text
  return text.substring(0, length).trim() + suffix
}

/**
 * Nettoie et normalise une chaîne de caractères
 */
export function normalizeString(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]/g, '') // Supprime les caractères spéciaux
}

/**
 * Convertit une taille de fichier en format lisible
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Vérifie si un objet est vide
 */
export function isEmpty(obj) {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * Clone profond d'un objet
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * Génère une couleur aléatoire en hexadécimal
 */
export function generateRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

/**
 * Valide une adresse email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Capitalise la première lettre d'une chaîne
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convertit un slug en titre lisible
 */
export function slugToTitle(slug) {
  if (!slug) return ''
  return slug
    .split('-')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Convertit un titre en slug
 */
export function titleToSlug(title) {
  if (!title) return ''
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}