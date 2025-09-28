Les url de photo de profil des anciens utilisateurs (photo_url) doivent pointer vers l'ancienne plateforme laravel. la structure des urls de l'ancienne plateforme est par exemple "images_uploades/oh3vcJFvqaH016tTdVauGOuQFtyrStK6ckEyTJXt.jpg". donc l'url complète est"https://epavillonclimatique.francophonie.org/" + l'ancienne valeur de photo_url (exemple: "https://epavillonclimatique.francophonie.org/images_uploades/oh3vcJFvqaH016tTdVauGOuQFtyrStK6ckEyTJXt.jpg").

celà correspond à profile_photo_url dans la nouvelle plateforme. mais le problème c'est que dans la nouvelle plateforme, il y a aussi profile_photo_thumbnail_url. je veux que tu creer un bouton(fonctionnalité) pour migrer l'url de la photo de profil (profile_photo_url) et que tu génère profile_photo_thumbnail_url qui sera stocké sur superbase.

# Resumé
- Tu dois créer une fonctionnalité (un bouton) pour migrer les anciennes URLs de photo de profil des utilisateurs.
- L'URL complète de la photo de profil doit être construite en concaténant la base URL "https://epavillonclimatique.francophonie.org/" avec la valeur existante de "photo_url" de l'ancienne plateforme.
- Cette URL complète doit être stockée dans le champ "profile_photo_url" de la nouvelle plateforme.
- Tu dois également générer une version miniature de cette photo de profil et stocker cette miniature dans le champ "profile_photo_thumbnail_url" de la nouvelle plateforme.

pour générer "profile_photo_thumbnail_url", tu peux t'inspirer de comment fait /Users/angenor/Documents/projets/IFDD/epavillonvue/src/views/profils/Profile.vue
