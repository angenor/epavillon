# Fonctionnalit�s des pages de formations

## 1. Page Index (Liste des formations)
`/formations`

### 1.1 Affichage et filtrage

#### Grille de formations
- **Cards de formation** avec :
  - Image banni�re (banner_hd_url ou banner_thumbnail_url)
  - Titre de la formation
  - Cat�gorie (badge color� : climat/biodiversit�/d�sertification)
  - Format (badge : en ligne/hybride)
  - Dates (d�but - fin)
  - Prix estim� (si disponible)
  - Nombre de participants inscrits
  - Pourcentage moyen de progression
  - Statut (Active/Inactive)
  - Public cible (extrait)

#### Filtres et recherche
- **Barre de recherche** : titre, description, objectifs
- **Filtres par** :
  - Cat�gorie (climat, d�sertification, biodiversit�)
  - Format (online, hybrid)
  - Statut (actives, termin�es, � venir)
  - Prix (gratuit, payant)
  - Date (en cours, � venir, pass�es)
- **Tri par** :
  - Date de d�but (croissant/d�croissant)
  - Nombre de participants
  - Popularit� (bas� sur le nombre d'inscrits)
  - Nouveaut� (date de cr�ation)

#### Fonctionnalit�s utilisateur
- **Pour utilisateurs connect�s** :
  - Indicateur "Inscrit" sur les formations o� l'utilisateur est participant
  - Badge de progression (%) si inscrit
  - Bouton d'inscription rapide
- **Pour formateurs/admins** :
  - Bouton "Cr�er une formation"
  - Indicateurs statistiques (nombre total d'inscrits)

### 1.2 Vue alternative (liste)
- Basculer entre vue grille et vue liste
- Vue liste avec plus de d�tails :
  - Description courte
  - Objectifs principaux
  - M�thodologie
  - Nombre de chapitres

## 2. Page Show (D�tail d'une formation)
`/formations/:id`

### 2.1 En-t�te de la formation

#### Banni�re et informations principales
- **Image banni�re** (format 16:9 HD)
- **Breadcrumb** : Accueil > Formations > [Titre formation]
- **Titre** de la formation
- **Badges** : Cat�gorie, Format, Statut
- **M�tadonn�es** :
  - Dates (d�but - fin)
  - Dur�e estim�e
  - Prix estim�
  - Nombre de participants
  - Cr�� par (nom du formateur)
  - Date de cr�ation

#### Actions principales
- **Pour non-inscrits** :
  - Bouton "S'inscrire � cette formation"
  - Aper�u du programme (chapitres verrouill�s)
- **Pour participants** :
  - Bouton "Continuer la formation"
  - Barre de progression globale
  - Bouton "Voir mon certificat" (si compl�t�)
- **Pour formateurs/admins** :
  - Bouton "Modifier"
  - Bouton "G�rer les participants"
  - Bouton "Statistiques"

### 2.2 Onglets de contenu

#### Onglet "Vue d'ensemble"
- **Description** compl�te (rich text)
- **Objectifs p�dagogiques** (liste)
- **Public cible** d�taill�
- **M�thodologie** d'enseignement
- **Pr�requis** (si applicable)

#### Onglet "Programme"
- **Liste des chapitres** (accord�on) :
  - Num�ro et titre du chapitre
  - Description du chapitre
  - Nombre de le�ons
  - Dur�e estim�e
  - **Pour participants** :
    - Statut (non commenc�/en cours/termin�)
    - Pourcentage de progression
    - Derni�re consultation
- **Le�ons par chapitre** (expandable) :
  - Titre de la le�on
  - Type (document/vid�o)
  - Dur�e (pour vid�os)
  - **Pour participants** :
    - Checkbox de compl�tion
    - Nombre de vues
    - Temps visionn�

#### Onglet "Participants" (si inscrit ou admin)
- **Statistiques** :
  - Nombre total de participants
  - Taux de compl�tion moyen
  - Progression moyenne
- **Liste des participants** (pour admins) :
  - Avatar et nom
  - Date d'inscription
  - Progression (%)
  - Statut (actif/inactif)
  - Certificat obtenu (oui/non)

#### Onglet "Quiz & �valuations"
- **Quiz en temps r�el** :
  - Liste des quiz programm�s
  - Statut (� venir/en cours/termin�)
  - Nombre de participants
  - **Pour participants** :
    - Bouton "Rejoindre" (si en cours)
    - Score obtenu (si termin�)
- **�valuations** :
  - Liste des �valuations
  - Note de passage requise
  - **Pour participants** :
    - Statut (non commenc�/r�ussi/�chou�)
    - Score obtenu
    - Tentatives restantes

#### Onglet "Ressources"
- **Documents p�dagogiques** :
  - Liste des documents par chapitre
  - Bouton de t�l�chargement
  - Taille du fichier
  - Type de fichier (PDF, DOC, etc.)

#### Onglet "Discussions" (optionnel)
- **Forum de discussion** :
  - Questions des participants
  - R�ponses du formateur
  - Syst�me de votes
  - Recherche dans les discussions

### 2.3 Sidebar lat�rale

#### Widget de progression (pour participants)
- Progression globale (cercle de progression)
- Chapitres compl�t�s X/Y
- Temps total pass�
- Prochaine le�on sugg�r�e

#### Widget d'information
- Formateur (avatar, nom, bio courte)
- Dates importantes
- Contact/support

#### Actions rapides
- T�l�charger le programme (PDF)
- Partager la formation
- Signaler un probl�me

## 3. Page Create (Création d'une formation)
`/formations/create`

### 3.1 Permissions
- **Accès limité à** :
  - Utilisateurs avec rôle formateur
  - Administrateurs
  - Super administrateurs

### 3.2 Formulaire de création multi-étapes

#### Étape 1 : Informations de base
- **Titre** * (input text, max 200 caractères)
- **Description courte** * (textarea, max 500 caractères pour les cards)
- **Description complète** * (éditeur rich text)
- **Catégorie** * (select) :
  - Climat
  - Désertification
  - Biodiversité
- **Format** * (radio buttons) :
  - En ligne (avec icône)
  - Hybride (avec icône)
- **Validation en temps réel** des champs requis

#### Étape 2 : Détails pédagogiques
- **Public cible** * (textarea avec suggestions) :
  - Négociateurs climatiques
  - Points focaux UNFCCC
  - Professionnels du développement durable
  - Étudiants et chercheurs
  - Grand public
  - Autre (à préciser)
- **Objectifs pédagogiques** * (liste dynamique) :
  - Bouton "Ajouter un objectif"
  - Minimum 3 objectifs requis
  - Réorganisation par drag & drop
- **Méthodologie** * (textarea avec templates) :
  - Cours magistraux
  - Études de cas
  - Travaux pratiques
  - Discussions interactives
  - Projets collaboratifs
- **Prérequis** (textarea, optionnel)
- **Compétences à acquérir** (tags avec suggestions)

#### Étape 3 : Planning et tarification
- **Dates de formation** * :
  - Date de début (date picker avec validation)
  - Date de fin (doit être après la date de début)
  - Durée calculée automatiquement
- **Estimation du prix** (optionnel) :
  - Montant (number input)
  - Devise (USD/EUR/XAF)
  - Case "Formation gratuite"
- **Nombre de places** (optionnel) :
  - Illimité (checkbox)
  - Ou nombre maximum (number input)
- **Inscription** :
  - Ouverte immédiatement
  - Ouverte à partir de (date picker)
  - Sur invitation uniquement

#### Étape 4 : Médias et visuels
- **Bannière principale** * :
  - Zone de drag & drop
  - Preview en temps réel
  - Recadrage automatique (16:9)
  - Formats acceptés : JPG, PNG, WebP
  - Taille max : 5MB
- **Bannière miniature** :
  - Génération automatique depuis la bannière principale
  - Possibilité de personnaliser
- **Vidéo de présentation** (optionnel) :
  - URL YouTube
  - Preview intégrée

#### Étape 5 : Structure du programme (optionnel à la création)
- **Message** : "Vous pourrez ajouter les chapitres et leçons après la création"
- **Option rapide** : Créer une structure de base
  - Nombre de chapitres (number input)
  - Génération automatique de chapitres vides

#### Étape 6 : Révision et création
- **Récapitulatif** de toutes les informations
- **Aperçu** de la card de formation
- **Aperçu** de la page de détail
- **Options de sauvegarde** :
  - "Créer et publier" (formation active)
  - "Créer comme brouillon" (formation inactive)
  - "Créer et continuer l'édition" (redirige vers edit)

### 3.3 Fonctionnalités UX

#### Sauvegarde automatique
- Sauvegarde en localStorage toutes les 30 secondes
- Indicateur "Brouillon sauvegardé"
- Récupération en cas de déconnexion

#### Validation progressive
- Validation à chaque étape
- Indicateurs visuels (vert/rouge)
- Messages d'erreur contextuels
- Impossibilité de passer à l'étape suivante si erreurs

#### Aide contextuelle
- Tooltips sur chaque champ
- Exemples de bonnes pratiques
- Liens vers la documentation
- Chat d'assistance (si disponible)

### 3.4 Après la création

#### Redirection et actions
- **Si "Créer et publier"** :
  - Redirection vers la page show
  - Toast de succès avec actions :
    - "Ajouter des chapitres"
    - "Inviter des participants"
    - "Partager"
- **Si "Créer comme brouillon"** :
  - Redirection vers la liste des formations
  - Badge "Brouillon" sur la formation
- **Si "Créer et continuer"** :
  - Redirection vers la page edit
  - Ouverture sur l'onglet "Programme"

#### Email de confirmation
- Envoi automatique au créateur
- Récapitulatif de la formation
- Lien direct vers la gestion
- Prochaines étapes suggérées

## 4. Page Edit (Modification d'une formation)
`/formations/:id/edit`

### 3.1 Permissions
- **Acc�s limit� �** :
  - Cr�ateur de la formation
  - Administrateurs
  - Super administrateurs

### 3.2 Formulaire en �tapes

#### �tape 1 : Informations g�n�rales
- **Titre** (requis)
- **Description** (�diteur rich text)
- **Cat�gorie** (select)
- **Format** (radio buttons)
- **Prix estim�** (number input)
- **Public cible** (textarea)
- **Objectifs** (textarea)
- **M�thodologie** (textarea)
- **Dates** (date pickers)
- **Statut** (actif/inactif)

#### �tape 2 : M�dias
- **Banni�re HD** (upload avec preview)
- **Banni�re thumbnail** (upload avec preview)
- **Recadrage automatique** des images

#### �tape 3 : Programme
- **Gestion des chapitres** :
  - Ajouter/Modifier/Supprimer des chapitres
  - R�organiser par drag & drop
  - Pour chaque chapitre :
    - Num�ro (auto-incr�ment�)
    - Titre
    - Description
- **Gestion des le�ons** par chapitre :
  - Ajouter/Modifier/Supprimer des le�ons
  - R�organiser par drag & drop
  - Pour chaque le�on :
    - Titre
    - Type (document/vid�o)
    - Upload de document ou URL YouTube
    - Ordre dans le chapitre

#### �tape 4 : �valuations
- **Cr�er/Modifier des �valuations** :
  - Titre
  - Score de passage
  - Questions (QCM ou ouvertes)
  - Points par question
- **Planifier des quiz** :
  - Titre
  - Public/Priv�
  - Autoriser anonymes
  - Dur�e limite
  - Date/heure programm�e

#### �tape 5 : Validation
- **Aper�u** de la formation
- **V�rification** des informations
- **Sauvegarde** (brouillon ou publier)

### 3.3 Fonctionnalit�s avanc�es

#### Gestion des participants
- Voir la liste des participants
- Exporter en CSV
- Envoyer des notifications group�es
- R�initialiser la progression d'un participant

#### Statistiques et rapports
- **Tableau de bord** :
  - Nombre d'inscrits (graphique temporel)
  - Taux de compl�tion
  - Progression moyenne
  - Chapitres les plus consult�s
  - Temps moyen par chapitre
- **Export de rapports** (PDF/Excel)

#### Historique des modifications
- Log de toutes les modifications
- Qui a modifi� quoi et quand
- Possibilit� de restaurer une version

### 3.4 Actions suppl�mentaires

#### Duplication
- Bouton "Dupliquer cette formation"
- Cr�er une copie avec nouveau titre

#### Archivage
- Archiver une formation termin�e
- Conserver l'acc�s aux participants actuels

#### Suppression
- Suppression douce (soft delete)
- Confirmation requise
- Conservation des donn�es des participants

## 4. Fonctionnalit�s transversales

### 4.1 Syst�me de notifications
- Rappels de formation (d�but, quiz programm�s)
- Nouveaux chapitres disponibles
- Certificat disponible
- Messages du formateur

### 4.2 Int�gration avec d'autres modules
- **Lien avec les t�moignages** : afficher les t�moignages li�s
- **Lien avec les commentaires** : syst�me de feedback
- **Lien avec la galerie** : photos/vid�os de la formation

### 4.3 Accessibilit� et UX
- Support multi-langue (fr/en)
- Mode sombre/clair
- Responsive design
- Skeleton loaders pendant le chargement
- Messages de confirmation/erreur clairs

### 4.4 S�curit�
- Validation des permissions (RLS)
- Protection contre les inscriptions multiples
- Limitation du nombre de tentatives d'�valuation
- V�rification de l'authenticit� des certificats

## 5. Fonctionnalit�s sp�ciales

### 5.1 Quiz en temps r�el
- **Interface participant** :
  - Salle d'attente avant le d�but
  - Affichage des questions une par une
  - Timer par question
  - R�sultats en temps r�el
  - Classement final
- **Interface formateur** :
  - Contr�le du d�marrage
  - Monitoring des participants
  - Statistiques par question
  - Export des r�sultats

### 5.2 Certificats
- G�n�ration automatique apr�s r�ussite
- Template personnalisable
- QR code de v�rification
- T�l�chargement PDF
- Partage sur r�seaux sociaux

### 5.3 Recommandations
- Suggestions de formations similaires
- Parcours de formation recommand�s
- Formations populaires dans la m�me cat�gorie

## 6. API et Int�grations

### 6.1 Endpoints Supabase n�cessaires
- `trainings` : CRUD des formations
- `training_participants` : gestion des inscriptions
- `training_chapters` : gestion du programme
- `lesson_contents` : contenus p�dagogiques
- `participant_progress` : suivi de progression
- `live_quizzes` : quiz temps r�el
- `evaluations` : syst�me d'�valuation

### 6.2 Int�grations externes
- **YouTube API** : pour les vid�os de le�ons
- **Zoom API** : pour les sessions live (format hybride)
- **Service de g�n�ration PDF** : pour les certificats
- **Service d'email** : pour les notifications

## 7. Performance et optimisation

### 7.1 Mise en cache
- Cache des listes de formations
- Cache des progressions utilisateur
- Cache des contenus statiques

### 7.2 Chargement progressif
- Lazy loading des chapitres/le�ons
- Pagination des participants
- Chargement diff�r� des m�dias

### 7.3 Optimisation des requ�tes
- Jointures optimis�es pour les statistiques
- Indexes sur les champs fr�quemment recherch�s
- Requ�tes en parall�le quand possible