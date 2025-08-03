# Cahier des charges - Plateforme ePavilion

## 1\. Présentation du projet

### 1.1 Contexte

Le ePavilion est une plateforme numérique initiée par l'Institut de la Francophonie pour le Développement Durable (IFDD), organe subsidiaire de l'Organisation internationale de la Francophonie (OIF). Cette plateforme vise à faciliter la coopération entre les 88 États et gouvernements membres de la Francophonie dans le domaine du développement durable.

### 1.2 Objectifs généraux

- Centraliser les activités et événements liés au développement durable dans l'espace francophone  
- Faciliter les échanges entre professionnels du développement durable  
- Renforcer les capacités des négociateurs climatiques francophones  
- Promouvoir les innovations et bonnes pratiques en matière de développement durable  
- Créer un espace de réseautage professionnel spécialisé

### 1.3 Architecture technique

Le nouveau projet sera développé avec :

- **Frontend** : Nuxt 4 avec Vue.js 3 (version web); Flutter (version mobile)  
- **Backend** : Supabase  
- **Architecture** : Clean Code pour garantir une maintenabilité à long terme
- **UI/UX** : TailwindCSS 4 avec DaisyUI pour le système de design

## 2\. Gestion des utilisateurs et des rôles

### 2.1 Types d'utilisateurs

La plateforme distingue plusieurs catégories d'utilisateurs :

#### 2.1.1 Utilisateur standard

**Informations personnelles :**

- Nom et prénom  
- Adresse email (unique)  
- Organisation d'appartenance  
- Adresse physique
- Téléphone (optionnel)  
- Biographie professionnelle (optionnel)  
- Photo de profil (haute définition et miniature)  
- Pays de résidence (référencé dans table countries)
- Statut de vérification organisationnelle (validé par l'administrateur)
- Statut de blocage/suspension (avec raison et durée)

**Paramètres utilisateur :**

- Mode d'affichage (sombre/clair)  
- Préférences de notifications  
- Alertes pour les évènements en directes (activées par défaut)  
- Visibilité du profil pour le réseautage

#### 2.1.2 Point focal UNFCCC

Utilisateur ayant des responsabilités spéciales :

- Validation par l'administrateur requise  
- Capacité à désigner des négociateurs pour chaque année  
- Accès aux espaces de concertation spécialisés

#### 2.1.3 Négociateur/Négociatrice

Utilisateur spécialisé dans les négociations climatiques :

- Désignation annuelle par le point focal UNFCCC ou un administrateur  
- Historique des désignations  
- Nombre total de désignations  
- Thématiques de spécialisation suivies  
- Liste des COP auxquelles il/elle a participé  
- Historique des concertations (titre, dates, ville, pays)  
- Accès aux formations spécialisées

#### 2.1.4 Formateur

Profil spécialisé pour l'animation des sessions de formation

### 2.2 Rôles d'administration

- **Administrateur** : Gestion courante de la plateforme  
- **Super administrateur** : Toutes les permissions et tous les roles, validation finale des activités

## 3\. Gestion des organisations

### 3.1 Informations organisationnelles

- Dénomination officielle  
- Adresse email institutionnelle (à valider par email)  
- Statut organisationnel (Institution publique nationale, Organisation internationale, Organisation régionale, ONG/Association, Secteur privé)  
- Logo officiel  
- Site web (optionnel)  
- Pays de siège (référencé dans table countries)
- Description des activités
- Détection automatique des doublons (basée sur le nom normalisé)

### 3.2 Fonctionnalités

- Recherche d'organisations existantes  
- Création de nouvelles organisations avec vérification anti-doublons
- Validation par les utilisateurs existants de la même organisation  
- Affichage public des organisations ayant des activités validées
- Marquage automatique des organisations potentiellement en doublon

## 4\. Gestion des événements annuels

### 4.1 Structure des événements

Chaque année, l'IFDD lance des appels à propositions d'événements thématiques.

**Propriétés d'un événement :**

- Titre de l'événement  
- Description détaillée (avec formatage enrichi)  
- Dates limites de soumission des activités  
- Statut de l'événement (À venir, En cours, Terminé, Suspendu)  
- Statut des soumissions (Ouvertes, Fermées)  
- Visuels promotionnels (bannières en formats 32:9, 16:9, 1:1)  
- Modalités de participation :  
  - **En ligne** : dates et heures de début/fin  
  - **Hybride** : dates et heures de début/fin  
  - **Présentiel** : lieu et dates

### 4.2 Soumission d'activités

Les utilisateurs peuvent soumettre des activités au nom de leur organisation. L’utilisateur peut sauvegarder l'état du formulaire déjà rempli pour poursuivre plus tard s’il n’a pas toutes les informations immédiatement.

**Informations requises :**

- Titre de l'activité  
- Pays d'origine (référencé dans table countries)
- Type d'activité  
- Objectifs poursuivis  
- Présentation détaillée  
- Format (en ligne, présentiel, hybride)  
- Thématiques principales (plusieurs possibles, stockées en tableau) : Atténuation, Adaptation, Résilience climatique, Pertes et préjudices, Innovations/Technologies propres, Terres et énergies renouvelables, Santé et solidarité, Industrie et transition, Transport et urbanisation, Nature et océans, Agriculture et alimentation, Élevage durable, Genre, Jeunesse, Technologies, Finance, Autre
- Catégories (plusieurs possibles, stockées en tableau) : Renforcement des capacités, Partage de résultats, Innovation technologique, Projet de terrain, Bonnes pratiques, Sensibilisation, Concertation
- Tags libres (stockés en tableau)
- Dates proposées (début et fin)  
- Dates définitives (fixées par l'administration)  
- Statut de validation  
- Visuels (image de couverture, bannière)  
- Liste des intervenants (maximum 10) : civilité, nom, prénom, email, fonction, organisation, disponibilité pour questions
- Documents supports
- Lien avec réunion Zoom (table dédiée)
- Support du soft delete (suppression avec restauration possible)

### 4.3 Processus de validation

1. Soumission par l'utilisateur  
2. Examen par l'administration  
3. Validation/rejet par le super administrateur  
4. Intégration automatique dans la programmation annuelle si validé  
5. Génération automatique des outils de diffusion (Zoom, YouTube Live)
6. Historique complet des modifications (avec type de données flexible JSONB)
7. Système d'inscription des participants avec liens personnalisés

### 4.4 Interactions pendant les activités

- Questions en temps réel des participants aux intervenants
- Modération des questions (visible/invisible, activée/désactivée)
- Désactivation possible par l'auteur ou administrateur avec justification
- Réponses des intervenants aux questions ciblées

## 5\. Espace de négociation climatique

### 5.1 Sessions officielles de négociations

Réservé aux utilisateurs ayant le rôle de négociateur.

#### 5.1.1 Sessions organisées par l'IFDD

- Titre de la session  
- Description (optionnel)  
- Dates et heures de début/fin  
- Lieu de la session  
- Catégorie (Climat, Biodiversité, Désertification)  
- Système d'inscription intégré  
- Génération automatique des liens Zoom  
- Gestion des documents supports  
- Liste des participants inscrits

#### 5.1.2 Sessions externes

- Titre de la session  
- Dates et heures  
- Lieu ou plateforme  
- Catégorie thématique  
- Lien vers le site officiel  
- Documents de référence

### 5.2 Documents d'aide à la négociation

- Titre du document  
- Type (Guide des négociations, Notes techniques, Documents pertinents)  
- Catégorie thématique  
- Description sommaire  
- Image de couverture  
- Fichier téléchargeable

### 5.3 Réunions de la Francophonie

- Organisation similaire aux sessions officielles  
- Focus sur la coordination francophone  
- Préparation aux grandes négociations internationales

## 6\. Système de réseautage professionnel

### 6.1 Annuaire des professionnels

- Liste des utilisateurs ayant accepté la visibilité publique  
- Filtres de recherche par organisation, pays, thématique  
- Consultation des profils détaillés  
- possibilité d’envoyer des demande de connexion(si le correspondant accepte, alors on peut lui envoyer des messages instantanée)  
- On peut bloquer ou signaler un individu avec justification facultatif

### 6.2 Système de connexions

- Demandes de connexion entre utilisateurs  
- Gestion des listes d'amis/contacts  
- Messagerie instantanée intégrée  
- Système de notifications en temps réel

### 6.3 Prise de rendez-vous

- Demandes de rendez-vous (vidéo, audio, présentiel)  
- Intégration d'outils de visioconférence (PeerJS)  
- Calendrier partagé  
- Notifications de rappel

## 7\. Partage d'innovations et bonnes pratiques

### 7.1 Soumission de contenus

Les utilisateurs peuvent partager au nom de leur organisation :

**Informations requises :**

- Titre de l'innovation/pratique  
- Catégorie (Innovation, Bonne pratique)  
- Images de couverture (haute et basse résolution, formats 16:9 et 1:1)  
- Vidéo de présentation YouTube  
- Vidéo courte de 10 secondes (aperçu)  
- Secteur d'application (agriculture, élevage, industrie, autre)  
- Description détaillée  
- Documents techniques supports

### 7.2 Système d'interactions

- Commentaires publics multi-contextes (innovations, formations, événements)
- Témoignages utilisateurs multi-contextes (avec possibilité pour la plateforme elle-même)
- Modération automatique et manuelle  
- Système de notation (1-5 étoiles)
- Réactions (like, love, insightful, useful)
- Compteur de vues automatique
- Protection contre les votes multiples

## 8\. Formations pour négociateurs

### 8.1 Structure pédagogique

Système de formation en ligne structuré :

#### 8.1.1 Formations

- Titre de la formation  
- Description (avec formatage possible/Rich text)  
- Documents pédagogiques  
- Catégorie (Climat, Désertification, Biodiversité)  
- Format (en ligne, hybride)  
- Estimation tarifaire  
- Public cible (ouvert à tous les utilisateurs, pas seulement les négociateurs)
- Objectifs pédagogiques détaillés  
- Méthodologie d'enseignement  
- Visuels promotionnels (bannières HD et miniatures)  
- Calendrier (dates de début et fin)  
- Historique des modifications  
- Quiz en temps réel avec :
  - Support des participants anonymes (avec pseudo)
  - Système de souscription avant le démarrage
  - Visualisation des participants connectés en temps réel
  - Questions à choix multiples ou unique
  - Plusieurs bonnes réponses possibles
  - Ordre des questions personnalisable
  - Chronométrage par question
  - Résultats et classement à la fin
  - Public ou réservé aux participants de la formation

#### 8.1.2 Leçons et suivi de progression

- Organisation par chapitres  
- Documents supports  
- Vidéos pédagogiques (intégration YouTube)  
- Évaluations intermédiaires
- Suivi détaillé de la progression :
  - Marquage des chapitres/leçons comme terminés
  - Enregistrement du temps de visionnage (en minutes)
  - Historique de consultation (dernière vue, nombre de vues)
  - Pourcentage global de progression

#### 8.1.3 Évaluations

- QCM automatisés avec plusieurs bonnes réponses possibles
- Questions ouvertes  
- Système de notation par points
- Ordre des questions personnalisable
- Table dédiée pour stocker toutes les réponses
- Génération automatique d'attestations selon le score obtenu
- Résultats détaillés avec score et pourcentage

### 8.2 Suivi des parcours

- Timeline de progression pour tous les participants (pas seulement négociateurs)
- Historique des formations suivies  
- Certificats obtenus
- Statistiques de réussite
- Table dédiée pour tous les participants aux formations

## 9\. Interface d'administration

### 9.1 Tableau de bord statistique

- Nombre total d'activités par statut (validées, en attente, invalidées, annulées)  
- Graphiques de soumissions (quotidiens, hebdomadaires, mensuels)  
- Statistiques d'utilisation de la plateforme  
- Indicateurs de performance

### 9.2 Gestion des activités

- Liste exhaustive des activités soumises  
- Interface de validation/rejet avec justification  
- Outils de communication avec les organisateurs(programmer un appel peerJs; envoyer mail)  
- Gestion des créneaux horaires via calendrier interactif vue-cal-v4: Modification par glisser-déposer dans le planning ou formulaire de modification(dans vue-cal-v4, il faut que les événement non invalidé s’affichent en rouge, annulé en gris, validé en vert, etc…)  
- Lorsqu’une activité est modifiée, il faut avoir une historique de modification(uniquement pour date, titre, description)

### 9.3 Système de notifications

- Notifications personnalisées selon les actions  
- Compteurs d'envois aux coordinateurs et panélistes  
- Templates de messages prédéfinis  
- Historique des communications

### 9.4 Intégrations automatiques

- Création automatique de réunions Zoom lors de la validation  
- Génération d'événements YouTube pour le streaming en direct  
- Préparation pour l'intégration d'outils de visioconférence propriétaires(sera intégré à moyen terme plus tard)

## 10\. Fonctionnalités multimédia et techniques

### 10.1 Galerie photo/vidéo

Après les formations, évènements, activités, il arrive de faire des séances photos. On aimerait pouvoir les stocker

- Lié aux formations, activités, événements  
- Upload et gestion des médias  
- Métadonnées : titre, description, auteur

### 10.2 Système de témoignages

- Témoignages écrits  
- Vidéos courtes (10 secondes)  
- Modération avant publication  
- Un témoignage concerne un évènement ou une formation

### 10.3 Traduction en temps réel

- Intégration de l'API Eleven Labs  
- Traduction simultanée des interventions  
- Support multilingue pour les événements internationaux

### 10.4 Chatbot intelligent

- Assistant IA connecté à un modèle de langage (LLM)  
- Interface animée  
- Aide contextuelle aux utilisateurs  
- Base de connaissances spécialisée sur le développement durable et la base de donnée de notre application

## 11\. Outils spécialisés

### 11.1 Pour les administrateurs

- Outils de sondage en temps réel avec :
  - Types de questions variés (texte, choix multiple, choix unique, oui/non, réponse ouverte)
  - Support des réponses anonymes (configurable)
  - Stockage flexible des réponses
- Système d'emailing automatique et newsletters :
  - Listes de diffusion personnalisées
  - Ciblage par pays, organisation, groupe, activité, formation ou événement
  - Abonnements généraux ou spécifiques
  - Campagnes programmables
  - Templates de messages avec variables
  - Historique complet des envois

## 12\. Système de messagerie

- messagerie instantané  
- groupe de messagerie(comme sur whatApp)

## 13\. Considérations techniques et sécurité

### 13.1 Performance

- Optimisation pour un usage international(i18n)  
- Gestion de la latence pour les utilisateurs africains  
- Mise en cache efficace des contenus statiques  
- Compression automatique des images et vidéos  
- recadrage des images avant soumission

### 13.2 Sécurité

- Authentification sécurisée  
- Chiffrement des données sensibles  
- Conformité RGPD pour les utilisateurs européens

### 13.3 Évolutivité

- Architecture modulaire permettant l'ajout de nouvelles fonctionnalités

## 14\. Livrables attendus

### 14.1 Plateforme web complète

- Interface utilisateur responsive  
- Interface d'administration  
- Documentation utilisateur  
- Guide d'administration

### 14.2 Formation et accompagnement

- Formation des administrateurs IFDD  
- Documentation technique  
- Support technique initial


## 15\. Nouvelles fonctionnalités de la base de données

### 15.1 Gestion centralisée des pays
- Table dédiée pour éviter les redondances
- Support des pays francophones
- Référencement uniforme dans toutes les tables

### 15.2 Intégration Zoom avancée
- Table dédiée pour stocker les informations de réunion
- Liens personnalisés pour chaque participant
- Support pour activités et sessions de négociation

### 15.3 Améliorations des activités
- Tags stockés en tableau pour flexibilité
- Thèmes et catégories multiples
- Soft delete avec restauration possible
- Questions/réponses en temps réel pendant les activités

### 15.4 Formations ouvertes à tous
- Participants non limités aux négociateurs
- Suivi détaillé du temps de visionnage
- Quiz avec support des participants anonymes
- Système de souscription avant démarrage

### 15.5 Système de newsletters avancé
- Ciblage précis des destinataires
- Listes de diffusion multiples
- Support des non-utilisateurs
- Campagnes programmables

hébergement:
Vercel ou Railway
Vercel : Simple, performant, gratuit pour commencer
Railway : Plus de contrôle, bon pour l'Afrique
-voir aussi hostinger