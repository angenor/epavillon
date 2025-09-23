<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Mail\RegistrationEmail;
use App\Mail\PassewordReset;
use App\Mail\SendActivitesRecuEmail;

class SendSuperbaseEmailController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    /*public function __invoke(Request $request)
    {
        //
    }*/

    public function index(Request $request){

        $email = $request->input('email');
      $token = $request->input('token');
      $tokenHash = $request->input('token_hash');
      $redirectTo = $request->input('redirect_to');
      $userId = $request->input('user_id');
      // Construire le lien de confirmation
      $confirmationUrl = $request->input('confirmation_url');


      \Mail::to($email)
            ->send(new RegistrationEmail([
                'message' => $confirmationUrl,
            ],
            "Confirmation de votre inscription"
        ));

        return response()->json(['success' => true]);
    }

    public function send_email_passeword_reset(Request $request){


      $reset_url = $request->input('reset_url');
      $email = $request->input('email');

      \Mail::to($email)
            ->send(new PassewordReset([
                'message' => $reset_url,
            ],
            "Réinitialisation de votre mot de passe Epavillon"
        ));

        return response()->json(['success' => true]);
    }

    public function send_activites_recu_email(Request $request){

        // Récupérer les données de l'activité depuis la requête
        $activityId = $request->input('activity_id');
        $activityTitle = $request->input('activity_title');
        $coordinatorEmail = $request->input('coordinator_email');
        $coordinatorName = $request->input('coordinator_name');
        $organizationName = $request->input('organization_name');
        $eventTitle = $request->input('event_title');
        $eventLogo = $request->input('event_logo');
        $eventCity = $request->input('event_city');
        $eventCountry = $request->input('event_country');
        $proposedStartDate = $request->input('proposed_start_date');
        $proposedEndDate = $request->input('proposed_end_date');
        $timezone = $request->input('timezone', 'UTC');

        // Validation des données requises
        if (!$coordinatorEmail || !$activityTitle) {
            return response()->json([
                'success' => false,
                'error' => 'Email du coordinateur et titre de l\'activité requis'
            ], 400);
        }

        try {
            // Préparer les données pour l'email
            $emailData = [
                'activity_id' => $activityId,
                'activity_title' => $activityTitle,
                'coordinator_name' => $coordinatorName,
                'organization_name' => $organizationName,
                'event_title' => $eventTitle,
                'event_logo' => $eventLogo,
                'event_city' => $eventCity,
                'event_country' => $eventCountry,
                'proposed_start_date' => $proposedStartDate,
                'proposed_end_date' => $proposedEndDate,
                'timezone' => $timezone,
                'formatted_start_date' => $proposedStartDate ? \Carbon\Carbon::parse($proposedStartDate)->setTimezone($timezone)->format('d/m/Y à H:i') : null,
                'formatted_end_date' => $proposedEndDate ? \Carbon\Carbon::parse($proposedEndDate)->setTimezone($timezone)->format('d/m/Y à H:i') : null,
            ];

            // Envoyer l'email
            \Mail::to($coordinatorEmail)
                ->send(new SendActivitesRecuEmail(
                    $emailData,
                    "Confirmation de réception de votre activité - {$activityTitle}"
                ));

            return response()->json([
                'success' => true,
                'message' => 'Email de confirmation envoyé avec succès'
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'envoi de l\'email d\'activité reçue', [
                'error' => $e->getMessage(),
                'activity_id' => $activityId,
                'coordinator_email' => $coordinatorEmail
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()
            ], 500);
        }
    }
}
