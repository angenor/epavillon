# Fonctionnalit�s des Pages Organisation

## 1. Page Liste des Organisations (`/organizations`)

### Fonctionnalit�s principales
- **Affichage en grille/liste** des organisations actives et v�rifi�es
- **Barre de recherche** avec filtrage en temps r�el par nom d'organisation
- **Filtres avanc�s** :
  - Par pays (dropdown avec tous les pays de la base)
  - Par type d'organisation (public_national_institution, international_organization, regional_organization, ngo_association, private_sector)
  - Par statut de v�rification (v�rifi�e/non v�rifi�e)
- **Pagination** pour g�rer l'affichage de nombreuses organisations
- **Tri** par nom, pays, date de cr�ation, nombre d'activit�s

### Affichage par organisation
Chaque carte d'organisation affiche :
- Logo de l'organisation (avec image par d�faut si absent)
- Nom complet
- Type d'organisation (avec ic�ne appropri�e)
- Pays d'origine
- Badge "V�rifi�e" si `is_verified = true`
- Nombre d'activit�s associ�es
- Lien vers le site web si disponible

### Fonctionnalit�s de recherche
- **Recherche textuelle** dans le nom et les alias d'organisations
- **Gestion des doublons** : affichage uniquement des organisations principales (`is_duplicate = false`)
- **Recherche floue** utilisant la fonction `search_organizations_simple`

## 2. Page D�tail d'Organisation (`/organizations/:id`)

### Informations g�n�rales
- **En-t�te** avec logo, nom complet et informations de base
- **Description** compl�te de l'organisation
- **Informations de contact** : email, site web
- **Localisation** : pays, avec flag du pays
- **Statut de v�rification** avec date et par qui elle a �t� v�rifi�e
- **Statistiques** : nombre total d'activit�s, date de cr�ation

### Section Activit�s li�es
- **Onglets temporels** :
  - Activit�s pass�es (`activity_status = 'completed'`)
  - Activit�s en cours (`activity_status = 'live'`)
  - Activit�s � venir (`validation_status = 'approved'` et dates futures)
- **Filtrage par �v�nement** (dropdown avec tous les �v�nements)
- **Filtrage par th�me** climatique
- **Tri** par date, titre, statut

### Affichage des activit�s
Pour chaque activit� :
- Titre et acronyme
- Image de couverture
- Dates (propos�es et/ou finales)
- Th�mes principaux (badges color�s)
- Statut de validation avec couleur appropri�e
- Format (online, in_person, hybrid) avec ic�ne
- Lien vers la page d�tail de l'activit�

## 3. Fonctionnalit�s de Gestion d'Organisation (pour utilisateurs connect�s)

### Pour les cr�ateurs d'organisations
- **Modifier les informations** de leur organisation
- **Ajouter des alias** (acronymes, noms alternatifs)
- **G�rer les validations** re�ues d'autres utilisateurs
- **Voir les statistiques** d�taill�es de leur organisation

### Pour les administrateurs
- **V�rifier des organisations** (`is_verified`)
- **G�rer les doublons** : fusionner ou marquer comme doublon
- **Mod�rer le contenu** : descriptions, images
- **Voir toutes les organisations** y compris inactives

## 4. Fonctionnalit�s Avanc�es

### Validation communautaire
- **Syst�me de validation** par les utilisateurs (`organization_validations`)
- **Compteur de validations** affich� sur chaque organisation
- **Bouton "Valider cette organisation"** pour les utilisateurs connect�s
- **Historique des validations** avec dates et utilisateurs

### Gestion des alias
- **Affichage des acronymes** et noms alternatifs
- **Recherche par alias** incluse dans la fonction de recherche
- **Ajout d'alias** par les utilisateurs connect�s (avec mod�ration)

### Statistiques et analytics
- **Graphiques d'activit�** par organisation
- **�volution temporelle** des activit�s soumises
- **R�partition par th�mes** climatiques
- **Comparaison avec d'autres organisations** similaires

## 5. Interface Responsive et UX

### Design et accessibilit�
- **Interface responsive** adapt�e mobile, tablette et desktop
- **Mode sombre/clair** respectant les pr�f�rences utilisateur
- **Internationalisation** fran�ais/anglais pour tous les textes
- **Skeleton loaders** pendant le chargement des donn�es
- **�tats vides** avec messages encourageants et call-to-action

### Navigation
- **Breadcrumbs** pour la navigation hi�rarchique
- **Retour � la liste** depuis la page d�tail
- **Navigation entre organisations** (suivant/pr�c�dent)
- **Liens contextuels** vers les �v�nements, activit�s li�es

### Performance
- **Pagination c�t� serveur** pour les grandes listes
- **Images optimis�es** avec lazy loading
- **Cache intelligent** des r�sultats de recherche
- **Chargement progressif** des sections lourdes
