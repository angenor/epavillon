@supabase_supabase-js.js?v=0e331b97:3937  GET https://jzkuvulxfhtcelpvrxgf.supabase.co/rest/v1/notifications?select=id%2Cnotification_type%2Ctitle%2Ccontent%2Cis_read%2Ccreated_at%2Crelated_entity_id%2Cconnections%3Arelated_entity_id%28id%2Crequester_id%2Cstatus%2Cusers%21connections_requester_id_fkey%28id%2Cfirst_name%2Clast_name%2Cprofile_photo_thumbnail_url%29%29&user_id=eq.acec5340-1dbd-4099-9dde-cdb5d2549566&order=created_at.desc&limit=20 400 (Bad Request)
(anonymous) @ @supabase_supabase-js.js?v=0e331b97:3937
(anonymous) @ @supabase_supabase-js.js?v=0e331b97:3958
fulfilled @ @supabase_supabase-js.js?v=0e331b97:3910
Promise.then
step @ @supabase_supabase-js.js?v=0e331b97:3923
(anonymous) @ @supabase_supabase-js.js?v=0e331b97:3925
__awaiter6 @ @supabase_supabase-js.js?v=0e331b97:3907
(anonymous) @ @supabase_supabase-js.js?v=0e331b97:3948
then @ @supabase_supabase-js.js?v=0e331b97:89Understand this error
useNotifications.js:55 Erreur lors de la récupération des notifications: {code: 'PGRST200', details: "Searched for a foreign key relationship between 'n…n the schema 'public', but no matches were found.", hint: null, message: "Could not find a relationship between 'notifications' and 'related_entity_id' in the schema cache"}