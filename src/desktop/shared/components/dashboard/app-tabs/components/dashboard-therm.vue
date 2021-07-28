<template>
  <no-result-dashboard-app v-if="!has_app_access('therm')">
    <img slot="image" src="@/assets/illustrations/no-permissions-illustration.svg" alt srcset />
    <div slot="title">No Access</div>
    <div slot="button" class="sh-button sh-button--create">Request access</div>
    <div slot="no-result-desc">
      Oops! You don't have enough permissions to access the feature/functionality.
      <br />Your administrator should be able to give access to this feature if registered.
      <br />
      <br />Want this feature to be enabled for your organization?
    </div>
  </no-result-dashboard-app>
  <div v-else-if="is_loading">
    <dashboard-therm-skeleton></dashboard-therm-skeleton>
  </div>
  <div v-else-if="data && data.length">
    <div class="dashboard-terra-tab is-regular-14-500-17 card pt-10 pl-10 mb-10 pb-5" v-for="item in data.slice(0, 3)" :key="item.uid">
      <div class="px-10 pt-5 mb-10">
        <router-link
          @click.native="append_recently_accessed_resource('therm', item.uid)"
          :to="{ name: 'therm-viewer', params: { id: item.uid } }"
          class="is-semiBold-18-600-22 title is-capitalized is-pointer mb-20"
          >{{ item.name }}</router-link
        >
        <div class="divider ml-10 mr-5 "></div>

        <p class="is-regular-14-500-17 has-opacity-7">{{ item.description || "*No descrition" }}</p>
      </div>
      <div class="card-content columns" v-if="item && item.users">
        <div class="column is-5 is-flex is-vcenter">
          <user-avatar :user="item.users.owner" :pxsize="30" class="mr-5"></user-avatar>

          <div>
            <p class="is-regular-12-500-14 has-opacity-7">Created By</p>
            <p
              class="is-medium-14-500-17 has-text-weight-semibold has-text-lightgrey is-capitalized"
              v-if="item.users && item.users.owner"
              v-username="item.users.owner"
            ></p>
          </div>
        </div>
        <div class="column">
          <h1 class="is-regular-12-500-14 has-opacity-7">Affected KW</h1>
          <h1 class="is-medium-16-500-19 mt-5 affected">
            {{ ((item.metrics.modules.affected * (item.moduleWattPeak || 300)) / 1000).toFixed(1) }}KW
          </h1>
        </div>
        <div class="column">
          <h1 class="is-regular-12-500-14 has-opacity-7">Total DC capacity</h1>
          <h1 class="is-medium-16-500-19 mt-5 capacity">
            {{ (item.metrics.modules.total * ((item.moduleWattPeak || 300) / 1000000)).toFixed(1) }}MW
          </h1>
        </div>
        <div class="column is-2">
          <h1 class="is-regular-12-500-14 has-opacity-7"># Issues</h1>
          <h1 class="is-medium-16-500-19 mt-5">{{ (item.metrics.issues && total_issues(item.metrics.issues)) || "0" }}</h1>
        </div>
      </div>
    </div>
    <router-link :to="{ 'name': 'therm-view-list' }" tag="p" class="has-text-right is-underlined is-pointer mr-10">View All</router-link>
  </div>
  <no-results v-else>
    <img slot="image" src="@/assets/illustrations/data-illustration.svg" alt />
  </no-results>
</template>

<script>
  import { viewService, userService } from "@/desktop/shared/services/";
  const queryString = require("query-string");
  import viewCard from "@/desktop/therm/shared/components/view-card";
  import InfoBlock from "@/desktop/shared/components/info-block";
  import { mapState } from "vuex";
  import OrderMixin from "@/desktop/shared/mixins/order.mixin.vue";
  import DashboardThermSkeleton from "@/desktop/shared/components/skeleton/dashboard/therm.vue";
  export default {
    mixins: [OrderMixin],
    data() {
      return {
        data: [],
        is_loading: false,
      };
    },
    created() {
      this.$eventHub.$on("update_dashboard", this.getData);
      if (this.has_app_access("therm")) this.getData();
    },
    beforeDestroy () {
      this.$eventHub.$off("update_dashboard", this.getData);
    },
    components: {
      viewCard,
      InfoBlock,
      DashboardThermSkeleton,
    },
    methods: {
      async getData() {
        this.is_loading = true;
        this.$store.state.firebase_database
          .ref(`/userProfile/${this.$store.state.claims.user_id}/organizations/${this.$store.state.current_organization.uid}/recentlyAccessed/therm/`)
          .once("value", async (snapshot) => {
            let recently_accessed_resources = snapshot.val() || [];
            try {
              let query = {
                metrics: true,
                complete: true,
                projects: true,
                important: true,
                page_number: 1,
              };
              let recents_data = [];
              if (recently_accessed_resources && recently_accessed_resources.length) {
                let recent_therm = [...recently_accessed_resources].join("&viewUid=");
                let { data } = await viewService
                  .getAll({
                    query: `${queryString.stringify(query)}&viewUid=${recent_therm}`,
                  })
                  .catch((err) => this.handleErrors(err));
                let uids = [...recently_accessed_resources];

                recents_data = this.maintain_order(uids, data);
              }

              let result = await viewService
                .getAll({
                  query: `${queryString.stringify(query)}&page_size=3&sort=-updatedAt`,
                })
                .catch((err) => this.handleErrors(err));
              let sorted_data = result.data;
              this.data = [...recents_data, ...sorted_data];
              this.data = _.uniqBy(this.data, "uid");

              this.is_loading = false;
            } catch (err) {
              this.is_loading = false;
            }
          });
      },
      total_issues(issues) {
        return _.sum(Object.values({ ...issues, table: 0 }));
      },
    },
  };
</script>

<style lang="scss" scoped>
  .user-picture {
    height: 3rem;
    width: 3rem;
    overflow: hidden;
    border-radius: 50%;

    &__icon {
      color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
      text-transform: capitalize;
    }
  }
  .dashboard-terra-tab {
    &:hover {
      box-shadow: 1px 1px 10px 2px #ddd;
      .title {
        color: $primary;
      }
      .affected {
        color: $therm-affected;
      }
      .capacity {
        color: $therm-capacity;
      }
    }
  }
</style>
