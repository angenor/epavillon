POST https://jzkuvulxfhtcelpvrxgf.supabase.co/rest/v1/negotiation_sessions?columns=%22title%22%2C%22description%22%2C%22start_datetime%22%2C%22end_datetime%22%2C%22location%22%2C%22category%22%2C%22is_ifdd_organized%22%2C%22external_link%22%2C%22created_by%22&select=* 400 (Bad Request)
(anonymous) @ @supabase_supabase-js.js?v=d2e5e037:3937
(anonymous) @ @supabase_supabase-js.js?v=d2e5e037:3958
fulfilled @ @supabase_supabase-js.js?v=d2e5e037:3910
Promise.then
step @ @supabase_supabase-js.js?v=d2e5e037:3923
(anonymous) @ @supabase_supabase-js.js?v=d2e5e037:3925
__awaiter6 @ @supabase_supabase-js.js?v=d2e5e037:3907
(anonymous) @ @supabase_supabase-js.js?v=d2e5e037:3948
then @ @supabase_supabase-js.js?v=d2e5e037:89Understand this error
useNegotiations.js:56 Erreur lors de la création de la session: {code: '23502', details: 'Failing row contains (5ee82798-ddf2-4bd7-a3e0-fe6c…7d8109e06a8, 2025-08-24 02:44:25.52511+00, null).', hint: null, message: 'null value in column "meeting_type" of relation "negotiation_sessions" violates not-null constraint'}
createSession @ useNegotiations.js:56
await in createSession
createSession @ NegotiationsList.vue:923
cache.<computed>.cache.<computed> @ chunk-ZY5X6FX7.js?v=d2e5e037:12229
callWithErrorHandling @ chunk-ZY5X6FX7.js?v=d2e5e037:2270
callWithAsyncErrorHandling @ chunk-ZY5X6FX7.js?v=d2e5e037:2277
invoker @ chunk-ZY5X6FX7.js?v=d2e5e037:11264Understand this error
NegotiationsList.vue:949 Erreur lors de la création de la session: {code: '23502', details: 'Failing row contains (5ee82798-ddf2-4bd7-a3e0-fe6c…7d8109e06a8, 2025-08-24 02:44:25.52511+00, null).', hint: null, message: 'null value in column "meeting_type" of relation "negotiation_sessions" violates not-null constraint'}
createSession @ NegotiationsList.vue:949
await in createSession
cache.<computed>.cache.<computed> @ chunk-ZY5X6FX7.js?v=d2e5e037:12229
callWithErrorHandling @ chunk-ZY5X6FX7.js?v=d2e5e037:2270
callWithAsyncErrorHandling @ chunk-ZY5X6FX7.js?v=d2e5e037:2277
invoker @ chunk-ZY5X6FX7.js?v=d2e5e037:11264Understand this error
