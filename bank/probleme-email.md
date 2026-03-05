- PostgreSQL via Supabase (tables existantes `activity_registrations`, `paco_demographic_data`, `users`) + sessionStorage côté client pour données temporaires (004-paco-email-verify)

## WAF / Edge Function Email Bug
- Le serveur web (WAF/ModSecurity) bloque les requêtes JSON contenant des caracteres Unicode speciaux (em dash, accents) venant des IPs Supabase edge functions (eu-west-2)
- Solution: utiliser des caracteres ASCII-safe dans le body JSON envoye depuis les edge functions vers le Laravel endpoint
- `send-paco-email` edge function etait obsolete: remplace par `send-email` avec `mode: 'paco'` (verifie inscription PACO au lieu de super_admin)
- `LARAVEL_POLIVALENT_EMAIL_URL` et `SUPABASE_CUSTOM_AUTH_LARAVEL_KEY` ne sont PAS dans les secrets Supabase (utilisent valeurs par defaut)
