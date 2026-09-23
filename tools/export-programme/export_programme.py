#!/usr/bin/env python3
"""Export local du programme d'un événement au format Word (paysage).

Deux sources de données possibles :
  1. Supabase directement (identifiants lus dans .env.local) ; ajouter --login
     pour voir les activités en attente, masquées aux anonymes par la RLS :
       python export_programme.py --event "CdP 30" --login
  2. Le fichier JSON téléchargé depuis /admin (bouton « Programme Word ») :
       python export_programme.py --json ~/Téléchargements/programme_CdP30.json

Le document est écrit dans tools/export-programme/output/ par défaut.
"""

from __future__ import annotations

import argparse
import getpass
import json
import os
import re
import sys
from pathlib import Path

from programme_docx import (
    build_programme,
    normalize_activities,
    normalize_event,
    parse_explicit_slots,
)
from supabase_client import DEFAULT_STATUSES, PUBLIC_STATUSES, SupabaseRest, load_env

TOOL_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = TOOL_DIR.parent.parent
DEFAULT_LOGO = TOOL_DIR / "assets" / "logo_ifdd_oif.png"
DEFAULT_OUTPUT_DIR = TOOL_DIR / "output"


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Génère le programme Word (paysage) des activités d'un événement.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--event", "-e", help="Identifiant (UUID) ou acronyme de l'événement")
    source.add_argument("--json", "-j", type=Path, help="Fichier JSON exporté depuis l'interface admin")
    source.add_argument("--list-events", action="store_true", help="Lister les événements et quitter")

    parser.add_argument("--output", "-o", type=Path, help="Chemin du fichier .docx à produire")
    parser.add_argument(
        "--statuses",
        default=",".join(DEFAULT_STATUSES),
        help="Statuts de validation à inclure, séparés par des virgules "
             "(défaut : tous sauf draft ; « all » pour tous, « public » pour approved,live,completed)",
    )
    parser.add_argument("--tz", help="Fuseau horaire d'affichage (défaut : celui de l'événement)")
    parser.add_argument(
        "--slots",
        help="Créneaux fixes des colonnes, ex. « 08:00-09:00,09:15-10:15 » "
             "(défaut : déduits des heures de début)",
    )
    parser.add_argument("--logo", type=Path, default=DEFAULT_LOGO, help="Image du logo (PNG)")
    parser.add_argument(
        "--login",
        action="store_true",
        help="Se connecter avec un compte (email/mot de passe) pour voir les activités non publiques",
    )
    return parser.parse_args(argv)


def safe_filename(text: str) -> str:
    cleaned = re.sub(r"[^\w\-]+", "_", text, flags=re.UNICODE).strip("_")
    return cleaned or "programme"


def resolve_statuses(spec: str) -> tuple[str, ...]:
    keyword = spec.strip().lower()
    if keyword == "all":
        return ()
    if keyword == "public":
        return PUBLIC_STATUSES
    return tuple(s.strip() for s in spec.split(",") if s.strip())


def warn_if_anonymous(client: SupabaseRest, statuses: tuple[str, ...]) -> None:
    """Sans connexion, la RLS masque les activités non publiques : prévenir l'utilisateur."""
    wants_private = not statuses or any(s not in PUBLIC_STATUSES for s in statuses)
    if wants_private and not client.is_authenticated:
        print(
            "AVERTISSEMENT : sans connexion (--login), Supabase ne renvoie que les activités "
            "approuvées / en direct / terminées. Les activités en attente ne figureront pas "
            "dans le document.",
            file=sys.stderr,
        )


def connect(args: argparse.Namespace) -> SupabaseRest:
    url, key = load_env(PROJECT_ROOT)
    client = SupabaseRest(url, key)
    email = os.getenv("EXPORT_SUPABASE_EMAIL")
    password = os.getenv("EXPORT_SUPABASE_PASSWORD")
    if args.login or (email and password):
        email = email or input("Email : ")
        password = password or getpass.getpass("Mot de passe : ")
        client.login(email, password)
        print(f"Connecté en tant que {email}")
    return client


def print_events(events: list[dict]) -> None:
    print(f"{'#':>2}  {'Année':<6}{'Acronyme':<12}{'Statut':<10}Titre")
    for index, event in enumerate(events, start=1):
        print(
            f"{index:>2}  {str(event.get('year') or ''):<6}"
            f"{(event.get('acronym') or '-'):<12}"
            f"{(event.get('event_status') or ''):<10}{event.get('title')}"
        )


def choose_event(client: SupabaseRest, identifier: str | None) -> dict:
    if identifier:
        event = client.fetch_event(identifier)
        if event is None:
            raise SystemExit(f"Aucun événement ne correspond à « {identifier} ».")
        return event

    events = client.fetch_events()
    if not events:
        raise SystemExit("Aucun événement trouvé.")
    print_events(events)
    while True:
        answer = input("Numéro de l'événement à exporter : ").strip()
        if answer.isdigit() and 1 <= int(answer) <= len(events):
            return events[int(answer) - 1]
        print("Choix invalide.")


def load_from_json(path: Path) -> tuple[dict, list[dict]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if "event" not in payload or "activities" not in payload:
        raise SystemExit("Le JSON doit contenir les clés « event » et « activities ».")
    return payload["event"], payload["activities"]


def load_from_supabase(args: argparse.Namespace) -> tuple[dict, list[dict]]:
    client = connect(args)
    if args.list_events:
        print_events(client.fetch_events())
        raise SystemExit(0)
    event = choose_event(client, args.event)
    statuses = resolve_statuses(args.statuses)
    warn_if_anonymous(client, statuses)
    activities = client.fetch_activities(event["id"], statuses)
    return event, activities


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)

    raw_event, raw_activities = load_from_json(args.json) if args.json else load_from_supabase(args)

    event = normalize_event(raw_event, args.tz)
    activities = normalize_activities(raw_activities, event.timezone)
    explicit_slots = parse_explicit_slots(args.slots) if args.slots else None

    output = args.output or DEFAULT_OUTPUT_DIR / f"Programme_{safe_filename(event.label)}.docx"
    stats = build_programme(event, activities, output, args.logo, explicit_slots)

    print(f"Événement   : {event.title} ({event.label})")
    print(f"Fuseau      : {event.timezone.key}")
    print(f"Activités   : {stats['activities']}  |  Jours : {stats['days']}  |  Créneaux : {stats['slots']}")
    print(f"Document    : {output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
