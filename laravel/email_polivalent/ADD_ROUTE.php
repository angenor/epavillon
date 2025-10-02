<?php
// ROUTE MANQUANTE À AJOUTER DANS routes/web.php

use App\Http\Controllers\PolivalentEmailController;

// Ajouter cette ligne après les autres routes d'email
Route::post('/send_polivalent_email', [PolivalentEmailController::class, 'send'])
    ->name('email.polivalent.send');