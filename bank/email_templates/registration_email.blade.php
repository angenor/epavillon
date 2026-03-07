@component('mail::message')
# Bienvenue ! 🎉

Nous sommes ravis de vous compter parmi nous !

@if(!empty($details['is_paco']))

@component('mail::panel')
Pour finaliser votre inscription au webinaire PACO, entrez le code ci-dessous sur la page d'inscription.
@endcomponent

@if(!empty($details['token']))
@component('mail::panel')
Votre code de verification : **{{ $details['token'] }}**
@endcomponent
@endif

@else

@component('mail::panel')
Pour finaliser votre inscription, une derniere etape est necessaire.
Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.
@endcomponent

@component('mail::button', ['url' => $details['message'], 'color' => 'success'])
Confirmer mon inscription
@endcomponent

@component('mail::subcopy')
Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
[{{ $details['message'] }}]({{ $details['message'] }})
@endcomponent

@endif

Merci de votre confiance,
**L'equipe E-pavillon Climatique**

@endcomponent
