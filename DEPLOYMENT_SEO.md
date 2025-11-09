# Guide SEO et Partage sur les Réseaux Sociaux

## 📊 État actuel

Votre site utilise des **meta tags statiques** définis dans [index.html](index.html). Ces meta tags sont les mêmes pour toutes les pages.

### ✅ Ce qui fonctionne

Lorsque vous partagez votre site sur les réseaux sociaux (Facebook, WhatsApp, LinkedIn, Twitter), l'aperçu affichera :

- **Titre** : e-Pavillon Climatique de la Francophonie - IFDD
- **Image** : https://epavillonclimatique.francophonie.org/images/example/event_banniere_par_defaut_32_9_v3.jpg
- **Description** : Plateforme de l'Institut de la Francophonie pour le développement durable (IFDD) dédiée aux événements climatiques et de développement durable dans l'espace francophone.

### 📍 Meta tags configurés

Les meta tags sont définis dans [index.html](index.html:8-34) :

```html
<!-- Meta tags par défaut -->
<title>e-Pavillon Climatique de la Francophonie - IFDD</title>
<meta name="description" content="...">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://epavillonclimatique.francophonie.org/">
<meta property="og:title" content="e-Pavillon Climatique de la Francophonie - IFDD">
<meta property="og:description" content="...">
<meta property="og:image" content="https://epavillonclimatique.francophonie.org/images/example/event_banniere_par_defaut_32_9_v3.jpg">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="e-Pavillon Climatique de la Francophonie - IFDD">
<meta name="twitter:image" content="https://epavillonclimatique.francophonie.org/images/example/event_banniere_par_defaut_32_9_v3.jpg">
```

## 🚀 Déploiement

### 1. Build du projet
```bash
npm run build
```

### 2. Vérification SEO (optionnel)
```bash
npm run verify:seo
```

Cette commande vérifie que :
- ✅ Les meta tags Open Graph sont présents
- ✅ Les meta tags Twitter Card sont présents
- ✅ L'image par défaut existe

### 3. Déployer

Déployez le contenu du dossier `dist/` sur votre hébergement.

## 🧪 Tests après déploiement

### Facebook Sharing Debugger
1. Allez sur : https://developers.facebook.com/tools/debug/
2. Collez votre URL : `https://epavillonclimatique.francophonie.org/`
3. Cliquez sur "Scrape Again"
4. Vérifiez que l'image et le titre s'affichent

### LinkedIn Post Inspector
1. Allez sur : https://www.linkedin.com/post-inspector/
2. Collez votre URL
3. Vérifiez l'aperçu

### Twitter Card Validator
1. Allez sur : https://cards-dev.twitter.com/validator
2. Collez votre URL
3. Vérifiez l'aperçu

### WhatsApp
Partagez simplement un lien dans une conversation et vérifiez l'aperçu.

## 💡 Pour changer l'image ou le titre par défaut

Si vous voulez modifier l'image, le titre ou la description affichés lors du partage :

1. Ouvrez [index.html](index.html)
2. Modifiez les valeurs des meta tags :
   - `og:title` pour le titre
   - `og:description` pour la description
   - `og:image` pour l'image
   - `twitter:title`, `twitter:description`, `twitter:image` pour Twitter

3. Changez aussi l'URL de l'image si vous voulez utiliser une autre image par défaut :
   ```html
   <meta property="og:image" content="https://epavillonclimatique.francophonie.org/images/votre-nouvelle-image.jpg">
   ```

4. Rebuild et redéployez :
   ```bash
   npm run build
   # Puis déployez le dossier dist/
   ```

5. Videz le cache Facebook :
   - https://developers.facebook.com/tools/debug/
   - Cliquez "Scrape Again"

## 📝 Notes importantes

### Pour les moteurs de recherche (Google, Bing, etc.)
- ✅ **Fonctionne parfaitement** : Les moteurs de recherche modernes exécutent JavaScript
- ✅ Google verra les meta tags dynamiques générés par Vue.js avec `@vueuse/head`
- ✅ Le SEO de votre site est optimal pour Google

### Pour les réseaux sociaux (Facebook, WhatsApp, LinkedIn, Twitter)
- ⚠️ **Meta tags statiques uniquement** : Les crawlers ne peuvent pas exécuter JavaScript
- ⚠️ Toutes les pages partagent les mêmes meta tags par défaut
- ✅ L'aperçu affichera toujours l'image, le titre et la description définis dans `index.html`

### Pourquoi cette limitation ?

Les crawlers des réseaux sociaux (Facebook Bot, WhatsApp Bot, etc.) sont des robots simples qui :
- ✅ Lisent le HTML statique
- ❌ N'exécutent PAS JavaScript
- ❌ Ne voient PAS les meta tags générés dynamiquement par Vue.js

C'est une limitation technique de tous les frameworks SPA (Single Page Applications) comme Vue.js, React, Angular.

## ✅ Résultat final

Votre site est :
- ✅ **Partageable** sur tous les réseaux sociaux avec image et titre
- ✅ **Optimisé SEO** pour Google et autres moteurs de recherche
- ✅ **Performant** avec un build optimisé
- ✅ **Fonctionnel** avec une bonne expérience utilisateur

**Note** : Toutes les pages partagent les mêmes meta tags lors du partage sur les réseaux sociaux. C'est normal et attendu avec cette configuration.

---

**Dernière mise à jour :** 2025-01-08
