initFormData appelé, profilePhoto actuel: null
ProfileInfoSection.vue:393 FormData après init: Proxy(Object) {first_name: 'Franck2', last_name: 'NGOUANDI', biography: '', phone: '', address: '', …}
useConnections.js:313 Erreur lors du chargement des connexions acceptées: {code: 'PGRST201', details: Array(2), hint: "Try changing 'user_roles' to one of the following:…nd the desired relationship in the 'details' key.", message: "Could not embed because more than one relationship was found for 'users' and 'user_roles'"}
getAcceptedConnections @ useConnections.js:313
await in getAcceptedConnections
(anonymous) @ Profile.vue:386
await in (anonymous)
(anonymous) @ chunk-ZY5X6FX7.js?v=0e331b97:4929
callWithErrorHandling @ chunk-ZY5X6FX7.js?v=0e331b97:2270
callWithAsyncErrorHandling @ chunk-ZY5X6FX7.js?v=0e331b97:2277
hook.__weh.hook.__weh @ chunk-ZY5X6FX7.js?v=0e331b97:4909
flushPostFlushCbs @ chunk-ZY5X6FX7.js?v=0e331b97:2455
flushJobs @ chunk-ZY5X6FX7.js?v=0e331b97:2497
Promise.then
queueFlush @ chunk-ZY5X6FX7.js?v=0e331b97:2392
queueJob @ chunk-ZY5X6FX7.js?v=0e331b97:2387
effect2.scheduler @ chunk-ZY5X6FX7.js?v=0e331b97:7566
trigger @ chunk-ZY5X6FX7.js?v=0e331b97:516
endBatch @ chunk-ZY5X6FX7.js?v=0e331b97:574
notify @ chunk-ZY5X6FX7.js?v=0e331b97:834
trigger @ chunk-ZY5X6FX7.js?v=0e331b97:808
set value @ chunk-ZY5X6FX7.js?v=0e331b97:1680
finalizeNavigation @ vue-router.js?v=0e331b97:2677
(anonymous) @ vue-router.js?v=0e331b97:2587
Promise.then
pushWithRedirect @ vue-router.js?v=0e331b97:2555
push @ vue-router.js?v=0e331b97:2481
install @ vue-router.js?v=0e331b97:2836
use @ chunk-ZY5X6FX7.js?v=0e331b97:5970
(anonymous) @ main.js:65Understand this error
ProfileInfoSection.vue:379 initFormData appelé, profilePhoto actuel: null
ProfileInfoSection.vue:393 FormData après init: Proxy(Object) {first_name: 'Franck2', last_name: 'NGOUANDI', biography: '', phone: '', address: '', …}
useConnections.js:313 Erreur lors du chargement des connexions acceptées: {code: 'PGRST201', details: Array(2), hint: "Try changing 'user_roles' to one of the following:…nd the desired relationship in the 'details' key.", message: "Could not embed because more than one relationship was found for 'users' and 'user_roles'"}