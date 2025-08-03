# à revoire
- negotiators
- je veux qu'il y ai une table zoom qui contiendra le lien d'inscription, le lien de démarrage, l'ID de la réunion etc...
- je veux une table pivot entre activity_speakers et activities pour stocker le lien de connexion individuel la date d'inscription etc...
- activity_registrations parce qu'il faut que les personnes qui souhaitent participer à une activité puissent s'inscrire. on y stockera le lien de connexion, la date d'inscription, l'ID de l'activité, l'ID de l'utilisateur etc...

- il serait intéressant d'avoir country dans une table à part de sorte à éviter les redondances.
- dans user, au lieu de position, il faut mettre "adresse".
- un utilisateur peut etre bloqué ou suspendu par l'administrateur. 

- il arrive que des utilisateurs creer des organisations qui sont des doublons. Il faudrait donc vérifier si l'organisation existe déjà avant de la créer.
# activities
- les ENUM: activity_type, activity_theme
- je veux la possibilité d'ajouter des tags à activities
- main_theme et category doit etre des tableaux parce que je peux avoir plusieurs thèmes principaux et plusieurs catégories.
- dans activity_modifications old_value et new_value sont de type TEXT alors que les modification des activités peuvent aussi porter sur les dates(TIMESTAMPTZ), merci de trouver une solution à ça
- je veux qu'une activité supprimée puisse être restaurée. Il faut donc ajuster et aussi ajouter un champ deleted_at TIMESTAMPTZ dans activities. et un champ deleted_by UUID REFERENCES public.users(id) pour savoir qui a supprimé l'activité. et un champ deleted_reason TEXT pour savoir pourquoi l'activité a été supprimée. 

- evaluations: je ne comprends pas comment les réponses sont stockées. Il faudrait une table evaluation_answers.
- dans evaluation_questions je vois qu'il n'y a qu'une seule bonne réponse. Il faudrait permettre plusieurs bonnes réponses.
- pour evaluations et live_quizzes il faut donner la possibilité de choisir l'ordre des questions.
- pour les quiz, il me faut aussi quiz_results
- negotiator_training_progress n'a pas été conçu correctement. Je voulais plutot que les apprenants puissent marquer les leçons et chapitres comme terminés. Il faudrait probablement ajouter une ou des tables pour celà. je voudrais aussi pouvoir enregistrer lorsque les apprenants ont vue les leçons, chapitres et training. Il faudrait donc ajouter last_viewed_at TIMESTAMPTZ.
- les formations ne sont pas suivis uniquement par les négociateurs. Il faudrait donc ajouter une table training_participants qui contiendra l'ID de la formation, l'ID de l'utilisateur etc...
- les témoignages ne sont pas lié uniquements aux innovations et bonnes pratiques. Il peuvent etre liés à une formation, à un évènement ou à rien du tout(dans ce que on considère qu'il est lié à notre plateforme en ligne).
- les commentaires ne sont pas lié uniquements aux innovations et bonnes pratiques. Il peuvent etre liés à une formation, à une evenement.
- pendant et après chaque activités, il faut donner la possibilité aux participants de poser des questions. Il faut donc ajouter une table activity_questions. Une question est adressé à un ou plusieurs orateurs. Ces questions doivents etre temps reel. Le ou les orarteur(s) doivent pouvoir répondre aux questions en temps réel.
- on doit pouvoir réagir au innovations/bonnes pratiques et compter aussi les nombre de vues
- Les Réponses aux sondages doivent pouvoir être anonymes(celui qui cree l'indiquera).
- Les questions de sondages peuvent être de type texte, choix multiple(1 à n choix), oui/non, réponse ouverte.
- newsletters: je veux pouvoir envoyer des newsletters à tous les utilisateurs, aux utilisateurs d'un pays, aux utilisateurs d'une organisation, aux utilisateurs d'un groupe de messagerie, aux utilisateurs d'une activité, aux utilisateurs d'une formation, aux utilisateurs d'un évènement.
- je veux qu'on puisse s'inscrire à une newsletter de façon générale ou à une newsletter spécifique.