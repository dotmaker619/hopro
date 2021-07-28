import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/mobile/modules/core/components/project-management/mobile-project-management";
import AuthRoutes from "@/auth/route/auth-route";
import authMixin from "@/auth/shared/auth.mixin";
import store from "@/store/";
import Views from "@/mobile/modules/dashboard/app-therm-terra-list.vue";
import MobileViewer from "@/mobile/viewer/map.vue";
import TicketDetails from "@/desktop/tickets/components/ticket-details/ticket-details.vue";
import TicketList from "@/desktop/tickets/components/tickets-list/tickets-list.vue";
import Vault from "@/mobile/modules/vault/components/vault.vue";
import Settings from "@/mobile/shared/settings/settings.vue";
import Share from "@/mobile/shared/components/share-file.vue";

import Navbar from "@/mobile/shared/components/navbar.vue";
import BottomNavbar from "@/mobile/shared/components/bottom-navbar.vue";

Vue.use(VueRouter);
const routes = [
  {
    path: "/",
    name: "home",
    components: {
      default: Home,
      top: Navbar,
      bottom: BottomNavbar,
    },
    meta: { requiresAuth: true, screen: "mobile", title: "Home" },
  },
  {
    path: "/share-file",
    name: "share",
    component: Share,
    meta: { requiresAuth: true, screen: "mobile", title: "Share" },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    alias: "views",
    components: {
      default: Views,
      top: Navbar,
      bottom: BottomNavbar,
    },
    meta: {
      title: "Views",
      requiresAuth: true,
      screen: "mobile",
    },
  },
  {
    path: "/settings",
    name: "settings",
    component: Settings,
  },
  {
    path: "/viewer/:id/terra",
    name: "terra-viewer",
    components: {
      default: MobileViewer,
      // top: Navbar,
    },
    meta: { requiresAuth: true, screen: "mobile", title: "Terra" },
  },
  {
    path: "/viewer/:id/therm",
    name: "therm-viewer",
    components: {
      default: MobileViewer,
      // top: Navbar,
    },
    meta: { requiresAuth: true, screen: "mobile", title: "Therm" },
  },
  {
    path: "/tickets",
    name: "tickets-list",
    components: {
      default: TicketList,
      top: Navbar,
      bottom: BottomNavbar,
    },
    meta: {
      requiresAuth: true,
      screen: "mobile",
      title: "Overview",
    },

    children: [
      {
        path: ":id/details",
        name: "ticket-details",
        component: TicketDetails,
        meta: {
          screen: "mobile",
        },
      },
    ],
    meta: {
      title: "Tickets",
      requiresAuth: true,
      screen: "mobile",
    },
  },
  {
    path: "/vault",
    name: "vault",
    components: {
      default: Vault,
      top: Navbar,
      bottom: BottomNavbar,
    },
    meta: {
      title: "vault",
      requiresAuth: true,
      screen: "mobile",
    },
  },

  ...AuthRoutes,
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.name != from.name) return { x: 0, y: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (window.$cookies.get("access_token")) {
      window.is_mobile = to.meta.screen ? true : false;
      await authMixin.methods.initialize_app();
      next();
    } else {
      next({
        name: "auth",
      });
    }
  } else {
    next(); // make sure to always call next()!
  }
  store.commit("SET_APP_LOADING", false);
});
router.beforeEach((to, from, next) => {
  // This goes through the matched routes from last to first, finding the closest route with a title.
  // eg. if we have /some/deep/nested/route and /some, /deep, and /nested have titles, nested's will be chosen.
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title);

  if (nearestWithTitle) document.title = nearestWithTitle.meta.title;

  next();
});

export default router;
