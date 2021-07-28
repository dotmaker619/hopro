<template>
  <div>
    <div v-if="details" class="columns">
      <transfer-owner
        ref="groupTransferOwner"
        :name="details.name"
        :service="groupService"
        :id="details.uid"
        @update_user="update_owner(details, $event)"
      ></transfer-owner>
      <div class="column is-3">
        <details-skeleton v-if="isloading"></details-skeleton>
        <details-sidecard v-else>
          <template slot="header">
            <main-details-media
              :truncate_value="20"
              :info="{
                name: details.name,
                subtext: details.project_counts,
                properties: details.properties,
                type: 'projectManagement',
              }"
            ></main-details-media>
            <sh-dropdown v-if="hasEditAccess" :triggerIsIcon="true">
              <div slot="content">
                <p @click="open_form_popup(details)">
                  <sh-icon :name="'edit'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                  Edit Group
                </p>
                <p @click="$refs.groupTransferOwner.open_popup()">
                  <sh-icon :name="'transfer'" class="is-24x24 mr-10"></sh-icon>
                  Transfer ownership
                </p>
                <p @click="showDeleteModal = true">
                  <sh-icon :name="'delete'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                  Delete Group
                </p>
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
                  v-else
                  placeholder="Add description"
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
              <p class="details-card__content-description sh-text-normal-14">
                {{ details.created_at | dateFormat }}
              </p>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading">Asset</div>
              <primary-tag v-if="details.asset" :tags="[details.asset]" :type="'asset'" :noTopMargin="true"></primary-tag>
              <p v-else class="sh-text-normal-14 has-text-grey has-opacity-7">*No associated asset</p>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading">Container</div>
              <primary-tag v-if="details.container" :tags="[details.container]" :type="'container'" :noTopMargin="true"></primary-tag>
              <p v-else class="sh-text-normal-14 has-text-grey has-opacity-7">*No associated container</p>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading">
                Users
                <div
                  v-if="hasEditAccess"
                  @click="
                    add_users({
                      users: details.users,
                      service: groupService,
                      item_uid: details.uid,
                    })
                  "
                  class="details-card__content__plus is-pointer"
                >
                  +
                </div>
              </div>
              <p class="details-card__content-description" v-if="details.users.length">
                <user-tag :users="details.users || []" :howManyToShow="3"></user-tag>
              </p>
              <p class="details-card__content-description is-flex is-vcenter" v-else>
                <sh-icon :name="'assignee'" class="is-20x20 mr-5 has-opacity-6"></sh-icon>
                <span class="is-regular-14-00-17 has-opacity-7 has-text-light-grey">*No users assigned</span>
              </p>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading">Size</div>
              <p class="details-card__content-description">
                {{ resource_metrics && resource_metrics.data_size ? resource_metrics.data_size / Math.pow(2, 30) + " GB" : "0 GB" }}
              </p>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading">Tags</div>
              <p class="details-card__content-description" v-if="details.tags.length">
                <type-tag
                  :tags="details.tags"
                  :write_access="hasEditAccess"
                  :service="groupService"
                  :complete="
                    () => {
                      $emit('update');
                    }
                  "
                />
              </p>
              <p class="details-card__content-description is-flex is-vcenter" v-else>
                <sh-icon :name="'tags'" class="is-20x20 mr-5 has-opacity-6"></sh-icon>
                <span class="is-regular-14-00-17 has-opacity-7 has-text-light-grey">*No tags assigned</span>
              </p>
            </div>
          </template>
          <template slot="footer">
            <div class="is-flex is-vcenter ">
              <user-avatar class="mr-10" :user="details.owner && details.owner.uid && $store.getters.state_users[details.owner.uid]"></user-avatar>
              <router-link class="has-text-dark" :to="{ name: 'user-details', params: { id: details.owner.uid } }">
                <div class="is-medium-14-500-17 has-text-theme-black has-opacity-7 mt-5">Owner</div>
                <div
                  class="is-semiBold-16-600-19 name-highlights-on-hover truncate-text is-width-15"
                  v-username="details.owner && details.owner.uid && $store.getters.state_users[details.owner.uid]"
                ></div>
              </router-link>
            </div>
          </template>
        </details-sidecard>
      </div>
      <div class="column">
        <div class="sh-tabs">
          <ul v-if="resource_metrics">
            <li>
              <router-link active-class="is-active" :to="{ name: 'group-details' }">
                projects
                <span>{{ (resource_metrics && resource_metrics.projects) || 0 }}</span>
              </router-link>
            </li>
            <li>
              <router-link v-if="access('missions')" active-class="is-active" :to="{ name: 'group-details-missions' }">
                missions
                <span>{{ (details.missions && details.missions.length) || 0 }}</span>
              </router-link>
              <a v-else @click="no_access_popup('missions')" class="is-not-allowed disabled-tabs">
                missions
                <span>{{ (details.missions && details.missions.length) || 0 }}</span>
              </a>
            </li>
            <li>
              <router-link v-if="access('processing')" active-class="is-active" :to="{ name: 'group-details-processing' }">
                processing
                <span>{{ (resource_metrics && resource_metrics.processing) || 0 }}</span>
              </router-link>
              <a v-else @click="no_access_popup('processing')" class="is-not-allowed disabled-tabs">
                processing
                <span>{{ (resource_metrics && resource_metrics.processing) || 0 }}</span>
              </a>
            </li>
            <li>
              <router-link active-class="is-active" :to="{ name: 'group-details-reports' }">
                reports
                <span>{{ (resource_metrics && resource_metrics.no_of_reports) || 0 }}</span>
              </router-link>
            </li>
          </ul>
        </div>
        <keep-alive>
          <router-view
            class="router-group-details"
            :asset_id="(details.asset && details.asset.uid) || null"
            @update_project_count="resource_metrics.projects = $event"
          />
        </keep-alive>
      </div>
    </div>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="details.uid"
      :resourceName="details.name"
      :resourceType="'group'"
      :resourceService="groupService"
      @closed="showDeleteModal = false"
      @deleted="
        show_success('Resource successfully deleted');
        $router.push({ name: 'group-list' });
        getData();
      "
    />
    <pin-modal v-if="showPinModal" :resourceName="details ? details.name : ''" :resourceType="'group'" @closed="showPinModal = false" />
  </div>
</template>

<script>
  import UserTag from "@/desktop/shared/components/tags/user-tag";
  import TypeTag from "@/desktop/shared/components/tags/type-tag/type-tag";
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
  import { groupService, userService, metricsService } from "@/desktop/shared/services/";
  import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
  import PinModal from "@/desktop/shared/components/pin-modal";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import AddUsers from "@/desktop/shared/components/add-users-modal";
  import GroupFormComponent from "@/desktop/core/components/group/group-list/components/group-form.component.vue";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import UserTeamPopup from "@/desktop/shared/mixins/user-team-popup.mixin.vue";
  import DetailsSkeleton from "@/desktop/shared/components/skeleton/details-skeleton.vue";

  export default {
    props: ["details", "isloading"],
    mixins: [FormPopup, UserTeamPopup],
    data() {
      return {
        resource_metrics: null,
        groupUsers: [],
        groupService: groupService,
        showDeleteModal: false,
        showPinModal: false,
        update: false,
        updated_description: this.details.description ? this.details.description.length : null,
        hasEditAccess: false,
        GroupFormComponent: GroupFormComponent,
        groupService: groupService,
      };
    },
    components: {
      shDropdown,
      detailsSidecard,
      MainDetailsMedia,
      UserTag,
      TypeTag,
      PinModal,
      PrimaryTag,
      DetailsSkeleton,
    },

    created() {
      this.checkEditAccess();
      if (this.details) {
        this.get_resource_metrics("groups", this.details.uid);
      }
    },

    methods: {
      async get_resource_metrics(attribute, resource_id) {
        this.resource_metrics = await metricsService.get_resource_metrics({
          attribute: attribute,
          id: resource_id,
          query:'datas=false'
        });
      },
      checkEditAccess() {
        groupService
          .get({ id: this.$route.params.id, query: "edit=true" })
          .then(() => (this.hasEditAccess = true))
          .catch((err) => this.handleErrors(err));
      },
      async update_description() {
        let res = await groupService.patch({
          body: {
            description: this.updated_description,
          },
          id: this.details.uid,
        });
        this.details.description = this.updated_description;
        this.update = false;
      },
      open_form_popup(edit_item) {
        let info = {};
        info.header = edit_item ? "Edit Group for" : "Create Group for";
        if (this.$route.name === "asset-details-groups") {
          info.asset_id = this.$route.params.id;
        }
        if (this.$route.name === "container-details") {
          info.container_id = this.$route.params.id;
        }
        this.open_form(this.GroupFormComponent, info, edit_item);
      },
    },
  };
</script>
