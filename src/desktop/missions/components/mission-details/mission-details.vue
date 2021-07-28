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
              }"
            ></main-details-media>
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
                  <sh-icon class="is-16x16" :name="'edit'" :file="'tickets_sprite'" v-if="update == false" @click.native="update = true"> </sh-icon>
                </p>
                <sh-icon
                  class="is-16x16 is-pointer"
                  :name="'tick-set-complete'"
                  :file="'tickets_sprite'"
                  v-if="update == true"
                  @click.native="update_description"
                >
                </sh-icon>
              </div>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading">Created on</div>
              <p class="details-card__content-description is-uppercase">
                {{ details.createdAt | dateFormat }}
              </p>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading mb-5">
                Status
              </div>
              <div class="sh-user-status-tag sh-user-status-tag--active" style="width: 8rem; margin-top: 0.75rem;">Active</div>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading">
                Groups
              </div>
              <p class="details-card__content-description">
                <primary-tag v-if="missionGroup" :type="'group'" :tags="[{ name: missionGroup.name, uid: missionGroup.uid }]" />
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading">
                Teams
                <div
                  v-if="access('core', 'modify_teams')"
                  @click="
                    add_teams({
                      teams: [...details.readLabels, ...details.writeLabels],
                      service: assetService,
                      item_uid: details.uid,
                    })
                  "
                  class="details-card__content__plus is-pointer"
                >
                  +
                </div>
                <div
                  v-else
                  @click="no_access_popup('core', 'modify_teams')"
                  class="mission-details__body__users__heading__icon is-not-allowed disabled-link"
                >
                  +
                </div>
              </div>
              <p class="details-card__content-description">
                <primary-tag :type="'team'" :tags="get_teams(details)" :toShowCount="2" />
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading">
                Users
                <div
                  v-if="access('core', 'modify_teams')"
                  @click="
                    add_users({
                      users: [...details.readUsers, ...details.writeUsers],
                      service: missionService,
                      item_uid: details.uid,
                      mission: true,
                    })
                  "
                  class="details-card__content__plus is-pointer"
                >
                  +
                </div>
                <div
                  v-else
                  @click="no_access_popup('core', 'modify_teams')"
                  class="mission-details__body__users__heading__icon is-not-allowed disabled-link"
                >
                  +
                </div>
              </div>
              <p class="details-card__content-description">
                <user-tag
                  class="is-flex is-vcenter"
                  :users="[...details.readUsers, ...details.writeUsers]"
                  :tagsCountToShow="3"
                  :custom_size="30"
                  :custom_class="'tiny-user-avatar'"
                ></user-tag>
              </p>
            </div>
          </template>
          <template slot="footer">
            <div class="is-flex is-vcenter ">
              <user-avatar class="mr-10" :user="details.owner && details.owner.uid && $store.getters.state_users[details.owner.uid]"></user-avatar>
              <router-link class="has-text-dark" :to="{ name: 'user-details', params: { id: details.owner.uid } }">
                <div class="is-medium-14-500-17 has-text-theme-black has-opacity-7 mt-5">Created by</div>
                <div
                  class="is-semiBold-16-600-19 name-highlights-on-hover"
                  v-username="details.owner && details.owner.uid && $store.getters.state_users[details.owner.uid]"
                ></div>
              </router-link>
            </div>
          </template>
        </details-sidecard>
      </div>
      <div class="column is-9">
        <div v-if="details" class="sh-tabs">
          <mission-inner-card :missions="details.missions" :groupUid="details.groupUid" :missionGroupUid="details.uid" />
        </div>
      </div>
    </div>

    <pin-modal v-if="showPinModal" :resourceName="details ? details.name : ''" :resourceType="'asset'" @closed="showPinModal = false" />
  </div>
</template>

<script>
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
  import { missionService, userService, groupService } from "@/desktop/shared/services/";
  import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import MissionInnerCard from "../mission-inner-card";

  import AddUsers from "@/desktop/shared/components/add-users-modal";

  import PinModal from "@/desktop/shared/components/pin-modal";
  import ResourceEbs from "@/desktop/core/shared/components/resource-ebs";
  import RoleFormComponent from "../mission-form.component";

  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import UserTeamPopup from "@/desktop/shared/mixins/user-team-popup.mixin.vue";
  import DetailsSkeleton from "@/desktop/shared/components/skeleton/details-skeleton.vue";
  import PathBreadcrumb from "@/desktop/core/shared/components/details-top-section/components/path-breadcrumb";

  export default {
    mixins: [FormPopup, UserTeamPopup],
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
        RoleFormComponent: RoleFormComponent,
        missionService: missionService,
        missionGroup: null,
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
      MissionInnerCard,
    },

    created() {
      this.getDetails();

      this.checkEditAccess();
    },

    methods: {
      async getDetails(loading = true) {
        this.is_loading = loading;
        this.details = await missionService.get({ id: this.$route.params.id, query: "users=true" }).catch((err) => {
          this.handleErrors(err);
          this.is_loading = false;
        });

        if (this.details) {
          this.missionGroup = await groupService.get({ id: this.details.groupUid }).catch((err) => this.handleErrors(err));
        }
        this.is_loading = false;
      },

      checkEditAccess() {
        missionService
          .get({ id: this.$route.params.id, query: "edit=true" })
          .then(() => (this.hasEditAccess = true))
          .catch((err) => this.handleErrors(err));
      },
      async update_description() {
        let res = await this.missionService.patch({
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
