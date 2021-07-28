import Vue from "vue";
import "buefy/dist/buefy.css";
import Buefy from "buefy";
import "@/assets/style/core.scss";

import vModal from "vue-js-modal";
import vClickOutside from "v-click-outside";
import HelperMixin from "@/desktop/shared/mixins/helper-mixin.vue";

import NoResults from "@/desktop/shared/components/no-results.vue";
import DeleteModal from "@/desktop/shared/components/delete-modal.vue";
import PrettyDate from "@/desktop/shared/filters/pretty-date.js";
import SinceDays from "@/desktop/shared/filters/since-days.js";
import { Truncate, TruncateMiddle } from "@/desktop/shared/filters/truncate.js";
import TransferOwner from "@/desktop/shared/components/transfer-owner/transfer-owner";
import VueIziToast from "vue-izitoast";
import "izitoast/dist/css/iziToast.css";
import VueSkeletonLoading from "vue-skeleton-loading";
import VueCookies from "vue-cookies";
import prettysize from "prettysize";

import ShIcon from "@/desktop/shared/components/icon.vue";
import MIcon from "@/mobile/shared/components/mobile-icon.vue";

import UserAvatar from "@/desktop/shared/components/user-avatar.vue";
import VueClipboard from "vue-clipboard2";
import { VTooltip, VPopover, VClosePopover } from "v-tooltip";
import UnknownUser from "@/desktop/shared/components/unknown-user.vue";

import DashboardAppIllustration from "@/desktop/shared/components/illustration/dashboard-app.vue";
import * as LocationPicker from "vue2-location-picker";
import Vue2TouchEvents from "vue2-touch-events";

import Root from "./mobile-root.vue";
import router from "./mobile-router";
import store from "@/store/";
import "@/registerServiceWorker";
import VAccess from "@/desktop/shared/directives/access.directive";
import { Position } from "@/desktop/shared/directives/position.directive";
import { set, get } from "idb-keyval";
import S3 from "aws-s3";
import { base64ToBlob } from "base64-blob";


// import VueGridLayout from "vue-grid-layout";

Vue.directive("access", VAccess);

Vue.directive("tooltip", VTooltip);
Vue.directive("close-popover", VClosePopover);
Vue.component("v-popover", VPopover);

Vue.use(VueSkeletonLoading);
Vue.use(VueCookies);

Object.defineProperty(Vue.prototype, "$prettysize", { value: prettysize });

Vue.use(Buefy);
Vue.use(vClickOutside);
Vue.use(vModal, { dynamic: true, injectModalsContainer: true });
Vue.use(VueIziToast);
Vue.use(Vue2TouchEvents);

Vue.use(LocationPicker, {
  installComponents: false, // If true, create it globally
});
// components

// Vue.component("GridLayout", VueGridLayout.GridLayout);
Vue.component("unknown-user", UnknownUser);
Vue.component("sh-icon", ShIcon);
Vue.component("m-icon", MIcon);

Vue.component("user-avatar", UserAvatar);

// Vue.component("vault", Vault);
Vue.component("no-results", NoResults);
Vue.component("delete-modal", DeleteModal);

Vue.component("transfer-owner", TransferOwner);
// no result illustration
Vue.component("no-result-dashboard-app", DashboardAppIllustration);
// mixins
Vue.mixin(HelperMixin);
//filters
Vue.filter("prettyDate", PrettyDate);
Vue.filter("sinceDays", SinceDays);
Vue.filter("truncate", Truncate);
Vue.filter("truncate-middle", TruncateMiddle);
Vue.use(VueClipboard);
//Directives
Vue.directive("focus", {
  inserted: function(el) {
    el.focus();
  },
});
import UserName from "@/desktop/shared/directives/user-name.directive";
Vue.directive("username", UserName);

// Vue.directive("position", Position);

Vue.config.productionTip = false;
Vue.config.devtools = process.env.NODE_ENV !== "production";
Vue.config.performance = true;

Vue.prototype.$eventHub = new Vue();

Vue.config.silent = true;
// Vue.config.errorHandler = (error) => {
//   console.log(error)
// }

const app = new Vue({
  router,
  store,
  render: (h) => h(Root),
}).$mount("#app");

window.addEventListener(
  "dragover",
  function(e) {
    e = e || event;
    e.preventDefault();
  },
  false
);
window.addEventListener(
  "drop",
  function(e) {
    e = e || event;
    e.preventDefault();
  },
  false
);

// const broadcast = new BroadcastChannel("sw-init");

// broadcast.onmessage = (event) => {
//   if (event.data && event.data.type === "syncStarted") {
//     app.$store.commit("SET_SYNC_STATUS", 1);
//   }
//   if (event.data && event.data.type === "syncEnded") {
//     app.$store.commit("SET_SYNC_STATUS", 0);
//   }
//   if (event.data && event.data.type === "syncError") {
//     app.$store.commit("SET_SYNC_STATUS", -1);
//   }
// };

navigator.serviceWorker.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "syncStarted") {
    app.$store.commit("SET_SYNC_STATUS", 1);
  }
  if (event.data && event.data.type === "syncEnded") {
    app.$store.commit("SET_SYNC_STATUS", 0);
  }
  if (event.data && event.data.type === "syncError") {
    app.$store.commit("SET_SYNC_STATUS", -1);
  }
  if (event.data && event.data.type === "update_tickets") {
    if (event.data.map && Object.keys(event.data.map).length > 0) {
      app.$store.commit("tickets/UPDATE_OFFLINE_TICKETS", event.data.map);
      app.$store.commit(
        "viewer/UPDATE_OFFLINE_CLUSTER_TICKETS",
        event.data.map
      );
    }
  }
  if (event.data && event.data.type === "syncAttachments") {
    offlineAttachmentSync();
  }
});


window.offlineAttachmentSync = offlineAttachmentSync; 
async function offlineAttachmentSync() { 
    app.$store.commit("SET_SYNC_STATUS", 1);
    const config = {
      bucketName: process.env.VUE_APP_ATTACHMENT_BUCKET,
      region: process.env.VUE_APP_ATTACHMENT_REGION,
      accessKeyId: process.env.VUE_APP_ATTACHMENT_ACCESS,
      secretAccessKey: process.env.VUE_APP_ATTACHMENT_SECRET,
    };
    try {
      const S3Client = new S3(config);
      let attachments = await get("attachments");
      let p = [];
      let b = [];
      if (attachments)
        Object.entries(attachments).forEach((entry) => {
          let [ticketUid, files] = entry;
          Object.keys(files).forEach(async (fileID) => {
            let extn = files[fileID]["file_name"].split(".").pop();
            let blob = base64ToBlob(files[fileID]["data"]);
            b.push(blob);
            if (files[fileID].status !== "uploaded") {
              let upload = S3Client.uploadFile(
                await blob,
                `tickets/${ticketUid}/files/${fileID}`
              )
                .then((data) => {
                  console.log(data);
                  files[fileID].status = "uploaded";
                  set("attachments", attachments);
                })
                .catch((err) => console.error(err));
               p[p.length] = upload;
            }
          });
        });

      await Promise.all(b);
      await Promise.all(p);
      let payload = {
        tickets: Object.keys(attachments).reduce((a, c) => {
          a[c] = Object.keys(attachments[c])
            .filter((d) => attachments[c][d].status === "uploaded")
            .map((d) => {
              let name = attachments[c][d].file_name.split(".");
              let extn = name[name.length - 1];
              if (extn == "jpg") extn = "jpeg";
              return {
                service: {
                  bucket: process.env.VUE_APP_ATTACHMENT_BUCKET,
                  region: process.env.VUE_APP_ATTACHMENT_REGION,
                  name: "aws_s3",
                  stage: "tickets",
                  key: `tickets/${c}/files/${d}.${extn}`,
                },
                checklistUid: attachments[c][d].checklist_id,
                checklistItemUid: attachments[c][d].item_id,
                fileName: attachments[c][d].file_name,
              };
            });
          return a;
        }, {}),
        strict: false,
      };
      await app.$store.dispatch("tickets/bulk_create_attachments", {
        body: payload,
      });
      Object.keys(attachments).forEach((d) => {
        Object.keys(attachments[d]).forEach((f) => {
          if (attachments[d][f].status === "uploaded") delete attachments[d][f];
        });
        if (Object.keys(attachments[d]).length === 0) delete attachments[d];
      });
      set("attachments", attachments);
      app.$store.commit("SET_SYNC_STATUS", 0);
    } catch (e) {
      console.log(e);
      app.$store.commit("SET_SYNC_STATUS", -1);
    }
}

set("token", {
  url: process.env.VUE_APP_TICKETS_API_HOST,
  core_url: process.env.VUE_APP_CORE_API_HOST,
  terra_url: process.env.VUE_APP_TERRA_API_HOST,
  therm_url: process.env.VUE_APP_THERM_API_HOST,
  token: window.$cookies.get("access_token"),
  org: app.$store.state.current_organization
    ? app.$store.state.current_organization.uid
    : null,
}).then(() => {
  console.log("Access token set to idb, initialise serviceworker");
});

function setVHForMobile() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--mobilevh", `${vh}px`);
}
setVHForMobile();
window.addEventListener("resize", () => {
  setVHForMobile();
});

window.spriteCache = {};
