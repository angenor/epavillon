#!/usr/bin/env node

/**
 * Script de vérification SEO
 * Vérifie que tous les fichiers nécessaires pour le SEO sont présents après le build
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.join(__dirname, '..', 'dist')

console.log('🔍 Vérification SEO du build...\n')

const checks = []

// Vérifier que le dossier dist existe
if (!fs.existsSync(distPath)) {
  console.error('❌ Le dossier dist n\'existe pas. Lancez `npm run build` d\'abord.')
  process.exit(1)
}

// Vérifier index.html
const indexPath = path.join(distPath, 'index.html')
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf-8')

  // Vérifier les meta tags Open Graph
  const ogChecks = [
    { tag: 'og:image', regex: /<meta property="og:image" content="https:\/\/epavillonclimatique\.francophonie\.org/ },
    { tag: 'og:title', regex: /<meta property="og:title"/ },
    { tag: 'og:description', regex: /<meta property="og:description"/ },
    { tag: 'og:url', regex: /<meta property="og:url"/ },
    { tag: 'twitter:card', regex: /<meta name="twitter:card"/ },
    { tag: 'twitter:image', regex: /<meta name="twitter:image" content="https:\/\/epavillonclimatique\.francophonie\.org/ }
  ]

  ogChecks.forEach(({ tag, regex }) => {
    if (regex.test(indexContent)) {
      checks.push({ name: `Meta tag ${tag}`, status: 'ok' })
    } else {
      checks.push({ name: `Meta tag ${tag}`, status: 'error' })
    }
  })
} else {
  checks.push({ name: 'index.html', status: 'error' })
}

// Vérifier que l'image par défaut existe
const defaultImages = [
  'images/CdP31_IFDD.jpg',
  'images/example/event_banniere_par_defaut_32_9_v3.jpg',
  'images/example/event_banniere_par_defaut_16_9.jpg',
  'images/example/event_banniere_par_defaut_16_9_reduit.jpg'
]

defaultImages.forEach(imagePath => {
  const fullPath = path.join(distPath, imagePath)
  if (fs.existsSync(fullPath)) {
    checks.push({ name: imagePath, status: 'ok' })
  } else {
    checks.push({ name: imagePath, status: 'warning' })
  }
})

// Afficher les résultats
console.log('📊 Résultats de la vérification :\n')

let hasErrors = false
let hasWarnings = false

checks.forEach(({ name, status }) => {
  if (status === 'ok') {
    console.log(`✅ ${name}`)
  } else if (status === 'warning') {
    console.log(`⚠️  ${name}`)
    hasWarnings = true
  } else {
    console.log(`❌ ${name}`)
    hasErrors = true
  }
})

console.log('\n' + '='.repeat(50))

if (hasErrors) {
  console.error('\n❌ Des erreurs ont été détectées. Le SEO ne fonctionnera pas correctement.')
  console.error('Vérifiez que vous avez bien suivi toutes les étapes du guide DEPLOYMENT_SEO.md\n')
  process.exit(1)
} else if (hasWarnings) {
  console.warn('\n⚠️  Des avertissements ont été détectés. Certaines images par défaut sont manquantes.')
  console.warn('Le partage sur les réseaux sociaux pourrait ne pas afficher d\'images pour certaines pages.\n')
  process.exit(0)
} else {
  console.log('\n✅ Tous les contrôles SEO sont passés avec succès!')
  console.log('Le site est prêt à être déployé avec un bon support du partage sur les réseaux sociaux.\n')
  console.log('📋 Prochaines étapes :')
  console.log('1. Déployez avec : firebase deploy')
  console.log('2. Testez le partage avec Facebook Debugger : https://developers.facebook.com/tools/debug/')
  console.log('3. Consultez DEPLOYMENT_SEO.md pour plus d\'informations\n')
  process.exit(0)
}
