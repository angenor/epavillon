Je veux un système d'envoie de notification par email plus flexible. Actuellement, les emails sont envoyés automatiquement en fonction de certains statuts d'événements. Je souhaite pouvoir configurer ces envois de manière plus granulaire, en fonction des besoins spécifiques de chaque événement et activités. je veux pouvoir envoyer des mails personnalisés en fonction des statuts des activités, comme "Soumise", "Validée", "Annulée", etc. Je veux aussi pouvoir choisir les destinataires de ces emails (organisateurs, participants, panélistes, etc.) et personnaliser le contenu des messages.
On doit pouvoir choisir d'envoyer des emails aussi à des individus spécifiques ou en groupe sans rapport avec des évènements ou activités.

exemple:
- J'ouvre mon outil d'envoi d'email
- Je sélectionne le type d'email que je veux envoyer: "email simple" ou "email d'evenement"
- Si je sélectionne email simple:
  - Je sélectionne le(s) destinataire(s)(en entrant leur nom ou email: pour le nom il drevait etre inscrit sur la plateforme, pour l'email pas besoin)
  - Je rédige mon email
  - J'envoie l'email
- Je sélectionne "email d'evenement"
  - Je sélectionne l'événement (dans le menu déroulant de mes événements)
  - Je sélectionne le statut des activités cibles (soumis, validé, annulé, etc.)
  - Je sélectionne le(s) destinataire(s) (organisateurs, participants, panélistes, etc.)
  - Sélection multiple possible
  - Je rédige mon email (avec des variables dynamiques comme {event_name}, {event_date}, {event_time}, {recipient_name}, etc.)
  - J'envoie l'email
  - je reçois une confirmation d'envoi


# NB:
- Pour les mails groués, il faut envoyer en BCC pour protéger la vie privée des destinataires.
- pas besoin de garder une trace des emails envoyés (qui, quand, à qui, quel contenu)
- Il faut un système de template pour les emails d'événements, avec des variables dynamiques.
- Il faut une interface utilisateur simple et intuitive pour gérer tout ça.
- l'envoi sera effectué à travers un edge function superbase. Je veux une seule route d'envoie. Tu personnaliser en fonction des donnée que tu reçois dans le controller Laravel(laravel 8.x)
