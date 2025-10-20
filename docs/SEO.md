# Documentation SEO - e-Pavillon Climatique

## Vue d'ensemble

Cette documentation décrit l'implémentation complète du référencement (SEO) pour les pages d'événements de l'e-Pavillon Climatique. L'objectif est d'optimiser la visibilité sur les moteurs de recherche et les réseaux sociaux.

## Fichiers implémentés

### 1. Composable SEO (`src/composables/useSEO.js`)

Composable réutilisable qui gère :
- **Meta tags dynamiques** (title, description, keywords)
- **Open Graph tags** (Facebook, LinkedIn, etc.)
- **Twitter Card tags**
- **Données structurées JSON-LD** (Schema.org)
- **URL canoniques**

#### Fonctions principales

- `useSEO(seoData)` : Hook principal pour initialiser le SEO
- `updateSEO(data)` : Met à jour dynamiquement les meta tags
- `setTitle(title)` : Définit le titre de la page
- `setMetaTag(attributes)` : Crée ou met à jour un meta tag
- `setCanonical(url)` : Définit l'URL canonique
- `setStructuredData(data)` : Ajoute les données structurées JSON-LD
- `generateEventStructuredData(event, country)` : Génère les données structurées pour un événement

### 2. Page détail événement (`src/views/events/Detail.vue`)

La page a été optimisée avec :
- Balises HTML sémantiques (`<main>`, `<article>`, `<header>`, `<section>`)
- Attributs microdata Schema.org
- Meta tags dynamiques basés sur les données de l'événement
- Images optimisées avec attributs alt descriptifs

## Optimisations SEO implémentées

### 1. Balises HTML sémantiques

```html
<main role="main">
  <article itemscope itemtype="https://schema.org/Event">
    <header role="banner">
      <h1 itemprop="name">Titre de l'événement</h1>
    </header>
    <section aria-label="Description">
      <div itemprop="description">...</div>
    </section>
  </article>
</main>
```

**Avantages :**
- Meilleure compréhension de la structure par les moteurs de recherche
- Amélioration de l'accessibilité
- Support des lecteurs d'écran

### 2. Meta tags dynamiques

#### Title
```html
<title>Titre de l'événement | e-Pavillon Climatique</title>
```

#### Description (max 160 caractères)
```html
<meta name="description" content="Description de l'événement avec ville, pays et date">
```

#### Robots
```html
<meta name="robots" content="index, follow">
<meta name="googlebot" content="index, follow">
```

### 3. Open Graph (Facebook, LinkedIn, etc.)

```html
<meta property="og:title" content="Titre de l'événement">
<meta property="og:description" content="Description...">
<meta property="og:type" content="event">
<meta property="og:url" content="https://epavillon.org/events/2024/abc123">
<meta property="og:image" content="https://...banner_16_9.jpg">
<meta property="og:image:secure_url" content="https://...banner_16_9.jpg">
<meta property="og:image:alt" content="Titre de l'événement">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="e-Pavillon Climatique - IFDD">
```

**Avantages :**
- Prévisualisations riches sur Facebook, LinkedIn, WhatsApp
- Contrôle de l'image et du texte affichés lors du partage
- Meilleure visibilité sur les réseaux sociaux

### 4. Twitter Cards

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Titre de l'événement">
<meta name="twitter:description" content="Description...">
<meta name="twitter:image" content="https://...banner_16_9.jpg">
<meta name="twitter:image:alt" content="Titre de l'événement">
```

**Avantages :**
- Cartes riches sur Twitter/X
- Affichage optimisé avec grande image

### 5. Données structurées JSON-LD (Schema.org)

Le format JSON-LD est la méthode recommandée par Google pour les données structurées.

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Titre de l'événement",
  "description": "Description sans HTML",
  "startDate": "2024-11-15T09:00:00",
  "endDate": "2024-11-17T17:00:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
  "image": "https://...banner.jpg",
  "url": "https://epavillon.org/events/2024/abc123",
  "location": {
    "@type": "Place",
    "name": "Paris",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Paris",
      "addressCountry": "France",
      "streetAddress": "123 rue Example"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "IFDD - Institut de la Francophonie pour le Développement Durable",
    "url": "https://www.ifdd.francophonie.org"
  }
}
```

**Avantages :**
- Affichage dans les résultats enrichis de Google (rich snippets)
- Éligibilité pour Google Events (recherche d'événements)
- Meilleure compréhension du contenu par les moteurs de recherche
- Possibilité d'apparaître dans Google Calendar

### 6. Microdata (attributs HTML)

En complément du JSON-LD, les attributs microdata renforcent la sémantique :

```html
<article itemscope itemtype="https://schema.org/Event">
  <h1 itemprop="name">Titre</h1>
  <img itemprop="image" src="..." alt="...">
  <time itemprop="startDate" datetime="2024-11-15">15 nov. 2024</time>
  <div itemprop="location" itemscope itemtype="https://schema.org/Place">
    <span itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
      <span itemprop="addressLocality">Paris</span>,
      <span itemprop="addressCountry">France</span>
    </span>
  </div>
  <div itemprop="description">Description de l'événement</div>
</article>
```

### 7. URL canonique

```html
<link rel="canonical" href="https://epavillon.org/events/2024/abc123">
```

**Avantages :**
- Évite les contenus dupliqués
- Indique aux moteurs de recherche quelle est l'URL principale

### 8. Images optimisées

- Format 16:9 pour les partages sociaux (1200x675 minimum recommandé)
- Attributs `alt` descriptifs
- Attribut `itemprop="image"` pour Schema.org
- Loading strategy adaptée (`eager` pour l'image principale)

## Tester le référencement

### Outils de test recommandés

#### 1. Google Search Console - Test de résultats enrichis
- URL : https://search.google.com/test/rich-results
- Teste les données structurées JSON-LD
- Vérifie l'éligibilité aux rich snippets

#### 2. Schema.org Validator
- URL : https://validator.schema.org/
- Valide les données structurées
- Affiche les erreurs et avertissements

#### 3. Facebook Sharing Debugger
- URL : https://developers.facebook.com/tools/debug/
- Teste les Open Graph tags
- Prévisualise le partage sur Facebook

#### 4. Twitter Card Validator
- URL : https://cards-dev.twitter.com/validator
- Teste les Twitter Cards
- Prévisualise le partage sur Twitter

#### 5. LinkedIn Post Inspector
- URL : https://www.linkedin.com/post-inspector/
- Teste le partage sur LinkedIn
- Rafraîchit le cache LinkedIn

#### 6. Lighthouse (Chrome DevTools)
- Appuyez sur F12 dans Chrome
- Onglet "Lighthouse"
- Exécutez un audit SEO
- Score SEO cible : 90+

### Checklist de vérification

- [ ] Le titre de la page est unique et descriptif (< 60 caractères)
- [ ] La meta description est présente (< 160 caractères)
- [ ] Les Open Graph tags sont présents et corrects
- [ ] Les Twitter Card tags sont présents
- [ ] Les données structurées JSON-LD sont valides
- [ ] L'URL canonique est définie
- [ ] Les images ont des attributs alt descriptifs
- [ ] Les balises HTML sémantiques sont utilisées
- [ ] Le contenu est structuré avec h1, h2, h3
- [ ] Le site est responsive (mobile-friendly)
- [ ] Les temps de chargement sont optimisés
- [ ] Pas d'erreurs dans la console

## Bonnes pratiques

### 1. Titres de page
- Unique pour chaque page
- 50-60 caractères maximum
- Inclure le mot-clé principal
- Format : `Titre événement | e-Pavillon Climatique`

### 2. Meta descriptions
- 150-160 caractères maximum
- Phrase d'accroche avec appel à l'action
- Inclure les mots-clés importants
- Éviter le contenu dupliqué

### 3. Images
- Taille optimale pour partage : 1200x675 (16:9)
- Poids optimisé (< 200 Ko)
- Format : JPG pour photos, PNG pour graphiques
- Attributs alt descriptifs et concis

### 4. Contenu
- Contenu unique et de qualité
- Utiliser des titres hiérarchiques (h1 → h6)
- Paragraphes courts et lisibles
- Mots-clés naturellement intégrés

### 5. Performance
- Temps de chargement < 3 secondes
- Core Web Vitals optimisés
- Images lazy-loaded (sauf hero)
- CSS et JS minifiés

## Résultats attendus

Avec cette implémentation complète, vous devriez obtenir :

1. **Meilleur positionnement Google**
   - Apparition dans les résultats enrichis
   - Éligibilité Google Events
   - Meilleur CTR (Click-Through Rate)

2. **Partages sociaux optimisés**
   - Cartes riches sur Facebook, Twitter, LinkedIn
   - Contrôle total de l'image et du texte affichés
   - Meilleure viralité

3. **Accessibilité améliorée**
   - Meilleur support des lecteurs d'écran
   - Navigation facilitée
   - Conformité RGAA/WCAG

4. **Analytique enrichie**
   - Données structurées exploitables
   - Meilleur suivi dans Google Analytics
   - Rich snippets dans les SERPs

## Maintenance

### Vérifications régulières
- Tester les pages avec Google Search Console
- Vérifier les erreurs de données structurées
- Surveiller les performances dans PageSpeed Insights
- Mettre à jour les meta tags si nécessaire

### Évolutions futures
- Ajouter les données structurées pour les activités
- Implémenter les breadcrumbs Schema.org
- Ajouter le balisage FAQ si pertinent
- Optimiser pour la recherche vocale

## Support et ressources

- Documentation Schema.org : https://schema.org/Event
- Google Search Central : https://developers.google.com/search
- Open Graph Protocol : https://ogp.me/
- Twitter Cards : https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
- Web.dev SEO : https://web.dev/lighthouse-seo/

## Annexe : Code d'exemple d'utilisation

### Dans une autre page Vue

```vue
<template>
  <main>
    <h1>{{ pageTitle }}</h1>
    <!-- Contenu de la page -->
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useSEO } from '@/composables/useSEO'

const pageTitle = ref('Ma page')
const pageDescription = ref('Description de ma page')

const seoData = computed(() => ({
  title: pageTitle.value,
  description: pageDescription.value,
  image: 'https://example.com/image.jpg',
  url: window.location.href,
  type: 'website'
}))

// Initialiser le SEO
useSEO(seoData)
</script>
```

### Pour un article de blog

```js
import { generateEventStructuredData } from '@/composables/useSEO'

// Adapter pour un article
const articleStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Titre de l\'article',
  description: 'Description de l\'article',
  image: 'https://example.com/article-image.jpg',
  datePublished: '2024-01-15',
  dateModified: '2024-01-20',
  author: {
    '@type': 'Person',
    name: 'Nom de l\'auteur'
  },
  publisher: {
    '@type': 'Organization',
    name: 'e-Pavillon Climatique - IFDD',
    logo: {
      '@type': 'ImageObject',
      url: 'https://example.com/logo.png'
    }
  }
}
```

---

**Date de création :** 2024
**Dernière mise à jour :** 2024
**Version :** 1.0
