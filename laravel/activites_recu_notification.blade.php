@component('mail::message')
{{-- En-tête avec logo et titre --}}
@if(isset($details['event_logo']) && $details['event_logo'])
<div style="text-align: center; margin-bottom: 30px;">
    <img src="{{ $details['event_logo'] }}" alt="Logo de l'événement" style="max-height: 80px; width: auto;">
</div>
@endif

# Confirmation de réception 📝

@if(isset($details['coordinator_name']) && $details['coordinator_name'])
Bonjour {{ $details['coordinator_name'] }},
@else
Bonjour,
@endif

Nous accusons réception de votre proposition d'activité et vous remercions pour votre soumission.

{{-- Détails de l'activité dans un panel --}}
@component('mail::panel')
## 📋 **Détails de votre activité**

**Titre :** {{ $details['activity_title'] }}

@if(isset($details['organization_name']) && $details['organization_name'])
**Organisation :** {{ $details['organization_name'] }}
@endif

@if(isset($details['event_title']) && $details['event_title'])
**Événement :** {{ $details['event_title'] }}
@endif

@if(isset($details['event_city']) && $details['event_city'] && isset($details['event_country']) && $details['event_country'])
**Lieu :** {{ $details['event_city'] }}, {{ $details['event_country'] }}
@endif

@if(isset($details['formatted_start_date']) && $details['formatted_start_date'] && isset($details['formatted_end_date']) && $details['formatted_end_date'])
**Dates proposées :**
Du {{ $details['formatted_start_date'] }} au {{ $details['formatted_end_date'] }}
@if(isset($details['timezone']) && $details['timezone'] !== 'UTC')
(Fuseau horaire : {{ $details['timezone'] }})
@endif
@endif
@endcomponent

{{-- Message principal --}}
@component('mail::panel')
### 🔍 **Prochaines étapes**

Votre proposition d'activité est maintenant entre les mains de notre **comité d'administration** qui procédera à son examen dans les meilleurs délais.

**Nous vous ferons un retour sur votre proposition sous peu.**

En attendant, nous vous remercions pour votre engagement et votre contribution à cet événement.
@endcomponent

{{-- Section informative --}}
Si vous avez des questions concernant votre soumission, n'hésitez pas à nous contacter.

{{-- Signature --}}
Cordialement,
**L'équipe E-pavillon Climatique de l'IFDD**

{{-- Subcopy avec informations supplémentaires --}}
@component('mail::subcopy')
Cette notification confirme que nous avons bien reçu votre proposition d'activité.
Vous recevrez une nouvelle notification dès que notre comité aura pris une décision.

@if(isset($details['activity_id']) && $details['activity_id'])
**Référence de l'activité :** {{ $details['activity_id'] }}
@endif
@endcomponent

@endcomponent