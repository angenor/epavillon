# Fonctionnalités de la Messagerie ePavilion

## 1. Architecture générale

### 1.1 Interface utilisateur
- **Fenêtre popup flottante** positionnée en bas à droite de l'écran
- **Bouton flottant de messagerie** (FAB - Floating Action Button) pour ouvrir/fermer la messagerie
- **Design responsive** qui s'adapte aux différentes tailles d'écran
- **Mode réduit/étendu** : possibilité de minimiser la fenêtre de chat
- **Badge de notification** sur le bouton flottant pour les messages non lus

### 1.2 Structure de la fenêtre popup
```
┌─────────────────────────────────┐
│ Header (Liste contacts/Chat)    │
├─────────────────────────────────┤
│                                 │
│   Zone principale               │
│   (Liste ou conversation)       │
│                                 │
├─────────────────────────────────┤
│ Zone de saisie (si chat actif) │
└─────────────────────────────────┘
```

## 2. Fonctionnalités de base (Tables: messages, connections)

### 2.1 Messagerie individuelle
- **Envoi de messages** uniquement aux connexions acceptées
- **Historique des conversations** persistant
- **Indicateur de lecture** (is_read)
- **Timestamps** pour chaque message
- **Recherche** dans les conversations
- **Suppression** de messages individuels

### 2.2 Gestion des connexions
- **Liste des contacts** (connexions acceptées uniquement)
- **Statut en ligne/hors ligne** des contacts
- **Demandes de connexion** avec statuts:
  - `pending`: En attente
  - `accepted`: Acceptée
  - `rejected`: Rejetée
  - `blocked`: Bloquée
  - `cancelled`: Annulée

### 2.3 Système de blocage (Table: user_blocks)
- **Bloquer un utilisateur** avec raison optionnelle
- **Liste des utilisateurs bloqués**
- **Débloquer un utilisateur**
- Les utilisateurs bloqués ne peuvent pas envoyer de messages

## 3. Fonctionnalités avancées

### 3.1 Messagerie de groupe (Tables: message_groups, group_members, group_messages)

#### Création et gestion de groupes
- **Créer un groupe** avec nom et description
- **Ajouter/retirer des membres**
- **Rôles dans le groupe**:
  - Membre standard
  - Administrateur du groupe (is_admin)
- **Quitter un groupe**
- **Supprimer un groupe** (admin seulement)

#### Fonctionnalités de groupe
- **Messages de groupe** visibles par tous les membres
- **Notifications de groupe**
- **Historique persistant**
- **Indicateur de nouveaux messages**
- **Liste des membres** avec leurs rôles
- **Modification du nom/description** (admin seulement)

### 3.2 Rendez-vous intégrés (Table: appointments)

#### Types de rendez-vous
- **Vidéo** (avec intégration PeerJS)
- **Audio**
- **Présentiel**

#### Gestion des rendez-vous
- **Proposer un rendez-vous** depuis la conversation
- **Statuts de rendez-vous**:
  - `pending`: En attente de confirmation
  - `confirmed`: Confirmé
  - `cancelled`: Annulé
  - `completed`: Terminé
- **Notifications de rappel**
- **Lien de réunion** généré automatiquement pour les RDV vidéo/audio
- **Notes** associées au rendez-vous
- **Intégration calendrier** dans l'interface de chat

## 4. Notifications en temps réel

### 4.1 Types de notifications
- **Nouveau message** individuel
- **Message de groupe**
- **Demande de connexion**
- **Demande de rendez-vous**
- **Rappel de rendez-vous**
- **Utilisateur en ligne/hors ligne**

### 4.2 Mécanismes de notification
- **Badge sur le bouton flottant** avec compteur
- **Son de notification** (configurable)
- **Notification navigateur** (avec permission)
- **Indicateur visuel** dans la liste des conversations

## 5. Interface utilisateur détaillée

### 5.1 États de la fenêtre popup

#### État fermé
- Bouton flottant visible
- Badge avec nombre de messages non lus
- Animation pulse si nouveaux messages

#### État liste des conversations
- Header avec titre "Messages" et bouton fermer
- Barre de recherche
- Liste des conversations récentes avec:
  - Photo de profil
  - Nom du contact/groupe
  - Dernier message (tronqué)
  - Timestamp
  - Badge messages non lus
- Bouton "Nouveau message" ou "Nouveau groupe"

#### État conversation active
- Header avec:
  - Bouton retour
  - Photo et nom du contact/groupe
  - Statut en ligne
  - Menu options (⋮)
- Zone de messages avec:
  - Messages groupés par date
  - Bulles de chat (différenciées envoyé/reçu)
  - Timestamps
  - Indicateurs de lecture
- Zone de saisie avec:
  - Champ de texte
  - Bouton d'envoi
  - Boutons d'actions (rendez-vous, etc.)

### 5.2 Menu contextuel (par conversation)
- **Profil** du contact
- **Proposer un rendez-vous**
- **Rechercher** dans la conversation
- **Effacer l'historique**
- **Bloquer** le contact
- **Paramètres** de notification pour cette conversation

### 5.3 Dimensions et positionnement
```css
/* Desktop */
- Largeur: 380px
- Hauteur: 600px
- Position: fixed, bottom: 20px, right: 20px

/* Mobile */
- Plein écran en mode conversation
- Liste réduite en mode liste
```

## 6. Fonctionnalités temps réel (Supabase Realtime)

### 6.1 Subscriptions
- **Messages entrants** en temps réel
- **Statut de lecture** mis à jour instantanément
- **Statut en ligne** des contacts
- **Typing indicator** 

### 6.2 Optimisations
- **Pagination** des messages anciens
- **Lazy loading** des conversations
- **Cache local** pour les messages récents
- **Debounce** pour les indicateurs de frappe

## 7. Sécurité et permissions

### 7.1 Règles de sécurité (RLS)
- Seuls les utilisateurs connectés peuvent accéder à la messagerie
- Messages visibles uniquement par l'expéditeur et le destinataire
- Connexions requises pour envoyer des messages
- Utilisateurs bloqués/suspendus ne peuvent pas envoyer de messages

### 7.2 Validation des données
- **Sanitization** des messages (XSS prevention)
- **Limite de caractères** par message
- **Rate limiting** pour éviter le spam
- **Validation** des rendez-vous (dates futures uniquement)

## 8. Composants Vue.js à créer

### 8.1 Structure des composants
```
src/components/messaging/
├── FloatingChatButton.vue      # Bouton flottant
├── ChatWindow.vue               # Fenêtre principale
├── ConversationList.vue         # Liste des conversations
├── ChatConversation.vue         # Vue conversation active
├── MessageBubble.vue            # Bulle de message
├── ChatHeader.vue               # Header de la fenêtre
├── ChatInput.vue                # Zone de saisie
├── GroupManager.vue             # Gestion des groupes
├── AppointmentScheduler.vue    # Planification de RDV
└── UserStatusIndicator.vue      # Indicateur en ligne/hors ligne
```

### 8.2 Composables
```
src/composables/messaging/
├── useChat.js                   # Logique principale de chat
├── useMessages.js               # Gestion des messages
├── useConnections.js            # Gestion des connexions
├── useGroups.js                 # Gestion des groupes
├── useAppointments.js           # Gestion des rendez-vous
├── useNotifications.js          # Gestion des notifications
└── useRealtimeSubscription.js   # Subscriptions temps réel
```

### 8.3 Store Pinia
```
src/stores/messaging.js
- État global de la messagerie
- Messages en cache
- Conversations actives
- Compteurs de messages non lus
- Statuts des utilisateurs
```

## 9. Intégrations externes

### 9.1 PeerJS pour visioconférence
- Initialisation de peer connection pour RDV vidéo/audio
- Gestion des flux média
- Interface de contrôle (mute, caméra, raccrocher)

### 9.2 Notifications navigateur
- Demande de permission
- Envoi de notifications pour messages reçus (fenêtre inactive)
- Actions rapides depuis la notification

## 10. Roadmap d'implémentation

### Phase 1: MVP (Messagerie de base)
1. Bouton flottant et fenêtre popup
2. Liste des conversations
3. Envoi/réception de messages individuels
4. Indicateurs de lecture
5. Notifications de base

### Phase 2: Fonctionnalités avancées
1. Messagerie de groupe
2. Système de blocage
3. Recherche dans les conversations
4. Statut en ligne/hors ligne

### Phase 3: Intégrations
1. Rendez-vous intégrés
2. Visioconférence PeerJS
3. Notifications navigateur avancées
4. Typing indicators

### Phase 4: Optimisations
1. Cache et pagination
2. Performance temps réel
3. Mode hors ligne partiel
4. Animations et transitions

## 11. Considérations UX

### 11.1 Accessibilité
- Support clavier complet
- Lecteurs d'écran compatibles
- Contraste suffisant (modes light/dark)
- Tailles de police ajustables

### 11.2 Responsive Design
- Adaptation mobile/tablette/desktop
- Gestes tactiles sur mobile
- Mode paysage/portrait

### 11.3 Performances
- Chargement progressif
- Skeleton loaders
- Optimistic UI updates
- Gestion des erreurs réseau

## 12. Tests à implémenter

### 12.1 Tests unitaires
- Composables de messagerie
- Formatage des dates/messages
- Validation des données

### 12.2 Tests d'intégration
- Envoi/réception de messages
- Création de groupes
- Planification de rendez-vous

### 12.3 Tests E2E
- Flux complet de conversation
- Notifications temps réel
- Gestion des connexions
