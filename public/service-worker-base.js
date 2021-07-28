workbox.core.setCacheNameDetails({ prefix: "sensehawk-app" });

workbox.core.skipWaiting();
workbox.core.clientsClaim();

var CDN_CSS = [
  "https://rawgit.com/enyo/dropzone/master/dist/dropzone.css",
  "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.0.9/mapbox-gl-draw.css",
  "https://api.tiles.mapbox.com/mapbox-gl-js/v1.0.0/mapbox-gl.css",
  "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-compare/v0.1.0/mapbox-gl-compare.css",
  "https://use.fontawesome.com/releases/v5.2.0/css/all.css",
  "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.0.9/mapbox-gl-draw.css",
  "https://global.oktacdn.com/okta-signin-widget/3.2.2/css/okta-sign-in.min.css",
  "https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css",
  "https://unpkg.com/buefy/dist/buefy.min.css",
  "https://cdn.jsdelivr.net/gh/sensehawk/cdn/dhtmlx/suite/suite.min.css",
];

var CDN_JS = [
  // Commented as they are not opaque-responses and for Onesignal it's a cyclic fetch.

  // "https://cdn.onesignal.com/sdks/OneSignalSDK.js",
  // "https://www.gstatic.com/firebasejs/7.8.2/firebase-app.js",
  // "https://www.gstatic.com/firebasejs/7.8.2/firebase-auth.js",
  // "https://www.gstatic.com/firebasejs/7.8.2/firebase-database.js",

  "https://cdn.split.io/sdk/split-10.11.1.min.js",
  "https://cdn.jsdelivr.net/gh/sensehawk/cdn/ckeditor/ckeditor-classic.js",
  "https://cdn.jsdelivr.net/npm/exif-js",
  "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.19/lodash.min.js",
  "https://api.tiles.mapbox.com/mapbox-gl-js/v1.0.0/mapbox-gl.js",
  "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.0.9/mapbox-gl-draw.js",
  "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-compare/v0.1.0/mapbox-gl-compare.js",
  "https://cdn.jsdelivr.net/npm/@turf/turf@5/turf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/plotly.js/1.51.1/plotly.min.js",
  "https://cdn.jsdelivr.net/npm/getstream/dist/js_min/getstream.js",
  "https://cdnjs.cloudflare.com/ajax/libs/aws-sdk/2.467.0/aws-sdk.min.js",
  "https://js.pusher.com/5.1/pusher.min.js",
  "https://global.oktacdn.com/okta-signin-widget/3.2.2/js/okta-sign-in.min.js",
  "https://cdn.jsdelivr.net/gh/sensehawk/cdn/dhtmlx/suite/suite.min.js",
];

self.__precacheManifest = [...CDN_CSS, ...CDN_JS].concat(
  self.__precacheManifest || []
);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {
  ignoreURLParametersMatching: [/.*/],
});

if (
  self.origin.includes("localhost") ||
  self.origin.includes("m-dev") ||
  self.origin.includes("m-stage") ||
  self.origin.includes("m.sensehawk")
) {
  const shareTargetHandler = async ({ event }) => {
    const formData = await event.request.formData();
    const mediaFiles = formData.getAll("images");
    await idbKeyval.set("imageShare", mediaFiles);
    return Response.redirect("/?share=true", 303);
  };

  workbox.routing.registerRoute("/share", shareTargetHandler, "POST");

  self.addEventListener("sync", function(event) {
    if (event.tag == "ticketSync") {
      event.waitUntil(ticketsSync());
    }
  });
  self.addEventListener("install", function(event) {
    event.waitUntil(
      (async () => {
        let data = await idbKeyval.get("token");
        await api.initialize(data.token);
        await store.init();
        await store.syncStatus.delete();
      })()
    );
  });

  self.addEventListener("message", async (event) => {
    let status = await idbKeyval.get("syncStatus");
    if (event.data && event.data.type === "init") {
      console.log("Initialized");
      if (event.data.data.org) {
        let org = await store.organization.get();
        org == event.data.data.org ? "" : store.clear();
        await store.organization.setData(() => event.data.data.org);
      }
      await api.initialize(event.data.data.token);
      let isOffline = await store.offline_client.get();
      if (status !== 1 && !isOffline) ticketsSync();
    }
    if (status !== 1 && event.data && event.data.type === "sync") {
      ticketsSync();
    }
  });

  workbox.routing.registerRoute(
    new RegExp(
      "(https://(?:tickets-stage-server|tickets-server).sensehawk.com/tickets/.*/checklists/.*/items/.*/attachments.*)"
    ),
    checkOfflineAndRoute()
  );

  ticketRoutes();

  function checkOfflineAndRoute() {
    return async ({ event }) => {
      if (await store.offline_client.get()) {
        return new workbox.strategies.CacheOnly({
          cacheName: "api-cache",
          networkTimeoutSeconds: 10,
        })
          .handle({ event })
          .then((res) => res)
          .catch((e) => e);
      } else {
        return new workbox.strategies.NetworkFirst({
          cacheName: "api-cache",
          networkTimeoutSeconds: 10,
        })
          .handle({ event })
          .then((res) => res)
          .catch((e) => e);
      }
    };
  }

  workbox.routing.registerRoute(
    new RegExp("(.*-server.*claims.*)"),
    new workbox.strategies.NetworkFirst({
      cacheName: "api-cache",
      networkTimeoutSeconds: 10,
    })
  );

  workbox.routing.registerRoute(
    new RegExp("(.*mapbox.*light-v10?.*)"),
    checkOfflineAndRoute()
  );

  workbox.routing.registerRoute(
    new RegExp("(.*mapbox.*.json.*)"),
    checkOfflineAndRoute()
  );
  workbox.routing.registerRoute(
    new RegExp("(https://mapserver.sensehawk.com/[^/]*)"),
    checkOfflineAndRoute()
  );

  workbox.routing.registerRoute(
    new RegExp("(.*-server.*)"),
    checkOfflineAndRoute()
  );
} else {
  workbox.routing.registerRoute(
    new RegExp("(.*mapbox.*light-v10?.*)"),
    new workbox.strategies.NetworkFirst({
      cacheName: "api-cache",
      networkTimeoutSeconds: 10,
    })
  );
  workbox.routing.registerRoute(
    new RegExp("(.*mapbox.*.json.*)"),
    new workbox.strategies.NetworkFirst({
      cacheName: "api-cache",
      networkTimeoutSeconds: 10,
    })
  );
  workbox.routing.registerRoute(
    new RegExp("(https://mapserver.sensehawk.com/[^/]*)"),
    new workbox.strategies.NetworkFirst({
      cacheName: "api-cache",
      networkTimeoutSeconds: 10,
    })
  );
  workbox.routing.registerRoute(
    new RegExp("(.*-server.*)"),
    new workbox.strategies.NetworkFirst({
      cacheName: "api-cache",
      networkTimeoutSeconds: 30,
    })
  );
}
