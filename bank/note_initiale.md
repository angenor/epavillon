
### 3. **Alternative plus simple : Désactiver les emails Supabase et gérer côté client**

**Dans Supabase Dashboard > Authentication > Email Templates :**
- Désactivez "Enable email confirmations"

**Dans votre frontend React/Vue/etc :**

```javascript
// Lors de l'inscription
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

if (data?.user) {
  // Appeler directement votre backend Laravel
  await fetch('https://epavillonclimatique.francophonie.org/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'receivers-emails': data.user.email,
      'email-titre': 'Confirmez votre compte',
      'email-body': `Token: ${data.user.confirmation_token}`
    })
  })
}
```
