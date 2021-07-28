<script>
import { mapState, mapMutations, mapGetters } from "vuex";
// import { metricsService } from "@/desktop/shared/services/";
import axios from "axios";
const queryString = require("query-string");
import NoAccessPopup from "@/desktop/shared/components/no-access-popup";
export default {
  data() {
    return {
      error_status: null,
      errors: null,
      isLoading: false,
      showDeleteModal: false,
    };
  },

  computed: {
    isPinned() {
      return !!this.$store.state.PINNED_TABS.filter(
        (p) => p.path === this.$route.path
      ).length;
    },
    isMobile() {
      return this.$route && this.$route.meta.screen == "mobile";
    },
  },

  methods: {
    get_teams(item) {
      return [...(item.readLabels || []), ...(item.writeLabels || [])].map(
        (t) => {
          return this.$store.getters.state_teams[t] || { uid: t, name: t };
        }
      );
    },
    append_recently_accessed_resource(
      resourceType,
      resourceId,
      appendLength = 25
    ) {
      let resourceList = !this.$store.state.RECENTLY_ACCESSED_RESOURCES
        ? []
        : [
            ...(this.$store.state.RECENTLY_ACCESSED_RESOURCES[resourceType] ||
              []),
          ];
      let resourceIndex = resourceList.indexOf(resourceId);
      if (resourceIndex === -1) resourceList.unshift(resourceId);
      else {
        resourceList.splice(resourceIndex, 1);
        resourceList.unshift(resourceId);
      }
      this.$store.state.firebase_database
        .ref(
          `/userProfile/${this.$store.state.claims.user_id}/organizations/${this.$store.state.current_organization.uid}/recentlyAccessed/${resourceType}`
        )
        .set(resourceList.slice(0, appendLength));
    },
    // checking perms
    has_app_access(appName) {
      return this.$store.state.claims.app_permissions.hasOwnProperty(appName);
    },
    no_access_popup(app_name, permission_name) {
      this.$modal.show(
        NoAccessPopup,
        {
          app_name,
          permission_name,
          open_guide: (newValue) => {
            // "callback"
          },
        },
        // classes: ["has-background-transparent"],
        {
          width: "650px",
          height: "auto",
        }
      );
    },
    access(app_name, permission_name) {
      if (
        !this.$store ||
        !this.$store.state.claims ||
        !this.$store.state.claims.app_permissions
      )
        return false;

      if (!permission_name)
        return this.$store.state.claims.app_permissions[app_name];
      else
        return (
          this.$store.state.claims.app_permissions[app_name] &&
          this.$store.state.claims.app_permissions[app_name].includes(
            permission_name
          )
        );
    },

    // list pages
    get_default_query_params() {
      if (
        this.$route.name === "mission-list" ||
        this.$route.name === "group-details-missions"
      )
        return {
          pageSize: this.$route.query.pageSize || this.default_page_size,
          pageNumber: this.$route.query.pageNumber || 1,
          q: this.$route.query.q || "",
        };

      return {
        page_size: this.$route.query.page_size || this.default_page_size,
        page: this.$route.query.page || 1,
        search: this.$route.query.q || "",
      };
    },
    async get_data(query, service, from_server = false) {
      this.isLoading = true;
      query = {
        ...query,
        ...this.get_default_query_params(),
      };

      let res = await service
        .getAll({
          query: queryString.stringify(query),
          from_server,
        })
        .catch((err) => {
          this.handleErrors(err);
        });
      let results = res && res.results ? res.results : [];
      let count = res && res.count ? res.count : 0;

      this.data = results;
      this.updatePagination(count);
      this.isLoading = false;
    },

    async get_data_with_attribute(id, attribute, query, service) {
      query = {
        ...query,
        ...this.get_default_query_params(),
      };

      let { results, count } = await service
        .get({
          id: id,
          attribute: attribute,
          query: queryString.stringify(query),
        })
        .catch((err) => {
          this.handleErrors(err);
        });
      this.data = results;
      this.updatePagination(count);
    },
    update_owner(data, user) {
      data.owner = user;
      data = Object.assign({}, data);
    },
    // async get_resource_metrics(attribute, resource_id) {
    //   this.resource_metrics = await metricsService.get_resource_metrics({
    //     attribute: attribute,
    //     id: resource_id,
    //   });
    // },
    handleErrors(err, show_notification) {
      if (!err || !err.response) return;
      let message = "";
      this.errors = err.response.data;
      this.error_status = err.response.status;
      if (err.response.status == 403)
        message = "You don't have enough permissions for this action";
      else if (err.response.status == 400) message = "Invalid inputs";
      else if (err.response.status == 404) message = "Resource not Found.";
      else if (err.response.status == 401) {
        if (
          ["OAUTH_10", "OAUTH_11", "OAUTH_22", "OAUTH_31"].includes(
            err.response.data.code
          )
        ) {
          window.$cookies.remove(
            "access_token",
            null,
            window.location.hostname === "localhost"
              ? "localhost"
              : ".sensehawk.com"
          );

          if (err.response.data.code === "OAUTH_31") {
            this.$cookies
              .keys()
              .forEach((cookie) =>
                this.$cookies.remove(
                  cookie,
                  null,
                  window.location.hostname === "localhost"
                    ? "localhost"
                    : ".sensehawk.com"
                )
              );
          }
          console.log("err.response.status", err.response.status);
          if (this.$router) this.$router.push({ name: "auth" });
          else {
            window.location.href = window.location.origin + "/auth";
          }
        }
      } else message = "Oops! Something went wrong.";
      if (show_notification) {
        this.$toast.show(
          message,
          "",
          this.$store.state.izitoast_options.appError
        );
      }
    },
    show_success(message) {
      this.$toast.show(
        message,
        "",
        this.$store.state.izitoast_options.appSuccess
      );
    },
    show_warning(message) {
      this.$toast.show(
        message,
        "",
        this.$store.state.izitoast_options.appWarning
      );
    },
    show_danger(message) {
      this.$toast.show(
        message,
        "",
        this.$store.state.izitoast_options.appError
      );
    },
    get_password_header(uid) {
      return { "X-Vault-Password": this.$store.state.pass_keys[uid] || uid };
    },
    // deleted_resource(routeName, routeId) {
    //   this.show_success("Resource successfully deleted");
    //   this.$router.push({ name: routeName, params: { id: routeId } });
    //   this.getData();
    // },
    // deleted_in_list() {
    //   this.show_success("Resource successfully deleted");
    //   this.getData();
    // },
  },
};
</script>
