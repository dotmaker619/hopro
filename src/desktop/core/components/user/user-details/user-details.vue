<template>
  <div class="details--section">
    <div class="pin" v-if="details">
      <div
        class="pin-text is-pointer"
        @click.stop="$router.push({ name: 'user-list' })"
        v-tooltip="{ content: details.first_name ? details.first_name + '' + details.last_name : details.email, html: false }"
      >
        <i class="fas fa-chevron-left mr-10"></i>
        {{ details.first_name ? details.first_name + " " + details.last_name : details.email }}
      </div>
    </div>
    <div class="columns">
      <div class="column is-3">
        <details-skeleton v-if="is_loading"></details-skeleton>
        <details-sidecard v-else>
          <template slot="header">
            <div class="is-block">
              <img
                class="image is-rounded is-48x48"
                v-if="details.display_picture || details.profile_picture"
                :src="details.display_picture || details.profile_picture"
              />
              <div
                class=" is-icon is-30x30 user-style"
                v-else
                :style="
                  `background-color: ${hashed_color(
                    details.first_name ? details.first_name + ' ' + details.last_name : details.email,
                    'userManagement'
                  )};`
                "
              >
                {{ details && details.first_name ? details.first_name.charAt(0) : details.email.charAt(0) }}
              </div>
              <!-- <user-avatar :user="details" pxsize="40" :avatarfontsize="19"></user-avatar> -->
              <div v-if="$store.state.online_users && $store.state.online_users.map((el) => el.id).includes(details.uid)" class="online-status"></div>
            </div>
            <user-dropdown
              v-if="
                !$store.getters.is_org_user &&
                  ($route.name === 'user-details' || $route.name === 'user-details-containers' || $route.name === 'user-details-groups') &&
                  $store.state.claims.app_permissions.core.includes('modify_users')
              "
              :user="details"
            />
          </template>

          <template slot="main">
            <div class="is-flex is-vcenter">
              <div
                class="is-semiBold-16-600-19 name-highlights-on-hover mr-10"
                v-tooltip="{ content: details.first_name ? details.first_name + '' + details.last_name : details.email, html: false }"
              >
                {{ (details.first_name ? details.first_name + " " + details.last_name : details.email ? details.email : "Unknown") | truncate(20) }}
              </div>
              <div class="badge-container ">
                <div v-if="details.is_owner" class="badge is-owner">Owner</div>
                <div v-else-if="details.is_manager" class="badge is-manager">Manager</div>
                <div v-else-if="details.is_guest" class="badge is-guest">Guest</div>
              </div>
            </div>
            <div class="is-medium-14-500-17 has-opacity-7 pb-30">
              {{ details.role || "" }}
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading">Last Seen:</div>
              <p class="details-card__content-description is-uppercase">{{ details.updated_at | prettyDate }}</p>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading">Added on:</div>
              <p class="details-card__content-description is-uppercase">{{ details.created_at | prettyDate }}</p>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading mb-5">
                Status
              </div>
              <div
                class="user-details__body__main__entry__status sh-user-status-tag ml-5"
                :class="[details.status === 'active' ? 'sh-user-status-tag--active' : 'sh-user-status-tag--inactive']"
              >
                {{ details.status }}
              </div>
            </div>
            <div class="divider"></div>
            <div class="details-card__content">
              <div class="details-card__content-heading">
                Email ID
              </div>
              <p class="details-card__content-description">
                {{ details.email }}
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading">
                Phone number
              </div>
              <p class="details-card__content-description">
                {{ details.phone_number || "*Not found" }}
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading">
                Teams
                <div
                  v-if="access('core', 'modify_teams')"
                  @click="
                    add_teams({
                      teams: details.labels,
                      service: userService,
                      item_uid: details.uid,
                    });
                    getDetails();
                  "
                  class="details-card__content__plus is-pointer"
                >
                  +
                </div>
                <div
                  v-else
                  @click="no_access_popup('core', 'modify_teams')"
                  class="role-details__body__users__heading__icon is-not-allowed disabled-link"
                >
                  +
                </div>
              </div>
              <p class="details-card__content-description">
                <primary-tag :tags="details.labels || []" :tagsCountToShow="3" :type="'team'"></primary-tag>
              </p>
            </div>
          </template>
        </details-sidecard>
      </div>
      <div class="column is-9">
        <div v-if="details" class="sh-tabs">
          <ul>
            <li>
              <router-link exact-active-class="is-active" :to="{ name: 'user-details' }">
                Assets
                <span>{{ details.assets.length || 0 }}</span>
              </router-link>
            </li>
            <li>
              <router-link exact-active-class="is-active" :to="{ name: 'user-details-groups' }">
                Groups
                <span>{{ details.groups.length || 0 }}</span>
              </router-link>
            </li>
            <li>
              <router-link exact-active-class="is-active" :to="{ name: 'user-details-containers' }">
                Containers
                <span>{{ details.containers.length || 0 }}</span>
              </router-link>
            </li>
            <li class="sh-tabs__right">
              <router-link exact-active-class="is-active" :to="{ name: 'user-permissions', params: { type: details.is_guest ? 'guest' : 'user' } }"
                >Permissions</router-link
              >
            </li>
          </ul>
        </div>
        <router-view @updateDetails="getDetails()" :details="details" class="router-asset-details" tag="div" />
      </div>
    </div>

    <delete-modal
      v-if="showDeleteModal"
      :resourceId="details.uid"
      :resourceName="details ? details.name : ''"
      :resourceType="'user'"
      :resourceService="userService"
      @closed="showDeleteModal = false"
      @deleted="
        show_success('Resource successfully deleted');
        $router.push({ name: 'asset-list' });
        getData();
      "
    />
    <pin-modal v-if="showPinModal" :resourceName="details ? details.name : ''" :resourceType="'asset'" @closed="showPinModal = false" />
  </div>
</template>

<script>
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import UserDropdown from "@/desktop/core/components/user/user-details/components/user-dropdown";

  import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
  import { userService, metricsService } from "@/desktop/shared/services/";
  import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import AppTypeTag from "@/desktop/shared/components/tags/app-type-tag";

  import AddUsers from "@/desktop/shared/components/add-users-modal";

  import PinModal from "@/desktop/shared/components/pin-modal";
  import ResourceEbs from "@/desktop/core/shared/components/resource-ebs";

  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import UserTeamPopup from "@/desktop/shared/mixins/user-team-popup.mixin.vue";
  import DetailsSkeleton from "@/desktop/shared/components/skeleton/details-skeleton.vue";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";

  export default {
    mixins: [FormPopup, UserTeamPopup, HashColor],
    data() {
      return {
        is_loading: false,
        details: null,
        showPinModal: false,
        roleUsers: [],
        showDeleteModal: false,
        showPinModal: false,
        hasEditAccess: false,
        update: false,
        updated_description: this.details && this.details.description && this.details.description.length ? this.details.description : null,
        userService: userService,
      };
    },
    components: {
      shDropdown,
      detailsSidecard,
      MainDetailsMedia,
      PrimaryTag,
      AppTypeTag,
      PinModal,
      DetailsSkeleton,
      UserDropdown,
    },

    created() {
      this.getDetails();
      this.checkEditAccess();
    },

    methods: {
      async getDetails(loading = true) {
        this.is_loading = loading;
        this.details = await userService.get({ id: this.$route.params.id, query: "users=true" }).catch((err) => {
          this.handleErrors(err);
          this.is_loading = false;
        });
        this.is_loading = false;
      },

      checkEditAccess() {
        userService
          .get({ id: this.$route.params.id, query: "edit=true" })
          .then(() => (this.hasEditAccess = true))
          .catch((err) => this.handleErrors(err));
      },
      async update_description() {
        let res = await this.userService.patch({
          body: {
            description: this.updated_description,
          },
          id: this.details.uid,
        });
        this.details.description = this.updated_description;
        this.update = false;
      },
    },
  };
</script>
<style lang="scss" scoped>
  .badge {
    &.is-owner {
      color: $primary;
      border-color: $primary;
    }
    &.is-manager {
      color: $manager;
      border-color: $manager;
    }
    &.is-guest {
      color: $guest;
      border-color: $guest;
    }
  }
</style>
