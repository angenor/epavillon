# Fonctionnalit�s de la page N�gociations

## Vue d'ensemble
La page N�gociations est un espace d�di� aux n�gociateurs climatiques francophones pour acc�der aux sessions de n�gociation, documents d'aide et r�unions de coordination. Elle comprend trois sections principales navigables via les routes `/nego/climat`, `/nego/biodiversite` et `/nego/desertification`.

## Navigation principale
- **Routes disponibles** :
  - `/nego/climat` : Sessions et ressources sur le changement climatique
  - `/nego/biodiversite` : Sessions et ressources sur la biodiversit�
  - `/nego/desertification` : Sessions et ressources sur la d�sertification
- **Syst�me d'onglets** : Navigation fluide entre les trois cat�gories th�matiques
- **Breadcrumb** : Indication claire de la position dans la navigation

## Section 1 : Sessions de n�gociation

### 1.1 Sessions organis�es par l'IFDD
**Fonctionnalit�s** :
- **Liste des sessions** filtr�e par cat�gorie (climat/biodiversit�/d�sertification)
- **Carte de session** affichant :
  - Titre de la session
  - Description (optionnelle)
  - Dates et heures (start_datetime, end_datetime)
  - Lieu de la session
  - Badge de cat�gorie avec couleur distinctive
  - Statut (� venir/en cours/termin�e)
  - Nombre d'inscrits
- **Actions utilisateur** :
  - Inscription/d�sinscription � une session
  - Ajout au calendrier personnel
  - Acc�s au lien Zoom (si disponible)
  - T�l�chargement des documents supports

### 1.2 Sessions externes
**Fonctionnalit�s** :
- **Liste des sessions externes** avec :
  - Titre et dates
  - Lieu ou plateforme
  - Lien vers le site officiel (external_link)
  - Documents de r�f�rence t�l�chargeables
- **Filtres** :
  - Par date (� venir/pass�es)
  - Par cat�gorie th�matique
  - Par localisation

### 1.3 Gestion des inscriptions
**Fonctionnalit�s** :
- **Syst�me d'inscription** avec confirmation imm�diate
- **Tableau de bord personnel** :
  - Mes sessions inscrites
  - Historique de participation
  - Rappels automatiques
- **Notifications** :
  - Rappel 24h avant la session
  - Notification de changements d'horaire
  - Lien Zoom personnel envoy� par email

## Section 2 : Documents d'aide � la n�gociation

### 2.1 Biblioth�que de documents
**Fonctionnalit�s** :
- **Grille de documents** avec :
  - Image de couverture (cover_image_url)
  - Titre du document
  - Type de document (badge color�) :
    - Guide des n�gociations (vert)
    - Note technique (bleu)
    - Document pertinent (orange)
    - Autre (gris)
  - Cat�gorie th�matique (climat/biodiversit�/d�sertification)
  - Description sommaire
  - Date de publication
  - Taille du fichier
- **Actions** :
  - Visualisation en ligne (PDF viewer int�gr�)
  - T�l�chargement direct (file_url)
  - Partage via lien
  - Ajout aux favoris

### 2.2 Syst�me de recherche et filtrage
**Fonctionnalit�s** :
- **Barre de recherche** avec recherche dans :
  - Titre
  - Description
  - Contenu (si index�)
- **Filtres avanc�s** :
  - Par type de document (document_type)
  - Par cat�gorie (category)
  - Par date de publication
  - Par pertinence
- **Tri** :
  - Plus r�cents
  - Alphab�tique

### 2.3 Gestion des favoris
**Fonctionnalit�s** :
- **Collection personnelle** de documents favoris
- **Organisation** par dossiers personnalis�s
- **Synchronisation** entre appareils
- **Mode hors ligne** pour documents t�l�charg�s

## Section 3 : R�unions de la Francophonie

### 3.1 Calendrier des r�unions
**Fonctionnalit�s** :
- **Vue calendrier** (int�gration Vue Cal v4) :
  - Vue mensuelle/hebdomadaire/journali�re
  - R�unions affich�es avec code couleur par cat�gorie
  - Popup d�taill� au survol
- **Liste des r�unions** avec :
  - Titre de la r�union
  - Type de r�union (meeting_type) :
    - Atelier pr�paratoire (Preparatory_Workshop)
    - Consultation francophone (Francophone_Consultation)
    - Innovation
    - Atelier de formation terrain (Field_Training_Workshop)
  - Dates et heures (start_datetime, end_datetime)
  - Lieu et pays (avec drapeau)
  - Nombre de participants inscrits
  - Statut d'inscription

### 3.2 D�tails et inscription
**Fonctionnalit�s** :
- **Page d�taill�e** de chaque r�union :
  - Description compl�te
  - Objectifs et ordre du jour
  - Liste des intervenants
  - Documents pr�paratoires
  - Informations pratiques (lieu, acc�s, h�bergement)
- **Syst�me d'inscription** :
  - Formulaire d'inscription simple
  - Confirmation par email
  - G�n�ration de badge �lectronique
  - QR code pour l'acc�s

### 3.3 Outils de coordination
**Fonctionnalit�s** :
- **Espace de discussion** pr�-r�union :
  - Forum de questions/r�ponses
  - Partage de positions nationales
  - Coordination des interventions
- **Documents partag�s** :
  - Positions communes francophones
  - Notes de synth�se
  - Comptes-rendus
- **Annuaire des participants** :
  - Liste des inscrits avec organisation
  - Fonction de mise en relation
  - Chat direct entre participants

## Fonctionnalit�s transversales

### 4.1 Accessibilité et permissions
- **Accès réservé** aux utilisateurs avec r�le n�gociateur ou admin/super admin

### 4.4 Support multilingue
- **Interface bilingue** fran�ais/anglais


## Int�grations techniques

### 5.1 Base de donn�es
**Tables utilis�es** :
- `negotiation_sessions` : Sessions de n�gociation
- `session_registrations` : Inscriptions aux sessions
- `francophonie_meetings` : R�unions de la Francophonie
- `francophonie_meeting_registrations` : Inscriptions aux r�unions
- `negotiation_documents` : Documents d'aide
- `zoom_meetings` : Informations Zoom
- `countries` : R�f�rence des pays

### 5.3 Composants Vue r�utilisables
- `SessionCard.vue` : Carte de session r�utilisable
- `DocumentGrid.vue` : Grille de documents
- `MeetingCalendar.vue` : Calendrier des r�unions
- `RegistrationModal.vue` : Modal d'inscription
- `CategoryTabs.vue` : Navigation par cat�gorie