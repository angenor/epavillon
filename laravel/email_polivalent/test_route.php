<?php
// Route de test à ajouter temporairement dans routes/web.php

Route::get('/test-polivalent-email', function() {
    try {
        // Test UNIQUEMENT avec SimpleEmail
        $mailable = new \App\Mail\SimpleEmail([
            'subject' => 'Test Email Polyvalent',
            'content' => 'Ceci est un test du système email polyvalent. Si vous recevez cet email, le système fonctionne correctement.',
            'variables' => [
                '{recipient_name}' => 'Utilisateur Test',
                '{dashboard_url}' => 'https://epavillonclimatique.francophonie.org/events/dashboard',
                '{organization_name}' => 'IFDD'
            ]
        ]);

        // Envoyer l'email
        \Mail::to('angenor99@gmail.com')->send($mailable);

        return response()->json([
            'success' => true,
            'message' => 'Email envoyé avec succès à angenor99@gmail.com'
        ]);

    } catch (\Exception $e) {
        // Retourner l'erreur complète pour diagnostic
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});

// Route pour tester le rendu du template sans envoyer
Route::get('/test-polivalent-render', function() {
    try {
        $mailable = new \App\Mail\SimpleEmail([
            'subject' => 'Test Render',
            'content' => 'Test de rendu du template',
            'variables' => [
                '{recipient_name}' => 'Test User',
                '{dashboard_url}' => 'https://example.com',
                '{organization_name}' => 'IFDD'
            ]
        ]);

        // Juste rendre le HTML sans envoyer
        $html = $mailable->render();

        return response()->json([
            'success' => true,
            'html_length' => strlen($html),
            'html_preview' => substr($html, 0, 500) . '...'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});