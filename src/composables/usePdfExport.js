import jsPDF from 'jspdf'
import { format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import { enUS } from 'date-fns/locale/en-US'
import { useSupabase } from '@/composables/useSupabase'
import QRCode from 'qrcode'

/**
 * Composable pour exporter le programme du jour en PDF format 16:9
 */
export function usePdfExport() {
  const { supabase } = useSupabase()

  /**
   * Génère un PDF du programme du jour au format 16:9 (paysage)
   * Inspiré du design de la Journée Finance Durable
   * @param {number} customScale - Facteur d'échelle personnalisé (0.6 à 1.4), par défaut 1.0
   */
  const exportDayProgramToPdf = async (event, activities, selectedDate, locale, t, customScale = 1.0) => {
    console.log('PDF Export - Date sélectionnée:', selectedDate)
    console.log('PDF Export - Nombre total d\'activités:', activities.length)
    console.log('PDF Export - Échelle personnalisée:', customScale, `(${Math.round(customScale * 100)}%)`)

    // Format 16:9 vrai paysage (297mm x 167mm)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [167.06, 297], // Format 16:9 exact
      compress: true // Activer la compression PDF
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10

    // Couleurs - Charte IFDD
    const blueHeader = [41, 128, 185] // Bleu IFDD pour l'en-tête
    const greenBand = [46, 125, 50] // Vert IFDD plus foncé pour les bandes
    const greenTime = [76, 175, 80] // Vert pour les heures
    const orangeAccent = [255, 152, 0] // Orange IFDD pour accents
    const darkText = [33, 33, 33]
    const grayText = [97, 97, 97]

    // Filtrer les activités du jour sélectionné
    const activitiesOfDay = activities.filter(activity => {
      if (!activity.final_start_date) return false
      const activityDate = new Date(activity.final_start_date)
      return isSameDay(activityDate, selectedDate)
    })

    console.log('PDF Export - Activités du jour filtré:', activitiesOfDay.length)

    // Trier les activités par heure
    const sortedActivities = activitiesOfDay.sort((a, b) => {
      return new Date(a.final_start_date) - new Date(b.final_start_date)
    })

    // Charger les speakers
    const activityIds = sortedActivities.map(a => a.id)
    let speakersByActivity = {}

    if (activityIds.length > 0) {
      const { data: speakers } = await supabase
        .from('activity_speakers')
        .select('activity_id, first_name, last_name, position, organization')
        .in('activity_id', activityIds)

      if (speakers) {
        speakers.forEach(speaker => {
          if (!speakersByActivity[speaker.activity_id]) {
            speakersByActivity[speaker.activity_id] = []
          }
          speakersByActivity[speaker.activity_id].push(speaker)
        })
      }
    }

    // ===== EN-TÊTE BLEU =====
    doc.setFillColor(...blueHeader)
    doc.rect(0, 0, pageWidth, 25, 'F')

    // Fonction helper pour charger et optimiser un logo
    const loadAndOptimizeLogo = async (logoPath, maxWidth = 1000) => {
      // Si c'est déjà une URL complète (http:// ou https://), l'utiliser telle quelle
      // Sinon, construire l'URL relative (ajouter / au début si nécessaire)
      let logoUrl
      if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
        logoUrl = logoPath
      } else {
        const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`
        logoUrl = `${window.location.origin}${path}`
      }

      const logoImg = await new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = logoUrl
      })

      console.log(`Logo ${logoPath} - dimensions originales:`, logoImg.width, 'x', logoImg.height)

      // Canvas haute résolution pour excellente qualité
      const canvas = document.createElement('canvas')
      const aspectRatio = logoImg.width / logoImg.height
      canvas.width = maxWidth
      canvas.height = Math.round(maxWidth / aspectRatio)

      const ctx = canvas.getContext('2d')
      // Activer le lissage haute qualité
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Dessiner le logo avec transparence
      ctx.drawImage(logoImg, 0, 0, canvas.width, canvas.height)

      // PNG pour qualité optimale des logos
      const logoDataUrl = canvas.toDataURL('image/png')
      const sizeKB = (logoDataUrl.length / 1024).toFixed(2)

      console.log(`Logo ${logoPath} optimisé - Canvas:`, canvas.width, 'x', canvas.height, '- Taille:', sizeKB, 'KB')

      return { dataUrl: logoDataUrl, aspectRatio }
    }

    // Charger et ajouter le logo IFDD à gauche
    try {
      const logoHeight = 15
      const { dataUrl, aspectRatio } = await loadAndOptimizeLogo('/logos/logo-ifdd-blanc.png', 1000)
      const logoWidth = logoHeight * aspectRatio
      doc.addImage(dataUrl, 'PNG', margin + 2, 5, logoWidth, logoHeight)
    } catch (error) {
      console.warn('Impossible de charger le logo IFDD:', error)
    }

    // Charger et ajouter le logo Francophonie à droite
    try {
      const logoHeight = 15
      const { dataUrl, aspectRatio } = await loadAndOptimizeLogo('/logos/logo-francophonie-white-transparent.png', 1000)
      const logoWidth = logoHeight * aspectRatio
      const logoX = pageWidth - margin - logoWidth - 2
      doc.addImage(dataUrl, 'PNG', logoX, 5, logoWidth, logoHeight)
    } catch (error) {
      console.warn('Impossible de charger le logo Francophonie:', error)
    }

    // Titre principal en blanc : "PROGRAMME DU PAVILLON DE LA FRANCOPHONIE"
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(17)
    doc.setFont('helvetica', 'bold')
    const mainTitle = locale === 'fr'
      ? 'PROGRAMME DU PAVILLON DE LA FRANCOPHONIE'
      : 'FRANCOPHONIE PAVILION PROGRAM'
    doc.text(mainTitle, pageWidth / 2, 11, { align: 'center' })

    // Sous-titre avec date et horaires - style amélioré
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const dateLocale = locale === 'fr' ? fr : enUS
    const formattedDate = format(selectedDate, 'EEEE d MMMM yyyy', { locale: dateLocale })
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

    // Calculer les horaires avec style
    let timeRange = ''
    if (sortedActivities.length > 0) {
      const firstTime = format(new Date(sortedActivities[0].final_start_date), 'HH:mm')
      const lastTime = format(new Date(sortedActivities[sortedActivities.length - 1].final_end_date), 'HH:mm')
      timeRange = `  •  ${firstTime} - ${lastTime}`
    }

    // Ajouter l'événement sous la date avec séparateur élégant
    const eventInfo = event.acronym ? `${event.acronym} ${event.year}` : event.title
    doc.text(`${capitalizedDate}${timeRange}  •  ${eventInfo}`, pageWidth / 2, 19, { align: 'center' })

    // ===== DIVISER LES ACTIVITÉS EN 3 COLONNES =====
    const activitiesPerColumn = Math.ceil(sortedActivities.length / 3)
    const column1 = sortedActivities.slice(0, activitiesPerColumn)
    const column2 = sortedActivities.slice(activitiesPerColumn, activitiesPerColumn * 2)
    const column3 = sortedActivities.slice(activitiesPerColumn * 2)

    // Calcul optimisé pour maximiser la largeur des colonnes
    const columnGap = 3 // Espacement entre les colonnes
    const totalWidth = pageWidth - (2 * margin)
    const columnWidth = (totalWidth - (2 * columnGap)) / 3
    const startY = 30 // Ajusté pour format 16:9 avec en-tête de 25mm

    // Fonction pour calculer les tailles de police adaptées
    const calculateFontSizes = () => {
      // Utiliser le customScale fourni par l'utilisateur
      // Le customScale va de 0.6 (60%) à 1.4 (140%)
      const scaleFactor = customScale

      return {
        title: Math.max(5, 9.5 * scaleFactor),
        organization: Math.max(4.5, 7.5 * scaleFactor),
        organizationLabel: Math.max(4, 7 * scaleFactor),
        speaker: Math.max(4.5, 7.5 * scaleFactor),
        speakerLabel: Math.max(4, 7 * scaleFactor),
        position: Math.max(4, 6.5 * scaleFactor),
        time: Math.max(6, 10 * scaleFactor),
        lineSpacing: Math.max(2, 4 * scaleFactor),
        sectionSpacing: Math.max(1.5, 4 * scaleFactor)
      }
    }

    // Fonction pour dessiner une colonne
    const drawColumn = async (activities, columnX, title, partNumber) => {
      // Calculer les tailles adaptées avec l'échelle personnalisée
      const fontSizes = calculateFontSizes()

      // Bande verte du titre avec coins légèrement arrondis
      doc.setFillColor(...greenBand)
      doc.roundedRect(columnX, startY, columnWidth, 8, 1, 1, 'F')

      // Accent orange subtil en haut de la bande
      doc.setFillColor(...orangeAccent)
      doc.roundedRect(columnX, startY, columnWidth, 1.5, 1, 1, 'F')

      // Titre de la section en blanc
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(title, columnX + columnWidth / 2, startY + 5.5, { align: 'center' })

      let currentY = startY + 15 // Plus d'espace après le titre

      // Dessiner chaque activité
      for (const activity of activities) {
        const startTime = format(new Date(activity.final_start_date), 'HH:mm')

        // Ligne de séparation subtile entre activités (sauf pour la première)
        if (currentY > startY + 15) {
          doc.setDrawColor(220, 220, 220)
          doc.setLineWidth(0.1)
          doc.line(columnX + 2, currentY - 1, columnX + columnWidth - 2, currentY - 1)
          currentY += fontSizes.sectionSpacing
        }

        // Heure en vert avec fond léger pour meilleure visibilité
        doc.setFillColor(245, 250, 245) // Fond vert très clair
        const timeBoxX = columnX + 2
        const timeBoxY = currentY - 3
        const timeBoxWidth = 14
        const timeBoxHeight = 5
        doc.roundedRect(timeBoxX, timeBoxY, timeBoxWidth, timeBoxHeight, 1, 1, 'F')

        doc.setTextColor(...greenTime)
        doc.setFontSize(fontSizes.time)
        doc.setFont('helvetica', 'bold')
        // Centrer l'heure dans le rectangle (horizontalement et verticalement)
        const timeTextX = timeBoxX + timeBoxWidth / 2
        const timeTextY = timeBoxY + timeBoxHeight / 2 + 1 // +1 pour compenser la baseline
        doc.text(startTime, timeTextX, timeTextY, { align: 'center' })
        currentY += 6

        // Titre de l'activité en noir avec meilleure lisibilité
        doc.setTextColor(...darkText)
        doc.setFontSize(fontSizes.title)
        doc.setFont('helvetica', 'bold')

        // Découper le titre si trop long
        const titleLines = doc.splitTextToSize(activity.title || '', columnWidth - 4)
        doc.text(titleLines, columnX + 2, currentY)
        currentY += titleLines.length * fontSizes.lineSpacing + 1

        // Espacement avant organisation
        currentY += fontSizes.sectionSpacing * 0.5

        // Organisation avec icône
        if (activity.organization?.name) {
          doc.setFontSize(fontSizes.organizationLabel)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(...grayText)

          // Petit cercle orange comme icône
          doc.setFillColor(...orangeAccent)
          doc.circle(columnX + 3, currentY - 1, 0.7, 'F')

          const orgLabel = locale === 'fr' ? 'Organisation :' : 'Organization:'
          doc.text(orgLabel, columnX + 5, currentY)
          currentY += fontSizes.lineSpacing * 0.75

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(fontSizes.organization)
          doc.setTextColor(...darkText)
          const orgText = activity.organization.name
          const orgLines = doc.splitTextToSize(orgText, columnWidth - 8)
          doc.text(orgLines, columnX + 5, currentY)
          currentY += orgLines.length * (fontSizes.lineSpacing * 0.75)
        }

        // Espacement avant intervenants
        currentY += fontSizes.sectionSpacing * 0.5

        // Panélistes avec icône
        const activitySpeakers = speakersByActivity[activity.id] || []
        if (activitySpeakers.length > 0) {
          doc.setFontSize(fontSizes.speakerLabel)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(...grayText)

          // Petit cercle orange comme icône
          doc.setFillColor(...orangeAccent)
          doc.circle(columnX + 3, currentY - 1, 0.7, 'F')

          const speakersLabel = locale === 'fr' ? 'Intervenants :' : 'Speakers:'
          doc.text(speakersLabel, columnX + 5, currentY)
          currentY += fontSizes.lineSpacing * 0.75

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(fontSizes.speaker)
          doc.setTextColor(...darkText)

          activitySpeakers.forEach(speaker => {
            const speakerText = `• ${speaker.first_name} ${speaker.last_name}`
            const speakerLines = doc.splitTextToSize(speakerText, columnWidth - 8)
            doc.text(speakerLines, columnX + 5, currentY)
            currentY += speakerLines.length * (fontSizes.lineSpacing * 0.75)

            if (speaker.position) {
              doc.setFontSize(fontSizes.position)
              doc.setTextColor(...grayText)
              const posLines = doc.splitTextToSize(`  ${speaker.position}`, columnWidth - 8)
              doc.text(posLines, columnX + 5, currentY)
              currentY += posLines.length * (fontSizes.lineSpacing * 0.7)
              doc.setFontSize(fontSizes.speaker)
              doc.setTextColor(...darkText)
            }
          })
        }

        currentY += fontSizes.sectionSpacing // Espacement entre activités

        // Vérifier si on dépasse la page
        if (currentY > pageHeight - 20) {
          return // Arrêter si on manque de place
        }
      }
    }

    // Dessiner les 3 colonnes avec espacement optimisé
    const col1X = margin
    const col2X = margin + columnWidth + columnGap
    const col3X = margin + (columnWidth + columnGap) * 2

    await drawColumn(column1, col1X, locale === 'fr' ? 'PARTIE 1 : MATIN' : 'PART 1 : MORNING', 1)
    await drawColumn(column2, col2X, locale === 'fr' ? 'PARTIE 2 : APRÈS-MIDI' : 'PART 2 : AFTERNOON', 2)
    await drawColumn(column3, col3X, locale === 'fr' ? 'PARTIE 3 : FIN DE JOURNÉE' : 'PART 3 : END OF DAY', 3)

    // ===== PIED DE PAGE AMÉLIORÉ =====
    // Ligne de séparation subtile et centrée (plus courte pour ne pas traverser le QR code)
    const footerLineWidth = pageWidth * 0.5 // 50% de la largeur
    const footerLineX = (pageWidth - footerLineWidth) / 2 // Centré
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.2)
    doc.line(footerLineX, pageHeight - 10, footerLineX + footerLineWidth, pageHeight - 10)

    // Texte du pied de page
    doc.setFontSize(7.5)
    doc.setTextColor(...grayText)
    doc.text(
      t('programmations.pdfFooter'),
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )

    // ===== QR CODE EN BAS À DROITE =====
    const programmationUrl = `${window.location.origin}/programmations/${event.year}/${event.id}`

    try {
      // Générer le QR code en base64 (ultra optimisé)
      const qrCodeDataUrl = await QRCode.toDataURL(programmationUrl, {
        width: 80, // Réduit au minimum pour diminuer la taille du fichier
        margin: 0,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'L' // Niveau de correction d'erreur bas = plus petit
      })

      console.log('QR Code Data URL length:', qrCodeDataUrl.length)

      // Ajouter le QR code en bas à droite avec un fond élégant
      const qrSize = 22 // Taille en mm
      const qrX = pageWidth - margin - qrSize - 2
      const qrY = pageHeight - 35 // Plus haut pour laisser de la place

      // Fond blanc avec bordure pour mettre en valeur le QR code
      const padding = 2
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(...orangeAccent)
      doc.setLineWidth(0.3)
      doc.roundedRect(qrX - padding, qrY - padding, qrSize + (padding * 2), qrSize + (padding * 2), 1.5, 1.5, 'FD')

      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

      // Texte sous le QR code avec style amélioré
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...darkText)
      doc.text(
        locale === 'fr' ? 'Scannez pour accéder' : 'Scan to access',
        qrX + qrSize / 2,
        qrY + qrSize + 4,
        { align: 'center' }
      )
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6)
      doc.setTextColor(...grayText)
      doc.text(
        locale === 'fr' ? 'à la programmation complète' : 'the full program',
        qrX + qrSize / 2,
        qrY + qrSize + 7,
        { align: 'center' }
      )
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error)
    }

    // Générer le nom du fichier
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const eventSlug = event.acronym || event.title.replace(/\s+/g, '-').toLowerCase()
    const filename = `programme-${eventSlug}-${dateStr}.pdf`

    // Log de la taille du PDF
    const pdfOutput = doc.output('blob')
    const sizeInMB = (pdfOutput.size / 1024 / 1024).toFixed(2)
    console.log('PDF file size:', sizeInMB, 'MB')

    // Télécharger le PDF
    doc.save(filename)
  }

  return {
    exportDayProgramToPdf
  }
}
