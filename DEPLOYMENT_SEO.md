# Guide SEO et Partage sur les Réseaux Sociaux

## 🎯 Solution implémentée : Pre-rendering au moment du build

Votre site utilise un système de **pre-rendering intelligent** qui génère des fichiers HTML statiques avec les **vraies données** de Supabase (titres, descriptions, images) pour chaque événement et activité.

### ✅ Comment ça fonctionne

**Au moment du build (`npm run build:seo`)** :
1. Build normal de Vite → génère `dist/`
2. Récupère TOUTES les activités et événements depuis Supabase
3. Lance un navigateur headless (Puppeteer)
4. Visite chaque page (activité/événement)
5. Attend que `@vueuse/head` génère les meta tags dynamiques avec les vraies données
6. Sauvegarde le HTML complet dans `dist/`

**Résultat** : Chaque page a son propre fichier HTML avec ses propres meta tags !

```
dist/
├── index.html                                    (page d'accueil)
├── programmations/
│   └── 2025/
│       └── 8303bbfa.../
│           └── index.html                       (événement avec SES meta tags)
├── activities/
│   └── 84ac2637.../
│       └── index.html                           (activité avec SES meta tags)
```

## 📦 Installation (À FAIRE UNE SEULE FOIS)

**Installez les dépendances** :
```bash
npm install --save-dev puppeteer serve-handler
```

**Note** : Puppeteer télécharge Chrome headless (~150 MB). L'installation peut prendre 2-3 minutes.

## 🚀 Build et déploiement

### Build avec pre-rendering (RECOMMANDÉ)
```bash
npm run build:seo
```

**Ce que fait cette commande** :
- ✅ Build Vite
- ✅ Récupère toutes les routes depuis Supabase (événements + activités)
- ✅ Pré-rend chaque page avec Puppeteer
- ✅ Génère les fichiers HTML avec les **vraies données**

**Durée** : 3-7 minutes (build 1-2 min + pre-rendering 2-5 min)

### Build normal (sans pre-rendering)
```bash
npm run build
```

Utilisez ceci seulement si vous ne voulez PAS les meta tags dynamiques.

### Déployer
```bash
npm run deploy
```

Cette commande fait automatiquement :
1. `npm run build:seo` (build + pre-rendering)
2. `firebase deploy` (déploiement)

## 📊 Résultat final

### ✅ Pour les réseaux sociaux (Facebook, WhatsApp, LinkedIn, Twitter)

Chaque page partagée affichera **SES PROPRES** meta tags :

**Page d'accueil** :
- Titre : "e-Pavillon Climatique de la Francophonie - IFDD"
- Image : Bannière par défaut
- Description : Description générique

**Page d'événement** (ex: `/programmations/2025/8303bbfa...`) :
- Titre : **Nom réel de l'événement**
- Image : **Image de couverture de l'événement**
- Description : **Description de l'événement**

**Page d'activité** (ex: `/activities/84ac2637...`) :
- Titre : **Nom réel de l'activité**
- Image : **Poster de l'activité**
- Description : **Description de l'activité**

### ✅ Pour Google et moteurs de recherche

Fonctionne parfaitement ! Google exécute JavaScript ET voit aussi le HTML pré-rendu.

## 🧪 Tests après déploiement

### 1. Vérifier qu'un fichier HTML a été généré

Après le pre-rendering, vérifiez :
```bash
ls dist/activities/84ac2637-817d-4e7e-a256-ea2902efaed0/
```

Vous devriez voir un fichier `index.html`.

### 2. Vérifier les meta tags dans le fichier

```bash
cat dist/activities/84ac2637-817d-4e7e-a256-ea2902efaed0/index.html | grep "og:title"
```

Vous devriez voir le **titre réel de l'activité**, pas le titre par défaut.

### 3. Facebook Debugger

1. Allez sur : https://developers.facebook.com/tools/debug/
2. Collez votre URL : `https://epavillonclimatique.francophonie.org/activities/84ac2637-817d-4e7e-a256-ea2902efaed0`
3. Cliquez "Scrape Again"
4. ✅ Vous devriez voir le **titre, l'image et la description spécifiques** de l'activité !

### 4. LinkedIn Post Inspector

https://www.linkedin.com/post-inspector/

### 5. Twitter Card Validator

https://cards-dev.twitter.com/validator

### 6. WhatsApp

Partagez simplement un lien dans une conversation. L'aperçu affichera les bonnes données !

## ⚠️ Quand rebuild ?

Vous devez reconstruire (`npm run build:seo`) et redéployer quand :

- ✅ Nouvel événement créé
- ✅ Nouvelle activité créée
- ✅ Modification d'un titre/description d'événement ou activité
- ✅ Changement d'image de couverture
- ❌ Commentaire ajouté (pas besoin)
- ❌ Inscription à un événement (pas besoin)

## 🔧 Scripts disponibles

```bash
# Générer la liste des routes depuis Supabase
npm run generate:routes

# Build normal (sans pre-rendering)
npm run build

# Build avec pre-rendering (RECOMMANDÉ)
npm run build:seo

# Pre-rendering seulement (après un build)
npm run prerender

# Vérifier les meta tags
npm run verify:seo

# Déployer (build:seo + firebase deploy)
npm run deploy
```

## 🐛 Dépannage

### Erreur : "Puppeteer not found"
```bash
npm install --save-dev puppeteer serve-handler
```

### Le pre-rendering est très lent
- **Normal** : 2-5 minutes pour ~50 pages
- Puppeteer lance un vrai navigateur Chrome pour chaque page

### Erreur "Port 3000 already in use"
Arrêtez le processus :
```bash
pkill -f "node.*3000"
```

### Les meta tags ne s'affichent pas après déploiement
1. Vérifiez que le fichier HTML existe bien sur le serveur
2. Videz le cache de votre navigateur
3. Videz le cache des réseaux sociaux (Facebook Debugger)

## 💡 Pour changer l'image ou le titre par défaut de la page d'accueil

1. Ouvrez [index.html](index.html:8-34)
2. Modifiez les meta tags :
   ```html
   <meta property="og:title" content="Votre nouveau titre">
   <meta property="og:image" content="https://epavillonclimatique.francophonie.org/images/votre-image.jpg">
   <meta property="og:description" content="Votre nouvelle description">
   ```
3. Rebuild et redéployez :
   ```bash
   npm run build:seo
   npm run deploy
   ```

## ✅ Avantages de cette solution

- ✅ **Meta tags dynamiques** : Chaque page a ses propres meta tags
- ✅ **Partage social parfait** : Image, titre, description spécifiques sur tous les réseaux
- ✅ **SEO optimal** : Google et les crawlers voient le contenu complet
- ✅ **Pas de serveur requis** : Fonctionne avec n'importe quel hébergement statique
- ✅ **Gratuit** : Pas de service externe payant

## ⚠️ Limites

- ⚠️ **Rebuild requis** : Vous devez reconstruire et redéployer à chaque nouveau contenu
- ⚠️ **Temps de build** : Ajoute 2-5 minutes au processus de build
- ⚠️ **Contenu statique** : Le HTML est généré au moment du build, pas en temps réel

---

**Dernière mise à jour :** 2025-01-09
