// supabase/functions/get-youtube-live-id/index.ts
// Edge Function pour récupérer l'ID du direct YouTube en cours sur une chaîne

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'

console.info('get-youtube-live-id function started')

interface RequestBody {
  channelHandle?: string
  channelId?: string
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { channelHandle, channelId }: RequestBody = await req.json()

    if (!channelHandle && !channelId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'channelHandle ou channelId requis'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Construire l'URL de la page streams
    let streamsUrl: string
    if (channelHandle) {
      // Format: @ifddoif
      const handle = channelHandle.startsWith('@') ? channelHandle : `@${channelHandle}`
      streamsUrl = `https://www.youtube.com/${handle}/streams`
    } else {
      // Format avec channel ID
      streamsUrl = `https://www.youtube.com/channel/${channelId}/streams`
    }

    console.info(`Fetching streams from: ${streamsUrl}`)

    // Récupérer la page
    const response = await fetch(streamsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const html = await response.text()

    // Méthode 1: Rechercher dans ytInitialData (JSON embarqué dans le HTML)
    const ytInitialDataMatch = html.match(/var ytInitialData = ({.*?});/)

    if (ytInitialDataMatch) {
      try {
        const ytData = JSON.parse(ytInitialDataMatch[1])

        // Parcourir la structure pour trouver le premier live stream
        const tabs = ytData?.contents?.twoColumnBrowseResultsRenderer?.tabs || []

        for (const tab of tabs) {
          const richGrid = tab?.tabRenderer?.content?.richGridRenderer?.contents || []

          for (const item of richGrid) {
            const videoRenderer = item?.richItemRenderer?.content?.videoRenderer

            if (videoRenderer) {
              // Vérifier si c'est un live stream
              const badges = videoRenderer?.badges || []
              const isLive = badges.some((badge: any) =>
                badge?.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_LIVE_NOW'
              )

              if (isLive && videoRenderer?.videoId) {
                console.info(`Live stream found: ${videoRenderer.videoId}`)
                return new Response(
                  JSON.stringify({
                    success: true,
                    videoId: videoRenderer.videoId,
                    title: videoRenderer?.title?.runs?.[0]?.text || '',
                    thumbnail: videoRenderer?.thumbnail?.thumbnails?.[0]?.url || ''
                  }),
                  {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                  }
                )
              }
            }
          }
        }
      } catch (parseError) {
        console.error('Erreur lors du parsing de ytInitialData:', parseError)
      }
    }

    // Méthode 2: Utiliser cheerio pour parser le HTML
    const $ = cheerio.load(html)

    // Rechercher les liens de vidéos avec le badge "LIVE"
    const liveVideoLinks = $('a[href*="/watch?v="]').filter(function() {
      const href = $(this).attr('href')
      const parent = $(this).parent()

      // Vérifier si le parent contient un badge "LIVE"
      const hasLiveBadge = parent.find('[aria-label*="LIVE"], [aria-label*="EN DIRECT"]').length > 0

      return href && hasLiveBadge
    })

    if (liveVideoLinks.length > 0) {
      const href = liveVideoLinks.first().attr('href')
      const videoIdMatch = href?.match(/v=([a-zA-Z0-9_-]{11})/)

      if (videoIdMatch) {
        const videoId = videoIdMatch[1]
        console.info(`Live stream found via HTML parsing: ${videoId}`)
        return new Response(
          JSON.stringify({
            success: true,
            videoId: videoId
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Aucun live trouvé
    console.info('No live stream found')
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Aucun direct en cours trouvé'
      }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in get-youtube-live-id:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur inconnue'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
