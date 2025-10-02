<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class EmailService
{
    /**
     * Variables dynamiques disponibles
     */
    protected $availableVariables = [
        // Variables générales
        '{current_date}' => 'Date actuelle',
        '{current_time}' => 'Heure actuelle',
        '{current_year}' => 'Année actuelle',
        '{dashboard_url}' => 'URL du tableau de bord',

        // Variables de destinataire
        '{recipient_name}' => 'Nom complet du destinataire',
        '{recipient_first_name}' => 'Prénom du destinataire',
        '{recipient_last_name}' => 'Nom de famille du destinataire',
        '{recipient_email}' => 'Email du destinataire',

        // Variables d'organisation
        '{organization_name}' => 'Nom de l\'organisation',
        '{organization_email}' => 'Email de l\'organisation',

        // Variables d'événement (pour future implémentation)
        '{event_name}' => 'Nom de l\'événement',
        '{event_title}' => 'Titre de l\'événement',
        '{event_date}' => 'Date de l\'événement',
        '{event_time}' => 'Heure de l\'événement',
        '{event_city}' => 'Ville de l\'événement',
        '{event_country}' => 'Pays de l\'événement',
        '{event_address}' => 'Adresse de l\'événement',

        // Variables d'activité
        '{activity_title}' => 'Titre de l\'activité',
        '{activity_status}' => 'Statut de l\'activité',
        '{activity_date}' => 'Date de l\'activité',
        '{coordinator_name}' => 'Nom du coordinateur',
    ];

    /**
     * Prépare les données pour un email simple
     */
    public function prepareSimpleEmail(array $data): array
    {
        // Ajouter des variables par défaut si non fournies
        if (!isset($data['variables'])) {
            $data['variables'] = [];
        }

        // Variables automatiques
        $data['variables']['{current_date}'] = Carbon::now()->format('d/m/Y');
        $data['variables']['{current_time}'] = Carbon::now()->format('H:i');
        $data['variables']['{current_year}'] = Carbon::now()->format('Y');
        $data['variables']['{dashboard_url}'] = config('app.frontend_url', 'https://epavillonclimatique.francophonie.org');

        return $data;
    }

    /**
     * Prépare les destinataires pour l'envoi
     */
    public function prepareRecipients(array $recipients): array
    {
        $prepared = [
            'to' => [],
            'cc' => [],
            'bcc' => []
        ];

        // Traiter les destinataires "to"
        if (!empty($recipients['to'])) {
            $prepared['to'] = $this->normalizeEmails($recipients['to']);
        }

        // Traiter les destinataires "cc"
        if (!empty($recipients['cc'])) {
            $prepared['cc'] = $this->normalizeEmails($recipients['cc']);
        }

        // Traiter les destinataires "bcc"
        if (!empty($recipients['bcc'])) {
            $prepared['bcc'] = $this->normalizeEmails($recipients['bcc']);
        }

        // Pour les envois groupés, utiliser BCC pour protéger la vie privée
        if (count($prepared['to']) > 5 && empty($prepared['bcc'])) {
            // Déplacer tous sauf le premier en BCC
            $prepared['bcc'] = array_slice($prepared['to'], 1);
            $prepared['to'] = array_slice($prepared['to'], 0, 1);

            Log::info('Conversion automatique en BCC pour envoi groupé', [
                'total_recipients' => count($prepared['bcc']) + 1
            ]);
        }

        return $prepared;
    }

    /**
     * Normalise les adresses email
     */
    protected function normalizeEmails(array $emails): array
    {
        return array_map(function($email) {
            if (is_string($email)) {
                return strtolower(trim($email));
            }
            if (is_array($email) && isset($email['email'])) {
                $normalized = [
                    'email' => strtolower(trim($email['email']))
                ];
                if (isset($email['name'])) {
                    $normalized['name'] = trim($email['name']);
                }
                return $normalized;
            }
            return $email;
        }, $emails);
    }

    /**
     * Remplace les variables dynamiques dans le texte
     */
    public function replaceVariables(string $text, array $variables): string
    {
        // Remplacer chaque variable trouvée
        foreach ($variables as $key => $value) {
            // S'assurer que la clé commence par { et finit par }
            if (!str_starts_with($key, '{')) {
                $key = '{' . $key;
            }
            if (!str_ends_with($key, '}')) {
                $key = $key . '}';
            }

            $text = str_replace($key, $value, $text);
        }

        // Nettoyer les variables non remplacées (optionnel)
        // On peut les laisser ou les supprimer selon le besoin
        $text = $this->cleanUnusedVariables($text);

        return $text;
    }

    /**
     * Nettoie les variables non utilisées du texte
     */
    protected function cleanUnusedVariables(string $text): string
    {
        // Regex pour trouver les variables de format {variable_name}
        $pattern = '/\{[a-zA-Z_][a-zA-Z0-9_]*\}/';

        // Les remplacer par une chaîne vide ou un placeholder
        // Pour l'instant, on les laisse telles quelles pour le débogage
        // $text = preg_replace($pattern, '', $text);

        return $text;
    }

    /**
     * Récupère les destinataires basés sur un événement et des critères
     * (Pour future implémentation)
     */
    public function getEventRecipients(string $eventId, array $criteria = []): array
    {
        // À implémenter avec les requêtes à la base de données
        // Cette méthode récupérera les emails selon :
        // - Le statut des activités
        // - Les rôles (organisateurs, participants, panélistes, etc.)
        // - Les critères spécifiques de l'événement

        return [];
    }

    /**
     * Récupère les informations d'un événement pour les variables
     * (Pour future implémentation)
     */
    public function getEventVariables(string $eventId): array
    {
        // À implémenter avec les requêtes à la base de données
        // Cette méthode récupérera toutes les variables liées à un événement

        return [];
    }

    /**
     * Valide une adresse email
     */
    public function isValidEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Récupère la liste des variables disponibles
     */
    public function getAvailableVariables(): array
    {
        return $this->availableVariables;
    }

    /**
     * Recherche des utilisateurs par nom ou email
     * (Pour l'autocomplétion dans l'interface)
     */
    public function searchUsers(string $query): array
    {
        // À implémenter avec la connexion à la base de données
        // Recherche dans la table users de Supabase

        return [];
    }

    /**
     * Crée un template d'email avec les variables par défaut
     */
    public function createEmailTemplate(string $type = 'simple'): array
    {
        $templates = [
            'simple' => [
                'subject' => 'Information importante',
                'content' => "Bonjour {recipient_name},\n\nNous espérons que ce message vous trouve bien.\n\n[Votre message ici]\n\nCordialement,\nL'équipe IFDD",
                'variables' => [
                    '{recipient_name}' => 'Destinataire'
                ]
            ],
            'event' => [
                'subject' => 'Mise à jour concernant {event_name}',
                'content' => "Bonjour {recipient_name},\n\nNous vous informons d'une mise à jour concernant l'événement {event_name} qui aura lieu le {event_date} à {event_city}, {event_country}.\n\n[Détails de la mise à jour]\n\nPour plus d'informations, veuillez consulter votre tableau de bord : {dashboard_url}\n\nCordialement,\nL'équipe organisatrice",
                'variables' => [
                    '{recipient_name}' => 'Destinataire',
                    '{event_name}' => 'Nom de l\'événement',
                    '{event_date}' => 'Date de l\'événement',
                    '{event_city}' => 'Ville',
                    '{event_country}' => 'Pays',
                    '{dashboard_url}' => 'URL du tableau de bord'
                ]
            ]
        ];

        return $templates[$type] ?? $templates['simple'];
    }
}