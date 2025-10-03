@component('mail::message')

{{-- Contenu principal (inclut déjà la salutation si l'utilisateur l'a ajoutée) --}}
@if($details['rawHtml'] ?? false)
{!! $details['content'] !!}
@else
{!! nl2br(e($details['content'])) !!}
@endif

{{-- Bouton d'action optionnel (uniquement si show_button est true) --}}
@if(($details['show_button'] ?? false) && isset($details['dashboard_url']) && !empty($details['dashboard_url']))
@component('mail::button', ['url' => $details['dashboard_url']])
{{ $details['button_text'] ?? 'Accéder au tableau de bord' }}
@endcomponent
@endif

{{-- Signature --}}
Cordialement,
**L'équipe E-pavillon Climatique de l'{{ $details['organization_name'] ?? 'IFDD' }}**

{{-- Note de bas de page --}}
@component('mail::subcopy')
Cet email a été envoyé depuis la plateforme ePavillon Climatique de l'IFDD.
Si vous n'êtes pas le destinataire de ce message, veuillez l'ignorer et le supprimer.
@endcomponent

@endcomponent
