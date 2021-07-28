<template>
  <div class="details--section">
    <div class="pin">
      <path-breadcrumb :details="details" :page="page"></path-breadcrumb>
    </div>
    <div class="columns">
      <div class="column is-3">
        <details-skeleton v-if="is_loading"></details-skeleton>
        <details-sidecard v-else>
          <template slot="header">
            <main-details-media
              :truncate_value="25"
              :info="{
                name_class: 'is-semiBold-16-600-22',
                name: details.name || '',
                properties: details.properties,
                subtext_class: 'is-medium-14-500-17 has-text-theme-black has-opacity-7 is-capitalized',
              }"
            ></main-details-media>
            <sh-dropdown :triggerIsIcon="true" v-if="hasEditAccess">
              <div slot="content">
                <p @click="open_form(TeamFormComponent, { header: 'Edit Team for' }, details)">
                  <sh-icon :name="'edit'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>Edit team
                </p>
                <p @click="showDeleteModal = true"><sh-icon :name="'delete'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>Delete team</p>
              </div>
            </sh-dropdown>
          </template>
          <template slot="main">
            <div class="details-card__content">
              <div class="details-card__content-heading">Description</div>
              <div class="is-flex">
                <p class="details-card__content-description cursor-is-text" v-if="update == false" @click="update = true">
                  {{ details.description ? details.description : "*No description found" }}
                </p>
                <input
                  type="text"
                  class="details-card__content-description bpm-less"
                  style="12px"
                  placeholder="Add description"
                  v-else
                  v-focus
                  @keypress.enter="update_description"
                  v-model="updated_description"
                  v-click-outside="() => (update = false)"
                />
                <p class="details-card__content-description--icon">
                  <sh-icon class="is-16x16" :name="'edit'" :file="'tickets_sprite'" v-if="update == false" @click.native="update = true"></sh-icon>
                </p>
                <sh-icon
                  class="is-16x16 is-pointer"
                  :name="'tick-set-complete'"
                  :file="'tickets_sprite'"
                  v-if="update == true"
                  @click.native="update_description"
                ></sh-icon>
              </div>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading">Created on</div>
              <p class="details-card__content-description is-uppercase">{{ details.created_at | dateFormat }}</p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading mb-5">Status</div>
              <div data-v-24e77e02 class="sh-user-status-tag sh-user-status-tag--active" style="width: 8rem; margin-top: 0.75rem;">Active</div>
            </div>
            <div class="divider"></div>
            <div class="details-card__content">
              <div class="details-card__content-heading">
                Associated Asset
              </div>
              <p class="details-card__content-description">
                <associated-asset-dropdown :existing="details.asset_id || null" @update="getDetails"></associated-asset-dropdown>
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading">
                Assets
                <div @click="assign_assets" class="details-card__content__plus is-pointer">+</div>
              </div>
              <p class="details-card__content-description">
                <primary-tag :tags="details.assets || []" :type="'asset'" :howManyToShow="3"></primary-tag>
              </p>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading">
                Users
                <div
                  v-if="access('core', 'modify_labels')"
                  @click="
                    add_users({
                      team: true,
                      users: details.users,
                      service: teamService,
                      item_uid: details.uid,
                    })
                  "
                  class="details-card__content__plus is-pointer"
                >
                  +
                </div>
                <div
                  v-else
                  @click="no_access_popup('core', 'modify_labels')"
                  class="team-details__body__users__heading__icon is-not-allowed disabled-link"
                >
                  +
                </div>
              </div>

              <p class="details-card__content-description">
                <user-tag
                  v-if="details.users && details.users.length"
                  :users="details.users || []"
                  :tagsCountToShow="3"
                  :custom_size="30"
                  :custom_class="'tiny-user-avatar'"
                ></user-tag>
              </p>
            </div>
          </template>
          <template slot="footer">
            <div class="is-flex is-vcenter">
              <user-avatar
                class="mr-10"
                :user="details.created_by && details.created_by.uid && $store.getters.state_users[details.created_by.uid]"
              ></user-avatar>
              <router-link class="has-text-dark" :to="{ name: 'user-details', params: { id: details.created_by.uid } }">
                <div class="is-medium-14-500-17 has-text-theme-black has-opacity-7 mt-5">Created by</div>
                <div
                  class="is-semiBold-16-600-19 name-highlights-on-hover"
                  v-username="details.created_by && details.created_by.uid && $store.getters.state_users[details.created_by.uid]"
                ></div>
              </router-link>
            </div>
          </template>
        </details-sidecard>
      </div>
      <div class="column is-9">
        <div v-if="details" class="sh-tabs">
          <ul>
            <li>
              <router-link exact-active-class="is-active" :to="{ name: 'team-details' }">
                Users
                <span>{{ details.users.length || 0 }}</span>
              </router-link>
            </li>
            <li>
              <router-link exact-active-class="is-active" :to="{ name: 'team-details-assets' }">
                Assets
                <span>{{ details.assets.length || 0 }}</span>
              </router-link>
            </li>
          </ul>
        </div>
        <router-view @updateDetails="getDetails()" @assigne-team-assets="assign_assets" :details="details" class="router-asset-details" tag="div" />
      </div>
    </div>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="details.uid"
      :resourceName="details ? details.name : ''"
      :resourceType="'asset'"
      :resourceService="teamService"
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
  import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
  import { teamService, roleService, userService, metricsService } from "@/desktop/shared/services/";
  import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import AddUsers from "@/desktop/shared/components/add-users-modal";
  import PinModal from "@/desktop/shared/components/pin-modal";
  import ResourceEbs from "@/desktop/core/shared/components/resource-ebs";
  import TeamFormComponent from "../team-list/components/team-form.component";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import UserTeamPopup from "@/desktop/shared/mixins/user-team-popup.mixin.vue";
  import DetailsSkeleton from "@/desktop/shared/components/skeleton/details-skeleton.vue";
  import PathBreadcrumb from "@/desktop/core/shared/components/details-top-section/components/path-breadcrumb";
  import AssignTeamAssets from "@/desktop/core/components/team/team-details/components/assign-team-assets";
  import AssociatedAssetDropdown from "./components/associated-asset-dropdown";
  export default {
    mixins: [FormPopup, UserTeamPopup],
    data() {
      return {
        is_loading: false,
        details: null,
        showPinModal: false,
        showDeleteModal: false,

        hasEditAccess: false,
        update: false,
        updated_description: this.details && this.details.description && this.details.description.length ? this.details.description : null,
        TeamFormComponent: TeamFormComponent,
        teamService: teamService,
      };
    },
    components: {
      shDropdown,
      detailsSidecard,
      MainDetailsMedia,
      UserTag,
      PrimaryTag,
      PinModal,
      DetailsSkeleton,
      PathBreadcrumb,
      AssociatedAssetDropdown,
    },
    created() {
      this.getDetails(true);
      this.checkEditAccess();
    },

    methods: {
      async getDetails(loading = false) {
        this.is_loading = loading;
        this.details = await teamService.get({ id: this.$route.params.id, query: "users=true" }).catch((err) => {
          this.handleErrors(err);
          this.is_loading = false;
        });
        this.is_loading = false;
      },

      checkEditAccess() {
        teamService
          .get({ id: this.$route.params.id, query: "edit=true" })
          .then(() => (this.hasEditAccess = true))
          .catch((err) => this.handleErrors(err));
      },

      async update_description() {
        let res = await this.teamService.patch({
          body: {
            description: this.updated_description,
          },
          id: this.details.uid,
        });
        this.details.description = this.updated_description;
        this.update = false;
      },

      assign_assets() {
        this.$modal.show(
          AssignTeamAssets,
          {
            existing: this.details.assets || {},
          },
          { height: "80%" },
          {
            "closed": () => {
              this.$eventHub.$emit("refresh-asset-list");
              this.getDetails();
            },
          }
        );
      },
    },
  };
</script>
