# Interface d'Administration - Messages d'Incidents

## 🎉 Implémentation Complète

L'interface d'administration pour gérer les messages d'incidents est maintenant entièrement opérationnelle !

## 📍 Accès

**URL** : `/admin/incident-messages`

**Permissions** : Réservé aux administrateurs (admin et super_admin)

## 🎨 Fonctionnalités

### 1. Liste des Messages

- ✅ Affichage de tous les messages d'incidents
- ✅ Badges visuels pour :
  - **Gravité** : Info (bleu), Warning (orange), Error (rouge)
  - **Statut** : Actif / Inactif
  - **Type** : Message général, Organisation spécifique, Journée spécifique

### 2. Filtres Avancés

- **Par événement** : Filtrer les messages d'un événement spécifique
- **Par gravité** : Info, Warning ou Error
- **Par statut** : Actif ou Inactif
- **Bouton réinitialiser** : Réinitialiser tous les filtres

### 3. Actions Rapides

Chaque message dispose de 3 actions :

1. **👁️ Toggle Actif/Inactif** : Activer ou désactiver un message en un clic
2. **✏️ Modifier** : Éditer le message existant
3. **🗑️ Supprimer** : Supprimer définitivement le message (avec confirmation)

### 4. Création/Édition de Messages

Le formulaire modal permet de :

#### Étape 1 : Sélectionner l'événement
- Liste déroulante de tous les événements disponibles

#### Étape 2 : Choisir le type de message
Trois options disponibles :
- **📧 Message général** : Affecte tout l'événement
- **🏢 Organisation spécifique** : Affecte uniquement une organisation
- **📅 Journée spécifique** : Affecte une date précise

#### Étape 3 : Configuration selon le type
- **Si organisation** : Sélectionner l'organisation dans la liste
- **Si journée** : Sélectionner la date dans un calendrier

#### Étape 4 : Définir la gravité
Trois niveaux avec icônes et couleurs :
- **ℹ️ Information** (bleu)
- **⚠️ Avertissement** (orange)
- **❌ Erreur** (rouge)

#### Étape 5 : Rédiger les messages
- 🇫🇷 **Message en français** (requis)
- 🇬🇧 **Message en anglais** (requis)

#### Étape 6 : Activation
- ✅ Case à cocher pour activer immédiatement le message

## 📂 Fichiers Créés

### Vues et Composants
```
src/views/admin/IncidentMessages.vue          # Vue principale de gestion
src/components/admin/MessageFormModal.vue      # Modal de création/édition
```

### Router
```
src/router/index.js                            # Route ajoutée : /admin/incident-messages
```

### Traductions
```
src/locales/fr/admin.json                      # Traductions françaises
src/locales/en/admin.json                      # Traductions anglaises
```

### Navigation
```
src/views/admin/AdminLayout.vue                # Lien ajouté au menu admin
```

## 🎯 Guide d'Utilisation

### Créer un Nouveau Message

1. **Accéder à la page** : `/admin/incident-messages`
2. **Cliquer sur** : "Nouveau message" (bouton orange en haut à droite)
3. **Remplir le formulaire** :
   - Sélectionner l'événement
   - Choisir le type de message
   - Remplir les champs spécifiques
   - Choisir la gravité
   - Rédiger les messages FR/EN
   - Cocher "Activer immédiatement" si souhaité
4. **Enregistrer** : Cliquer sur "Créer"

### Modifier un Message Existant

1. Dans la liste, **cliquer sur l'icône ✏️** du message
2. Modifier les champs souhaités
3. **Enregistrer** : Cliquer sur "Enregistrer"

### Activer/Désactiver Rapidement

- **Cliquer sur l'icône 👁️** pour basculer entre actif/inactif
- Le changement est immédiat, sans confirmation

### Supprimer un Message

1. **Cliquer sur l'icône 🗑️** du message
2. **Confirmer** dans la boîte de dialogue
3. Le message est supprimé définitivement

### Filtrer les Messages

1. Utiliser les **sélecteurs en haut de page** :
   - Événement
   - Gravité
   - Statut
2. Les résultats se mettent à jour automatiquement
3. **Réinitialiser** : Bouton "Réinitialiser" pour effacer les filtres

## 💡 Exemples d'Utilisation

### Exemple 1 : Problème Technique Global
```
Type: Message général
Événement: CdP30 Climat 2025
Gravité: Error
Message FR: "Les diffusions en direct sont temporairement interrompues. Nous travaillons à résoudre le problème. Merci de votre patience."
Message EN: "Live broadcasts are temporarily interrupted. We are working to solve the problem. Thank you for your patience."
Actif: ✅
```

### Exemple 2 : Alerte pour une Organisation
```
Type: Organisation spécifique
Événement: CdP30 Climat 2025
Organisation: IFDD
Gravité: Warning
Message FR: "Les activités de l'IFDD peuvent subir des retards en raison de problèmes logistiques."
Message EN: "IFDD activities may experience delays due to logistical issues."
Actif: ✅
```

### Exemple 3 : Information pour une Journée
```
Type: Journée spécifique
Événement: CdP30 Climat 2025
Date: 2025-11-15
Gravité: Info
Message FR: "Maintenance technique prévue le 15 novembre de 12h à 13h. Certains services seront temporairement indisponibles."
Message EN: "Technical maintenance scheduled on November 15 from 12pm to 1pm. Some services will be temporarily unavailable."
Actif: ✅
```

## 🔄 Cycle de Vie d'un Message

```
1. CRÉATION
   ↓
2. ACTIVATION (si "Activer immédiatement")
   ↓
3. AFFICHAGE sur la page de programmation
   ↓
4. DÉSACTIVATION (quand le problème est résolu)
   ↓
5. SUPPRESSION (après quelques jours pour l'historique)
```

## 🎨 Aperçu Visuel

### Liste des Messages
```
┌─────────────────────────────────────────────────────────┐
│ 🟠 Warning   🟢 Actif   📧 Message général              │
│                                                         │
│ 📅 CdP30 Climat 2025                                   │
│ 🇫🇷 Des problèmes techniques sont en cours...          │
│ 🇬🇧 Technical issues are being resolved...             │
│                                                         │
│ Créé le: 10 nov. 2025, 14:30                           │
│                                                         │
│         👁️ Désactiver   ✏️ Modifier   🗑️ Supprimer      │
└─────────────────────────────────────────────────────────┘
```

### Modal de Création
```
┌─────────────────────────────────────────┐
│ Créer un message d'incident        ✕   │
├─────────────────────────────────────────┤
│                                         │
│ Événement *                             │
│ [CdP30 Climat 2025 ▼]                   │
│                                         │
│ Type de message                         │
│ ┌─────┐ ┌─────┐ ┌─────┐                │
│ │ 📧  │ │ 🏢  │ │ 📅  │                │
│ └─────┘ └─────┘ └─────┘                │
│                                         │
│ Gravité *                               │
│ ┌─────┐ ┌─────┐ ┌─────┐                │
│ │ ℹ️   │ │ ⚠️  │ │ ❌  │                │
│ └─────┘ └─────┘ └─────┘                │
│                                         │
│ 🇫🇷 Message en français *               │
│ [                                   ]   │
│                                         │
│ 🇬🇧 Message en anglais *                │
│ [                                   ]   │
│                                         │
│ ☐ Activer immédiatement ce message     │
│                                         │
│         [Annuler]  [Créer]              │
└─────────────────────────────────────────┘
```

## 📊 Statistiques et Monitoring

L'interface affiche :
- **Nombre total** de messages
- **Filtrage dynamique** pour trouver rapidement un message
- **Tri automatique** par date de création (plus récent en premier)

## 🔒 Sécurité

- ✅ Accès restreint aux administrateurs
- ✅ Validation des permissions via RLS Supabase
- ✅ Confirmation avant suppression
- ✅ Logs automatiques (created_at, updated_at)

## 🚀 Prochaines Améliorations

Suggestions pour le futur :

- [ ] **Statistiques d'affichage** : Nombre de vues par message
- [ ] **Planification** : Programmer l'activation/désactivation automatique
- [ ] **Notifications** : Alerter les admins lors de création de message
- [ ] **Historique** : Journal des modifications
- [ ] **Templates** : Messages pré-remplis pour les cas courants
- [ ] **Export** : Exporter la liste des messages (CSV, PDF)
- [ ] **Duplication** : Dupliquer un message existant

## ✅ Checklist de Test

Avant de mettre en production :

- [ ] Créer un message de test
- [ ] Vérifier l'affichage dans la liste
- [ ] Modifier le message
- [ ] Activer/désactiver le message
- [ ] Filtrer par événement
- [ ] Filtrer par gravité
- [ ] Filtrer par statut
- [ ] Supprimer le message de test
- [ ] Vérifier l'affichage sur la page publique
- [ ] Tester en mode clair et sombre
- [ ] Tester en français et en anglais
- [ ] Vérifier sur mobile et desktop

## 🎓 Formation

### Pour les Administrateurs

1. **Se connecter** avec un compte admin
2. **Accéder au menu** : Administration → Messages d'Incidents
3. **Créer un message de test** pour se familiariser
4. **Explorer les filtres** et actions disponibles
5. **Consulter la documentation** : [INCIDENT_MESSAGES_GUIDE.md](bank/shema_et_requettes/INCIDENT_MESSAGES_GUIDE.md)

## 📞 Support

En cas de problème :
1. Vérifier les logs de la console navigateur (F12)
2. Vérifier les permissions Supabase
3. Consulter la documentation technique
4. Contacter l'équipe de développement

---

**Interface prête à l'emploi !** 🎉

Les administrateurs peuvent maintenant gérer facilement les messages d'incidents depuis l'interface d'administration.
