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


je veux une page ActivityDatesManager.vue (accéssible à partir de ActivitiesList.vue) qui permet de gérer les dates des activités.
Actuellement, les organisateurs on proposé des activités avec des dates qui ne sont pas forcement bonnes. Il peut y avoir des conflits de dates entre plusieurs activités.
Je veux que cette page  permette de modifier les dates par glisser-déposer et redimensionnement. les modifications seront sauvegardées automatiquement non seulemnt dans les attibut proposed_start_date et proposed_end_date  mais aussi dans des table activity_modifications activity_modifications. La sauvegarde dans activity_modifications doit se faire uniquement si l'utilisateur clique sur le bouton enregistrer. Donc il va falloir détecter des modifications(déplacement, rédimentionnement).
les cards des activités dans le tableau doivent afficher le titre de l'activité, le nom & logo de l'organisation.

 leurs couleur de fond doit etre jaune si l'activité est en cours de révision, submitted. Elles doivent etre rouge si l'activité est rejetée, annulé, elle doit etre verte si l'activité est approuvée, en cours ou terminée.
lorsqu'on modifie une date ou heure par glisser-déposer ou redimensionnement, il faut enregistrer la modification à la fois dans activity_modifications(date, auteur etc...) et dans activities(modifier proposed_start_date et proposed_end_date, ne surtout pas  mettre à jour le champ "final_start_date" et "final_end_date" de l'activité, ces dernier serons mise à jour une fois le comité d'accord) lorsque l'utilisateur clique sur le bouton "enregistrer"(ce bouton doit apparaitre dès qu'une modification est effectuée).
voici un exemple de code pour le tableau dynamique avec vue-cal: @src/views/admin/activities/exempleDateManager.vue (c'est un exemple, tu adapteras le code pour répondre aux besoins ci-dessus)

- Les heures/dates dans la base de donnée sont en heure GMT. Il faut convertir les dates en heure de l'évènement avant affichage: @src/composables/useTimezone.js , il faut ensuite convertir les dates en heure GMT avant d'enregistrer dans la base de données.
- Il faut donner la possibilité de sélectionner l'évènement pour lequel on veut gérer les dates des activités. Par défaut, l'évènement sélectionné sera le dernier évènement créé.

CREATE TYPE validation_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled', 'live', 'completed');


---------------
dans la page d'administration, Je veux une section de gestion des directs youtube des activités.
- Les activités doivent etre mise en évidence selon selon qu'il soit l'heure du direct youtube approche ou que le direct soit en cours ou que l'activité soit la prochaine. si l'évenemnt est terminé, ou annulé, la mise en évidence disparait.
- Si le lien du direct n'est pas ajouté alors qu'il est l'heure et que l'activité n'est pas annulée, il faut indiquer un message pour indiquer qu'on est en retard pour ajouter le lien du direct youtube.
- je veux deux possiblité d'ajouter le lien. possibilité 1: ajouter via un formulaire qui receuil l'id de la vidéo youtube. Possibilité 2: lorsqu'on clique sur un bouton, l'id du direct en cours sur la page https://www.youtube.com/@ifddoif/streams est automatiquement récupéré.
- une fois le lien youtube ajouté, un racourcis pour "Regarder le direct" doit apparaitre en pop-up lorsque lons ne se trouve pas sur la page de détail de l'activité sinon l'image de couverture de l'activité se remplace par un Iframe de la vidéo youtube.
- Le lien youtube doit être stocké dans un nouveau champ "youtube_link" de la table activities.
Le lien youtube doit être l'id de la vidéo youtube (ex: pour le lien https://www.youtube.com/watch?v=dQw4w9WgXcQ , l'id est dQw4w9WgXcQ).


- Cette section doit permettre d'ajouter, modifier ou supprimer le lien youtube du direct et de l'enregistrement youtube de chaque activité.

. la card de l'activité dans la liste des activités si l'activité est en direct ou un bouton "Regarder l'enregistrement" si l'activité est terminée.

