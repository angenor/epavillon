# Structure modulaire des traductions

## Vue d'ensemble
Les fichiers de traduction ont été divisés en modules pour résoudre les problèmes de taille excessive (>25000 tokens) qui empêchaient Claude Code de les traiter efficacement.

## Structure des répertoires

```
src/locales/
├── fr/                     # Traductions françaises
│   ├── common.json         # Éléments communs, nav, user, sidebar, hero, footer, error
│   ├── auth.json           # Authentification
│   ├── admin.json          # Administration
│   ├── profile.json        # Profil, messaging, notifications
│   ├── events.json         # Events, programmations, trainings, formations
│   ├── activities.json     # Activities et activity
│   ├── community.json      # Community, organizations, organizationDetail, organization
│   ├── negotiations.json   # Negotiations
│   ├── directory.json      # Directory
│   ├── appointments.json   # Appointments
│   └── index.js           # Index qui combine tous les modules
├── en/                     # Traductions anglaises (même structure)
├── backup/                 # Sauvegarde des anciens fichiers
│   ├── fr.json
│   └── en.json
└── README.md              # Ce fichier
```

## Utilisation

### Développement
Pour ajouter de nouvelles traductions :

1. **Trouver le bon module** : Identifiez dans quel module logique appartient votre nouvelle traduction
2. **Modifier le fichier JSON** : Ajoutez vos clés dans le fichier approprié (ex: `fr/community.json`)
3. **Mettre à jour les deux langues** : N'oubliez pas d'ajouter les traductions en français ET en anglais

### Ajouter un nouveau module

1. **Créer les fichiers JSON** : `fr/nouveau-module.json` et `en/nouveau-module.json`
2. **Modifier les index** : Ajouter l'import et l'export dans `fr/index.js` et `en/index.js`
3. **Optionnel** : Mettre à jour le script `scripts/split-translations.cjs` pour les futures régénérations

### Régénération automatique

Le script `scripts/split-translations.cjs` peut être utilisé pour régénérer la structure modulaire à partir des fichiers de sauvegarde :

```bash
node scripts/split-translations.cjs
```

## Avantages

✅ **Taille optimisée** : Chaque module fait moins de 25000 tokens
✅ **Organisation logique** : Les traductions sont groupées par fonctionnalité
✅ **Maintenabilité** : Plus facile de trouver et modifier des traductions
✅ **Performance** : Chargement plus rapide et efficient
✅ **Évolutivité** : Facile d'ajouter de nouveaux modules

## Migration

Les anciens fichiers `fr.json` et `en.json` ont été sauvegardés dans le dossier `backup/`. 
La configuration i18n dans `main.js` a été mise à jour pour utiliser la nouvelle structure modulaire.