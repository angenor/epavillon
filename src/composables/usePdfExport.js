import jsPDF from 'jspdf'
import { format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import { enUS } from 'date-fns/locale/en-US'
import { useSupabase } from '@/composables/useSupabase'

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

    // Format 16:9 paysage
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4' // A4 paysage: 297 x 210mm
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
    doc.rect(0, 0, pageWidth, 30, 'F')

    // Titre principal en blanc
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    const eventTitle = event.acronym
      ? `${event.title} ${event.year} - ${event.acronym}`.toUpperCase()
      : `${event.title} ${event.year || ''}`.toUpperCase()
    doc.text(eventTitle, pageWidth / 2, 12, { align: 'center' })

    // Sous-titre avec date et horaires
    doc.setFontSize(12)
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

    doc.text(`${capitalizedDate}${timeRange}`, pageWidth / 2, 22, { align: 'center' })

    // ===== DIVISER LES ACTIVITÉS EN 3 COLONNES =====
    const activitiesPerColumn = Math.ceil(sortedActivities.length / 3)
    const column1 = sortedActivities.slice(0, activitiesPerColumn)
    const column2 = sortedActivities.slice(activitiesPerColumn, activitiesPerColumn * 2)
    const column3 = sortedActivities.slice(activitiesPerColumn * 2)

    const columnWidth = (pageWidth - (margin * 4)) / 3
    const startY = 35

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

      let currentY = startY + 12

      // Dessiner chaque activité
      activities.forEach(activity => {
        const startTime = format(new Date(activity.final_start_date), 'HH:mm')

        // Heure en vert
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
        currentY += titleLines.length * 4

        // Organisation et panélistes
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)

        // Organisation
        if (activity.organization?.name) {
          const orgText = `• ${activity.organization.name}`
          const orgLines = doc.splitTextToSize(orgText, columnWidth - 6)
          doc.text(orgLines, columnX + 4, currentY)
          currentY += orgLines.length * 3.5
        }

        // Panélistes
        const activitySpeakers = speakersByActivity[activity.id] || []
        activitySpeakers.forEach(speaker => {
          const speakerText = `• ${speaker.first_name} ${speaker.last_name}`
          const speakerLines = doc.splitTextToSize(speakerText, columnWidth - 6)
          doc.text(speakerLines, columnX + 4, currentY)
          currentY += speakerLines.length * 3.5

          if (speaker.position) {
            const posLines = doc.splitTextToSize(`  ${speaker.position}`, columnWidth - 6)
            doc.text(posLines, columnX + 4, currentY)
            currentY += posLines.length * 3.5
          }
        })

        currentY += 3 // Espacement entre activités

        // Vérifier si on dépasse la page
        if (currentY > pageHeight - 20) {
          return // Arrêter si on manque de place
        }
      })
    }

    // Dessiner les 3 colonnes
    const col1X = margin
    const col2X = margin + columnWidth + margin
    const col3X = margin + (columnWidth + margin) * 2

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
