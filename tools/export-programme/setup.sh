#!/usr/bin/env bash
# Crée l'environnement virtuel Python de l'outil d'export du programme
# et installe les dépendances (python-docx, requests, python-dotenv).
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$DIR/.venv"

if [ ! -d "$VENV" ]; then
  echo "Création de l'environnement virtuel dans $VENV"
  python3 -m venv "$VENV"
fi

"$VENV/bin/pip" install --quiet --upgrade pip
"$VENV/bin/pip" install --quiet -r "$DIR/requirements.txt"

echo "Environnement prêt. Exemple :"
echo "  $VENV/bin/python $DIR/export_programme.py --list-events"
