<script>
  import { authService, userService, teamService, apiService, assetService } from "@/desktop/shared/services/";
  import { mapMutations, mapState } from "vuex";
  import config from "@/auth/components/config.js";
  import { organizationService } from "@/desktop/shared/services/";
  import store from "@/store/";

  let authMixin = {
    computed: {
      ...mapState(["token", "claims", "current_organization"]),
    },
    methods: {
      ...mapMutations(["SET_COOKIE_TOKEN"]),
      async handle_auth() {
        store.commit("SET_APP_LOADING", true);

        // if "access_token" not there in in cookies and no code
        if (!window.$cookies.get("access_token") && !this.$route.query.code) {
          this.$router.push({ name: "auth" });
          return;
        }
        let payload = await authService
          .get_access_token({
            body: {
              redirect_uri: config.oidc.redirectUri,
              code: this.$route.query.code,
            },
          })
          .catch((err) => {
            this.$router.push({ name: "auth" });
          });
        if (payload && payload.access_token) this.SET_COOKIE_TOKEN(payload.access_token);
        else {
          this.$router.push({ name: "auth" });
          return;
        }
        await this.initialize_app();

        if (this.$route.name !== "home") this.$router.push({ name: "home" });
      },
      async initialize_app() {
        try {
          store.commit("SET_APP_LOADING", true);
          if (!store.state.claims) {
            let res = await authMixin.methods.set_claims();
            if (res) return;
          }
          if (!store.state.current_organization) {
            await authMixin.methods.set_org();
            this.getAssets();
          }
          if (!store.state.RECENTLY_ACCESSED_RESOURCES && !window.is_mobile) {
            // alert("firebase");
            await authMixin.methods.init_firebase();
          }

          this.handle_one_signal();
          store.commit("SET_APP_LOADING", false);
        } catch (err) {
          console.log(err);
        }
      },
      async init_firebase() {
        var firebaseConfig = {
          apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
          authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
          databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
          projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
          storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.VUE_APP_FIREBASE_APP_ID,
          measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID,
        };
        firebase.initializeApp(firebaseConfig);
        try {
          let response = await apiService.get_firebase_token();
          await firebase.auth().signInWithCustomToken(response.data.token);
          firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
              store.commit("SET_FIREBASE_DATABASE", firebase.database());
              authMixin.methods.set_recently_accessed_resources();
              await store.dispatch("set_tags");
              store.commit("SET_TAGS");
              store.commit("SET_PINNED_TABS");
              store.commit("SET_RECENTLY_ACCESSED", "tickets");
              store.commit("SET_RECENTLY_ACCESSED", "terra");
              store.commit("SET_RECENTLY_ACCESSED", "therm");
              store.commit("SET_RECENTLY_ACCESSED", "vault-files");
              store.commit("SET_RECENTLY_ACCESSED", "vault-folders");
            }
          });
        } catch (err) {
          store.commit("SET_RECENTLY_ACCESSED_RESOURCES", {
            terra: [],
            therm: [],
            tickets: [],
            "vault-folders": [],
            "vault-files": [],
          });
        }
      },
      set_recently_accessed_resources() {
        store.commit("SET_RECENTLY_ACCESSED_RESOURCES", {
          terra: [],
          therm: [],
          tickets: [],
          "vault-folders": [],
          "vault-files": [],
        });
        if (!store.state.claims) return;
        return new Promise((resolve, reject) => {
          store.state.firebase_database
            .ref(`/userProfile/${store.state.claims.user_id}/organizations/${store.state.current_organization.uid}/recentlyAccessed/`)
            .once("value", (snapshot) => {
              if (snapshot.val()) store.commit("SET_RECENTLY_ACCESSED_RESOURCES", snapshot.val());
              else
                store.commit("SET_RECENTLY_ACCESSED_RESOURCES", {
                  terra: [],
                  therm: [],
                  tickets: [],
                  "vault-folders": [],
                  "vault-files": [],
                });
              resolve();
            });
        });
      },
      clear_cache() {
        if ("caches" in window) {
          caches.delete("api-cache").then(function(response) {
            console.log("Successfully cleaned api cache!!");
          });
        }
      },
      async logout() {
        this.isLoading = true;
        this.is_sidebar_active = false;
        try {
          await authService.logout();
          await authService.logout_okta();

          this.remove_cookies();
          this.handle_one_signal(false);
          this.handle_intercom();
          this.clear_cache();
          if (this.$router) this.$router.push({ name: "auth" });
          else window.location.href = window.location.origin + "/auth";
          this.isLoading = false;
        } catch (err) {
          this.remove_cookies();
          this.handle_one_signal(false);
          this.handle_intercom();
          if (this.$router) this.$router.push({ name: "auth" });
          else window.location.href = window.location.origin + "/auth";
          this.isLoading = false;
        }
      },
      remove_cookies() {
        window.$cookies.remove("access_token", null, window.location.hostname === "localhost" ? "localhost" : ".sensehawk.com");
        window.$cookies
          .keys()
          .forEach((cookie) => window.$cookies.remove(cookie, null, window.location.hostname === "localhost" ? "localhost" : ".sensehawk.com"));
      },
      async getAssets() {
        try {
          let query = "page_size=1000&page_number=1";
          let { results } = await assetService.getAssetsDashboard({ query });
          store.commit("SET_ASSETS", results);
        } catch (err) {
          console.log(err);
        }
      },
      handle_one_signal(is_add = true) {
        try {
          if (!store.state.claims || !OneSignal) return;
          OneSignal.push(() => {
            if (is_add) OneSignal.setExternalUserId(store.state.claims.user_id);
            else OneSignal.removeExternalUserId(store.state.claims.user_id);
          });
        } catch (err) {
          console.log(err);
        }
      },
      handle_intercom() {
        window.Intercom("shutdown");
        window.Intercom("boot", { app_id: process.env.VUE_APP_INTERCOM_KEY });
      },
      async set_claims() {
        if (!window.$cookies.get("access_token")) return "Error";
        try {
          let user_claims = await authService.get_user_claims({});

          if (user_claims) {
            store.dispatch("set_claims", user_claims);
          } else return "Error";
        } catch (err) {
          if (err.response && ["OAUTH_31", "OAUTH_22", "OAUTH_11", "OAUTH_10"].includes(err.response.data.code)) {
            if ("caches" in window) {
              caches.delete("api-cache").then(function(response) {
                console.log("Successfully cleaned api cache!!");
              });
            }
            window.$cookies
              .keys()
              .forEach((cookie) => window.$cookies.remove(cookie, null, window.location.hostname === "localhost" ? "localhost" : ".sensehawk.com"));
          }
          if (!window.location.href.includes("auth")) {
            if (this.$router) {
              this.$router.push({ name: "auth" });
            } else {
              window.location.href = window.location.origin + "/auth";
            }
          }
          return "Error";
        }
      },
      async set_org() {
        if (!store.state.claims) return;
        let organizations;
        if (store.getters.has_user_role) {
          try {
            let results = await organizationService.getAll({
              query: "page_size=99999&page=1",
            });
            organizations = results.results ? results.results : [];
          } catch (err) {
            console.log(err);
          }

          if (!window.$cookies.get("user_organization")) {
            store.dispatch("set_current_organization", organizations[0]);
          } else {
            try {
              let org = window.$cookies.get("user_organization");
              let cookie_org = JSON.parse(atob(org));
              store.dispatch("set_current_organization", cookie_org);
            } catch (err) {
              console.log(err);
              // store.dispatch("set_current_organization", cookie_org);
            }
          }
        } else {
          if (window.$cookies.get("user_organization")) {
            try {
              let org = window.$cookies.get("user_organization");
              let cookie_org = JSON.parse(atob(org));
              store.dispatch("set_current_organization", cookie_org);
            } catch (err) {
              store.dispatch("set_current_organization", cookie_org);
            }
          } else {
            store.dispatch("set_current_organization", store.state.claims.user_organization);
          }
        }

        let promises = [
          userService.getAll({
            from_server: true,
            query: "page_size=10000&display_picture=true&include_internal=true",
          }),
          teamService.getAll({
            from_server: true,
            query: "users=true&assets=true",
          }),
        ];
        if (window.is_mobile) promises.push(apiService.getTags());

        let data = await Promise.all(promises);
        store.dispatch("set_teams_and_users", data);
      },
      async update_users() {
        let data = await userService.getAll({
          from_server: true,
          query: "page_size=10000&display_picture=true&include_internal=true",
        });
        store.dispatch("set_users", data);
      },
      async update_teams() {
        let data = await teamService.getAll({
          query: "users=true&assets=true",
          from_server: true,
        });
        store.dispatch("set_teams", data);
      },
    },
  };
  export default authMixin = authMixin;
</script>
