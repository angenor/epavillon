@component('mail::message')

{{-- Salutation personnalisée --}}
@if(isset($details['recipient_name']) && $details['recipient_name'])
Bonjour {{ $details['recipient_name'] }},
@else
Bonjour,
@endif

{{-- Contenu principal --}}
@if($details['rawHtml'] ?? false)
{!! $details['content'] !!}
@else
{!! nl2br(e($details['content'])) !!}
@endif

{{-- Bouton d'action optionnel --}}
@if(isset($details['dashboard_url']) && !empty($details['dashboard_url']))
@component('mail::button', ['url' => $details['dashboard_url']])
Accéder au tableau de bord
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
