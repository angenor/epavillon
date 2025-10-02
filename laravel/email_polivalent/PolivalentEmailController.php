<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\EmailService;
use App\Mail\SimpleEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PolivalentEmailController extends Controller
{
    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    /**
     * Méthode unique pour l'envoi d'emails polyvalents
     * Gère les emails simples et les emails d'événements (future implémentation)
     */
    public function send(Request $request)
    {
        try {
            // Validation de base
            $validator = Validator::make($request->all(), [
                'email_type' => 'required|in:simple,event',
                'subject' => 'required|string|max:255',
                'content' => 'required|string',
                'recipients' => 'required|array',
                'recipients.to' => 'required_without_all:recipients.cc,recipients.bcc|array',
                'recipients.to.*' => 'email',
                'recipients.cc' => 'array',
                'recipients.cc.*' => 'email',
                'recipients.bcc' => 'array',
                'recipients.bcc.*' => 'email',
                'variables' => 'array',
                'template' => 'string',
                // Pour les emails d'événement (future implémentation)
                'event_id' => 'string|uuid',
                'activity_status' => 'in:submitted,approved,rejected,cancelled',
                'recipient_roles' => 'array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();
            $emailType = $validated['email_type'];

            // Router selon le type d'email
            switch ($emailType) {
                case 'simple':
                    return $this->sendSimpleEmail($validated);

                case 'event':
                    // À implémenter plus tard
                    return response()->json([
                        'success' => false,
                        'message' => 'Les emails d\'événements seront implémentés dans une prochaine version'
                    ], 501);

                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Type d\'email non supporté'
                    ], 400);
            }

        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi d\'email polyvalent', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'envoi de l\'email',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Envoie un email simple
     */
    protected function sendSimpleEmail(array $data)
    {
        try {
            // Préparer les données de l'email
            $emailData = $this->emailService->prepareSimpleEmail($data);

            // Remplacer les variables dynamiques dans le contenu et le sujet
            $content = $this->emailService->replaceVariables(
                $data['content'],
                $data['variables'] ?? []
            );

            $subject = $this->emailService->replaceVariables(
                $data['subject'],
                $data['variables'] ?? []
            );

            // Préparer les destinataires
            $recipients = $this->emailService->prepareRecipients($data['recipients']);

            // Créer le Mailable
            $mailable = new SimpleEmail([
                'subject' => $subject,
                'content' => $content,
                'template' => $data['template'] ?? 'simple_email',
                'variables' => $data['variables'] ?? []
            ]);

            // Envoyer l'email avec la syntaxe exacte de SendSuperbaseEmailController
            // Utiliser directement Mail::to()->send() sans boucles complexes

            // Extraire les emails (gérer les formats array et string)
            $toEmails = [];
            if (!empty($recipients['to'])) {
                foreach ($recipients['to'] as $recipient) {
                    $toEmails[] = is_array($recipient) ? $recipient['email'] : $recipient;
                }
            }

            $ccEmails = [];
            if (!empty($recipients['cc'])) {
                foreach ($recipients['cc'] as $recipient) {
                    $ccEmails[] = is_array($recipient) ? $recipient['email'] : $recipient;
                }
            }

            $bccEmails = [];
            if (!empty($recipients['bcc'])) {
                foreach ($recipients['bcc'] as $recipient) {
                    $bccEmails[] = is_array($recipient) ? $recipient['email'] : $recipient;
                }
            }

            // Envoyer l'email
            if (!empty($toEmails)) {
                // Envoyer avec TO (et optionnellement CC/BCC)
                $mail = Mail::to($toEmails);

                if (!empty($ccEmails)) {
                    $mail->cc($ccEmails);
                }

                if (!empty($bccEmails)) {
                    $mail->bcc($bccEmails);
                }

                $mail->send($mailable);

            } elseif (!empty($bccEmails)) {
                // Si seulement BCC (envoi groupé), utiliser l'adresse de l'expéditeur comme destinataire principal
                Mail::to(config('mail.from.address'))
                    ->bcc($bccEmails)
                    ->send($mailable);
            } else {
                throw new \Exception('Aucun destinataire spécifié');
            }

            // Logging du succès
            Log::info('Email polyvalent envoyé avec succès', [
                'type' => 'simple',
                'subject' => $subject,
                'recipients_count' => [
                    'to' => count($recipients['to'] ?? []),
                    'cc' => count($recipients['cc'] ?? []),
                    'bcc' => count($recipients['bcc'] ?? [])
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email envoyé avec succès',
                'data' => [
                    'type' => 'simple',
                    'recipients_count' => [
                        'to' => count($recipients['to'] ?? []),
                        'cc' => count($recipients['cc'] ?? []),
                        'bcc' => count($recipients['bcc'] ?? [])
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi de l\'email simple', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);

            throw $e;
        }
    }

    /**
     * Envoie un email d'événement (à implémenter)
     */
    protected function sendEventEmail(array $data)
    {
        // À implémenter dans la prochaine phase
        // Cette méthode gérera :
        // - La récupération des destinataires selon les rôles et statuts
        // - L'application de templates spécifiques aux événements
        // - La gestion des variables dynamiques d'événement

        return response()->json([
            'success' => false,
            'message' => 'Fonctionnalité à venir'
        ], 501);
    }
}