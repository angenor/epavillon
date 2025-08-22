POST https://jzkuvulxfhtcelpvrxgf.supabase.co/rest/v1/messages?select=id%2Csender_id%2Crecipient_id%2Ccontent%2Cis_read%2Ccreated_at%2Csender%3Asender_id%28id%2Cfirst_name%2Clast_name%2Cprofile_photo_thumbnail_url%29%2Crecipient%3Arecipient_id%28id%2Cfirst_name%2Clast_name%2Cprofile_photo_thumbnail_url%29 403 (Forbidden)
(anonymous) @ @supabase_supabase-js.js?v=d2e5e037:3937
(anonymous) @ @supabase_supabase-js.js?v=d2e5e037:3958
fulfilled @ @supabase_supabase-js.js?v=d2e5e037:3910
Promise.then
step @ @supabase_supabase-js.js?v=d2e5e037:3923
(anonymous) @ @supabase_supabase-js.js?v=d2e5e037:3925
__awaiter6 @ @supabase_supabase-js.js?v=d2e5e037:3907
(anonymous) @ @supabase_supabase-js.js?v=d2e5e037:3948
then @ @supabase_supabase-js.js?v=d2e5e037:89Understand this error
useMessages.js:240 Erreur lors de l'envoi du message: {code: '42501', details: null, hint: null, message: 'new row violates row-level security policy for table "messages"'}
sendMessage @ useMessages.js:240
await in sendMessage
sendMessage @ messaging.js:105
wrappedAction @ pinia.js?v=d2e5e037:5503
store.<computed> @ pinia.js?v=d2e5e037:5197
sendMessage @ ChatConversation.vue:148
callWithErrorHandling @ chunk-ZY5X6FX7.js?v=d2e5e037:2270
callWithAsyncErrorHandling @ chunk-ZY5X6FX7.js?v=d2e5e037:2277
emit @ chunk-ZY5X6FX7.js?v=d2e5e037:8526
(anonymous) @ chunk-ZY5X6FX7.js?v=d2e5e037:10235
sendMessage @ ChatInput.vue:131
callWithErrorHandling @ chunk-ZY5X6FX7.js?v=d2e5e037:2270
callWithAsyncErrorHandling @ chunk-ZY5X6FX7.js?v=d2e5e037:2277
invoker @ chunk-ZY5X6FX7.js?v=d2e5e037:11264Understand this error
ChatInput.vue:131 [Vue warn]: Unhandled error during execution of component event handler
  at <ChatInput onSendMessage=fn<sendMessage> onTyping=fn<handleTyping> disabled=false >
  at <ChatConversation >
  at <ChatWindow >
  at <MessagingSystem >
  at <App>
warn$1 @ chunk-ZY5X6FX7.js?v=d2e5e037:2123
logError @ chunk-ZY5X6FX7.js?v=d2e5e037:2334
handleError @ chunk-ZY5X6FX7.js?v=d2e5e037:2326
(anonymous) @ chunk-ZY5X6FX7.js?v=d2e5e037:2280
Promise.catch
callWithAsyncErrorHandling @ chunk-ZY5X6FX7.js?v=d2e5e037:2279
emit @ chunk-ZY5X6FX7.js?v=d2e5e037:8526
(anonymous) @ chunk-ZY5X6FX7.js?v=d2e5e037:10235
sendMessage @ ChatInput.vue:131
callWithErrorHandling @ chunk-ZY5X6FX7.js?v=d2e5e037:2270
callWithAsyncErrorHandling @ chunk-ZY5X6FX7.js?v=d2e5e037:2277
invoker @ chunk-ZY5X6FX7.js?v=d2e5e037:11264Understand this warning
messaging.js:111 Uncaught (in promise) TypeError: showToast is not a function
    at Proxy.sendMessage (messaging.js:111:7)
    at async sendMessage (ChatConversation.vue:148:18)
