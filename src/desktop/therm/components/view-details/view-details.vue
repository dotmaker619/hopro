<template>
  <div>
    <router-view class="px-20"></router-view>
    <top-section class="mt-20 px-20"
    :details="details"
    @show_pin_modal="showPinModal=true;">
    </top-section>
    
    <div v-if="is_loading" class="px-20">
      <therm-skeleton></therm-skeleton>
    </div>
    <div v-else>
      <div class="columns px-20" v-if="details">
        <div class="column is-3">
          <details-sidecard>
            <template slot="header">
              <info-block
                :info="{
                name : details.name, 
                subtext_class:'is-semiBold-16-600-22',
                type: 'projectManagement'
              }"
              ></info-block>
              <sh-dropdown v-if="!details.isAsset" :triggerIsIcon="true">
                <div slot="content">
                  <p
                    @click="open_form(ThermFormComponent, {header:'Edit Thermal View for'},details)"
                  >
                    <img class="image is-24x24 mr-5" src="@/assets/icons/asset-icon.svg" alt />
                    Edit View
                  </p>
                  <p @click="showDeleteModal = true">
                    <img class="image is-24x24 mr-5" src="@/assets/icons/container-icon.svg" alt />
                    Delete View
                  </p>
                </div>
              </sh-dropdown>
            </template>

            <template slot="main">
              <div class="details-card__content">
                <div class="details-card__content-heading">Description</div>
                <p
                  class="is-regular-13-00-20 has-text-light-grey"
                >{{details.description || '*No desciption' }}</p>
              </div>
              <div class="details-card__content">
                <div class="details-card__content-heading has-text-light-grey">Created On:</div>
                <p
                  class="details-card__content-description is-regular-14-500-17 has-text-theme-black"
                >{{details.created_at}}</p>
              </div>
              <div class="details-card__content">
                <div class="details-card__content-heading">Entity</div>
                <p
                  class="details-card__content-description sh-text-semibold-16"
                >{{details.entity && details.entity.name ? details.entity.name : "*No associated entity"}}</p>
              </div>
              <div class="details-card__content">
                <div class="pb-15 is-flex align-center">
                  <span class="has-text-light-grey is-regular-14-00-17">Teams</span>
                  <span
                    v-if="!details.isAsset"
                    @click="add_teams"
                    class="therm_add_icon is-pointer"
                  >+</span>
                </div>
                <p class="details-card__content-description">
                  <primary-tag
                    :tags="get_teams(details.users || {})"
                    type="team"
                    :toShowCount="2"
                    :truncate_length="8"
                  ></primary-tag>
                </p>
              </div>
              <div class="details-card__content">
                <div class="pb-15 is-flex align-center">
                  <span class="has-text-light-grey is-regular-14-00-17">Users</span>
                  <span
                    v-if="!details.isAsset"
                    @click="add_users"
                    class="therm_add_icon is-pointer"
                  >+</span>
                </div>
                <p class="details-card__content-description">
                  <user-tag
                    :howManyToShow="3"
                    :users="[...(details.users.readOnly || []), ...(details.users.readWrite||[])]"
                  ></user-tag>
                </p>
              </div>
            </template>
            <template slot="footer">
              <info-block
                :info="{
                name : details.users.owner && details.users.owner.email, 
                top: 'Created by',
                type: 'userManagement'
              }"
              ></info-block>
            </template>
          </details-sidecard>
        </div>
        <div class="column is-9">
          <ActionButton :details="details" />
          <div class="my-30 is-black-border-bottom"></div>
          <div class="columns">
            <temperature-histogram class="column is-9" :details="details"></temperature-histogram>
            <Metrics class="column is-3" :details="details" />
          </div>
          <div class="columns mt-25">
            <issue-counts :details="details" class="column is-6"></issue-counts>
            <issue-status class="column is-6"></issue-status>
          </div>
        </div>
      </div>
    </div>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="details.uid"
      :resourceName="details.name"
      :resourceType="'view'"
      :resourceService="viewService"
      @closed="showDeleteModal=false"
      @deleted="show_success('Resource successfully deleted');
      $router.push({ name: 'therm-view-list'});getData()"
    />
    <pin-modal
      v-if="showPinModal"
      :resourceName="details?details.name:''"
      :resourceType="'therm'"
      @closed="showPinModal=false"
    />
  </div>
</template>

<script>
import { viewService, teamService } from "@/desktop/shared/services/";
import shDropdown from "@/desktop/shared/components/sh-dropdown";
import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
import InfoBlock from "@/desktop/shared/components/info-block";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import UserTag from "@/desktop/shared/components/tags/user-tag";
// import AddTeam from "@/desktop/shared/components/details/components/add-team";
import TemperatureHistogram from "./components/temperature-histogram";
import IssueCounts from "./components/issue-counts";
import IssueStatus from "./components/issue-status";
import ActionButton from "./components/action-button";
import Metrics from "./components/metrics.vue";
import ThermFormComponent from "../therm-form.component";
import AddTeams from "@/desktop/shared/components/add-teams-modal";
import AddUsers from "@/desktop/shared/components/add-users-modal";
import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
import TopSection from "@/desktop/core/shared/components/details-top-section/details-top-section";
import PinModal from "@/desktop/shared/components/pin-modal";
import ThermSkeleton from "@/desktop/shared/components/skeleton/therm-skeleton.vue";

export default {
  data() {
    return {
      details: null,
      issue_types: null,
      viewService: viewService,
      showDeleteModal: false,
      showPinModal: false,
      viewTeams: null,
      is_loading: false,
      ThermFormComponent: ThermFormComponent
    };
  },
  mixins: [FormPopup],
  components: {
    shDropdown,
    detailsSidecard,
    InfoBlock,
    PrimaryTag,
    UserTag,
    TemperatureHistogram,
    IssueCounts,
    IssueStatus,
    ActionButton,
    Metrics,
    TopSection,
    PinModal,
    ThermSkeleton
  },
  async created() {
    this.getData(true);

    this.$eventHub.$on("refresh-therm-details", this.getData);
  },
  beforeDestroy() {
    this.$eventHub.$off("refresh-therm-details", this.getData);
  },
  methods: {
    async getData(loading=false) {
      this.is_loading = loading;
      this.details = await viewService
        .get({
          id: this.$route.params.id,
          query: "users=true&metrics=true&complete=true&projects=true"
        })
        .catch(err => {
          this.handleErrors(err);
        });
      this.is_loading = false;
    },
    add_teams() {
      this.$modal.show(
        AddTeams,
        {
          teams: [
            ...(this.details.users.readLabels || []).map(u => ({
              uid: u,
              access: "read"
            })),
            ...(this.details.users.writeLabels || []).map(u => ({
              uid: u,
              access: "write"
            }))
          ],
          item_uid: this.details.uid,
          complete: async e => {
            let readLabels = e.filter(u => u.access === "read").map(u => u.uid);
            let writeLabels = e
              .filter(u => u.access === "write")
              .map(u => u.uid);
            await viewService
              .update({
                id: this.details.uid,
                body: {
                  uid: this.details.uid,
                  readLabels,
                  writeLabels
                }
              })
              .then(res => {
                this.getData();
                this.$eventHub.$emit("refresh-details");
              })
              .catch(err => this.handleErrors(err));
          }
        },
        { height: "80%" }
      );
    },
    add_users() {
      this.$modal.show(
        AddUsers,
        {
          users: [
            ...(this.details.users.readOnly || []).map(u => ({
              ...u,
              access: "read"
            })),
            ...(this.details.users.readWrite || []).map(u => ({
              ...u,
              access: "write"
            }))
          ],
          item_uid: this.details.uid,
          complete: async e => {
            let readUsers = e.filter(u => u.access === "read");
            let writeUsers = e.filter(u => u.access === "write");
            await viewService
              .update({
                id: this.details.uid,
                body: {
                  uid: this.details.uid,
                  readUsers,
                  writeUsers
                }
              })
              .then(res => {
                this.getData();
                this.$eventHub.$emit("refresh-details");
              })
              .catch(err => this.handleErrors(err));
          }
        },
        { height: "80%" }
      );
    }
  }
};
</script>
<style>
.box {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);
  background-color: #ffffff;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.top-breadcrumb {
  margin-bottom: 1rem;
}
.therm_add_icon {
  display: inline-flex;
  justify-content: center;
  line-height: 1.7rem;
  margin: 0 1rem;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  font-size: 2rem;
  color: #6e748f;
  border: 1px dashed #6e748f;
}
</style>