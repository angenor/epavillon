"""Accès en lecture à Supabase (API REST PostgREST) pour l'export du programme.

Les identifiants sont lus dans `.env.local` (puis `.env`) à la racine du projet :
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Avec la clé anon, la politique RLS ne rend visibles que les activités publiques
(approved / live / completed). Pour voir les activités en attente, se connecter
avec un compte administrateur (`login`) ou fournir SUPABASE_SERVICE_ROLE_KEY.
"""

from __future__ import annotations

import os
from pathlib import Path

import requests
from dotenv import load_dotenv

EVENT_SELECT = (
    "id,title,acronym,year,city,timezone,event_status,participation_mode,"
    "in_person_start_date,in_person_end_date,online_start_datetime,online_end_datetime,"
    "country:countries(name_fr)"
)

ACTIVITY_SELECT = (
    "id,title,validation_status,"
    "proposed_start_date,proposed_end_date,final_start_date,final_end_date,"
    "organization:organizations(name,acronym,country:countries(name_fr)),"
    "country:countries(name_fr)"
)

PUBLIC_STATUSES = ("approved", "live", "completed")
# Statuts exportés par défaut pour l'analyse des administrateurs : tout sauf les brouillons
DEFAULT_STATUSES = ("submitted", "under_review", "approved", "live", "completed", "rejected", "cancelled")


class SupabaseConfigError(RuntimeError):
    """Variables d'environnement Supabase manquantes."""


def load_env(project_root: Path) -> tuple[str, str]:
    """Charge `.env.local` puis `.env` et retourne (url, clé)."""
    for name in (".env.local", ".env"):
        env_file = project_root / name
        if env_file.exists():
            load_dotenv(env_file, override=False)

    url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("VITE_SUPABASE_ANON_KEY")
        or os.getenv("SUPABASE_ANON_KEY")
    )
    if not url or not key:
        raise SupabaseConfigError(
            "VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définis "
            f"dans {project_root / '.env.local'}"
        )
    return url.rstrip("/"), key


class SupabaseRest:
    """Client REST minimal (lecture seule) pour PostgREST."""

    def __init__(self, url: str, api_key: str, timeout: int = 30):
        self.url = url
        self.api_key = api_key
        self.access_token = api_key
        self.timeout = timeout

    @property
    def is_authenticated(self) -> bool:
        """Vrai après `login` ou avec une clé service (droits au-delà de la lecture publique)."""
        return self.access_token != self.api_key or bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

    # ------------------------------------------------------------------ auth
    def login(self, email: str, password: str) -> None:
        """Authentifie un utilisateur (email / mot de passe) pour appliquer ses droits RLS."""
        response = requests.post(
            f"{self.url}/auth/v1/token",
            params={"grant_type": "password"},
            headers={"apikey": self.api_key, "Content-Type": "application/json"},
            json={"email": email, "password": password},
            timeout=self.timeout,
        )
        if response.status_code != 200:
            raise RuntimeError(f"Connexion refusée ({response.status_code}) : {response.text}")
        self.access_token = response.json()["access_token"]

    # --------------------------------------------------------------- requêtes
    def _headers(self) -> dict[str, str]:
        return {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/json",
        }

    def select(self, table: str, params: dict[str, str]) -> list[dict]:
        response = requests.get(
            f"{self.url}/rest/v1/{table}",
            headers=self._headers(),
            params=params,
            timeout=self.timeout,
        )
        if response.status_code >= 400:
            raise RuntimeError(
                f"Erreur Supabase sur {table} ({response.status_code}) : {response.text}"
            )
        return response.json()

    # ------------------------------------------------------------- métier
    def fetch_events(self) -> list[dict]:
        return self.select(
            "events",
            {"select": EVENT_SELECT, "order": "year.desc,title.asc"},
        )

    def fetch_event(self, identifier: str) -> dict | None:
        """Retrouve un événement par id, sinon par acronyme (insensible à la casse / espaces)."""
        events = self.fetch_events()
        for event in events:
            if event["id"] == identifier:
                return event
        wanted = _normalize(identifier)
        for event in events:
            if _normalize(event.get("acronym")) == wanted or _normalize(event.get("title")) == wanted:
                return event
        return None

    def fetch_activities(self, event_id: str, statuses: tuple[str, ...] = DEFAULT_STATUSES) -> list[dict]:
        params = {
            "select": ACTIVITY_SELECT,
            "event_id": f"eq.{event_id}",
            "is_deleted": "eq.false",
            "order": "proposed_start_date.asc",
            "limit": "1000",
        }
        if statuses:
            params["validation_status"] = "in.(" + ",".join(statuses) + ")"
        return self.select("activities", params)


def _normalize(value: str | None) -> str:
    return "".join((value or "").lower().split())
