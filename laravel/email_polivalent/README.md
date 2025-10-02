# Système d'envoi d'emails polyvalent

## Vue d'ensemble

Ce système permet l'envoi flexible d'emails simples et d'emails d'événements via une architecture modulaire Laravel 8.x, intégrée avec Supabase Edge Functions et une interface Vue.js.

## Structure des fichiers

### Backend Laravel (`laravel/email_polivalent/`)

1. **PolivalentEmailController.php** - Contrôleur principal gérant tous les types d'emails
2. **EmailService.php** - Service contenant la logique métier
3. **SimpleEmail.php** - Classe Mailable utilisant markdown (comme SendActivitesRecuEmail)
4. **views/simple_email.blade.php** - Template markdown pour emails simples

### Edge Function Supabase

- `supabase/functions/send-email/index.ts` - Function pour router les emails vers Laravel

### Frontend Vue

- `src/components/email/SimpleEmailSender.vue` - Composant d'interface utilisateur
- `src/composables/useEmailSender.js` - Composable pour la logique d'envoi

## Installation

### 1. Configuration Laravel

#### Ajouter la route dans `laravel/routes/web.php`:

```php
use App\Http\Controllers\PolivalentEmailController;

Route::post('/send_polivalent_email', [PolivalentEmailController::class, 'send'])
    ->name('email.polivalent.send');
```

#### Déplacer les fichiers vers la structure Laravel appropriée:

```bash
# Depuis le dossier laravel/email_polivalent/

# Controller
cp PolivalentEmailController.php ../app/Http/Controllers/

# Service
mkdir -p ../app/Services
cp EmailService.php ../app/Services/

# Mailable (utilise maintenant markdown comme SendActivitesRecuEmail)
cp SimpleEmail.php ../app/Mail/

# Views (template markdown uniquement)
mkdir -p ../resources/views/emails/polivalent
cp views/simple_email.blade.php ../resources/views/emails/polivalent/
```

#### Vider les caches après installation:

```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

#### Note importante sur la configuration

Ce système utilise les mêmes composants mail markdown que `SendActivitesRecuEmail` qui fonctionne déjà sur votre serveur. Si les composants mail ne sont pas disponibles, vous pouvez les publier avec :

```bash
php artisan vendor:publish --tag=laravel-mail
```

### 2. Configuration Supabase Edge Function

#### Déployer la fonction:

```bash
supabase functions deploy send-email
```

#### Variables d'environnement requises:

```env
LARAVEL_POLIVALENT_EMAIL_URL=https://votre-domaine.com/send_polivalent_email
SUPABASE_CUSTOM_AUTH_LARAVEL_KEY=votre_clé_auth
```

### 3. Intégration Vue.js

Le composant `SimpleEmailSender` peut être utilisé dans n'importe quelle vue:

```vue
<template>
  <SimpleEmailSender />
</template>

<script>
import SimpleEmailSender from '@/components/email/SimpleEmailSender.vue'

export default {
  components: {
    SimpleEmailSender
  }
}
</script>
```

## Utilisation

### Email Simple (Implémenté)

#### Structure de la requête:

```json
{
  "email_type": "simple",
  "subject": "Objet de l'email",
  "content": "Contenu avec {recipient_name}",
  "recipients": {
    "to": ["email1@example.com"],
    "cc": ["email2@example.com"],
    "bcc": ["email3@example.com"]
  },
  "variables": {
    "{recipient_name}": "Jean Dupont",
    "{organization_name}": "IFDD"
  }
}
```

#### Variables dynamiques disponibles:

- `{recipient_name}` - Nom complet du destinataire
- `{recipient_first_name}` - Prénom
- `{recipient_last_name}` - Nom de famille
- `{recipient_email}` - Email
- `{organization_name}` - Organisation
- `{current_date}` - Date actuelle
- `{current_time}` - Heure actuelle
- `{dashboard_url}` - URL du tableau de bord

### Email d'Événement (À implémenter)

Cette fonctionnalité sera disponible dans la phase 2 et permettra:
- Sélection d'événements spécifiques
- Filtrage par statut d'activité
- Envoi groupé par rôle (organisateurs, participants, etc.)
- Variables dynamiques d'événement

## Fonctionnalités clés

### Protection de la vie privée
- Envoi automatique en BCC pour les groupes de plus de 5 destinataires
- Validation des adresses email

### Templates prédéfinis
- Bienvenue
- Notification
- Rappel
- Personnalisé

### Interface utilisateur
- Prévisualisation en temps réel
- Insertion facile de variables
- Support multi-langue (FR/EN)

## API Endpoints

### POST `/send_polivalent_email`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Email envoyé avec succès",
  "data": {
    "type": "simple",
    "recipients_count": {
      "to": 2,
      "cc": 1,
      "bcc": 3
    }
  }
}
```

**Réponse erreur (422):**
```json
{
  "success": false,
  "errors": {
    "subject": ["Le sujet est requis"],
    "recipients.to": ["Au moins un destinataire est requis"]
  }
}
```

## Sécurité

- Validation stricte des données entrantes
- Protection CSRF via Laravel
- Authentification par Bearer token
- Logging des erreurs sans exposition de données sensibles

## Maintenance

### Logs
Les logs sont disponibles dans `storage/logs/laravel.log`

### Debug
En mode debug (`APP_DEBUG=true`), les messages d'erreur détaillés sont inclus dans les réponses JSON.

## Prochaines étapes

1. **Phase 2 - Email d'événement:**
   - Intégration avec la base de données Supabase
   - Sélection dynamique des destinataires
   - Templates spécifiques aux événements

2. **Améliorations futures:**
   - Système de files d'attente pour envois massifs
   - Statistiques d'envoi
   - Templates HTML avancés
   - Pièces jointes

## Support

Pour toute question ou problème, consultez la documentation principale du projet ou contactez l'équipe de développement.