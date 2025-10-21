#!/usr/bin/env node

/**
 * Script SERVEUR pour générer les embeddings de tous les documents de négociation existants
 * Usage: node src/scripts/generateDocumentEmbeddings.js
 *
 * NOTE: Ce script utilise des dépendances Node.js (pdf-parse, mammoth) et doit être exécuté côté serveur
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { extractTextFromDocument } from '../../server/ai/documentProcessor.server.js'
import {
  splitTextIntoSmartChunks,
  cleanText
} from '../utils/ai/documentProcessor.js'
import { batchGenerateEmbeddings } from '../utils/ai/embeddingGenerator.js'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const CHUNK_SIZE = parseInt(process.env.VITE_AI_CHUNK_SIZE) || 1000
const CHUNK_OVERLAP = parseInt(process.env.VITE_AI_CHUNK_OVERLAP) || 200

// Vérifier les variables d'environnement
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.local')
  process.exit(1)
}

if (!process.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.error('❌ VITE_OPENAI_API_KEY must be set in .env.local')
  process.exit(1)
}

// Initialiser Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Récupère tous les documents de négociation
 */
async function fetchAllDocuments() {
  console.log('📥 Fetching all negotiation documents...')

  const { data, error } = await supabase
    .from('negotiation_documents')
    .select('id, title, file_url, file_type, category, updated_at')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`)
  }

  console.log(`✅ Found ${data.length} documents`)
  return data
}

/**
 * Vérifie si un document a déjà des embeddings
 */
async function hasExistingEmbeddings(documentId) {
  const { count, error } = await supabase
    .from('document_embeddings')
    .select('*', { count: 'exact', head: true })
    .eq('document_id', documentId)

  if (error) {
    console.error(`Error checking embeddings for ${documentId}:`, error)
    return false
  }

  return count > 0
}

/**
 * Supprime les embeddings existants d'un document
 */
async function deleteExistingEmbeddings(documentId) {
  const { error } = await supabase
    .from('document_embeddings')
    .delete()
    .eq('document_id', documentId)

  if (error) {
    throw new Error(`Failed to delete embeddings: ${error.message}`)
  }
}

/**
 * Traite un document et génère ses embeddings
 */
async function processDocument(document, skipExisting = true) {
  const { id, title, file_url, file_type, category } = document

  console.log(`\n📄 Processing: ${title}`)
  console.log(`   ID: ${id}`)
  console.log(`   Category: ${category || 'N/A'}`)

  try {
    // Vérifier si des embeddings existent déjà
    if (skipExisting && await hasExistingEmbeddings(id)) {
      console.log(`   ⏭️  Skipping (embeddings already exist)`)
      return { success: true, skipped: true, chunksCount: 0 }
    }

    // Étape 1: Extraire le texte
    console.log(`   📖 Extracting text...`)
    const { text, metadata } = await extractTextFromDocument(file_url, file_type)

    if (!text || text.trim().length === 0) {
      console.log(`   ⚠️  Warning: No text extracted`)
      return { success: false, error: 'No text extracted', chunksCount: 0 }
    }

    const cleanedText = cleanText(text)
    console.log(`   📏 Text length: ${cleanedText.length} characters`)

    // Étape 2: Diviser en chunks
    console.log(`   ✂️  Splitting into chunks...`)
    const chunks = splitTextIntoSmartChunks(cleanedText, CHUNK_SIZE, CHUNK_OVERLAP)
    console.log(`   📦 Created ${chunks.length} chunks`)

    if (chunks.length === 0) {
      console.log(`   ⚠️  Warning: No chunks created`)
      return { success: false, error: 'No chunks created', chunksCount: 0 }
    }

    // Étape 3: Générer les embeddings
    console.log(`   🤖 Generating embeddings...`)
    const batchSize = 10
    const allEmbeddings = []

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      const batchTexts = batch.map(chunk => chunk.text)

      const embeddings = await batchGenerateEmbeddings(batchTexts)
      allEmbeddings.push(...embeddings)

      const progress = Math.round(((i + batch.length) / chunks.length) * 100)
      console.log(`   ⏳ Progress: ${progress}%`)
    }

    // Étape 4: Stocker dans Supabase
    console.log(`   💾 Storing embeddings in database...`)

    const embeddingsData = chunks.map((chunk, index) => ({
      document_id: id,
      chunk_index: chunk.index,
      chunk_text: chunk.text,
      chunk_metadata: {
        start: chunk.start,
        end: chunk.end,
        pages: metadata.pages || null,
        title: title,
        category: category,
        document_title: title
      },
      embedding: allEmbeddings[index]
    }))

    // Insérer par batch
    for (let i = 0; i < embeddingsData.length; i += batchSize) {
      const batch = embeddingsData.slice(i, i + batchSize)

      const { error: insertError } = await supabase
        .from('document_embeddings')
        .insert(batch)

      if (insertError) {
        throw new Error(`Failed to insert embeddings: ${insertError.message}`)
      }
    }

    console.log(`   ✅ Success! Generated ${chunks.length} embeddings`)
    return { success: true, chunksCount: chunks.length, skipped: false }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`)
    return { success: false, error: error.message, chunksCount: 0 }
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Starting document embeddings generation\n')
  console.log('Configuration:')
  console.log(`  - Chunk size: ${CHUNK_SIZE}`)
  console.log(`  - Chunk overlap: ${CHUNK_OVERLAP}`)
  console.log(`  - Supabase URL: ${SUPABASE_URL}`)
  console.log('')

  const startTime = Date.now()

  try {
    // Récupérer tous les documents
    const documents = await fetchAllDocuments()

    if (documents.length === 0) {
      console.log('ℹ️  No documents found')
      return
    }

    // Demander confirmation
    const readline = await import('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise(resolve => {
      rl.question(`Process ${documents.length} documents? (y/n): `, resolve)
    })
    rl.close()

    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Cancelled by user')
      return
    }

    // Traiter chaque document
    const results = {
      success: 0,
      skipped: 0,
      failed: 0,
      totalChunks: 0,
      errors: []
    }

    for (let i = 0; i < documents.length; i++) {
      console.log(`\n[${i + 1}/${documents.length}]`)
      const result = await processDocument(documents[i])

      if (result.success) {
        if (result.skipped) {
          results.skipped++
        } else {
          results.success++
          results.totalChunks += result.chunksCount
        }
      } else {
        results.failed++
        results.errors.push({
          document: documents[i].title,
          error: result.error
        })
      }

      // Petit délai pour éviter le rate limiting
      if (i < documents.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Afficher le résumé
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log('\n' + '='.repeat(50))
    console.log('📊 SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total documents: ${documents.length}`)
    console.log(`✅ Successfully processed: ${results.success}`)
    console.log(`⏭️  Skipped (existing): ${results.skipped}`)
    console.log(`❌ Failed: ${results.failed}`)
    console.log(`📦 Total chunks generated: ${results.totalChunks}`)
    console.log(`⏱️  Duration: ${duration}s`)

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:')
      results.errors.forEach(({ document, error }) => {
        console.log(`  - ${document}: ${error}`)
      })
    }

    console.log('\n✨ Done!')
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})
