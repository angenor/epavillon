modifier son organisation

migrer photo sans thumbnail compressé
gerer rendez-vous
gerer applel
gerer les notifications
gerer les messages

google analytics

parfait, dans @src/views/admin/activities/ActivityDetail.vue , je veux que la note soit dans un bouton flotant en bas à droite lorsque la note est attributé.
En plus je veux un autre bouton flotant en bas à droite avec un couleur assez visible qui permettra d'écrire les commantaires concernants l'activité où  on se trouve.
Lorsqu'on clique sur les boutons, il se transforme en une sorte de chatbot(petit fenetre en bas à droite) et l'utilisateur peut saisir sa note d'une part et peu saisir son commentaire d'autre part avant de choisir qui peut voir le commentaire parmis les révisionnistes


- un révisionniste ne peut changer le statut d'une activité ni envoyer une notification


je veux une page ActivityDatesManager.vue(à partir de ActivitiesList.vue) qui permet de gérer les dates des activités.
Actuellement, les organisateurs on proposé des activités avec des dates qui ne sont pas forcement bonnes. Il peut y avoir des conflits de dates entre plusieurs activités.
Je veux que cette page liste toutes les activités avec leurs dates sous forme de tableau dynamique et permette de modifier les dates par glisser-déposer et redimensionnement. les modifications seront sauvegardées automatiquement (aussi dans activity_modifications). Le tableau doit etre en fullscreen et avoir une vue par jour, par semaine et par mois.
Tu utiliseras vue-cal, déjà installé.
les cards des activités dans le tableau doivent afficher le titre de l'activité, le nom & logo de l'organisation. leurs couleur de fond doit etre jaune si l'activité est en cours de révision, submitted. Elles doivent etre rouge si l'activité est rejetée, annulé, elle doit etre verte si l'activité est approuvée, en cours ou terminée.
lorsqu'on modifie une date ou heure par glisser-déposer ou redimensionnement, il faut enregistrer la modification à la fois dans activity_modifications(date, auteur etc...) et dans activities(modifier proposed_start_date et proposed_end_date, ne surtout pas  mettre à jour le champ "final_start_date" et "final_end_date" de l'activité, ces dernier serons mise à jour une fois le comité d'accord) lorsque l'utilisateur clique sur le bouton "enregistrer"(ce bouton doit apparaitre dès qu'une modification est effectuée).
voici un exemple de code pour le tableau dynamique avec vue-cal: @src/views/admin/activities/exempleDateManager.vue (c'est un exemple, tu adapteras le code pour répondre aux besoins ci-dessus)

- Les heures/dates dans la base de donnée sont en heure GMT. Il faut convertir les dates en heure de l'évènement avant affichage: @src/composables/useTimezone.js , il faut ensuite convertir les dates en heure GMT avant d'enregistrer dans la base de données.
- Il faut donner la possibilité de sélectionner l'évènement pour lequel on veut gérer les dates des activités. Par défaut, l'évènement sélectionné sera le dernier évènement créé.

CREATE TYPE validation_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled', 'live', 'completed');


