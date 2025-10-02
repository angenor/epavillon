<?php

// Ajouter cette route dans votre fichier laravel/routes/web.php

use App\Http\Controllers\PolivalentEmailController;

// Route pour l'envoi d'emails polyvalents
Route::post('/send_polivalent_email', [PolivalentEmailController::class, 'send'])
    ->name('email.polivalent.send');

// Note: Si vous utilisez une authentification ou des middlewares spécifiques,
// vous pouvez les ajouter comme ceci:
// Route::post('/send_polivalent_email', [PolivalentEmailController::class, 'send'])
//     ->middleware(['auth', 'cors'])
//     ->name('email.polivalent.send');