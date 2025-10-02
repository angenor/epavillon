@component('mail::message')
# {{ $details['subject'] ?? 'Notification' }}

{{ $details['content'] ?? '' }}

@if(isset($details['dashboard_url']) && !empty($details['dashboard_url']))
@component('mail::button', ['url' => $details['dashboard_url']])
Accéder au tableau de bord
@endcomponent
@endif

Cordialement,<br>
L'équipe {{ config('app.name') }}
@endcomponent