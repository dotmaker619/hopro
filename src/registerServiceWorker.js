/* eslint-disable no-console */

import { register } from "register-service-worker";

if (process.env.NODE_ENV === "production") {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        "App is being served from cache by a service worker.\n" +
          "For more details, visit https://goo.gl/AFskqB"
      );
    },
    registered(registration) {
      console.log("Service worker has been registered.");
    },
    cached() {
      console.log("Content has been cached for offline use.");
    },
    updatefound(registration) {
      // caches.open('v1').then(function(cache) {
      if (registration) registration.update();
      if ("caches" in window) {
        caches.delete("css-cache").then(function(response) {
          console.log("Successfully cleaned css cache!!");
        });
        caches.delete("js-cache").then(function(response) {
          console.log("Successfully cleaned js cache!!");
        });
      }
      // })
      console.log("New content is downloading.");
    },
    updated() {
      console.log("New content is available; please refresh.");
      try {
        var event = new CustomEvent("app-updated", {
          action: "refresh application",
        });
        document.dispatchEvent(event);
        console.log("app-updated");
      } catch (err) {
        console.log("app-updated", err);
      }
      // setTimeout(() => {
      //   window.location.reload(true)
      // }, 1000)
    },
    offline() {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    },
    error(error) {
      console.error("Error during service worker registration:", error);
    },
  });
}
