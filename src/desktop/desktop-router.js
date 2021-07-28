import Vue from "vue";
import VueRouter from "vue-router";
import AdminRoutes from "@/desktop/admin/route/admin-route";
import CoreRoutes from "@/desktop/core/route/core-route";
import TicketRoutes from "@/desktop/tickets/route/tickets-route";
import FormsRoutes from "@/desktop/forms/route/forms-route";
import ProcessingRoutes from "@/desktop/processing/route/processing-route";
import MissionRoutes from "@/desktop/missions/route/mission-route";
import AuthRoutes from "@/auth/route/auth-route";
import ThermRoutes from "@/desktop/therm/route/therm-route";
import TerraRoutes from "@/desktop/terra/route/terra-route";
import VaultRoutes from "@/desktop/vault/route/vault-route";
import Dashboard from "@/desktop/shared/components/dashboard/dashboard-home.vue";
import Home from "@/desktop/shared/components/home/home.vue";

import Sidebar from "@/desktop/shared/components/sidebar.vue";
import Navbar from "@/desktop/shared/components/navbar/navbar.vue";
import Redirect from "@/desktop/shared/components/redirect.vue";
import NoAccess from "@/desktop/shared/components/no-access.component.vue";
import NotFound from "@/desktop/shared/components/not-found.component.vue";

import authMixin from "@/auth/shared/auth.mixin";
import store from "@/store/";
import ViewerEBS from "@/desktop/shared/components/viewer-ebs-el";

Vue.use(VueRouter);

const appRoutes = [
  {
    path: "/redirect",
    name: "redirect",
    component: Redirect,
  },
  {
    path: "/dashboard",
    name: "dashboard",
    components: {
      default: Dashboard,
      left: Sidebar,
      top: Navbar,
    },
    meta: {
      requiresAuth: true,
      title: "Dashboard",
    },
  },
  {
    path: "",
    name: "home",
    components: {
      default: Home,
      left: Sidebar,
      top: Navbar,
    },
    meta: {
      requiresAuth: true,
      title: "Home",
    },
  },
  {
    path: "/apps/:element/",
    name: "ebs",
    components: {
      default: ViewerEBS,
      left: Sidebar,
      top: Navbar,
    },
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/no-access",
    name: "no-access",
    components: {
      default: NoAccess,
      left: Sidebar,
      top: Navbar,
    },
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "*",
    name: "not-found",
    components: {
      default: NotFound,
      left: Sidebar,
      top: Navbar,
    },
    meta: {
      requiresAuth: true,
    },
  },
];

const routes = [
  ...AuthRoutes,
  ...ThermRoutes,
  ...CoreRoutes,
  ...AdminRoutes,
  ...ProcessingRoutes,
  ...MissionRoutes,
  ...appRoutes,
  ...TerraRoutes,
  ...TicketRoutes,
  ...VaultRoutes,
  ...FormsRoutes,
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

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    // this route requires auth, check if user has admin access
    // if not, redirect to no-access page.
    if (!store.getters.is_internal_user) {
      next({
        name: "no-access",
        // query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else {
    next(); // make sure to always call next()!
  }
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresOwnerOrManagerOrAdmin)) {
    // this route requires auth, check if user is Owner or Manager or Admin
    // if not, redirect to no-access page.
    if (store.getters.is_internal_user || (store.getters.is_power_user && (store.getters.is_manager || store.getters.is_owner))) {
      next();
    } else {
      next({
        name: "no-access",
        // query: { redirect: to.fullPath }
      });
    }
  } else {
    next(); // make sure to always call next()!
  }
});
router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresMissionsPermissions)) {
    // this route requires auth, check if user is Owner or Manager or Admin
    // if not, redirect to no-access page.
    if (store.getters.is_internal_user || store.getters.has_missions_permissions) {
      next();
    } else {
      next({
        name: "no-access",
        // query: { redirect: to.fullPath }
      });
    }
  } else {
    next(); // make sure to always call next()!
  }
});
router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresProcessingPermissions)) {
    // this route requires auth, check if user is Owner or Manager or Admin
    // if not, redirect to no-access page.
    if (store.getters.is_internal_user || store.getters.has_processing_permissions) {
      next();
    } else {
      next({
        name: "no-access",
        // query: { redirect: to.fullPath }
      });
    }
  } else {
    next(); // make sure to always call next()!
  }
});
router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresTerraPermissions)) {
    if (store.getters.is_internal_user || store.getters.has_terra_permissions) {
      next();
    } else {
      next({
        name: "no-access",
        // query: { redirect: to.fullPath }
      });
    }
  } else {
    next(); // make sure to always call next()!
  }
});
router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresThermPermissions)) {
    if (store.getters.is_internal_user || store.getters.has_therm_permissions) {
      next();
    } else {
      next({
        name: "no-access",
        // query: { redirect: to.fullPath }
      });
    }
  } else {
    next(); // make sure to always call next()!
  }
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresQCPermissions)) {
    // this route requires auth, check if user is Owner or Manager or Admin
    // if not, redirect to no-access page.
    if (store.getters.is_qc_internal_user) {
      next();
    } else {
      next({
        name: "no-access",
        // query: { redirect: to.fullPath }
      });
    }
  } else {
    next(); // make sure to always call next()!
  }
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
