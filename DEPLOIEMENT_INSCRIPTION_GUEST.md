# 🚀 Guide de déploiement : Inscription Guest pour les activités

## ✅ Modifications effectuées

### 1. **Base de données**
- ✅ Script SQL de migration créé : `bank/shema_et_requettes/migration_activity_registrations_guest_support.sql`
- ✅ Schéma mis à jour : `bank/shema_et_requettes/database_complete.sql`

### 2. **Fonction Edge**
- ✅ Fonction `register-to-zoom-meeting` restaurée pour supporter les guests
- ✅ Validation pour les utilisateurs authentifiés ET non authentifiés

### 3. **Frontend**
- ✅ Bouton d'inscription visible pour tous (utilisateurs connectés et non connectés)
- ✅ Modal d'inscription guest créé avec formulaire complet
- ✅ Validation côté client des champs obligatoires
- ✅ Support du mode sombre
- ✅ Traductions FR/EN complètes

---

## 📋 Étapes de déploiement

### Étape 1 : Appliquer le script SQL de migration

**IMPORTANT** : Cette migration modifie la structure de la table `activity_registrations`. Assurez-vous de faire une sauvegarde avant.

```bash
# Option 1 : Via l'interface Supabase (recommandé)
# 1. Aller dans le Dashboard Supabase
# 2. Accéder à l'éditeur SQL
# 3. Copier le contenu de bank/shema_et_requettes/migration_activity_registrations_guest_support.sql
# 4. Exécuter le script

# Option 2 : Via la CLI Supabase
supabase db push
```

**Résumé des modifications SQL :**
- Création du type ENUM `registration_type`
- `user_id` devient nullable
- Ajout des colonnes : `guest_email`, `guest_first_name`, `guest_last_name`, `guest_organization`, `guest_country_id`
- Ajout des colonnes : `registration_type`, `zoom_registrant_id`, `zoom_join_url`
- Contraintes CHECK pour garantir la cohérence des données
- Index uniques pour éviter les doublons (par `user_id` OU par `guest_email`)

### Étape 2 : Déployer la fonction edge mise à jour

```bash
# Déployer la fonction edge
npx supabase functions deploy register-to-zoom-meeting

# ou avec la CLI Supabase
supabase functions deploy register-to-zoom-meeting
```

### Étape 3 : Vérifier les variables d'environnement

Assurez-vous que ces variables sont configurées dans Supabase Edge Functions :

```bash
ZOOM_ACCOUNT_ID=votre_account_id
ZOOM_CLIENT_ID=votre_client_id
ZOOM_CLIENT_SECRET=votre_client_secret
SUPABASE_URL=votre_url_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

### Étape 4 : Build et déploiement du frontend

```bash
# Build de l'application
npm run build

# Prévisualiser le build localement (optionnel)
npm run preview

# Déployer selon votre méthode habituelle
# (Firebase, Vercel, Netlify, etc.)
```

---

## 🧪 Tests à effectuer

### Test 1 : Inscription utilisateur authentifié
1. Se connecter avec un compte utilisateur
2. Accéder à une activité approuvée avec Zoom
3. Cliquer sur "S'inscrire"
4. ✅ Vérifier que l'inscription se fait directement
5. ✅ Vérifier que le modal de succès s'affiche avec le lien Zoom
6. ✅ Vérifier qu'on ne peut pas s'inscrire deux fois (message "Déjà inscrit")

### Test 2 : Inscription guest (non connecté)
1. Se déconnecter ou utiliser une navigation privée
2. Accéder à une activité approuvée avec Zoom
3. Cliquer sur "S'inscrire"
4. ✅ Vérifier que le formulaire guest s'affiche
5. ✅ Remplir le formulaire (email, prénom, nom)
6. ✅ Soumettre l'inscription
7. ✅ Vérifier que le modal de succès s'affiche avec le lien Zoom
8. ✅ Réessayer de s'inscrire avec le même email
9. ✅ Vérifier que le message "Déjà inscrit" s'affiche

### Test 3 : Validation du formulaire
1. Ouvrir le formulaire guest
2. ✅ Essayer de soumettre sans remplir les champs → Erreurs affichées
3. ✅ Saisir un email invalide → Message d'erreur
4. ✅ Saisir un prénom de moins de 2 caractères → Message d'erreur
5. ✅ Remplir correctement → Inscription réussie

### Test 4 : Mode sombre
1. Activer le mode sombre
2. ✅ Vérifier que tous les modaux s'affichent correctement
3. ✅ Vérifier le contraste et la lisibilité

### Test 5 : Traductions
1. Changer la langue en EN
2. ✅ Vérifier que toutes les traductions s'affichent
3. Revenir en FR
4. ✅ Vérifier que toutes les traductions s'affichent

---

## 📊 Structure de données

### Table `activity_registrations` (après migration)

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| `id` | UUID | Non | Identifiant unique |
| `activity_id` | UUID | Non | ID de l'activité |
| `user_id` | UUID | Oui | ID utilisateur (NULL pour guest) |
| `guest_email` | TEXT | Oui | Email du guest |
| `guest_first_name` | TEXT | Oui | Prénom du guest |
| `guest_last_name` | TEXT | Oui | Nom du guest |
| `guest_organization` | TEXT | Oui | Organisation du guest |
| `guest_country_id` | UUID | Oui | Pays du guest |
| `registration_type` | ENUM | Non | `'user'` ou `'guest'` |
| `zoom_registrant_id` | TEXT | Oui | ID Zoom du participant |
| `zoom_join_url` | TEXT | Oui | Lien Zoom personnalisé |
| `registration_date` | TIMESTAMPTZ | Non | Date d'inscription |
| `attended` | BOOLEAN | Non | Présence confirmée |

**Contraintes :**
- Un seul enregistrement par `(activity_id, user_id)` pour les utilisateurs
- Un seul enregistrement par `(activity_id, guest_email)` pour les guests
- `user_id` OU `guest_email` doit être renseigné (pas les deux)
- Si guest, `guest_first_name` et `guest_last_name` obligatoires

---

## 🎯 Fonctionnalités

### Pour les utilisateurs authentifiés
- ✅ Inscription en un clic
- ✅ Informations pré-remplies depuis le profil
- ✅ Lien Zoom personnalisé immédiat

### Pour les guests (non connectés)
- ✅ Formulaire d'inscription simple
- ✅ Champs requis : email, prénom, nom
- ✅ Champs optionnels : organisation, pays
- ✅ Validation côté client
- ✅ Lien Zoom personnalisé immédiat
- ✅ Email de confirmation (à implémenter séparément)

### Sécurité
- ✅ Vérification anti-doublon (email OU user_id)
- ✅ Validation stricte des données
- ✅ Contraintes de base de données
- ✅ Authentification optionnelle

---

## ⚠️ Points d'attention

### 1. Email de confirmation
Le système renvoie le lien Zoom mais **n'envoie pas encore d'email automatique**.
Vous pouvez implémenter cela :
- Via un trigger Supabase
- Via une fonction edge dédiée
- Via un service tiers (SendGrid, Mailgun, etc.)

### 2. Gestion des guests après inscription
Les guests n'ont pas de compte, donc :
- Ils ne peuvent pas consulter leur historique
- Ils doivent conserver l'email avec le lien Zoom
- Envisager d'ajouter une page "Récupérer mon lien" par email

### 3. Performance
Si beaucoup d'inscriptions simultanées :
- Vérifier les limites de l'API Zoom
- Implémenter une file d'attente si nécessaire
- Monitorer les logs Supabase Edge Functions

---

## 🐛 Rollback (si nécessaire)

Si vous devez annuler les modifications :

```sql
-- Exécuter le rollback SQL (commenté dans le fichier de migration)
DROP INDEX IF EXISTS activity_registrations_user_unique;
DROP INDEX IF EXISTS activity_registrations_guest_unique;
ALTER TABLE public.activity_registrations DROP CONSTRAINT IF EXISTS check_user_or_guest;
ALTER TABLE public.activity_registrations DROP CONSTRAINT IF EXISTS check_guest_data;
ALTER TABLE public.activity_registrations
  DROP COLUMN IF EXISTS guest_email,
  DROP COLUMN IF EXISTS guest_first_name,
  DROP COLUMN IF EXISTS guest_last_name,
  DROP COLUMN IF EXISTS guest_organization,
  DROP COLUMN IF EXISTS guest_country_id,
  DROP COLUMN IF EXISTS registration_type,
  DROP COLUMN IF EXISTS zoom_registrant_id,
  DROP COLUMN IF EXISTS zoom_join_url,
  ALTER COLUMN user_id SET NOT NULL;
DROP TYPE IF EXISTS registration_type;
```

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs Supabase Edge Functions
2. Vérifier la console du navigateur (F12)
3. Vérifier les credentials Zoom
4. Tester l'API Zoom directement

---

**✨ Bon déploiement ! ✨**
