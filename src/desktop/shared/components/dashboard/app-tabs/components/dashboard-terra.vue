<template>
  <div>
    <no-result-dashboard-app v-if="!has_app_access('terra')">
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

    <div v-else-if="data && data.length">
      <div class="dashboard-terra-tab is-regular-14-500-17 card pt-10 pl-10 mb-10 pb-5" v-for="item in data.slice(0, 3)" :key="item.id">
        <div class="card-content">
          <div class="content-details columns">
            <article class="column" style="flex:0 0 60%">
              <router-link
                @click.native="append_recently_accessed_resource('terra', item.uid)"
                tag="p"
                :to="{ name: 'terra-viewer' , params: { id: item.uid } }"
                class="is-pointer title is-semiBold-18-600-22 is-marginless"
                >{{ item.name | truncate(25) }}</router-link
              >
              <p class="mt-3 is-regular-14-500-17 has-text-theme-black has-opacity-7">{{ item.description || "*Not found" }}</p>
              <router-link tag="p" class="is-flex is-vcenter mt-15" :to="{ name: 'user-details', params: { id: item.owner.uid } }">
                <user-avatar :user="item.owner" class="mr-10"></user-avatar>
                <div>
                  <p class="is-regular-14-500-17 mb-3 has-text-theme-grey">Created By</p>
                  <p class="is-medium-14-500-17 has-text-baltic-grey" v-username="item.owner"></p>
                </div>
              </router-link>
            </article>
            <section class="column is-paddingless mt-10">
              <div class="media-content">
                <div
                  class="content is-flex has-space-between has-direction-column"
                  style="
                      height:100px"
                >
                  <p>
                    <small class="is-regular-14-500-17 has-text-theme-black has-opacity-7">Users</small>
                    <user-tag
                      :users="[...(item.readUsers || []), ...(item.writeUsers || [])]"
                      :howManyToShow="2"
                      class="mt-3"
                      :pxsize="36"
                    ></user-tag>
                  </p>
                  <p class="is-regular-14-00-17 has-text-theme-black has-opacity-7 mb-5" style="margin-top:8px">
                    Modified On:
                    <span class="is-medium-14-500-17 has-text-theme-black">{{ item.timestamp | sinceDays }}</span>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <router-link :to="{ 'name': 'terra-list' }" tag="p" class="has-text-right is-underlined is-pointer mr-10">View All</router-link>
    </div>
    <div v-else>
      <div v-if="is_loading">
        <dashboard-terra-skeleton></dashboard-terra-skeleton>
      </div>
      <no-results v-else>
        <img slot="image" src="@/assets/illustrations/data-illustration.svg" alt />
      </no-results>
    </div>
  </div>
</template>

<script>
  import { terraService, userService } from "@/desktop/shared/services/";
  import InfoBlock from "@/desktop/shared/components/info-block";
  import UserTag from "@/desktop/shared/components/tags/user-tag";
  import { mapState } from "vuex";
  import OrderMixin from "@/desktop/shared/mixins/order.mixin.vue";
  import DashboardTerraSkeleton from "@/desktop/shared/components/skeleton/dashboard/terra.vue";
  export default {
    mixins: [OrderMixin],
    data() {
      return {
        data: [],
        terraUsers: {},
        is_loading: false,
      };
    },
    components: {
      UserTag,
      InfoBlock,
      DashboardTerraSkeleton,
    },
    created() {
      this.$eventHub.$on("update_dashboard", this.getData);
      if (this.has_app_access("terra")) this.getData();
    },
    beforeDestroy () {
      this.$eventHub.$off("update_dashboard", this.getData);
    },
    methods: {
      async getData() {
        this.is_loading = true;
        this.$store.state.firebase_database
          .ref(`/userProfile/${this.$store.state.claims.user_id}/organizations/${this.$store.state.current_organization.uid}/recentlyAccessed/terra/`)
          .once("value", async (snapshot) => {
            let recently_accessed_resources = snapshot.val() || [];

            try {
              let recents_data = [];
              if (recently_accessed_resources) {
                this.recent_terra = recently_accessed_resources.join();
                let { data } = await terraService
                  .get_views({
                    query: `uids=${this.recent_terra}`,
                  })
                  .catch((err) => {
                    this.handleErrors(err);
                    this.is_loading = false;
                  });
                let uids = [...recently_accessed_resources];
                recents_data = this.maintain_order(uids, data);
              }

              let result = await terraService
                .get_views({
                  query: `order=-updated&&page_size=3`,
                })
                .catch((err) => {
                  this.handleErrors(err);
                  this.is_loading = false;
                });

              let sorted_data = result.data;
              this.data = _.uniqBy([...recents_data, ...sorted_data], (d) => d.uid);
              this.is_loading = false;
            } catch (error) {
              this.is_loading = false;
            }
          });
      },
    },
  };
</script>
