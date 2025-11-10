# Modèles Prédéfinis pour Messages d'Incidents

## 📋 Vue d'ensemble

Le système de messages d'incidents inclut maintenant **10 modèles prédéfinis** pour faciliter la création rapide de messages courants. Cette fonctionnalité permet aux administrateurs de sélectionner un modèle qui pré-remplit automatiquement le formulaire avec un message standard en français et en anglais, ainsi que le niveau de gravité approprié.

## 🎯 Utilisation

### Comment utiliser un modèle ?

1. Accédez à `/admin/incident-messages`
2. Cliquez sur **"Nouveau message"**
3. En haut du formulaire, vous verrez la section **"💡 Modèles prédéfinis"**
4. Sélectionnez un modèle dans le menu déroulant
5. Le formulaire sera automatiquement pré-rempli avec :
   - Message en français
   - Message en anglais
   - Niveau de gravité approprié
6. **Personnalisez** le message si nécessaire
7. Complétez les autres champs (événement, type, etc.)
8. Enregistrez

> **Note** : Les modèles sont uniquement disponibles en mode création, pas en mode édition.

## 📚 Modèles Disponibles

### 🔧 Problèmes Techniques

#### 1. Problème technique général
- **Gravité** : Warning (⚠️ Avertissement)
- **FR** : "Nous rencontrons actuellement des problèmes techniques. Nos équipes travaillent à résoudre la situation dans les plus brefs délais."
- **EN** : "We are currently experiencing technical issues. Our teams are working to resolve the situation as soon as possible."
- **Usage** : Pour les problèmes techniques non spécifiés

#### 2. Problème de streaming vidéo
- **Gravité** : Error (🔴 Erreur)
- **FR** : "Le streaming vidéo rencontre des difficultés techniques. Veuillez patienter pendant que nous résolvons le problème."
- **EN** : "Video streaming is experiencing technical difficulties. Please be patient while we resolve the issue."
- **Usage** : Problèmes avec YouTube ou autres plateformes de streaming

#### 3. Problème audio/vidéo
- **Gravité** : Warning (⚠️ Avertissement)
- **FR** : "Des problèmes audio et/ou vidéo sont actuellement en cours de résolution. Merci de votre compréhension."
- **EN** : "Audio and/or video issues are currently being resolved. Thank you for your understanding."
- **Usage** : Problèmes de son ou d'image pendant les activités

#### 4. Problème de connexion internet
- **Gravité** : Error (🔴 Erreur)
- **FR** : "Nous rencontrons des problèmes de connexion internet. Le service pourrait être temporairement interrompu."
- **EN** : "We are experiencing internet connectivity issues. Service may be temporarily interrupted."
- **Usage** : Coupures ou lenteur internet

### 📅 Programmation

#### 5. Activité annulée
- **Gravité** : Error (🔴 Erreur)
- **FR** : "Cette activité a été annulée. Nous nous excusons pour tout inconvénient causé. Plus d'informations seront communiquées prochainement."
- **EN** : "This activity has been cancelled. We apologize for any inconvenience. More information will be communicated soon."
- **Usage** : Annulation d'une activité
- **Recommandation** : Utiliser avec type "Organisation" ou "Journée"

#### 6. Activité retardée
- **Gravité** : Warning (⚠️ Avertissement)
- **FR** : "Le début de cette activité est retardé. Nous vous tiendrons informés de la nouvelle heure de début."
- **EN** : "The start of this activity is delayed. We will keep you informed of the new start time."
- **Usage** : Retards d'activités
- **Recommandation** : Utiliser avec type "Organisation" ou "Journée"

#### 7. Changement de lieu
- **Gravité** : Info (🔵 Information)
- **FR** : "Le lieu de cette activité a été modifié. Veuillez consulter les détails de l'activité pour plus d'informations."
- **EN** : "The location of this activity has been changed. Please check the activity details for more information."
- **Usage** : Changement de salle ou de lieu
- **Recommandation** : Utiliser avec type "Organisation" ou "Journée"

### 🛠️ Maintenance

#### 8. Maintenance planifiée
- **Gravité** : Info (🔵 Information)
- **FR** : "Une maintenance planifiée est en cours. Les services seront temporairement indisponibles."
- **EN** : "Scheduled maintenance is in progress. Services will be temporarily unavailable."
- **Usage** : Maintenance prévue de la plateforme
- **Recommandation** : Utiliser avec type "Général"

#### 9. Mise à jour en cours
- **Gravité** : Info (🔵 Information)
- **FR** : "Une mise à jour est en cours d'installation. Vous pourriez rencontrer des perturbations temporaires."
- **EN** : "An update is being installed. You may experience temporary disruptions."
- **Usage** : Mise à jour de la plateforme
- **Recommandation** : Utiliser avec type "Général"

#### 10. Accès restreint temporairement
- **Gravité** : Warning (⚠️ Avertissement)
- **FR** : "L'accès est temporairement restreint pour des raisons de maintenance. Nous serons bientôt de retour."
- **EN** : "Access is temporarily restricted for maintenance reasons. We will be back soon."
- **Usage** : Restriction temporaire d'accès
- **Recommandation** : Utiliser avec type "Général"

## 🎨 Niveaux de Gravité

Les modèles utilisent trois niveaux de gravité :

| Niveau | Badge | Usage | Exemples de modèles |
|--------|-------|-------|---------------------|
| **Info** | 🔵 Information | Informations générales | Maintenance, Mise à jour, Changement de lieu |
| **Warning** | ⚠️ Avertissement | Alertes modérées | Problèmes techniques, Retard, Accès restreint |
| **Error** | 🔴 Erreur | Problèmes critiques | Annulation, Streaming, Internet |

## ✏️ Personnalisation

Après avoir sélectionné un modèle, vous pouvez :

1. **Modifier les messages** : Adaptez le texte à votre situation spécifique
2. **Changer la gravité** : Ajustez le niveau selon l'importance
3. **Ajouter des détails** : Complétez avec des informations supplémentaires

**Exemple** :
```
Modèle : "Activité retardée"
→ Personnalisation : "L'activité de l'IFDD sur le financement climatique est retardée
   de 30 minutes en raison de difficultés techniques. Nouvelle heure : 15h30 UTC."
```

## 👨‍💻 Pour les Développeurs

### Ajouter un nouveau modèle

1. Ouvrir [MessageFormModal.vue](src/components/admin/MessageFormModal.vue)
2. Localiser l'objet `templates` (ligne ~345)
3. Ajouter une nouvelle entrée :

```javascript
const templates = {
  // ... modèles existants
  nouveau_modele: {
    message_fr: 'Votre message en français',
    message_en: 'Your message in English',
    severity: 'warning' // 'info', 'warning', ou 'error'
  }
}
```

4. Ajouter les traductions dans les fichiers i18n :

**`src/locales/fr/admin.json`** :
```json
{
  "admin": {
    "incidentMessages": {
      "templates": {
        "list": {
          "nouveau_modele": "Nom du modèle en français"
        }
      }
    }
  }
}
```

**`src/locales/en/admin.json`** :
```json
{
  "admin": {
    "incidentMessages": {
      "templates": {
        "list": {
          "nouveau_modele": "Template name in English"
        }
      }
    }
  }
}
```

5. Ajouter l'option dans le `<select>` du formulaire (ligne ~36) :

```html
<option value="nouveau_modele">
  {{ t('admin.incidentMessages.templates.list.nouveau_modele') }}
</option>
```

### Structure de code

Le système de modèles fonctionne ainsi :

```javascript
// 1. Sélection du modèle
selectedTemplate = ref(null)

// 2. Application du modèle via @change
const applyTemplate = () => {
  const template = templates[selectedTemplate.value]
  if (template) {
    form.value.message_fr = template.message_fr
    form.value.message_en = template.message_en
    form.value.severity = template.severity
  }
}

// 3. L'utilisateur peut ensuite modifier les champs pré-remplis
```

## 📊 Statistiques d'Usage (à implémenter)

Pour améliorer les modèles, vous pourriez suivre :
- Modèles les plus utilisés
- Taux de personnalisation après sélection
- Modèles jamais utilisés (à retirer)
- Suggestions de nouveaux modèles

## 💡 Bonnes Pratiques

1. **Sélectionner d'abord le modèle** avant de choisir l'événement ou le type
2. **Adapter le message** selon le contexte spécifique
3. **Vérifier la gravité** : est-elle appropriée pour votre situation ?
4. **Utiliser le bon type** :
   - **Général** : Problèmes affectant tout l'événement
   - **Organisation** : Problèmes spécifiques à une organisation
   - **Journée** : Problèmes spécifiques à une date

## 🆕 Évolutions Futures

### Améliorations possibles :
- [ ] Permettre aux admins de créer leurs propres modèles personnalisés
- [ ] Enregistrer les modèles fréquemment utilisés
- [ ] Historique des modèles utilisés
- [ ] Suggestion intelligente de modèle selon le contexte
- [ ] Templates avec variables (ex: `{organization_name}`, `{new_time}`)
- [ ] Catégories de modèles personnalisables

## 📞 Support

Si vous avez besoin d'un nouveau modèle ou rencontrez un problème, contactez l'équipe de développement avec :
- Le type de message souhaité
- Le message standard en FR et EN
- La gravité suggérée
- Les cas d'usage

---

**Date de mise à jour** : 2025-01-10
**Version** : 1.0.0
**Fichiers modifiés** :
- [src/components/admin/MessageFormModal.vue](src/components/admin/MessageFormModal.vue)
- [src/locales/fr/admin.json](src/locales/fr/admin.json)
- [src/locales/en/admin.json](src/locales/en/admin.json)
