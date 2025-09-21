/**
 * Utilitaires pour la génération d'avatars par défaut
 */

/**
 * Génère une couleur de fond basée sur le nom de l'utilisateur
 * @param {string} name - Le nom complet de l'utilisateur
 * @returns {object} - Objet contenant la couleur de fond et la couleur du texte
 */
export function generateAvatarColor(name) {
  // Palette de couleurs harmonieuses pour les avatars
  const colors = [
    { bg: '#EF4444', text: '#FFFFFF' }, // Rouge
    { bg: '#F97316', text: '#FFFFFF' }, // Orange
    { bg: '#EAB308', text: '#FFFFFF' }, // Jaune
    { bg: '#22C55E', text: '#FFFFFF' }, // Vert
    { bg: '#06B6D4', text: '#FFFFFF' }, // Cyan
    { bg: '#3B82F6', text: '#FFFFFF' }, // Bleu
    { bg: '#8B5CF6', text: '#FFFFFF' }, // Violet
    { bg: '#EC4899', text: '#FFFFFF' }, // Rose
    { bg: '#F59E0B', text: '#FFFFFF' }, // Ambre
    { bg: '#10B981', text: '#FFFFFF' }, // Emeraude
    { bg: '#6366F1', text: '#FFFFFF' }, // Indigo
    { bg: '#84CC16', text: '#FFFFFF' }, // Lime
    { bg: '#06B6D4', text: '#FFFFFF' }, // Cyan
    { bg: '#8B5CF6', text: '#FFFFFF' }, // Violet
    { bg: '#F43F5E', text: '#FFFFFF' }, // Rose
  ]

  // Générer un hash simple basé sur le nom
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convertir en 32 bits
  }

  // Utiliser le hash pour sélectionner une couleur
  const colorIndex = Math.abs(hash) % colors.length
  return colors[colorIndex]
}

/**
 * Génère les initiales à partir du nom complet
 * @param {string} firstName - Prénom
 * @param {string} lastName - Nom de famille
 * @returns {string} - Les initiales (max 2 caractères)
 */
export function generateInitials(firstName, lastName) {
  const first = firstName?.trim()?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.trim()?.charAt(0)?.toUpperCase() || ''

  if (first && last) {
    return first + last
  } else if (first) {
    return first
  } else if (last) {
    return last
  } else {
    return '?'
  }
}

/**
 * Génère un style de dégradé basé sur le nom
 * @param {string} name - Le nom complet de l'utilisateur
 * @returns {string} - Style CSS pour un dégradé
 */
export function generateGradientStyle(name) {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  const gradientIndex = Math.abs(hash) % gradients.length
  return gradients[gradientIndex]
}