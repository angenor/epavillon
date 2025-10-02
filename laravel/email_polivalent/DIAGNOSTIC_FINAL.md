# Diagnostic final - Erreur HTML retourné

## Problème
Laravel retourne le HTML de l'email au lieu d'envoyer l'email et de retourner un JSON.

## Cause probable
Quand Laravel lance une exception pendant le rendu ou l'envoi d'un email markdown, il peut retourner le HTML partiel dans le message d'erreur.

## Solutions à tester sur le serveur

### 1. Vérifier si les composants mail sont publiés

```bash
cd /home/epavillonclimati/public_html

# Vérifier si le dossier existe
ls -la resources/views/vendor/mail/

# Si le dossier n'existe pas, publier les composants
php artisan vendor:publish --tag=laravel-mail
```

### 2. Tester directement avec tinker

```bash
php artisan tinker

# Test simple
$mail = new \App\Mail\SimpleEmail([
    'subject' => 'Test',
    'content' => 'Test content',
    'variables' => []
]);

// Essayer de rendre l'email
$html = $mail->render();
echo strlen($html);

// Si ça fonctionne, essayer d'envoyer
\Mail::to('test@example.com')->send($mail);
```

### 3. Vérifier les logs Laravel

```bash
tail -n 100 storage/logs/laravel.log | grep -A 10 -B 10 "polivalent"
```

### 4. Créer un test direct sans edge function

Créer temporairement cette route dans `routes/web.php` :

```php
Route::get('/test-email-direct', function() {
    try {
        $mailable = new \App\Mail\SimpleEmail([
            'subject' => 'Test Direct',
            'content' => 'Ceci est un test direct',
            'variables' => [
                '{recipient_name}' => 'Test User',
                '{dashboard_url}' => 'https://example.com'
            ]
        ]);

        \Mail::to('angenor99@gmail.com')->send($mailable);

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
});
```

Puis tester : `https://epavillonclimatique.francophonie.org/test-email-direct`

## Différence avec SendActivitesRecuEmail

Le système qui fonctionne (`SendActivitesRecuEmail`) :
- ✅ Utilise `->markdown('emails.activites_recu_notification')`
- ✅ Passe `$details` au template
- ✅ Envoie avec `Mail::to()->cc()->send()`

Le système qui ne fonctionne pas (`SimpleEmail`) :
- ✅ Utilise `->markdown('emails.polivalent.simple_email')`
- ✅ Passe `$details` au template
- ✅ Envoie avec `Mail::to()->send()`

Les deux systèmes sont identiques dans leur structure !

## Hypothèse finale

Le problème pourrait venir :
1. Du chemin du template (`emails.polivalent.simple_email` vs `emails.activites_recu_notification`)
2. D'une erreur dans le template lui-même sur le serveur
3. D'un problème de permissions sur le dossier `resources/views/emails/polivalent/`

## Action recommandée

1. **Copier directement le template qui fonctionne** :
```bash
cd /home/epavillonclimati/public_html
cp resources/views/emails/activites_recu_notification.blade.php resources/views/emails/polivalent/simple_email_test.blade.php
```

2. **Modifier SimpleEmail.php pour utiliser ce template** :
```php
->markdown('emails.polivalent.simple_email_test')
```

3. **Tester à nouveau**

Si ça fonctionne avec le template copié, le problème vient du contenu du template `simple_email.blade.php` sur le serveur.