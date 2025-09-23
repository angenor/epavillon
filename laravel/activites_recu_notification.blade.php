@component('mail::message')
{{-- En-tête avec logo si disponible --}}
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

{{-- Détails de l'activité --}}
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
@elseif(isset($details['event_country']) && $details['event_country'])
**Pays :** {{ $details['event_country'] }}
@endif

@if(isset($details['formatted_date']) && $details['formatted_date'])
**Dates proposées :** {{ $details['formatted_date'] }}
@endif
@endcomponent

{{-- Prochaines étapes --}}
@component('mail::panel')
### 🔍 **Prochaines étapes**

Votre proposition d'activité est maintenant entre les mains de notre **comité d'administration** qui procédera à son examen dans les meilleurs délais.

**Nous vous ferons un retour sur votre proposition sous peu.**

En attendant, nous vous remercions pour votre engagement et votre contribution à cet événement.
@endcomponent

{{-- Bouton d'accès au dashboard --}}
Nous vous invitons à ajouter vos bannières, gérer et suivre l'évolution du statut de votre activité directement depuis votre tableau de bord :

@component('mail::button', ['url' => $details['dashboard_url'] ?? 'https://epavillonclimatique.francophonie.org/events/dashboard'])
Accéder à votre tableau de bord
@endcomponent

{{-- Message de contact --}}
Si vous avez des questions concernant votre soumission, n'hésitez pas à nous contacter.

{{-- Signature --}}
Cordialement,
**L'équipe E-pavillon Climatique de l'IFDD**

{{-- Informations supplémentaires --}}
@component('mail::subcopy')
Cette notification confirme que nous avons bien reçu votre proposition d'activité.
Vous recevrez une nouvelle notification dès que notre comité aura pris une décision.

@if(isset($details['activity_id']) && $details['activity_id'])
**Référence de l'activité :** {{ $details['activity_id'] }}
@endif
@endcomponent

@endcomponent
