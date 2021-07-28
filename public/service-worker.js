
importScripts(
  "https://cdn.jsdelivr.net/npm/idb-keyval@3/dist/idb-keyval-iife.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/uuid/8.1.0/uuidv4.min.js",
  "https://unpkg.com/@turf/turf@5.1.6/turf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.19/lodash.min.js",
  "/offline/routes.js",
  "/offline/store.js",
  "/offline/controller.js"
);

importScripts(
  "/offline/tickets/helper.js",
  "/offline/tickets/sync.js",
  "/offline/tickets/routes.js"
);

importScripts("/service-worker-base.js");
importScripts("https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js");

