<template>
  <div class="organization details--section">
    <div class="pin" v-if="details">
      <div class="pin-text is-pointer" @click="$router.push({ name: 'organization-list' })">
        <i class="fas fa-chevron-left mr-10"></i>
        {{ details.name }}
      </div>
      <div class="pin-icon is-disabled">
        <i class="fas fa-thumbtack"></i>
      </div>
    </div>
    <div v-if="details" class="columns">
      <div class="column is-3">
        <details-sidecard>
          <template slot="header">
            <info-block
              :truncate_value="18"
              :info="{
                name: details.name,
                color: details.properties && details.properties.color,
                image: details.properties && details.properties.icon,
                type: 'projectManagement',
              }"
            ></info-block>
            <sh-dropdown :triggerIsIcon="true">
              <div slot="content">
                <!-- <p @click="edit_resource"> -->
                <p @click="open_form(OrgFormComponent, { header: 'Edit Organization' }, details)">
                  <sh-icon :name="'edit'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                  Edit organization
                </p>
                <p>
                  <sh-icon :name="'transfer'" class="is-24x24 mr-10"></sh-icon>
                  Transfer ownership
                </p>
                <p @click="showDeleteModal = true">
                  <sh-icon :name="'delete'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                  Delete organization
                </p>
              </div>
            </sh-dropdown>
          </template>

          <template slot="main">
            <div class="details-card__content">
              <div class="details-card__content-heading">Description</div>
              <p class="details-card__content-description">{{ details.description }}</p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading">Added on</div>
              <p class="details-card__content-description sh-text-normal-14">
                {{ details.created_at | dateFormat }}
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading">Status</div>
              <status-tag :status="details.active ? 'active' : 'inactive'"></status-tag>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading">Applications</div>
              <app-tag :apps="details.applications"></app-tag>
            </div>
          </template>
          <template slot="footer">
            <info-block
              v-if="details.owner && $store.getters.state_users[details.owner.uid]"
              :info="{
                'name': `${$store.getters.state_users[details.owner.uid].first_name} ${$store.getters.state_users[details.owner.uid].last_name}`,
                'top': 'Created by',
                'image': $store.getters.state_users[details.owner.uid].display_picture,
                type: 'userManagement',
              }"
            ></info-block>
          </template>
        </details-sidecard>
      </div>
      <div class="column is-9">
        <div class="sh-tabs">
          <ul>
            <li>
              <keep-alive>
                <router-link exact-active-class="is-active" :to="{ name: 'organization-details' }">
                  Users
                  <span>{{ (details.users && details.users.length) || 0 }}</span>
                </router-link>
              </keep-alive>
            </li>

            <li class="sh-tabs__right">
              <keep-alive>
                <router-link exact-active-class="is-active" :to="{ name: 'organization-permissions' }">Permissions</router-link>
              </keep-alive>
            </li>
          </ul>
        </div>
        <router-view class="router-asset-details" />
      </div>
    </div>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="details.uid"
      :resourceName="details.name"
      :resourceType="'organization'"
      :resourceService="organizationService"
      @closed="showDeleteModal = false"
      @deleted="
        show_success('Resource successfully deleted');
        $router.push({ name: 'organization-list' });
        getData();
      "
    />
  </div>
</template>

<script>
  import { organizationService, userService } from "@/desktop/shared/services/";
  // import UserList from "@/components/user-management/user/components/user-list/user-list.component.vue";
  // import Permissions from "./permissions/permissions.component";
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
  import InfoBlock from "@/desktop/shared/components/info-block";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import UserTag from "@/desktop/shared/components/tags/user-tag";
  import AppTag from "@/desktop/shared/components/tags/app-tag";
  import StatusTag from "@/desktop/shared/components/tags/status-tag";
  import OrgFormComponent from "./organization-form.component.vue";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  export default {
    mixins: [FormPopup],
    data() {
      return {
        details: null,
        organizationService: organizationService,
        orgusers: [],
        showDeleteModal: false,
        OrgFormComponent: OrgFormComponent,
      };
    },

    components: {
      shDropdown,
      detailsSidecard,
      InfoBlock,
      PrimaryTag,
      UserTag,
      // Permissions,
      StatusTag,
      AppTag,
    },

    created() {
      this.getDetails();
      this.$eventHub.$on("refresh-organization-details", this.getDetails);
    },
    beforeDestroy() {
      this.$eventHub.$off("refresh-organization-details", this.getDetails);
    },
    methods: {
      async getDetails() {
        this.details = await organizationService.get({
          id: this.$route.params.id,
        });
      },
      // async edit_resource() {
      //   this.$router.push({ name: "organization-edit" });
      // }
    },
  };
</script>

<style lang="scss">
  .is_at_bottom {
    position: absolute;
    bottom: -2rem;
    left: 0;
  }
</style>
