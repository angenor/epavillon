[Vue warn]: Invalid prop: type check failed for prop "speakers". Expected Array, got Object
  at <ActivitySpeakersSection speakers=Ref<
Array(3) [ {…}, {…}, {…} ]
 > newSpeakerForm=
Object { civility: "M.", first_name: "", last_name: "", position: "", organization: "", email: "" }
 showAddSpeakerModal=Ref< false >  ... >
  at <ManagementRefactored sidebar-open=false onUpdate:sidebarOpen=fn onVnodeUnmounted=fn<onVnodeUnmounted>  ... >
  at <RouterView sidebar-open=false onUpdate:sidebarOpen=fn >
  at <App> runtime-core.esm-bundler.js:51:13
[Vue warn]: Unhandled error during execution of render function
  at <ActivitySpeakersSection speakers=Ref<
Array(3) [ {…}, {…}, {…} ]
 > newSpeakerForm=
Object { civility: "M.", first_name: "", last_name: "", position: "", organization: "", email: "" }
 showAddSpeakerModal=Ref< false >  ... >
  at <ManagementRefactored sidebar-open=false onUpdate:sidebarOpen=fn onVnodeUnmounted=fn<onVnodeUnmounted>  ... >
  at <RouterView sidebar-open=false onUpdate:sidebarOpen=fn >
  at <App> runtime-core.esm-bundler.js:51:13
[Vue warn]: Unhandled error during execution of component update
  at <ManagementRefactored sidebar-open=false onUpdate:sidebarOpen=fn onVnodeUnmounted=fn<onVnodeUnmounted>  ... >
  at <RouterView sidebar-open=false onUpdate:sidebarOpen=fn >
  at <App> runtime-core.esm-bundler.js:51:13
Uncaught (in promise) TypeError: $props.speakers.some is not a function
    _sfc_render ActivitySpeakersSection.vue:25
    renderComponentRoot runtime-core.esm-bundler.js:6555
    componentUpdateFn runtime-core.esm-bundler.js:5346
    run reactivity.esm-bundler.js:237
    setupRenderEffect runtime-core.esm-bundler.js:5481
    mountComponent runtime-core.esm-bundler.js:5256
    processComponent runtime-core.esm-bundler.js:5209
    patch runtime-core.esm-bundler.js:4727
    mountChildren runtime-core.esm-bundler.js:4959
    mountElement runtime-core.esm-bundler.js:4882
    processElement runtime-core.esm-bundler.js:4847
    patch runtime-core.esm-bundler.js:4715
    mountChildren runtime-core.esm-bundler.js:4959
    mountElement runtime-core.esm-bundler.js:4882
    processElement runtime-core.esm-bundler.js:4847
    patch runtime-core.esm-bundler.js:4715
    mountChildren runtime-core.esm-bundler.js:4959
    processFragment runtime-core.esm-bundler.js:5139
    patch runtime-core.esm-bundler.js:4701
    patchBlockChildren runtime-core.esm-bundler.js:5081
    patchElement runtime-core.esm-bundler.js:4999
    processElement runtime-core.esm-bundler.js:4858
    patch runtime-core.esm-bundler.js:4715
    componentUpdateFn runtime-core.esm-bundler.js:5433
    run reactivity.esm-bundler.js:237
    runIfDirty reactivity.esm-bundler.js:275
    callWithErrorHandling runtime-core.esm-bundler.js:199
    flushJobs runtime-core.esm-bundler.js:408
    promise callback*queueFlush runtime-core.esm-bundler.js:322
    queueJob runtime-core.esm-bundler.js:317
    scheduler runtime-core.esm-bundler.js:5475
    trigger reactivity.esm-bundler.js:265
    endBatch reactivity.esm-bundler.js:323
    notify reactivity.esm-bundler.js:609
    trigger reactivity.esm-bundler.js:583
    set value reactivity.esm-bundler.js:1460
    loadActivity ManagementRefactored.vue:333
    setup ManagementRefactored.vue:362
    createHook runtime-core.esm-bundler.js:2836
    callWithErrorHandling runtime-core.esm-bundler.js:199
    callWithAsyncErrorHandling runtime-core.esm-bundler.js:206
    __weh runtime-core.esm-bundler.js:2816
    flushPostFlushCbs runtime-core.esm-bundler.js:385
    flushJobs runtime-core.esm-bundler.js:427
    promise callback*queueFlush runtime-core.esm-bundler.js:322
    queueJob runtime-core.esm-bundler.js:317
    scheduler runtime-core.esm-bundler.js:5475
    trigger reactivity.esm-bundler.js:265
    endBatch reactivity.esm-bundler.js:323
    notify reactivity.esm-bundler.js:609
    trigger reactivity.esm-bundler.js:583
    set value reactivity.esm-bundler.js:1460
    finalizeNavigation vue-router.mjs:3503
    pushWithRedirect vue-router.mjs:3368
    promise callback*pushWithRedirect vue-router.mjs:3335
    push vue-router.mjs:3260
    install vue-router.mjs:3704
    use runtime-core.esm-bundler.js:3886
    <anonymous> main.js:69
ActivitySpeakersSection.vue:25:27
