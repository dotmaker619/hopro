<template>
  <div>
    <div class="page-loading" v-if="isLoading">
        <img src="@/assets/icons/app-loader.svg" class="image is-100x100" />
      </div>
    <div class="mobile-navbar">
      <p class="is-flex align-center">
        <m-icon
          :name="'hamburger'"
          class="is-16x16 mr-10"
          :file="'tickets-sprite'"
          @click.native="is_sidebar_active = true"
        ></m-icon>
        <span
          class="is-medium-16-500-19 is-capitalized"
        >{{ $route.meta.title ? $route.meta.title : $route.name }}</span>

        <primary-tag
          v-if="$route.query.asset_name"
          :tags="$route.query.asset_name ? [{ uid: $route.query.asset, name: $route.query.asset_name }] : null"
          :hideIcon="false"
          :no_access="true"
          :type="'asset'"
          class="ml-10"
          style="margin-top:5px"
          :truncate_length="25"
        ></primary-tag>
      </p>
      <div class="header">
        <div :class="{'animate-offline-icon':background_sync===1}">
          <sh-icon @click.native="appOffline" :name="is_offline?'go-online-icon':'go-offline-icon'"  class="is-20x20 mr-15"/>
        </div>
        <div @click="$router.push({ name: 'settings' })">
          <figure class="image is-30x30" v-if="claims && claims.user_dp">
            <img class="is-rounded user-display-picture" :src="claims.user_dp" alt />
          </figure>
          <svg viewBox="0 0 100 100" class="image is-30x30" v-else>
            <use xlink:href="@/assets/icons/sprite.svg#user-placeholder" />
          </svg>
        </div>
      </div>
    </div>
    <div class="mobile-sidebar" v-if="is_sidebar_active">
      <div class="mobile-background-new" @click="is_sidebar_active = false"></div>
      <div class="mobile-sidebar-body">
        <div class="logo">
          <img src="@/assets/logos/sensehawk-logo-inverted.svg" alt />
        </div>
        <div class="main">
          <div class="user_details">
            <div class="image is-50x50 mr-15">
              <img :src="claims.user_dp" alt />
            </div>
            <div>
              <p
                class="is-medium-16-500-19 mb-7"
                v-username="$store.getters.state_users[claims.user_id]"
              ></p>
              <p
                class="is-regular-14-500-17 has-opacity-7 is-capitalized"
              >{{ $store.getters.state_users[claims.user_id].role }}</p>
            </div>
          </div>
          <OrganizationDropdown />
          <div class="nav_items mt-30">
            <ul>
              <li class="is-flex is-vcenter py-10 mt-5">
                <m-icon :name="'home'" class="is-24x24 mr-10" :file="'core-sprite'" />
                <span class="is-medium-16-500-19">Home</span>
              </li>
              <li class="is-flex is-vcenter py-10 mt-5">
                <m-icon :name="'notifications'" class="is-24x24 mr-10" :file="'core-sprite'" />
                <span class="is-medium-16-500-19">Notifications</span>
              </li>
              <li
                class="is-flex is-vcenter py-10 mt-5"
                @click="$router.push({ name: 'settings' })"
                :class="{ 'is-disabled': $store.state.is_offline }"
              >
                <m-icon :name="'settings'" class="is-24x24 mr-10" :file="'core-sprite'" />
                <span class="is-medium-16-500-19">Settings</span>
              </li>
            </ul>
          </div>

          <div @click="logout()" class="logout no-user-select">
            <m-icon :name="'logout'" class="is-20x20 mr-10" :file="'core-sprite'" />
            <div style="width:100%;">Logout</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapMutations, mapState } from "vuex";
import shDropdown from "@/desktop/shared/components/sh-dropdown.vue";
import { organizationService } from "@/desktop/shared/services/";
import AuthMixin from "@/auth/shared/auth.mixin";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
import OrganizationDropdown from "@/desktop/shared/components/navbar/components/organization-dropdown";
import isOnline from "is-online";

export default {
  mixins: [AuthMixin, HashColor],
  computed: {
    ...mapState(["current_organization", "claims"]),
    filteredOrg() {
      return this.organizations.filter(org => {
        return org.name
          .toLowerCase()
          .includes(this.searchOrganization.toLowerCase());
      });
    }
  },
  components: {
    shDropdown,
    PrimaryTag,
    OrganizationDropdown
  },
  data() {
    return {
      organizations: [],
      selected: { name: "ALL", uid: "" },
      searchOrganization: "",
      active: false,
      is_sidebar_active: false,
      isLoading: false
    };
  },
  async created() {
    if (this.$store.getters.has_user_role) {
      try {
        let results = await organizationService.getAll({
          query: "page_size=99999&page=1"
        });
        this.organizations = results.results ? results.results : [];
        this.organizations = await this.sort_organizations_on_access_time(
          this.organizations
        );
      } catch (err) {
        console.log(err);
      }
    } else {
      this.organizations = [
        this.$store.state.claims.user_organization,
        ...this.$store.state.claims.guest_organizations
      ];
      this.organizations = await this.sort_organizations_on_access_time(
        this.organizations
      );
    }
  },
  computed:{
    ...mapState([
      "is_offline",
      "background_sync"
    ]),
  },
  methods: {
    ...mapMutations(["SET_CURRENT_ORGANIZATION","SET_GO_OFFLINE"]),
    async appOffline(){
      if(this.is_offline && !await isOnline()){
        this.$toast.show('Unable to go online, check  network connection','',this.$store.state.izitoast_options.appError);
        return;
      }
      this.SET_GO_OFFLINE(!this.is_offline);
      if (
        !this.is_offline && navigator.serviceWorker &&
        navigator.serviceWorker.controller
      ) {
        navigator.serviceWorker.controller.postMessage({
          type: "sync",
        });
      }
      if(this.is_offline){
        this.$toast.show('App went offline, click again to go online','',this.$store.state.izitoast_options.appWarning)
      }
      else{
        this.$toast.show('App went online, Syncing offline data','',this.$store.state.izitoast_options.appSuccess)
      }
    },
    async change_organization(organization) {
      this.SET_CURRENT_ORGANIZATION(organization);
      if (this.$route.name !== "home") {
        await this.$router.push({ name: "home" });
      }
      this.$router.go();
    },
    async sort_organizations_on_access_time(organizations) {
      if (this.$store.state.firebase_database)
        await this.$store.state.firebase_database
          .ref(
            `/userProfile/${this.$store.state.claims.user_id}/organizationAccessTimestamp`
          )
          .once("value")
          .then(result => {
            let access_time = result.val() || {};

            organizations = _.sortBy(
              organizations.map(o => {
                return { ...o, accessTimestamp: access_time[o.uid] };
              }),
              u => -u.accessTimestamp
            );
          });
      return organizations;
    }
  }
};
</script>

<style lang="scss" scoped>

.animate-offline-icon{
  position:relative;
  &::after{
    width: 7px;
    height: 7px;
    border-radius: 100px;
    -webkit-text-stroke: 1px solid black;
    content: " ";
    display: block;
    border: 3px solid white;
    position: absolute;
    top: 6px;
    left: 6px;
    animation-name: offline-animation;
    animation-timing-function: ease-in;
    animation-duration: 0.5s;
    animation-iteration-count: infinite;
     animation-direction:alternate;
  }
}

@keyframes offline-animation {
  from {transform: scale(1);}
  to {transform: scale(3);}
}

.mobile-navbar {
  height: 5rem;
  width: 100%;
  background: $white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-sidebar {
  &-body {
    width: 100%;
    height: 100vh;
    position: fixed;
    top: 0;
    z-index: 1000;
    background: white;
    position: absolute;
    top: 0;
    left: 0;
    width: 25rem;
    height: 100vh;
    overflow: hidden;
    .logo {
      height: 10rem;
      img {
        position: relative;
        top: -4rem;
        border-bottom: 1px solid #eee;
      }
    }
    .main {
      padding: 1.5rem;

      .user_details {
        display: flex;
        align-items: center;
      }

      .logout {
        position: absolute;
        bottom: 0;
        display: flex;
        align-items: center;
        width: 100%;
        height: 5.5rem;
        padding-left: 1.5rem;
        border-top: solid 0.6px rgba(141, 149, 170, 0.5);
        left: 0;
        z-index: 1;
        background-color: $white;
      }
    }
  }
}

.user-display-picture {
  height: 3rem;
  width: 3rem;
  overflow: hidden;
}

.is-50x50 {
  height: 5rem;
  width: 5rem;
  overflow: hidden;
  border-radius: 100%;
}

.organization-icon {
  width: 2.4rem;
  min-width: 2.4rem;
  height: 2.4rem;
  color: $white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header {
  display: flex;
  align-items: center;
}

.org_dropdown {
  margin-top: 2.4rem;
  width: 218px;
  height: 4.4rem;
  border-radius: 4px;
  border: solid 0.6px rgba(141, 149, 170, 0.5);
  position: relative;
  z-index: 2;

  .header {
    display: flex;
    width: 100%;
    justify-content: space-between;

    padding: 7px 10px;
  }

  &--content {
    background: white;
    width: 218px;
    max-height: 314px;
    border-radius: 4px;
    box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.1);
    border: solid 0.6px rgba(141, 149, 170, 0.5);

    overflow: auto;
    .nav-search {
      border-bottom: 1px solid rgba(141, 149, 170, 0.5);

      input {
        border: none;
        box-shadow: none;
      }
    }
  }
}
.page-loading {
  width: 100%;
  height: 100vh;
  background-color: white;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
