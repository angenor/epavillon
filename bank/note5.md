Je veux implémenter un chatbot LLM très polivalent:
# Fonctionnalité 1: Negociation document (role obligatoire: négociateur ou admin ou superadmin)
- Le chatbot devra répondre à des questions en s'appuyant sur les documents de négociation disponibles dans la base de données(negotiation_documents) en fornissant les référence possible(ducuments, pages, titres).

# Fonctionnalité 2: Assistance utilisateur
- Le chatbot devra être capable de comprendre le contexte des questions et d'y répondre de manière pertinente en se basant sur les données disponibles dans la base de données Supabase.
- Le chatbot devra également être capable d'apprendre de nouvelles informations au fur et à mesure qu'il interagit avec les utilisateurs.
- les questions concerneront l'utilisation de la plateforme, les fonctionnalités disponibles, les procédures à suivre, les activités, les évènements, les organisations, les utilisateurs, les rôles, les permissions, etc.
- Navigation dans l'application: Le chatbot devra être capable de guider les utilisateurs à travers les différentes sections de l'application en fonction de leurs besoins et naviguer vers les pages appropriées.

# D'autres fonctionnalités pourront être ajoutées par la suite en fonction des besoins des utilisateurs et des évolutions de la plateforme


NB:
- on utilisera langchainjs et claude pour implémenter ce chatbot.
- modèle de données: bank/shema_et_requettes/database_complete.sql
