<template>
  <div>
    <div class="page-loading" v-if="isLoading">
      <img src="@/assets/icons/app-loader.svg" class="image is-100x100" />
    </div>
    <nav class="navbar level is-mobile">
      <div v-if="update_app" class="refresh-page-popup">
        <div class="refresh-page-popup-box">
          <div class="refresh-page-popup-box-left">
            <img class="icon" src="@/assets/icons/reload-refresh.svg" alt />
            <span class="text-1">New Version Available</span>
            <span class="text-2">Please, update app to new version</span>
          </div>
          <div class="refresh-page-popup-box-right">
            <a @click="update_app = false" class="button-1">Later</a>
            <a @click="$router.go()" class="button-2">Update Now</a>
          </div>
        </div>
      </div>
      <organization-dropdown v-else></organization-dropdown>

      <div class="notifications level-right">
        <template v-if="!update_app">
          <router-link
            v-if="$route.path.includes('admin')"
            :to="{ name: 'dashboard' }"
            class="route-button"
          >
            Go to User
            <i class="fas ml-5 fa-chevron-right"></i>
          </router-link>
          <router-link
            v-else-if="$store.getters.is_internal_user"
            :to="{ name: 'organization-list' }"
            class="route-button"
          >
            Go to Admin
            <i class="fas ml-5 fa-chevron-right"></i>
          </router-link>
        </template>
        <div class="level is-mobile">
          <div
            class="ml-10 mr-10 is-pointer is-relative"
            @click="openAppDropdown = !openAppDropdown"
          >
            <sh-icon :name="'all-applications-grid'" class="is-24x24"></sh-icon>
            <app-dropdown v-if="openAppDropdown" v-click-outside="() => (openAppDropdown = false)"></app-dropdown>
          </div>

          <p
            class="ml-10 mr-10 is-pointer is-relative"
            @click="openPinDropdown = !openPinDropdown"
            style="cursor: pointer"
          >
            <span
              v-if="!openPinDropdown && PINNED_TABS.length > 0"
              class="pin-count icon is-absolute"
            >{{ PINNED_TABS.length }}</span>
            <sh-icon :name="openPinDropdown ? 'pinned-active' : 'pinned'" class="is-24x24"></sh-icon>
            <pin-dropdown
              v-click-outside="() => (openPinDropdown = false)"
              @close_pin_dropdown="openPinDropdown = false"
              v-if="openPinDropdown"
            ></pin-dropdown>
          </p>

          <p class="ml-10 mr-10" @click="open_invite_popup" style="cursor: pointer">
            <sh-icon :name="'invite-users'" class="is-24x24"></sh-icon>
          </p>

          <p class="ml-10 mr-10">
            <sh-dropdown :triggerIsIcon="true" :icon="'expand'">
              <div slot="selection">
                <sh-icon :name="'add-create'" class="is-24x24 is-inline"></sh-icon>
              </div>
              <div slot="search"></div>
              <div slot="content">
                <p
                  v-if="access('core', 'create_assets')"
                  @click="open_form(AssetFormComponent, { header: 'Create Asset for' })"
                >
                  <img class="image is-16x16 mr-10" src="@/assets/icons/asset-icon.svg" alt />
                  <span class="is-medium-14-500-17">New Assets</span>
                </p>

                <p v-else @click="no_access_popup('core', 'create_assets')">
                  <img class="image is-16x16 mr-10" src="@/assets/icons/asset-icon.svg" alt />
                  <span class="is-medium-14-500-17 disabled-link">New Assets</span>
                </p>

                <p
                  v-if="access('core', 'create_groups')"
                  @click="open_form(GroupFormComponent, { header: 'Create Group for' })"
                >
                  <img class="image is-16x16 mr-10" src="@/assets/icons/group-icon.svg" alt />
                  <span class="is-medium-14-500-17">New Group</span>
                </p>
                <p v-else @click="no_access_popup('core', 'create_groups')">
                  <img class="image is-16x16 mr-10" src="@/assets/icons/group-icon.svg" alt />
                  <span class="is-medium-14-500-17 disabled-link">New Group</span>
                </p>
                <p
                  v-if="access('core', 'create_containers')"
                  @click="open_form(ContainersFormComponent, { header: 'Create Container for' })"
                >
                  <img class="image is-16x16 mr-10" src="@/assets/icons/container-icon.svg" alt />
                  <span class="is-medium-14-500-17">New Container</span>
                </p>
                <p v-else @click="no_access_popup('core', 'create_groups')">
                  <img class="image is-16x16 mr-10" src="@/assets/icons/container-icon.svg" alt />
                  <span class="is-medium-14-500-17 disabled-link">New Container</span>
                </p>
              </div>
            </sh-dropdown>
          </p>
          <!-- <p class="ml-10 mr-10">
            <svg viewBox="0 0 100 100" class="image is-24x24">
              <use xlink:href="@/assets/icons/sprite.svg#notification" />
          </svg>-->
          <!-- <notification-dropdown></notification-dropdown> -->
          <!-- </p> -->
          <img
            class="mr-10"
            style="height: 25px;margin-bottom: 5px;"
            src="@/assets/icons/seperate.svg"
            alt
          />

          <p
            :class="{ 'active-text': is_intercom_active }"
            v-if="$store.getters.is_show_intercom_support"
            class="mb-5 is-pointer"
            @click="toggle_intercom()"
          >
            <img class="image is-24x24" src="@/assets/icons/profile-menu-icons/help.svg" alt />
          </p>
          <div class="ml-10 mr-10 profile">
            <sh-dropdown class="margin-y-auto" :icon="'expand'" :triggerIsIcon="true">
              <div slot="selection">
                <div class="header">
                  <figure class="image is-48x48" v-if="claims && claims.user_dp">
                    <img class="is-rounded user-display-picture" :src="claims.user_dp" alt />
                  </figure>
                  <sh-icon v-else :name="'user-placeholder'" class="is-48x48"></sh-icon>
                </div>
              </div>
              <div slot="content" class="profile-dropdown">
                <p
                  :class="{ 'active-text': $route.name == 'user-profile' }"
                  @click="$router.push({ name: 'user-profile', params: { id: $store.state.claims.user_id } })"
                >
                  <img
                    v-if="$route.name == 'user-profile'"
                    class="mr-10"
                    src="@/assets/icons/profile-menu-icons/active/profile.svg"
                  />
                  <img v-else class="mr-10" src="@/assets/icons/profile-menu-icons/profile.svg" />
                  Profile
                </p>
                <!-- <p :class="{'active-text':$route.name=='settings'}">
                  <img v-if="$route.name=='settings'" class="mr-10" src="@/assets/icons/profile-menu-icons/active/settings.svg" />
                  <img v-else class="mr-10" src="@/assets/icons/profile-menu-icons/settings.svg" alt />
                  Settings
                </p>-->
                <!-- :class="{'active-text':is_intercom_active}" -->
                <p v-if="$store.getters.is_show_intercom_support" @click="toggle_intercom()">
                  <img class="mr-10" src="@/assets/icons/profile-menu-icons/help.svg" alt />
                  Help
                </p>
                <p @click="logout" :class="{ 'active-text': $route.name == 'logout' }">
                  <img
                    v-if="$route.name == 'logout'"
                    class="mr-10"
                    src="@/assets/icons/profile-menu-icons/active/logout.svg"
                    alt
                  />
                  <img v-else class="mr-10" src="@/assets/icons/profile-menu-icons/logout.svg" alt />
                  Logout
                </p>
              </div>
            </sh-dropdown>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>
<script>
import shDropdown from "../sh-dropdown";
import { mapMutations, mapState } from "vuex";
import AuthMixin from "@/auth/shared/auth.mixin";
import AppDropdown from "./components/app-dropdown";
import PinDropdown from "./components/pin-dropdown";
import AssetFormComponent from "@/desktop/core/components/asset/asset-form.component";
import GroupFormComponent from "@/desktop/core/components/group/group-list/components/group-form.component.vue";

import ContainersFormComponent from "@/desktop/core/components/container/container-form.component";
// import notificationDropdown from "../../core/shared/components/notifications/notification-dropdown";
import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
import UserInviteForm from "@/desktop/core/components/user/user-invite/user-invite-popup";
import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
import OrganizationDropdown from "./components/organization-dropdown";

export default {
  mixins: [AuthMixin, FormPopup, HashColor],
  components: {
    shDropdown,
    AppDropdown,
    PinDropdown,
    OrganizationDropdown
    // notificationDropdown
  },
  data() {
    return {
      is_intercom_active: false,
      update_app: false,
      active: false,
      avatarLink: "https://avatars.doist.com/?fullName=",

      openAppDropdown: false,
      openPinDropdown: false,
      searchOrganization: "",
      AssetFormComponent: AssetFormComponent,
      GroupFormComponent: GroupFormComponent,
      ContainersFormComponent: ContainersFormComponent
    };
  },
  async created() {
    if (this.$store.getters.is_show_intercom_support) this.init_intercom(true);
    document.addEventListener("app-updated", this.toggle_app_update);
  },
  beforeDestroy() {
    document.removeEventListener("app-updated", this.toggle_app_update);
  },
  computed: {
    ...mapState(["current_organization", "claims", "PINNED_TABS"]),
  },
  methods: {
    toggle_app_update () {
      this.update_app = true;
    },
    ...mapMutations(["SET_CURRENT_ORGANIZATION"]),
    toggle_intercom() {
      window.Intercom("show");
    },
    init_intercom() {
      this.is_intercom_active = !this.is_intercom_active;
      // Initialize only when split treatment is on/control
      // Whenever we have user logged in, use the user first_name + " " + last_name, email, user_id
      // If there's no user, just app_id.
      // At logout, shutdown intercom
      // When going to viewers hide the intercom
      // When coming back, show the intercom
      if (this.is_intercom_active) {
        let options = { app_id: process.env.VUE_APP_INTERCOM_KEY };
        options["email"] = this.claims.email;

        if (this.claims.firstname)
          options["name"] = this.claims.firstname + " " + this.claims.lastname;
        else if (this.claims.email) options["name"] = this.claims.email;
        else options["name"] = this.claims.user_id;
        window.Intercom("boot", options);
      }
    },
    open_invite_popup() {
      this.$modal.show(UserInviteForm, {}, { height: "auto" });
    },
  }
};
</script>
<style lang="scss">
.navbar {
  background: $white;
  height: 8rem;
  padding: 0 3rem;
  padding-right: 0;
}
.pin-count {
  font-family: Barlow-bold;
  font-size: 12px;
  color: white;
  background-color: $primary;
  border-radius: 50%;
  border: 1px solid white;
  z-index: 99;
  left: 1.6rem;
  bottom: 0.9rem;
  padding: 1rem 1rem;
}
.profile-dropdown {
  border-radius: 10px;
  border: solid 1px rgba(23, 30, 72, 0.1);
  background-color: #ffffff;
}
.active-text {
  color: $primary;
}
.profile .dropdown__content--squared {
  min-width: 12rem;
  top: 6rem;
  right: 1rem;
  border-radius: 10px;
  box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.16);
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

.is-rounded.user-display-picture {
  object-fit: cover;
}
.user-display-picture {
  height: 4.8rem !important;
  object-fit: cover;
}

.route-button {
  padding: 0.5rem 1rem;
  border-radius: 10rem;
  box-shadow: 1px 1px 2px 1px #eee;
  color: #000;
  font-weight: 500;
  font-size: 1.4rem;
}

.disabled-link {
  opacity: 0.5;
  cursor: not-allowed;
}
.refresh-page-popup {
  user-select: none;
  width: 100%;
  display: flex;
  align-items: center;
  &-box {
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 50px;
    border-radius: 6px;
    box-shadow: 0 3px 6px 0 rgba(92, 126, 247, 0.3);
    border: solid 1px $primary;
    background-color: #f4f7fc;
    &-left {
      display: flex;
      align-items: center;
      .icon {
        width: 31px;
        height: 31px;
        margin-right: 8px;
      }
      .text-1 {
        font-family: Barlow;
        font-size: 14px;
        font-weight: 600;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.57;
        letter-spacing: normal;
        text-align: left;
        color: $primary-text;
        margin-right: 8px;
      }

      .text-2 {
        opacity: 0.7;
        font-family: Barlow;
        font-size: 14px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.57;
        letter-spacing: normal;
        text-align: left;
        color: $primary-text;
      }
    }
    &-right {
      .button-1 {
        opacity: 0.7;
        font-family: Barlow;
        font-size: 16px;
        font-weight: 600;
        font-stretch: normal;
        font-style: normal;
        line-height: 6.63;
        letter-spacing: normal;
        text-align: center;
        color: $primary-text;
        margin-right: 30px;
      }
      .button-2 {
        border-radius: 6px;
        background-color: $primary;
        padding: 8px 20px;
        cursor: pointer;
        font-family: Barlow;
        font-size: 16px;
        font-weight: 600;
        font-stretch: normal;
        font-style: normal;
        line-height: 6.63;
        letter-spacing: normal;
        text-align: left;
        color: $white;
      }
    }
  }
}

.nav-search {
  border-radius: 22px;
  border: solid 0.6px rgba(141, 149, 170, 0.5);
  height: 40px;
  margin: 0 10px 10px;
  &-image {
    height: 16px;
    width: 16px;
  }
}
.search-org {
  height: 38px;
  border: 0;
  color: $primary-text !important;
}
input.search-org::placeholder {
  color: $primary-text;
  opacity: 0.5;
}
.page-loading {
  width: 100vw;
  height: 100vh;
  background-color: white;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: -220px;
}
</style>
