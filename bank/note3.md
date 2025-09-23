HROPTIONS
https://jzkuvulxfhtcelpvrxgf.supabase.co/functions/v1/send-activity-notification
CORS Missing Allow Origin

Blocage d’une requête multiorigines (Cross-Origin Request) : la politique « Same Origin » ne permet pas de consulter la ressource distante située sur https://jzkuvulxfhtcelpvrxgf.supabase.co/functions/v1/send-activity-notification. Raison : l’en-tête CORS « Access-Control-Allow-Origin » est manquant. Code d’état : 405.

Blocage d’une requête multiorigine (Cross-Origin Request) : la politique « Same Origin » ne permet pas de consulter la ressource distante située sur https://jzkuvulxfhtcelpvrxgf.supabase.co/functions/v1/send-activity-notification. Raison : échec de la requête CORS. Code d’état : (null).

Erreur lors de l'envoi de la notification: FunctionsFetchError: Failed to send a request to the Edge Function
    FunctionsError types.ts:21
    FunctionsFetchError types.ts:29
    response FunctionsClient.ts:103
    promise callback*invoke/< FunctionsClient.ts:102
    __awaiter @supabase_supabase-js.js:1329
    __awaiter @supabase_supabase-js.js:1311
    invoke @supabase_supabase-js.js:1353
    sendActivityReceivedNotification ActivityDetail.vue:456
    callWithErrorHandling runtime-core.esm-bundler.js:199
    callWithAsyncErrorHandling runtime-core.esm-bundler.js:206
    invoker runtime-dom.esm-bundler.js:729
    addEventListener runtime-dom.esm-bundler.js:680
    patchEvent runtime-dom.esm-bundler.js:698
    patchProp runtime-dom.esm-bundler.js:775
    mountElement runtime-core.esm-bundler.js:4900
    processElement runtime-core.esm-bundler.js:4847
    patch runtime-core.esm-bundler.js:4715
    mountChildren runtime-core.esm-bundler.js:4959
    mountElement runtime-core.esm-bundler.js:4882
    processElement runtime-core.esm-bundler.js:4847
    patch runtime-core.esm-bundler.js:4715
    mountChildren runtime-core.esm-bundler.js:4959
    mountElement runtime-core.esm-bundler.js:4882
    processElement runtime-core.esm-bundler.js:4847
    patch runtime-core.esm-bundler.js:4715
    mountChildren runtime-core.esm-bundler.js:4959
    mountElement runtime-core.esm-bundler.js:4882
    processElement runtime-core.esm-bundler.js:4847
    patch runtime-core.esm-bundler.js:4715
    mountChildren runtime-core.esm-bundler.js:4959
    mountElement runtime-core.esm-bundler.js:4882
    processElement runtime-core.esm-bundler.js:4847
    patch runtime-core.esm-bundler.js:4715
    patchBlockChildren runtime-core.esm-bundler.js:5081
    patchElement runtime-core.esm-bundler.js:4999
    processElement runtime-core.esm-bundler.js:4858
    patch runtime-core.esm-bundler.js:4715
    componentUpdateFn runtime-core.esm-bundler.js:5433
    run reactivity.esm-bundler.js:237
    runIfDirty reactivity.esm-bundler.js:275
    callWithErrorHandling runtime-core.esm-bundler.js:199
ActivityDetail.vue:486:13
