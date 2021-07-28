<template>
  <div>
    <div v-if="details" class="columns">
      <transfer-owner
        ref="containerTransferOwner"
        :name="details.name"
        :service="containerService"
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
                properties: details.properties,
                type: 'projectManagement',
                name_class: 'is-semiBold-16-600-22',
              }"
            ></main-details-media>
            <sh-dropdown v-if="hasEditAccess" :triggerIsIcon="true">
              <div slot="content">
                <p @click="open_form_popup(details)">
                  <sh-icon :name="'edit-small'" class="is-24x24 mr-10"></sh-icon>

                  Edit Container
                </p>
                <p @click="$refs.containerTransferOwner.open_popup()">
                  <sh-icon :name="'transfer-2'" class="is-24x24 mr-10"></sh-icon>
                  Transfer ownership
                </p>
                <p @click="showDeleteModal = true">
                  <sh-icon :name="'delete-small'" class="is-24x24 mr-10"></sh-icon>
                  Delete Container
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
              <div class="details-card__content-heading">
                Groups
                <span v-if="hasEditAccess">
                  <div @click="add_groups" class="details-card__content__plus">+</div>
                </span>
              </div>
              <p class="details-card__content-description">
                <primary-tag :tags="details.groups" :toShowCount="2" type="group" :noTopMargin="true"></primary-tag>
              </p>
            </div>

            <div v-if="$store.getters.is_qc_internal_user" class="details-card__content">
              <div class="details-card__content-heading">QC</div>
              <div class="is-flex">
                <p class="bordered-tag mr-10">
                  <router-link class="is-flex has-text-dark" :to="{ name: 'qc-therm-viewer', params: { id: $route.params.id } }">
                    <img class="sh-app-tag is-pointer image is-24x24" src="@/assets/icons/app-tag/therm-circle.svg" />
                    Therm
                  </router-link>
                </p>
                <p class="bordered-tag">
                  <router-link class="is-flex has-text-dark" :to="{ name: 'qc-terra-viewer', params: { id: $route.params.id } }">
                    <img class="sh-app-tag is-pointer image is-24x24" src="@/assets/icons/app-tag/terra-circle.svg" />
                    Terra
                  </router-link>
                </p>
              </div>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading">
                Applications
                <span v-if="hasEditAccess">
                  <div @click="add_apps" class="details-card__content__plus">+</div>
                </span>
              </div>
              <app-type-tag :apps="details.app_types" :show_name="true" :item_id="details.uid"></app-type-tag>
            </div>

            <div class="details-card__content">
              <div class="details-card__content-heading">
                Users
                <div
                  v-if="hasEditAccess"
                  @click="
                    add_users({
                      users: details.users,
                      service: containerService,
                      item_uid: details.uid,
                    })
                  "
                  class="details-card__content__plus is-pointer"
                >
                  +
                </div>
              </div>
              <p class="details-card__content-description">
                <user-tag v-if="details.users.length" :users="details.users || []" :howManyToShow="3"></user-tag>
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
                <type-tag :tags="details.tags" :write_access="hasEditAccess" :service="containerService" :complete="() => { $emit('update') }"/>
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
                  class="is-semiBold-16-600-19 name-highlights-on-hover"
                  v-username="details.owner && details.owner.uid && $store.getters.state_users[details.owner.uid]"
                ></div>
              </router-link>
            </div>
          </template>
        </details-sidecard>
      </div>
      <div class="column is-9">
        <div class="sh-tabs">
          <ul>
            <li>
              <router-link active-class="is-active" :to="{ name: 'container-details' }">
                Groups
                <span>{{ (details.groups && details.groups.length) || 0 }}</span>
              </router-link>
            </li>
          </ul>
        </div>
        <keep-alive>
          <router-view class="router-container-details" />
        </keep-alive>
      </div>
    </div>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="details.uid"
      :resourceName="details ? details.name : ''"
      :resourceType="'container'"
      :resourceService="containerService"
      @closed="showDeleteModal = false"
      @deleted="show_success('Resource successfully deleted');
      $router.push({ name: 'container-list'});
      getData()"
    />
  </div>
</template>

<script>
  import AppTypeTag from "@/desktop/shared/components/tags/app-type-tag";
  import TypeTag from "@/desktop/shared/components/tags/type-tag/type-tag";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
  import { containerService, userService } from "@/desktop/shared/services/";
  import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
  import AddApplications from "../../components/add-applications";
  import AddGroups from "../../components/add-container-groups.vue";
  import UserTag from "@/desktop/shared/components/tags/user-tag";
  import AddUsers from "@/desktop/shared/components/add-users-modal";
  import ContainersFormComponent from "./../../container-form.component";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import UserTeamPopup from "@/desktop/shared/mixins/user-team-popup.mixin.vue";
  import DetailsSkeleton from "@/desktop/shared/components/skeleton/details-skeleton.vue";

  export default {
    props: ["details", "isloading"],
    mixins: [FormPopup, UserTeamPopup],
    data() {
      return {
        containerUsers: [],
        showDeleteModal: false,
        showPinModal: false,
        containerService: containerService,
        resource_metrics: null,
        hasEditAccess: false,
        update: false,
        updated_description: this.details && this.details.description ? this.details.description.length : null,
        ContainersFormComponent: ContainersFormComponent,
        containerService: containerService,
      };
    },
    components: {
      shDropdown,
      detailsSidecard,
      MainDetailsMedia,
      AppTypeTag,
      TypeTag,
      PrimaryTag,
      UserTag,
      DetailsSkeleton,
    },
    created() {
      this.checkEditAccess();
    },
    methods: {
      async edit_resource() {
        this.$router.push({ name: "container-edit" });
      },
      open_form_popup(edit_item) {
        let info = {};
        info.header = edit_item ? "Edit Container for" : "Create Container for";
        if (edit_item) {
          info.has_group = edit_item.groups && edit_item.groups.length > 0;
          info.asset_uid = edit_item.asset.uid;
          info.subheader = edit_item.asset.name;
          info.header += " asset";
        }
        this.open_form(this.ContainersFormComponent, info, edit_item);
      },
      async checkEditAccess() {
        containerService
          .get({ id: this.$route.params.id, query: "edit=true" })
          .then(() => (this.hasEditAccess = true))
          .catch((err) => this.handleErrors(err));
      },

      async update_description() {
        let res = await containerService.patch({
          body: {
            description: this.updated_description,
          },
          id: this.details.uid,
        });
        this.details.description = this.updated_description;
        this.update = false;
      },

      add_apps() {
        this.$modal.show(AddApplications, { apps: this.details.app_types }, { height: "80%" }, { name: "add-applications" });
      },
      add_groups() {
        this.$modal.show(AddGroups, { groups: this.details.groups }, { height: "80%", width: "25%" }, { name: "add-groups" });
      },
    },
  };
</script>
