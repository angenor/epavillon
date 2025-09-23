@component('mail::message')
{{-- Titre centré et moderne --}}
# Bienvenue ! 🎉

Nous sommes ravis de vous compter parmi nous !

{{-- Message dans un panel stylé --}}
@component('mail::panel')
Pour finaliser votre inscription, une dernière étape est nécessaire.
Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.
@endcomponent

{{-- Bouton d'action centré --}}
@component('mail::button', ['url' => $details['message'], 'color' => 'success'])
✅ Confirmer mon inscription
@endcomponent

{{-- Signature élégante --}}
Merci de votre confiance,
**L'équipe E-pavillon Climatique**

{{-- Section alternative en subcopy --}}
@component('mail::subcopy')
Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
[{{ $details['message'] }}]({{ $details['message'] }})
@endcomponent

@endcomponent
