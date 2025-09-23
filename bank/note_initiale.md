POST
https://jzkuvulxfhtcelpvrxgf.supabase.co/storage/v1/object/documents/activities_document/719b6f82-bdcc-4b77-9834-c745d2e7e739/1758592770237_angenor_lettre_de_motivation.pdf
[HTTP/3 400  515ms]

Error uploading document: StorageApiError: new row violates row-level security policy
    StorageError errors.ts:5
    StorageApiError errors.ts:19
    handleError fetch.ts:32
    promise callback*handleError/< fetch.ts:29
    fulfilled @supabase_supabase-js.js:3057
    promise callback*step @supabase_supabase-js.js:3070
    __awaiter3 @supabase_supabase-js.js:3072
    __awaiter3 @supabase_supabase-js.js:3054
    handleError fetch.ts:23
    _handleRequest fetch.ts:80
    promise callback*_handleRequest/</< fetch.ts:80
    _handleRequest fetch.ts:72
    __awaiter3 @supabase_supabase-js.js:3072
    __awaiter3 @supabase_supabase-js.js:3054
    _handleRequest @supabase_supabase-js.js:3104
    post fetch.ts:100
    __awaiter3 @supabase_supabase-js.js:3072
    __awaiter3 @supabase_supabase-js.js:3054
    post @supabase_supabase-js.js:3122
    uploadOrUpdate StorageFileApi.ts:122
    __awaiter4 @supabase_supabase-js.js:3167
    __awaiter4 @supabase_supabase-js.js:3149
    uploadOrUpdate @supabase_supabase-js.js:3198
    upload StorageFileApi.ts:161
    __awaiter4 @supabase_supabase-js.js:3167
    __awaiter4 @supabase_supabase-js.js:3149
    upload @supabase_supabase-js.js:3250
    uploadDocument useUserActivities.js:266
    submitNewDocument Management.vue:1447
    cacheKey runtime-dom.esm-bundler.js:1712
    callWithErrorHandling runtime-core.esm-bundler.js:199
    callWithAsyncErrorHandling runtime-core.esm-bundler.js:206
useUserActivities.js:297:15
Error adding document: StorageApiError: new row violates row-level security policy
    StorageError errors.ts:5
    StorageApiError errors.ts:19
    handleError fetch.ts:32
    promise callback*handleError/< fetch.ts:29
    fulfilled @supabase_supabase-js.js:3057
    promise callback*step @supabase_supabase-js.js:3070
    __awaiter3 @supabase_supabase-js.js:3072
    __awaiter3 @supabase_supabase-js.js:3054
    handleError fetch.ts:23
    _handleRequest fetch.ts:80
    promise callback*_handleRequest/</< fetch.ts:80
    _handleRequest fetch.ts:72
    __awaiter3 @supabase_supabase-js.js:3072
    __awaiter3 @supabase_supabase-js.js:3054
    _handleRequest @supabase_supabase-js.js:3104
    post fetch.ts:100
    __awaiter3 @supabase_supabase-js.js:3072
    __awaiter3 @supabase_supabase-js.js:3054
    post @supabase_supabase-js.js:3122
    uploadOrUpdate StorageFileApi.ts:122
    __awaiter4 @supabase_supabase-js.js:3167
    __awaiter4 @supabase_supabase-js.js:3149
    uploadOrUpdate @supabase_supabase-js.js:3198
    upload StorageFileApi.ts:161
    __awaiter4 @supabase_supabase-js.js:3167
    __awaiter4 @supabase_supabase-js.js:3149
    upload @supabase_supabase-js.js:3250
    uploadDocument useUserActivities.js:266
    submitNewDocument Management.vue:1447
    cacheKey runtime-dom.esm-bundler.js:1712
    callWithErrorHandling runtime-core.esm-bundler.js:199
    callWithAsyncErrorHandling runtime-core.esm-bundler.js:206
Management.vue:1457:13

​

