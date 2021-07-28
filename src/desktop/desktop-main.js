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
import DateFormat from "@/desktop/shared/filters/date-format.js";
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

import Root from "./desktop-root.vue";
import router from "./desktop-router";
import store from "@/store/";
import "@/registerServiceWorker";
import VAccess from "@/desktop/shared/directives/access.directive";
import { Position } from "@/desktop/shared/directives/position.directive";

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
Vue.filter("dateFormat", DateFormat);
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
Vue.config.devtools = process.env.NODE_ENV !== 'production';
Vue.config.performance = true;

Vue.prototype.$eventHub = new Vue();

Vue.config.silent = true;
// Vue.config.errorHandler = (error) => {
//   console.log(error)
// }

new Vue({
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
