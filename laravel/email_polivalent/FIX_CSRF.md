# Solution : Désactiver la protection CSRF pour la route email polyvalent

## Problème identifié
Les routes dans `web.php` ont la protection CSRF activée par défaut. L'Edge Function ne peut pas fournir de token CSRF, donc Laravel rejette la requête.

## Solution 1 : Exclure la route du middleware CSRF

Modifier `app/Http/Middleware/VerifyCsrfToken.php` :

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Routes existantes
        '/send_email_passeword_reset',
        '/send_email',
        '/send_activites_recu_email',
        // Ajouter la nouvelle route
        '/send_polivalent_email'
    ];
}
```

## Solution 2 : Déplacer la route vers api.php

Créer ou modifier `routes/api.php` :

```php
<?php

use App\Http\Controllers\PolivalentEmailController;
use Illuminate\Support\Facades\Route;

// Route API sans protection CSRF
Route::post('/send_polivalent_email', [PolivalentEmailController::class, 'send']);
```

Puis mettre à jour l'URL dans l'Edge Function :
```
LARAVEL_POLIVALENT_EMAIL_URL=https://epavillonclimatique.francophonie.org/api/send_polivalent_email
```

## Solution 3 : Vérifier l'authentification Bearer

Si le contrôleur vérifie un Bearer token, s'assurer que :

1. La variable d'environnement `SUPABASE_CUSTOM_AUTH_LARAVEL_KEY` est définie dans Supabase
2. Le contrôleur accepte ce token

Ajouter des logs dans `PolivalentEmailController.php` :

```php
public function send(Request $request)
{
    \Log::info('Polivalent email request received', [
        'headers' => $request->headers->all(),
        'auth' => $request->header('Authorization'),
        'data' => $request->all()
    ]);

    // ... reste du code
}
```

## Commande pour vérifier

Tester directement depuis le serveur :

```bash
curl -X POST https://epavillonclimatique.francophonie.org/send_polivalent_email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-key" \
  -d '{"email_type":"simple","subject":"Test","content":"Test","recipients":{"to":["test@example.com"]}}'
```

Si ça retourne une page HTML ou rien, c'est le CSRF. Si ça retourne un JSON d'erreur, c'est l'authentification.