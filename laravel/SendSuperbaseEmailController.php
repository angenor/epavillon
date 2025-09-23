<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Mail\RegistrationEmail;
use App\Mail\PassewordReset;

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
}
