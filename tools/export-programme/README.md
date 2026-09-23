# Export du programme au format Word (paysage)

Génère, **en local**, le programme des activités d'un événement au format du
modèle `Programme_CdP29.docx` : page A4 paysage, logo IFDD / OIF, grille
« un jour par ligne, un créneau horaire par colonne ».

Dans chaque cellule, pour chaque activité :

1. l'heure **proposée** par l'organisation : surlignée en vert tant qu'aucune heure
   n'est retenue (phase d'analyse), surlignée en rouge et barrée dès qu'une heure
   retenue la remplace ;
2. `Organisation - Pays :` en gras ;
3. le titre de l'activité ;
4. l'heure **retenue**, surlignée en vert, si elle existe.

Le document sert à l'analyse des administrateurs : **tous les statuts sauf brouillon**
sont exportés par défaut (option `--statuses` pour restreindre).

L'activité est placée dans la case du jour et du créneau de son heure retenue
(ou de son heure proposée si rien n'est confirmé). Si le jour proposé diffère
du jour retenu, la ligne rouge est préfixée du jour proposé, ex. `(12 nov.) 10h00 - 11h00`.

L'hébergement (Apache statique / Firebase) ne peut pas produire de `.docx` :
cet outil s'exécute donc sur un poste de travail.

## Installation (une seule fois)

```bash
tools/export-programme/setup.sh
```

Le script crée `tools/export-programme/.venv` (ignoré par git) et installe
`python-docx`, `requests` et `python-dotenv` (voir `requirements.txt`).
Python 3.11 ou plus récent est requis (module `zoneinfo`).

## Utilisation

### 1. Depuis l'interface admin (événement sélectionné dans la barre)

Dans `/admin`, le bouton **Programme Word** à côté du sélecteur d'événement
télécharge `programme_<acronyme>.json` avec les activités de l'événement
sélectionné (tous les statuts sauf brouillon, avec les droits de l'administrateur
connecté). C'est la voie recommandée : aucune connexion à saisir côté Python. Puis :

```bash
npm run export:programme -- --json ~/Downloads/programme_CdP_30.json
```

### 2. Directement depuis Supabase

Les identifiants sont lus dans `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

```bash
npm run export:programme -- --list-events          # liste les événements
npm run export:programme -- --event "CdP 30"       # par acronyme, titre ou UUID
npm run export:programme                            # choix interactif
```

Sans connexion, ces commandes utilisent la clé anon : la politique RLS de Supabase
ne renvoie alors que les activités publiques (`approved`, `live`, `completed`) et le
script affiche un avertissement. Pour un événement en cours d'analyse, dont les
activités sont encore en attente, il faut se connecter (section suivante).

### 3. Se connecter avec un compte administrateur (activités en attente)

L'option `--login` authentifie le script auprès de Supabase avec un compte
utilisateur de la plateforme (email et mot de passe, comme sur le site). Les
requêtes portent alors les droits de ce compte : un administrateur ou un
révisionniste voit les activités `submitted`, `under_review`, etc.

```bash
npm run export:programme -- --event CdP31 --login
```

Le script demande l'email puis le mot de passe (saisie masquée) :

```text
Email : admin@exemple.org
Mot de passe :
Connecté en tant que admin@exemple.org
Événement   : 31e conférence des Nations Unies sur le climat (CdP31)
Fuseau      : Europe/Istanbul
Activités   : 118  |  Jours : 12  |  Créneaux : 9
Document    : tools/export-programme/output/Programme_CdP31.docx
```

Pour éviter la saisie à chaque export, définir les identifiants dans
l'environnement du terminal ; la connexion est alors automatique, sans `--login` :

```bash
export EXPORT_SUPABASE_EMAIL="admin@exemple.org"
export EXPORT_SUPABASE_PASSWORD="motdepasse"
npm run export:programme -- --event CdP31
```

Ne pas écrire ces identifiants dans `.env.local` : ce fichier est lu par Vite et
ses variables préfixées `VITE_` finissent dans le bundle du site. Les variables
`EXPORT_*` ne sont pas préfixées et ne seraient pas exposées, mais un mot de passe
n'a pas sa place dans un fichier du projet.

Autre possibilité : définir `SUPABASE_SERVICE_ROLE_KEY` dans l'environnement. La
clé service contourne la RLS et voit toutes les activités sans connexion. À réserver
à un poste de confiance, jamais dans un fichier versionné.

La connexion n'est pas nécessaire avec la voie 1 (JSON téléchargé depuis `/admin`),
puisque le navigateur applique déjà les droits de l'administrateur connecté.

### Options

| Option | Rôle |
| --- | --- |
| `--output chemin.docx` | Fichier produit (défaut : `tools/export-programme/output/Programme_<acronyme>.docx`) |
| `--tz Europe/Paris` | Fuseau horaire d'affichage (défaut : celui de l'événement) |
| `--slots "08:00-09:00,09:15-10:15,…"` | Colonnes fixes ; par défaut elles sont déduites des heures de début retenues (deux débuts distants d'au plus 30 min forment une même colonne) |
| `--login` | Se connecter avec un compte de la plateforme (email / mot de passe demandés) pour voir les activités en attente ; automatique si `EXPORT_SUPABASE_EMAIL` et `EXPORT_SUPABASE_PASSWORD` sont définis |
| `--statuses approved,live` | Statuts inclus lors de la lecture Supabase (défaut : tous sauf `draft` ; `public` pour approved,live,completed ; `all` pour tous) |
| `--logo image.png` | Logo à afficher en haut à droite (défaut : `assets/logo_ifdd_oif.png`) |

## Structure

| Fichier | Rôle |
| --- | --- |
| `export_programme.py` | Ligne de commande (choix de la source, options, écriture du fichier) |
| `supabase_client.py` | Lecture REST Supabase (événements, activités, connexion optionnelle) |
| `programme_docx.py` | Normalisation des données et construction du document Word |
| `assets/logo_ifdd_oif.png` | Logo extrait du modèle `Programme_CdP29.docx` |

Le composable `src/composables/useProgrammeExport.js` produit le JSON avec les
mêmes sélections que `supabase_client.py` : toute évolution des champs doit être
faite des deux côtés.
