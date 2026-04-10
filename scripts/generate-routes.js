#!/usr/bin/env node

/**
 * Script pour générer la liste des routes à pré-rendre
 * Récupère toutes les activités et événements depuis Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Charger les variables d'environnement depuis .env.local
config({ path: path.join(__dirname, '..', '.env.local') })

// Configuration Supabase depuis les variables d'environnement
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définis')
  console.error('Créez un fichier .env.local avec vos credentials Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Génération de la liste des routes à pré-rendre...\n')

async function generateRoutes() {
  const routes = [
    '/', // Page d'accueil
    '/programmations', // Liste des événements
    '/paco', // Webinaire PACO
  ]

  try {
    // Récupérer tous les événements
    console.log('📅 Récupération des événements...')
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, year')
      .order('year', { ascending: false })

    if (eventsError) {
      console.error('❌ Erreur lors de la récupération des événements:', eventsError)
    } else {
      console.log(`✅ ${events.length} événements trouvés`)
      events.forEach(event => {
        routes.push(`/programmations/${event.year}/${event.id}`)
      })
    }

    // Récupérer toutes les activités
    console.log('🎯 Récupération des activités...')
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id')
      .order('created_at', { ascending: false })

    if (activitiesError) {
      console.error('❌ Erreur lors de la récupération des activités:', activitiesError)
    } else {
      console.log(`✅ ${activities.length} activités trouvées`)
      activities.forEach(activity => {
        routes.push(`/activities/${activity.id}`)
      })
    }

    // Sauvegarder la liste des routes
    const routesPath = path.join(__dirname, '..', 'prerender-routes.json')
    fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2))

    console.log(`\n✅ ${routes.length} routes sauvegardées dans prerender-routes.json`)
    console.log('\n📋 Quelques exemples de routes :')
    routes.slice(0, 10).forEach(route => console.log(`  - ${route}`))
    if (routes.length > 10) {
      console.log(`  ... et ${routes.length - 10} autres routes`)
    }

    return routes
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

generateRoutes()
