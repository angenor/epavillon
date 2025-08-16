@supabase_supabase-js.js?v=0e331b97:3937  GET https://jzkuvulxfhtcelpvrxgf.supabase.co/rest/v1/trainings?select=*%2Ccreated_by_profile%3Aprofiles%21created_by%28first_name%2Clast_name%2Cprofile_photo_url%29&is_active=eq.true&order=created_at.desc 400 (Bad Request)
(anonymous) @ @supabase_supabase-js.js?v=0e331b97:3937
(anonymous) @ @supabase_supabase-js.js?v=0e331b97:3958
fulfilled @ @supabase_supabase-js.js?v=0e331b97:3910
Promise.then
step @ @supabase_supabase-js.js?v=0e331b97:3923
(anonymous) @ @supabase_supabase-js.js?v=0e331b97:3925
__awaiter6 @ @supabase_supabase-js.js?v=0e331b97:3907
(anonymous) @ @supabase_supabase-js.js?v=0e331b97:3948
then @ @supabase_supabase-js.js?v=0e331b97:89Understand this error
Index.vue:384 Erreur lors du chargement des formations: {code: 'PGRST200', details: "Searched for a foreign key relationship between 't…n the schema 'public', but no matches were found.", hint: null, message: "Could not find a relationship between 'trainings' and 'profiles' in the schema cache"}