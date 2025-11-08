# Guide de déploiement pour le SEO et le partage sur les réseaux sociaux

## 🎯 Problème résolu

Les meta tags dynamiques ajoutés avec `@vueuse/head` ne sont pas visibles par les crawlers des réseaux sociaux (Facebook, WhatsApp, LinkedIn, Twitter) car ils ne peuvent pas exécuter JavaScript.

## ✅ Solutions mises en place

### 1. Meta tags par défaut dans index.html
- Les meta tags Open Graph et Twitter Card sont maintenant présents dans le HTML statique
- Ces tags seront visibles par tous les crawlers
- Les tags seront mis à jour dynamiquement côté client par Vue.js pour une meilleure UX

### 2. URLs absolues pour les images
- Toutes les images utilisent maintenant des URLs absolues avec le domaine complet
- Format : `https://epavillonclimatique.francophonie.org/images/...`

## 📋 Étapes de déploiement

### 1. Reconstruire le projet
```bash
npm run build
```

### 2. Déployer sur Firebase
```bash
firebase deploy
```

### 3. Vider le cache des réseaux sociaux

#### Facebook Sharing Debugger
1. Allez sur : https://developers.facebook.com/tools/debug/
2. Collez l'URL de votre page d'accueil : `https://epavillonclimatique.francophonie.org/`
3. Cliquez sur "Scrape Again"
4. Vérifiez que l'image et le titre s'affichent correctement

#### LinkedIn Post Inspector
1. Allez sur : https://www.linkedin.com/post-inspector/
2. Collez votre URL
3. Vérifiez l'aperçu

#### Twitter Card Validator
1. Allez sur : https://cards-dev.twitter.com/validator
2. Collez votre URL
3. Vérifiez l'aperçu

### 4. Tester le partage
- Partagez un lien sur WhatsApp
- Partagez un lien sur Facebook
- Partagez un lien sur LinkedIn
- Partagez un lien sur Twitter

L'aperçu devrait maintenant afficher :
- ✅ Image de bannière
- ✅ Titre du site
- ✅ Description

## 🔄 Pour les pages dynamiques (événements/activités)

**Limitation actuelle :**
Les pages spécifiques d'événements et d'activités utilisent encore les meta tags par défaut de index.html lors du partage. Pour résoudre ce problème, vous avez **3 options** :

### Option 1 : Service de Pre-rendering (Recommandé - Gratuit)

**Prerender.io** (Gratuit jusqu'à 250 pages/mois)

1. Créez un compte sur https://prerender.io
2. Ajoutez votre site : `https://epavillonclimatique.francophonie.org`
3. Ajoutez ce middleware à votre `firebase.json` :

```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "function": "prerenderMiddleware"
      }
    ]
  }
}
```

4. Créez une Cloud Function pour Prerender.io :

```javascript
// functions/index.js
const functions = require('firebase-functions');
const prerender = require('prerender-node');

exports.prerenderMiddleware = functions.https.onRequest((req, res) => {
  prerender.set('prerenderToken', 'VOTRE_TOKEN_PRERENDER');
  return prerender(req, res);
});
```

### Option 2 : Migration vers Nuxt.js (SSR complet)

Pour un SEO parfait avec tous les meta tags dynamiques :
- Migrer vers **Nuxt.js 3** qui offre le Server-Side Rendering
- Toutes les pages seront pré-rendues avec leurs meta tags spécifiques
- Meilleur pour le SEO à long terme

### Option 3 : Solution minimale actuelle (Déjà en place)

**Avantages :**
- ✅ Page d'accueil : Meta tags fonctionnent parfaitement
- ✅ Partage de liens : Image et titre génériques s'affichent
- ✅ SEO Google : Fonctionne car Google exécute JavaScript

**Limitations :**
- ⚠️ Pages spécifiques : Utilisent les meta tags par défaut
- ⚠️ Partage de pages spécifiques : Pas d'image/titre personnalisé

## 📊 Vérification après déploiement

### Test 1 : Page d'accueil
```
URL: https://epavillonclimatique.francophonie.org/
Attendu:
- Titre : "e-Pavillon Climatique de la Francophonie - IFDD"
- Image : Bannière par défaut visible
- Description : Texte sur l'IFDD
```

### Test 2 : Facebook Debugger
```
Résultat attendu :
- og:image doit afficher l'image
- og:title doit afficher le titre
- og:description doit afficher la description
```

### Test 3 : Partage WhatsApp
```
Résultat attendu :
- Aperçu du lien avec image
- Titre visible
- Description visible
```

## 🚀 Recommandation

**Pour un site de production avec beaucoup de pages dynamiques**, je recommande fortement **Option 1 (Prerender.io)** :
- Gratuit jusqu'à 250 pages/mois
- Configuration rapide (30 minutes)
- Tous les meta tags dynamiques fonctionneront
- Compatible avec votre infrastructure Firebase actuelle

## 📞 Support

Si vous avez des questions ou des problèmes :
1. Vérifiez que le build est complet : `npm run build`
2. Vérifiez que les images existent dans `/dist/images/`
3. Utilisez les debuggers Facebook/LinkedIn pour diagnostiquer
4. Vérifiez les headers HTTP avec : `curl -I https://epavillonclimatique.francophonie.org/`

## ✨ Résultat final

Après le déploiement, votre site sera :
- ✅ **Partageable** sur tous les réseaux sociaux avec image et titre
- ✅ **Optimisé SEO** pour Google et autres moteurs de recherche
- ✅ **Performant** avec cache et compression
- ✅ **Sécurisé** avec headers de sécurité HTTP

---

**Dernière mise à jour :** $(date +%Y-%m-%d)
