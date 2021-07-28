<template>
  <!-- temporary desin -->
  <div class="px-20 pt-20">
    <top-section
    :details="details"
    @show_pin_modal="showPinModal=true;">
    </top-section>
    <!-- <router-view /> -->

    <div class="columns">
      <div class="column is-3" v-if="details">
        <transfer-owner
          ref="terraTransferOwner"
          :name="details.name"
          :service="terraService"
          :id="details.uid"
          @update_user="update_owner(details, $event)"
        ></transfer-owner>
        <details-skeleton v-if="is_loading"></details-skeleton>
        <details-sidecard v-else>
          <template slot="header">
            <info-block
              :icon_size="40"
              :info="{
                name : details.name,
                name_class: 'is-semiBold-16-600-22',
                type: 'projectManagement'
                }"
            ></info-block>
            <sh-dropdown v-if="!details.isContainer" :triggerIsIcon="true">
              <div slot="content">
                <p @click="open_form(TerraFormComponent,{header:'Edit Terra View for'},details)">
                  <sh-icon :name="'edit'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                  Edit Resource
                </p>
                <p @click="$refs.terraTransferOwner.open_popup()">
                  <sh-icon :name="'transfer'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                  Transfer ownership
                </p>
                <p @click="showDeleteModal = true">
                  <sh-icon :name="'delete'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                  Delete Resource
                </p>
              </div>
            </sh-dropdown>
          </template>

          <template slot="main">
            <div class="details-card__content">
              <div
                class="details-card__content-heading is-regular-14-00-17 has-secondary-text"
              >Description</div>

              <p
                class="details-card__content-description is-regular-14-00-24 has-primary-text"
                :class="{'has-text-grey sh-text-semibold has-opacity-7' : !details.description}"
              >{{details.description ? details.description : '*No description found'}}</p>
            </div>
            <div class="details-card__content">
              <div
                class="details-card__content-heading is-regular-14-00-17 has-secondary-text"
              >Modified on</div>
              <p
                class="details-card__content-description sh-text-normal-14 is-regular-14-00-17 has-primary-text"
              >{{details.updated | dateFormat}}</p>
            </div>
            <div class="details-card__content">
              <div
                class="details-card__content-heading is-regular-14-00-17 has-secondary-text is-flex align-center"
              >
                <span class="mr-10">Groups</span>
                <div
                  v-if="!details.isContainer"
                  @click="add_groups"
                  class="details-card__content__plus is-pointer"
                >
                  <span>+</span>
                </div>
              </div>
              <p class="details-card__content-description sh-text-semibold-16">
                <primary-tag
                  v-if="details.groups"
                  :toShowCount="1"
                  :tags="details.groups"
                  :type="'group'"
                  :no_wrap="true"
                  :noTopMargin="true"
                ></primary-tag>
              </p>
            </div>
            <div class="details-card__content">
              <div
                class="details-card__content-heading is-regular-14-00-17 has-secondary-text is-flex align-center"
              >
                <span class="mr-10">Teams</span>
                <div
                  v-if="!details.isContainer"
                  @click="open_teams_popup"
                  class="details-card__content__plus is-pointer"
                >
                  <span>+</span>
                </div>
              </div>
              <p class="details-card__content-description">
                <primary-tag
                  :toShowCount="2"
                  :type="'team'"
                  :tags="get_teams(details)"
                  :noTopMargin="true"
                ></primary-tag>
              </p>
            </div>
            <div class="details-card__content">
              <div
                class="details-card__content-heading is-regular-14-00-17 has-secondary-text is-flex align-center"
              >
                <span class="mr-10">Users</span>
                <div  
                  v-if="!details.isContainer"
                  @click="open_users_popup"
                  class="details-card__content__plus is-pointer"
                >
                  <span>+</span>
                </div>
              </div>
              <p class="details-card__content-description">
                <user-tag :users="[...(details.readUsers || []),...(details.writeUsers || [])]" :howManyToShow="3"></user-tag>
              </p>
            </div>
          </template>
          <template slot="footer">
            <info-block
              v-if="$store.getters.state_users[details.owner.uid]"
              :info="{
                'name': `${$store.getters.state_users[details.owner.uid].first_name} ${$store.getters.state_users[details.owner.uid].last_name}`,
                'top': 'Owner',
                name_class: 'is-semiBold-16-600-22',
                'image': $store.getters.state_users[details.owner.uid].display_picture,
                type: 'userManagement'
              }"
            ></info-block>
            <info-block
              v-else-if="details.owner && details.owner.uid"
              :unknown="true"
              :info="{
                  'name':  details.owner.email.includes('@sensehawk')?'Sensehawk':'Unknown',
                  'top': 'Owner',
                  'name_class': 'is-semiBold-16-600-22',
                  'type': 'userManagement'
              }"
            ></info-block>
          </template>
        </details-sidecard>
      </div>
      <div class="column" v-if="details">
        <div class="map-button is-flex is-end" :class="{'is-disabled': is_loading}">
          <!-- target="_blank" -->
          <!-- v-if="access('terra', 'can_view_viewer')" -->
          <router-link
            :to="{name:'terra-viewer',params:{id:details.uid}}"
            class="is-semiBold-14-600-17 is-flex mb-30"
          >
            <button class="is-flex align-center map-btn">
              <img class="mr-10" src="@/assets/icons/map-icon.svg" alt srcset />
              <div class="is-semiBold-14-600-17">Go to Map</div>
            </button>
          </router-link>
          <!-- <a
            v-else
            @click="no_access_popup('terra', 'can_view_viewer')"
            class="is-semiBold-14-600-17 is-flex mb-30"
          >
          <button class="is-flex align-center map-btn">
            <img class="mr-10" src="@/assets/icons/map-icon.svg" alt="" srcset="">
            <div class="is-semiBold-14-600-17 disabled-link is-not-allowed">Go to Map</div>
          </button>
          </a>-->
        </div>
        <div class="terra-divider mb-30"></div>

        <div class="columns">
          <div class="column is-5">
            <group :details="details" :is_group_loading="is_loading" />
          </div>
          <div class="column is-7">
            <features-type-groups :details="details"></features-type-groups>
          </div>
        </div>
      </div>
    </div>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="details.uid"
      :resourceName="details.name"
      :resourceType="'terra'"
      :resourceService="terraService"
      @closed="showDeleteModal=false"
      @deleted="show_success('Resource successfully deleted');
      $router.push({ name: 'terra-list'});getData()"
    />
    <pin-modal
      v-if="showPinModal"
      :resourceName="details?details.name:''"
      :resourceType="'terra'"
      @closed="showPinModal=false"
    />
  </div>
</template>

<script>
import shDropdown from "@/desktop/shared/components/sh-dropdown";
import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
import {
  terraService,
  userService,
  teamService
} from "@/desktop/shared/services/";
import PinModal from "@/desktop/shared/components/pin-modal";
import InfoBlock from "@/desktop/shared/components/info-block";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import UserTag from "@/desktop/shared/components/tags/user-tag";
import AddTerraGroups from "./components/add-terra-groups";
import FeaturesTypeGroups from "./components/feature-type-groups/features-type-groups";
import Group from "./components/group/group";
import TerraFormComponent from "../terra-form.component.vue";
import AddUsers from "@/desktop/shared/components/add-users-modal";
import AddTeams from "@/desktop/shared/components/add-teams-modal";
import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
import UserTeamPopup from "@/desktop/shared/mixins/user-team-popup.mixin.vue";
import TopSection from "@/desktop/core/shared/components/details-top-section/details-top-section";
import DetailsSkeleton from "@/desktop/shared/components/skeleton/details-skeleton.vue";

export default {
  data() {
    return {
      details: null,
      terraService: terraService,
      showDeleteModal: false,
      showPinModal: false,
      terraUsers: [],
      terraTeams: null,
      active_project: null,
      is_loading: false,
      from: "terra",
      TerraFormComponent: TerraFormComponent
    };
  },
  mixins: [FormPopup,UserTeamPopup],
  components: {
    shDropdown,
    detailsSidecard,
    InfoBlock,
    PrimaryTag,
    UserTag,
    Group,
    TopSection,
    FeaturesTypeGroups,
    PinModal,
    DetailsSkeleton,
  },
  created() {
    this.getData(true);
    this.$eventHub.$on("refresh-terra-details",()=> this.getData());
  },
  beforeDestroy() {
    this.$eventHub.$off("refresh-terra-details");
  },
  methods: {
    async getData(loading=false) {
      this.is_loading = loading;
      this.details = await terraService
        .get_view_details({ id: this.$route.params.id })
        .catch(err => {
          this.handleErrors(err);
          this.is_loading = false;
        });

      if (
        this.details &&
        this.details.groups &&
        this.details.groups.length &&
        this.details.groups[0].projects &&
        this.details.groups[0].projects.length
      ) {
        this.active_project = this.details.groups[0].projects[0];
      }
      setTimeout(() => {
        this.is_loading = false;
      }, 0);
    },
    open_teams_popup(){
      let info =  {
          teams: [
            ...(this.details.readLabels || []).map(u => ({
              uid: u,
              access: "read"
            })),
            ...(this.details.writeLabels || []).map(u => ({
              uid: u,
              access: "write"
            }))
          ],
          item_uid: this.details.uid,
        }
      this.add_teams(info, terraService);
    },
    open_users_popup(){
      let info =  {
          users: [
            ...(this.details.readUsers || []).map(u => ({
              ...u,
              access: "read"
            })),
            ...(this.details.writeUsers || []).map(u => ({
              ...u,
              access: "write"
            }))
          ],
          item_uid: this.details.uid,
        }
      this.add_users(info, terraService);
    },
    add_groups() {
      this.$modal.show(
        AddTerraGroups,
        { groups: this.details.groups },
        { height: "80%", width: "25%" },
        { name: "add-terra-groups" }
      );
    }
  }
};
</script>

<style lang="scss" >
.is-22x22 {
  height: 2.2rem;
  width: 2.2rem;
}

.details-skeleton {
  // width: 100%;
  height: 100vh;
  padding-left: 10px;
  &-column {
    background-color: #fff;
    border-radius: 1rem;
    box-shadow: 0px 0px 10px 1px #ddd;
    width: 30rem !important;
  }
}
.terra-divider {
  background-color: #eee;
  width: 100%;
  position: relative;
  margin-bottom: 3rem;
  height: 1px;
}

.map-btn {
  padding: 13px 20px;
  border-radius: 6px;
  background-color: #fff;
  border: solid 1px $primary;
  color: $primary;
  box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
  cursor: pointer;
}

// card-height and scroll on hover
.card-height-750 {
  height: 75rem;
  overflow: hidden;
  margin: 0 auto;
  &:hover {
    overflow: auto;
  }
}

.scrollbox {
  overflow: auto;
  visibility: hidden;
}

.scrollbox-content,
.scrollbox:hover,
.scrollbox:focus {
  visibility: visible;
}
</style>