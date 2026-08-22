#!/usr/bin/env node

/**
 * Script de pre-rendering avec Puppeteer
 * Génère des fichiers HTML statiques pour chaque route après le build
 *
 * Ce script visite chaque page avec un navigateur headless, attend que @vueuse/head
 * génère les meta tags dynamiques, puis sauvegarde le HTML complet.
 *
 * Prérequis : npm install --save-dev puppeteer serve-handler
 */

import puppeteer from 'puppeteer'
import { createServer } from 'http'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import handler from 'serve-handler'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const distPath = join(__dirname, '..', 'dist')
const routesFile = join(__dirname, '..', 'prerender-routes.json')
const PORT = 3000

console.log('🚀 Démarrage du pre-rendering avec Puppeteer...\n')

// Vérifier que le dossier dist existe
if (!existsSync(distPath)) {
  console.error('❌ Le dossier dist n\'existe pas. Lancez `npm run build` d\'abord.')
  process.exit(1)
}

// Routes : celles passées en argument, sinon la liste générée depuis Supabase.
// Passer des routes en argument évite `generate:routes` et permet de ne
// pré-rendre que quelques pages : `node scripts/prerender-after-build.js /paco`
const routeArgs = process.argv.slice(2).filter(arg => arg.startsWith('/'))

let routes
if (routeArgs.length > 0) {
  routes = routeArgs
} else {
  if (!existsSync(routesFile)) {
    console.error('❌ Le fichier prerender-routes.json n\'existe pas.')
    console.error('Lancez `npm run generate:routes` d\'abord, ou passez les routes en argument.')
    process.exit(1)
  }
  routes = JSON.parse(readFileSync(routesFile, 'utf-8'))
}

console.log(`📋 ${routes.length} route(s) à pré-rendre\n`)

// Créer un serveur HTTP pour servir le dossier dist (mode SPA)
const server = createServer(async (request, response) => {
  return handler(request, response, {
    public: distPath,
    rewrites: [
      { source: '**', destination: '/index.html' }
    ]
  })
})

// Fonction pour attendre que le serveur soit prêt
function waitForServer() {
  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`✅ Serveur local démarré sur http://localhost:${PORT}\n`)
      resolve()
    })
  })
}

// Fonction pour pré-rendre une route
async function prerenderRoute(browser, route) {
  const page = await browser.newPage()

  try {
    const url = `http://localhost:${PORT}${route}`
    console.log(`🔄 Pré-rendu de ${route}...`)

    // Visiter la page
    await page.goto(url, {
      waitUntil: 'networkidle0', // Attendre que le réseau soit inactif
      timeout: 30000
    })

    // Attendre que Vue.js et @vueuse/head finissent de s'exécuter
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Récupérer le HTML complet avec les meta tags dynamiques
    const html = await page.content()

    // Déterminer le chemin du fichier à créer
    let filePath
    if (route === '/') {
      filePath = join(distPath, 'index.html')
    } else {
      // Créer la structure de dossiers
      const routePath = join(distPath, route)
      if (!existsSync(routePath)) {
        mkdirSync(routePath, { recursive: true })
      }
      filePath = join(routePath, 'index.html')
    }

    // Sauvegarder le HTML
    writeFileSync(filePath, html, 'utf-8')
    console.log(`   ✅ Sauvegardé : ${filePath}`)

  } catch (error) {
    console.error(`   ❌ Erreur pour ${route}:`, error.message)
  } finally {
    await page.close()
  }
}

// Fonction principale
async function main() {
  await waitForServer()

  // Lancer Puppeteer
  console.log('🌐 Lancement de Puppeteer...\n')
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    let completed = 0
    const total = routes.length

    // Pré-rendre chaque route (séquentiellement pour éviter de surcharger)
    for (const route of routes) {
      await prerenderRoute(browser, route)
      completed++
      console.log(`📊 Progression : ${completed}/${total}\n`)
    }

    console.log(`\n🎉 Pre-rendering terminé ! ${completed} routes pré-rendues.\n`)
    console.log('✅ Chaque page a maintenant ses propres meta tags (titre, image, description).')
    console.log('📦 Le dossier dist/ est prêt pour le déploiement.\n')

  } catch (error) {
    console.error('❌ Erreur lors du pre-rendering:', error)
    process.exit(1)
  } finally {
    await browser.close()
    server.close()
  }
}

// Exécuter
main().catch(error => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
})
