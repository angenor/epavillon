"""Construction du document Word « Programme du pavillon » (format paysage).

Reproduit la mise en page du modèle Programme_CdP29.docx :
- titre + sous-titre centrés, logo IFDD / OIF en haut à droite ;
- une grille : une ligne par jour de l'événement, une colonne par créneau horaire ;
- dans chaque cellule, pour chaque activité :
    1. l'heure proposée par l'organisation : surlignée vert tant qu'aucune heure
       n'est retenue (phase d'analyse), surlignée rouge et barrée sinon ;
    2. « Organisation - Pays : » en gras ;
    3. le titre de l'activité ;
    4. l'heure retenue (surlignée vert), si elle existe.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_COLOR_INDEX
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

# --------------------------------------------------------------------------- constantes

FONT_BODY = "Arial"
FONT_CELL = "Arial"  # le modèle utilise Roboto, rarement installée : Arial évite les substitutions
RED_FILL = "E06666"  # trame des heures proposées
DATE_COLUMN_CM = 1.9
LOGO_WIDTH_CM = 6.5
LOGO_HEIGHT_CM = LOGO_WIDTH_CM * 177 / 681  # proportions du logo IFDD / OIF
SLOT_MERGE_MINUTES = 30  # deux heures de début séparées d'au plus 30 min = même créneau

MONTHS_SHORT = ["janv.", "févr.", "mars", "avr.", "mai", "juin",
                "juil.", "août", "sept.", "oct.", "nov.", "déc."]
MONTHS_LONG = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
               "août", "septembre", "octobre", "novembre", "décembre"]


# --------------------------------------------------------------------------- modèle de données

@dataclass
class EventInfo:
    id: str
    title: str
    acronym: str
    year: int | None
    city: str
    country: str
    timezone: ZoneInfo
    start_date: date | None
    end_date: date | None

    @property
    def label(self) -> str:
        return self.acronym or self.title


@dataclass
class ActivityEntry:
    title: str
    organization: str
    country: str
    proposed_start: datetime
    proposed_end: datetime
    final_start: datetime | None
    final_end: datetime | None

    @property
    def has_final(self) -> bool:
        return self.final_start is not None and self.final_end is not None

    @property
    def display_start(self) -> datetime:
        """Heure qui positionne l'activité dans la grille : la retenue si elle existe."""
        return self.final_start or self.proposed_start

    @property
    def display_end(self) -> datetime:
        return self.final_end or self.proposed_end


@dataclass
class Slot:
    start_minutes: int
    end_minutes: int
    label: str
    activities: list[ActivityEntry] = field(default_factory=list)


# --------------------------------------------------------------------------- normalisation

def _parse_datetime(value: str | None, tz: ZoneInfo) -> datetime | None:
    if not value:
        return None
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=ZoneInfo("UTC"))
    return parsed.astimezone(tz)


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00")).date()


def normalize_event(raw: dict, tz_override: str | None = None) -> EventInfo:
    tz = ZoneInfo(tz_override or raw.get("timezone") or "UTC")
    start = _parse_date(raw.get("in_person_start_date")) or _parse_date(raw.get("online_start_datetime"))
    end = _parse_date(raw.get("in_person_end_date")) or _parse_date(raw.get("online_end_datetime"))
    country = (raw.get("country") or {}).get("name_fr") or ""
    return EventInfo(
        id=raw["id"],
        title=raw.get("title") or "",
        acronym=(raw.get("acronym") or "").strip(),
        year=raw.get("year"),
        city=raw.get("city") or "",
        country=country,
        timezone=tz,
        start_date=start,
        end_date=end,
    )


def normalize_activities(raw_list: list[dict], tz: ZoneInfo) -> list[ActivityEntry]:
    entries = []
    for raw in raw_list:
        organization = raw.get("organization") or {}
        org_country = (organization.get("country") or {}).get("name_fr")
        activity_country = (raw.get("country") or {}).get("name_fr")
        proposed_start = _parse_datetime(raw.get("proposed_start_date"), tz)
        proposed_end = _parse_datetime(raw.get("proposed_end_date"), tz)
        if proposed_start is None:
            continue  # sans date proposée, impossible de placer l'activité
        entries.append(
            ActivityEntry(
                title=(raw.get("title") or "").strip(),
                organization=(organization.get("name") or "").strip(),
                country=(org_country or activity_country or "").strip(),
                proposed_start=proposed_start,
                proposed_end=proposed_end or proposed_start + timedelta(hours=1),
                final_start=_parse_datetime(raw.get("final_start_date"), tz),
                final_end=_parse_datetime(raw.get("final_end_date"), tz),
            )
        )
    entries.sort(key=lambda a: a.display_start)
    return entries


# --------------------------------------------------------------------------- formatage

def format_time(moment: datetime) -> str:
    return f"{moment.hour:02d}h{moment.minute:02d}"


def format_time_range(start: datetime, end: datetime) -> str:
    return f"{format_time(start)} - {format_time(end)}"


def format_minutes(minutes: int) -> str:
    hours, mins = divmod(minutes, 60)
    return f"{hours}h{mins:02d}"


def format_day_short(day: date) -> str:
    return f"{day.day} {MONTHS_SHORT[day.month - 1]}"


def format_event_period(event: EventInfo) -> str:
    start, end = event.start_date, event.end_date
    if not start or not end:
        return str(event.year or "")
    if start.month == end.month and start.year == end.year:
        return f"du {start.day} au {end.day} {MONTHS_LONG[end.month - 1]} {end.year}"
    return (
        f"du {start.day} {MONTHS_LONG[start.month - 1]} "
        f"au {end.day} {MONTHS_LONG[end.month - 1]} {end.year}"
    )


def build_subtitle(event: EventInfo) -> str:
    parts = [p for p in (event.label, event.city, event.country) if p]
    return ", ".join(parts) + ", " + format_event_period(event)


# --------------------------------------------------------------------------- grille

def compute_days(event: EventInfo, activities: list[ActivityEntry]) -> list[date]:
    """Tous les jours de l'événement, complétés par les jours d'activités hors période."""
    days: set[date] = set()
    if event.start_date and event.end_date and event.start_date <= event.end_date:
        current = event.start_date
        while current <= event.end_date:
            days.add(current)
            current += timedelta(days=1)
    for activity in activities:
        days.add(activity.display_start.date())
    return sorted(days)


def _minutes_of_day(moment: datetime) -> int:
    return moment.hour * 60 + moment.minute


def parse_explicit_slots(spec: str) -> list[Slot]:
    """Analyse « 08:00-09:00,09:15-10:15 » en créneaux fixes."""
    slots = []
    for chunk in spec.split(","):
        chunk = chunk.strip()
        if not chunk:
            continue
        start_text, end_text = chunk.split("-")
        start = _parse_hhmm(start_text)
        end = _parse_hhmm(end_text)
        slots.append(Slot(start, end, f"{format_minutes(start)} à {format_minutes(end)}"))
    if not slots:
        raise ValueError("Aucun créneau valide dans --slots")
    return sorted(slots, key=lambda s: s.start_minutes)


def _parse_hhmm(text: str) -> int:
    text = text.strip().lower().replace("h", ":")
    hours, _, minutes = text.partition(":")
    return int(hours) * 60 + int(minutes or 0)


def compute_slots(activities: list[ActivityEntry], explicit: list[Slot] | None = None) -> list[Slot]:
    """Colonnes de la grille.

    Sans créneaux explicites, les heures de début (retenues) sont regroupées :
    deux débuts distants d'au plus SLOT_MERGE_MINUTES forment une même colonne.
    Le libellé reprend le début le plus fréquent du groupe et la durée la plus
    fréquente de l'événement (les activités sur toute la journée ne faussent pas
    ainsi l'intitulé d'un créneau).
    """
    if explicit:
        slots = [Slot(s.start_minutes, s.end_minutes, s.label) for s in explicit]
        for activity in activities:
            _nearest_slot(slots, _minutes_of_day(activity.display_start)).activities.append(activity)
        return slots

    starts = sorted({_minutes_of_day(a.display_start) for a in activities})
    groups: list[list[int]] = []
    for start in starts:
        if groups and start - groups[-1][0] <= SLOT_MERGE_MINUTES:
            groups[-1].append(start)
        else:
            groups.append([start])

    durations = Counter(
        int((a.display_end - a.display_start).total_seconds() // 60) for a in activities
    )
    duration_mode = durations.most_common(1)[0][0] if durations else 60

    slots = []
    for group in groups:
        members = [a for a in activities if _minutes_of_day(a.display_start) in group]
        start_mode = Counter(_minutes_of_day(a.display_start) for a in members).most_common(1)[0][0]
        end = start_mode + duration_mode
        slot = Slot(group[0], end, f"{format_minutes(start_mode)} à {format_minutes(end)}")
        slot.activities.extend(members)
        slots.append(slot)
    return slots


def _nearest_slot(slots: list[Slot], start_minutes: int) -> Slot:
    for slot in slots:
        if slot.start_minutes <= start_minutes < slot.end_minutes:
            return slot
    return min(slots, key=lambda s: abs(s.start_minutes - start_minutes))


# --------------------------------------------------------------------------- helpers OOXML

def _set_cell_margins(cell, twips: int = 100) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    margins = OxmlElement("w:tcMar")
    for side in ("top", "left", "bottom", "right"):
        node = OxmlElement(f"w:{side}")
        node.set(qn("w:w"), str(twips))
        node.set(qn("w:type"), "dxa")
        margins.append(node)
    _insert_before(tc_pr, margins, "w:vAlign")  # tcMar précède vAlign dans le schéma


def _set_table_borders(table, size: int = 8, color: str = "000000") -> None:
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for side in ("top", "left", "bottom", "right", "insideH", "insideV"):
        node = OxmlElement(f"w:{side}")
        node.set(qn("w:val"), "single")
        node.set(qn("w:sz"), str(size))
        node.set(qn("w:space"), "0")
        node.set(qn("w:color"), color)
        borders.append(node)
    _insert_before(tbl_pr, borders, "w:tblLayout", "w:tblLook")


def _insert_before(parent, element, *successor_tags: str) -> None:
    """Insère `element` avant le premier successeur présent, sinon à la fin (ordre du schéma OOXML)."""
    for tag in successor_tags:
        successor = parent.find(qn(tag))
        if successor is not None:
            successor.addprevious(element)
            return
    parent.append(element)


def _mark_header_row(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    tr_pr.append(OxmlElement("w:tblHeader"))


def _set_run_shading(run, fill: str) -> None:
    r_pr = run._r.get_or_add_rPr()
    shading = OxmlElement("w:shd")
    shading.set(qn("w:val"), "clear")
    shading.set(qn("w:color"), "auto")
    shading.set(qn("w:fill"), fill)
    r_pr.append(shading)


def _set_column_widths(table, widths_cm: list[float]) -> None:
    for column, width in zip(table.columns, widths_cm):
        column.width = Cm(width)
    for row in table.rows:
        for cell, width in zip(row.cells, widths_cm):
            cell.width = Cm(width)


def _style_run(run, size: float, bold: bool = False, font: str = FONT_CELL) -> None:
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    r_pr = run._r.get_or_add_rPr()
    fonts = r_pr.find(qn("w:rFonts"))
    if fonts is None:
        fonts = OxmlElement("w:rFonts")
        r_pr.insert(0, fonts)
    for attr in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
        fonts.set(qn(attr), font)


def _compact_paragraph(paragraph, align=WD_ALIGN_PARAGRAPH.CENTER) -> None:
    paragraph.alignment = align
    fmt = paragraph.paragraph_format
    fmt.space_before = Pt(0)
    fmt.space_after = Pt(0)
    fmt.line_spacing = 1.0


# --------------------------------------------------------------------------- construction

def _configure_page(document) -> None:
    section = document.sections[0]
    section.orientation = WD_ORIENT.LANDSCAPE
    section.page_width = Cm(29.7)
    section.page_height = Cm(21.0)
    section.left_margin = section.right_margin = Cm(1.0)
    section.top_margin = section.bottom_margin = Cm(1.2)
    section.header_distance = section.footer_distance = Cm(0.8)

    normal = document.styles["Normal"]
    normal.font.name = FONT_BODY
    normal.font.size = Pt(10)
    normal.element.rPr.rFonts.set(qn("w:eastAsia"), FONT_BODY)
    normal.paragraph_format.space_after = Pt(0)


def _anchor_picture_top_right(run, image_path: Path, width_cm: float, content_width_cm: float) -> None:
    """Insère l'image en flottant, alignée à droite de la marge, derrière le texte.

    python-docx ne produit que des images « inline » ; on convertit l'élément
    wp:inline généré en wp:anchor (même mécanisme que le logo du modèle).
    """
    inline_shape = run.add_picture(str(image_path), width=Cm(width_cm))
    inline = inline_shape._inline
    drawing = inline.getparent()

    anchor = OxmlElement("wp:anchor")
    for attr, value in (
        ("distT", "0"), ("distB", "0"), ("distL", "114300"), ("distR", "114300"),
        ("simplePos", "0"), ("relativeHeight", "251658240"), ("behindDoc", "0"),
        ("locked", "0"), ("layoutInCell", "1"), ("allowOverlap", "1"),
    ):
        anchor.set(attr, value)

    simple_pos = OxmlElement("wp:simplePos")
    simple_pos.set("x", "0")
    simple_pos.set("y", "0")
    anchor.append(simple_pos)

    # Décalage horizontal explicite (comme le modèle) : plus fiable que « align=right »
    # selon les visionneuses. 1 cm = 360 000 EMU.
    position_h = OxmlElement("wp:positionH")
    position_h.set("relativeFrom", "margin")
    offset_h = OxmlElement("wp:posOffset")
    offset_h.text = str(int((content_width_cm - width_cm) * 360000))
    position_h.append(offset_h)
    anchor.append(position_h)

    position_v = OxmlElement("wp:positionV")
    position_v.set("relativeFrom", "paragraph")
    offset_v = OxmlElement("wp:posOffset")
    offset_v.text = "0"
    position_v.append(offset_v)
    anchor.append(position_v)

    # Ordre imposé par le schéma : extent, effectExtent, habillage, docPr, cNvGraphicFramePr, graphic.
    # Le wp:inline de python-docx n'a pas d'effectExtent : on le crée, ainsi que wrapNone,
    # sans lequel Word refuse d'ouvrir le document.
    anchor.append(inline.find(qn("wp:extent")))
    effect_extent = OxmlElement("wp:effectExtent")
    for side in ("l", "t", "r", "b"):
        effect_extent.set(side, "0")
    anchor.append(effect_extent)
    anchor.append(OxmlElement("wp:wrapNone"))
    for tag in ("wp:docPr", "wp:cNvGraphicFramePr", "a:graphic"):
        anchor.append(inline.find(qn(tag)))

    drawing.replace(inline, anchor)


def _add_heading_block(document, event: EventInfo, logo_path: Path | None, content_width_cm: float) -> None:
    """Titre et sous-titre centrés sur la page, logo flottant en haut à droite."""
    # Retraits symétriques : le texte reste centré sur la page sans jamais atteindre le logo
    side_indent = Cm(LOGO_WIDTH_CM + 0.5)

    title = document.add_paragraph()
    _compact_paragraph(title)
    title.paragraph_format.left_indent = title.paragraph_format.right_indent = side_indent
    if logo_path and logo_path.exists():
        _anchor_picture_top_right(title.add_run(), logo_path, LOGO_WIDTH_CM, content_width_cm)
    _style_run(title.add_run(f"Programme du pavillon de la francophonie à la {event.label}"), 14, font=FONT_BODY)

    subtitle = document.add_paragraph()
    _compact_paragraph(subtitle)
    subtitle.paragraph_format.left_indent = subtitle.paragraph_format.right_indent = side_indent
    subtitle.paragraph_format.space_before = Pt(6)
    _style_run(subtitle.add_run(build_subtitle(event)), 14, bold=True, font=FONT_BODY)

    # Réserve la hauteur du logo avant la grille
    spacer = document.add_paragraph()
    _compact_paragraph(spacer)
    spacer.paragraph_format.space_before = Cm(max(LOGO_HEIGHT_CM - 1.1, 0.4))
    spacer.paragraph_format.space_after = Pt(6)


def _fill_activity_cell(cell, activities: list[ActivityEntry], day: date, font_size: float) -> None:
    first = True
    for activity in activities:
        if first:
            paragraph = cell.paragraphs[0]
            first = False
        else:
            separator = cell.add_paragraph()
            _compact_paragraph(separator)
            paragraph = cell.add_paragraph()

        # 1. Heure proposée par l'organisation : vert tant qu'aucune heure n'est retenue,
        #    rouge et barrée dès qu'une heure retenue la remplace
        _compact_paragraph(paragraph)
        prefix = ""
        if activity.proposed_start.date() != day:
            prefix = f"({format_day_short(activity.proposed_start.date())}) "
        proposed_run = paragraph.add_run(prefix + format_time_range(activity.proposed_start, activity.proposed_end))
        if activity.has_final:
            _style_run(proposed_run, font_size)
            proposed_run.font.strike = True
            _set_run_shading(proposed_run, RED_FILL)
        else:
            _style_run(proposed_run, font_size, bold=True)
            proposed_run.font.highlight_color = WD_COLOR_INDEX.BRIGHT_GREEN

        # 2. Organisation - Pays :
        org_paragraph = cell.add_paragraph()
        _compact_paragraph(org_paragraph)
        org_label = activity.organization
        if activity.country:
            org_label += f" - {activity.country}"
        _style_run(org_paragraph.add_run(org_label + " :"), font_size, bold=True)

        # 3. Titre
        title_paragraph = cell.add_paragraph()
        _compact_paragraph(title_paragraph)
        _style_run(title_paragraph.add_run(activity.title), font_size)

        # 4. Heure retenue (vert), si elle existe
        if activity.has_final:
            final_paragraph = cell.add_paragraph()
            _compact_paragraph(final_paragraph)
            final_run = final_paragraph.add_run(format_time_range(activity.final_start, activity.final_end))
            _style_run(final_run, font_size, bold=True)
            final_run.font.highlight_color = WD_COLOR_INDEX.BRIGHT_GREEN


def _add_programme_grid(document, days: list[date], slots: list[Slot], content_width_cm: float) -> None:
    font_size = 10 if len(slots) <= 8 else 9
    table = document.add_table(rows=1 + len(days), cols=1 + len(slots))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False  # ajoute w:tblLayout type=fixed
    _set_table_borders(table)

    slot_width = (content_width_cm - DATE_COLUMN_CM) / max(len(slots), 1)
    _set_column_widths(table, [DATE_COLUMN_CM] + [slot_width] * len(slots))

    # Ligne d'en-tête : créneaux horaires
    header_row = table.rows[0]
    _mark_header_row(header_row)
    for cell, slot in zip(header_row.cells[1:], slots):
        paragraph = cell.paragraphs[0]
        _compact_paragraph(paragraph)
        _style_run(paragraph.add_run(slot.label), font_size, bold=True, font=FONT_BODY)

    # Une ligne par jour
    # Les lignes restent sécables : une journée chargée peut dépasser une page,
    # et une ligne insécable serait repoussée puis tronquée par Word.
    for row, day in zip(table.rows[1:], days):
        date_paragraph = row.cells[0].paragraphs[0]
        _compact_paragraph(date_paragraph)
        _style_run(date_paragraph.add_run(format_day_short(day)), font_size, bold=True, font=FONT_BODY)
        row.cells[0].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP  # visible dès le début de la ligne

        for cell, slot in zip(row.cells[1:], slots):
            in_cell = [a for a in slot.activities if a.display_start.date() == day]
            in_cell.sort(key=lambda a: a.display_start)
            _fill_activity_cell(cell, in_cell, day, font_size)

    for row in table.rows:
        for cell in row.cells:
            _set_cell_margins(cell)


def build_programme(
    event: EventInfo,
    activities: list[ActivityEntry],
    output_path: Path,
    logo_path: Path | None = None,
    explicit_slots: list[Slot] | None = None,
) -> dict:
    """Génère le document et retourne quelques statistiques (jours, créneaux, activités)."""
    document = Document()
    _configure_page(document)
    section = document.sections[0]
    content_width_cm = (section.page_width - section.left_margin - section.right_margin) / Cm(1)

    days = compute_days(event, activities)
    slots = compute_slots(activities, explicit_slots)

    _add_heading_block(document, event, logo_path, content_width_cm)
    if slots:
        _add_programme_grid(document, days, slots, content_width_cm)
    else:
        empty = document.add_paragraph()
        _compact_paragraph(empty)
        _style_run(empty.add_run("Aucune activité à afficher pour cet événement."), 11, font=FONT_BODY)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    document.save(str(output_path))
    return {"days": len(days), "slots": len(slots), "activities": len(activities)}
