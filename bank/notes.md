GET https://jzkuvulxfhtcelpvrxgf.supabase.co/rest/v1/users?select=*%2Ccountry%3Acountries%28*%29&id=eq.9a9ec732-7daf-4bec-8c4a-17d8109e06a8 500 (Internal Server Error)
(anonymous) @ @supabase_supabase-js.js?v=4b711431:3937
(anonymous) @ @supabase_supabase-js.js?v=4b711431:3958
fulfilled @ @supabase_supabase-js.js?v=4b711431:3910
Promise.then
step @ @supabase_supabase-js.js?v=4b711431:3923
(anonymous) @ @supabase_supabase-js.js?v=4b711431:3925
__awaiter6 @ @supabase_supabase-js.js?v=4b711431:3907
(anonymous) @ @supabase_supabase-js.js?v=4b711431:3948
then @ @supabase_supabase-js.js?v=4b711431:89Understand this error
auth.js:79 Error fetching profile: {code: '42P17', details: null, hint: null, message: 'infinite recursion detected in policy for relation "user_roles"'}
fetchProfile @ auth.js:79
await in fetchProfile
(anonymous) @ auth.js:103
(anonymous) @ @supabase_supabase-js.js?v=4b711431:6707
_notifyAllSubscribers @ @supabase_supabase-js.js?v=4b711431:6705
_recoverAndRefresh @ @supabase_supabase-js.js?v=4b711431:6648
await in _recoverAndRefresh
_initialize @ @supabase_supabase-js.js?v=4b711431:5319
await in _initialize
(anonymous) @ @supabase_supabase-js.js?v=4b711431:5273
(anonymous) @ @supabase_supabase-js.js?v=4b711431:5951
(anonymous) @ @supabase_supabase-js.js?v=4b711431:5068Understand this error
@supabase_supabase-js.js?v=4b711431:3937  GET https://jzkuvulxfhtcelpvrxgf.supabase.co/rest/v1/users?select=*%2Ccountry%3Acountries%28*%29&id=eq.9a9ec732-7daf-4bec-8c4a-17d8109e06a8 500 (Internal Server Error)
(anonymous) @ @supabase_supabase-js.js?v=4b711431:3937
(anonymous) @ @supabase_supabase-js.js?v=4b711431:3958
fulfilled @ @supabase_supabase-js.js?v=4b711431:3910
Promise.then
step @ @supabase_supabase-js.js?v=4b711431:3923
(anonymous) @ @supabase_supabase-js.js?v=4b711431:3925
__awaiter6 @ @supabase_supabase-js.js?v=4b711431:3907
(anonymous) @ @supabase_supabase-js.js?v=4b711431:3948
then @ @supabase_supabase-js.js?v=4b711431:89Understand this error
auth.js:79 Error fetching profile: {code: '42P17', details: null, hint: null, message: 'infinite recursion detected in policy for relation "user_roles"'}
fetchProfile @ auth.js:79
await in fetchProfile
fetchUser @ auth.js:30
await in fetchUser
(anonymous) @ auth.js:97
(anonymous) @ pinia.js?v=4b711431:5564
run @ chunk-ZY5X6FX7.js?v=4b711431:366
(anonymous) @ pinia.js?v=4b711431:5564
run @ chunk-ZY5X6FX7.js?v=4b711431:366
(anonymous) @ pinia.js?v=4b711431:5564
runWithContext @ chunk-ZY5X6FX7.js?v=4b711431:6107
createSetupStore @ pinia.js?v=4b711431:5564
useStore @ pinia.js?v=4b711431:5737
setup @ AppNavBar.vue:236
callWithErrorHandling @ chunk-ZY5X6FX7.js?v=4b711431:2270
setupStatefulComponent @ chunk-ZY5X6FX7.js?v=4b711431:10043
setupComponent @ chunk-ZY5X6FX7.js?v=4b711431:10004
mountComponent @ chunk-ZY5X6FX7.js?v=4b711431:7334
processComponent @ chunk-ZY5X6FX7.js?v=4b711431:7300
patch @ chunk-ZY5X6FX7.js?v=4b711431:6816
mountChildren @ chunk-ZY5X6FX7.js?v=4b711431:7048
mountElement @ chunk-ZY5X6FX7.js?v=4b711431:6971
processElement @ chunk-ZY5X6FX7.js?v=4b711431:6936
patch @ chunk-ZY5X6FX7.js?v=4b711431:6804
componentUpdateFn @ chunk-ZY5X6FX7.js?v=4b711431:7444
run @ chunk-ZY5X6FX7.js?v=4b711431:488
setupRenderEffect @ chunk-ZY5X6FX7.js?v=4b711431:7572
mountComponent @ chunk-ZY5X6FX7.js?v=4b711431:7347
processComponent @ chunk-ZY5X6FX7.js?v=4b711431:7300
patch @ chunk-ZY5X6FX7.js?v=4b711431:6816
render2 @ chunk-ZY5X6FX7.js?v=4b711431:8120
mount @ chunk-ZY5X6FX7.js?v=4b711431:6046
app.mount @ chunk-ZY5X6FX7.js?v=4b711431:12290
(anonymous) @ main.js:45Understand this error
general.js:205 [LaunchDarkly] LaunchDarkly client initialized