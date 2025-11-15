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
   */
  const exportDayProgramToPdf = async (event, activities, selectedDate, locale, t) => {
    console.log('PDF Export - Date sélectionnée:', selectedDate)
    console.log('PDF Export - Nombre total d\'activités:', activities.length)

    // Format 16:9 vrai paysage (297mm x 167mm)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [167.06, 297] // Format 16:9 exact
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10

    // Couleurs
    const blueHeader = [41, 128, 185] // Bleu pour l'en-tête
    const greenBand = [139, 195, 74] // Vert pour les bandes de sections
    const greenTime = [76, 175, 80] // Vert pour les heures
    const darkText = [33, 33, 33]

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
    doc.rect(0, 0, pageWidth, 25, 'F') // Réduit à 25mm pour format 16:9

    // Charger et ajouter le logo IFDD à gauche (optimisé)
    try {
      const logoUrl = `${window.location.origin}/logos/logo-ifdd-blanc.png`
      const logoImg = await new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = logoUrl
      })

      // Dimensions finales du logo dans le PDF
      const logoHeight = 15 // Réduit pour s'adapter à l'en-tête de 25mm
      const logoWidth = (logoImg.width / logoImg.height) * logoHeight

      // Créer un canvas optimisé (juste la taille nécessaire en pixels)
      const canvas = document.createElement('canvas')
      const pixelRatio = 3 // 3x pour bonne qualité sans être excessif
      canvas.width = logoWidth * pixelRatio
      canvas.height = logoHeight * pixelRatio
      const ctx = canvas.getContext('2d')
      ctx.drawImage(logoImg, 0, 0, canvas.width, canvas.height)

      // Convertir en JPEG avec compression pour réduire la taille
      const logoDataUrl = canvas.toDataURL('image/jpeg', 0.8) // 80% qualité JPEG

      doc.addImage(logoDataUrl, 'JPEG', margin + 2, 5, logoWidth, logoHeight)
    } catch (error) {
      console.warn('Impossible de charger le logo IFDD:', error)
    }

    // Titre principal en blanc : "PROGRAMME DU PAVILLON DE LA FRANCOPHONIE"
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16) // Réduit de 18 à 16
    doc.setFont('helvetica', 'bold')
    const mainTitle = locale === 'fr'
      ? 'PROGRAMME DU PAVILLON DE LA FRANCOPHONIE'
      : 'FRANCOPHONIE PAVILION PROGRAM'
    doc.text(mainTitle, pageWidth / 2, 10, { align: 'center' })

    // Sous-titre avec date et horaires
    doc.setFontSize(11) // Réduit de 12 à 11
    doc.setFont('helvetica', 'normal')
    const dateLocale = locale === 'fr' ? fr : enUS
    const formattedDate = format(selectedDate, 'EEEE d MMMM yyyy', { locale: dateLocale })
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

    // Calculer les horaires
    let timeRange = ''
    if (sortedActivities.length > 0) {
      const firstTime = format(new Date(sortedActivities[0].final_start_date), 'HH:mm')
      const lastTime = format(new Date(sortedActivities[sortedActivities.length - 1].final_end_date), 'HH:mm')
      timeRange = ` | ${firstTime}-${lastTime}`
    }

    // Ajouter l'événement sous la date
    const eventInfo = event.acronym ? `${event.acronym} ${event.year}` : event.title
    doc.text(`${capitalizedDate}${timeRange} - ${eventInfo}`, pageWidth / 2, 18, { align: 'center' })

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

    // Fonction pour dessiner une colonne
    const drawColumn = (activities, columnX, title, partNumber) => {
      // Bande verte du titre
      doc.setFillColor(...greenBand)
      doc.rect(columnX, startY, columnWidth, 8, 'F')

      // Titre de la section en blanc
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(title, columnX + columnWidth / 2, startY + 5.5, { align: 'center' })

      let currentY = startY + 15 // Plus d'espace après le titre

      // Dessiner chaque activité
      activities.forEach(activity => {
        const startTime = format(new Date(activity.final_start_date), 'HH:mm')

        // Heure en vert et plus grande
        doc.setTextColor(...greenTime)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(startTime, columnX + 2, currentY)
        currentY += 5

        // Titre de l'activité en noir
        doc.setTextColor(...darkText)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')

        // Découper le titre si trop long
        const titleLines = doc.splitTextToSize(activity.title || '', columnWidth - 4)
        doc.text(titleLines, columnX + 2, currentY)
        currentY += titleLines.length * 4 + 1

        // Espacement avant organisation
        currentY += 1.5

        // Organisation avec label
        if (activity.organization?.name) {
          doc.setFontSize(7.5)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(80, 80, 80)
          doc.text(locale === 'fr' ? 'Organisation :' : 'Organization:', columnX + 2, currentY)
          currentY += 3.5

          doc.setFont('helvetica', 'normal')
          doc.setTextColor(...darkText)
          const orgText = `• ${activity.organization.name}`
          const orgLines = doc.splitTextToSize(orgText, columnWidth - 6)
          doc.text(orgLines, columnX + 4, currentY)
          currentY += orgLines.length * 3.5 + 0.5
        }

        // Espacement avant intervenants
        currentY += 1.5

        // Panélistes avec label
        const activitySpeakers = speakersByActivity[activity.id] || []
        if (activitySpeakers.length > 0) {
          doc.setFontSize(7.5)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(80, 80, 80)
          doc.text(locale === 'fr' ? 'Intervenants :' : 'Speakers:', columnX + 2, currentY)
          currentY += 3.5

          doc.setFont('helvetica', 'normal')
          doc.setTextColor(...darkText)

          activitySpeakers.forEach(speaker => {
            const speakerText = `• ${speaker.first_name} ${speaker.last_name}`
            const speakerLines = doc.splitTextToSize(speakerText, columnWidth - 6)
            doc.text(speakerLines, columnX + 4, currentY)
            currentY += speakerLines.length * 3.5

            if (speaker.position) {
              doc.setFontSize(7)
              doc.setTextColor(100, 100, 100)
              const posLines = doc.splitTextToSize(`  ${speaker.position}`, columnWidth - 6)
              doc.text(posLines, columnX + 4, currentY)
              currentY += posLines.length * 3.2
              doc.setFontSize(7.5)
              doc.setTextColor(...darkText)
            }
          })
        }

        currentY += 4 // Espacement entre activités

        // Vérifier si on dépasse la page
        if (currentY > pageHeight - 20) {
          return // Arrêter si on manque de place
        }
      })
    }

    // Dessiner les 3 colonnes avec espacement optimisé
    const col1X = margin
    const col2X = margin + columnWidth + columnGap
    const col3X = margin + (columnWidth + columnGap) * 2

    drawColumn(column1, col1X, locale === 'fr' ? 'PARTIE 1 : MATIN' : 'PART 1 : MORNING', 1)
    drawColumn(column2, col2X, locale === 'fr' ? 'PARTIE 2 : APRÈS-MIDI' : 'PART 2 : AFTERNOON', 2)
    drawColumn(column3, col3X, locale === 'fr' ? 'PARTIE 3 : FIN DE JOURNÉE' : 'PART 3 : END OF DAY', 3)

    // ===== PIED DE PAGE =====
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(
      t('programmations.pdfFooter'),
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )

    // ===== QR CODE EN BAS À DROITE =====
    const programmationUrl = `${window.location.origin}/programmations/${event.year}/${event.id}`

    try {
      // Générer le QR code en base64 (optimisé pour réduire la taille)
      const qrCodeDataUrl = await QRCode.toDataURL(programmationUrl, {
        width: 100, // Réduit de 200 à 100 pour diminuer la taille du fichier
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Ajouter le QR code en bas à droite (avec espace pour le texte)
      const qrSize = 22 // Taille en mm
      const qrX = pageWidth - margin - qrSize - 2
      const qrY = pageHeight - 35 // Plus haut pour laisser de la place

      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

      // Texte sous le QR code
      doc.setFontSize(6)
      doc.setTextColor(80, 80, 80)
      doc.text(
        locale === 'fr' ? 'Scannez pour accéder' : 'Scan to access',
        qrX + qrSize / 2,
        qrY + qrSize + 3,
        { align: 'center' }
      )
      doc.text(
        locale === 'fr' ? 'à la programmation' : 'the program',
        qrX + qrSize / 2,
        qrY + qrSize + 5.5,
        { align: 'center' }
      )
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error)
    }

    // Générer le nom du fichier
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const eventSlug = event.acronym || event.title.replace(/\s+/g, '-').toLowerCase()
    const filename = `programme-${eventSlug}-${dateStr}.pdf`

    // Télécharger le PDF
    doc.save(filename)
  }

  return {
    exportDayProgramToPdf
  }
}
