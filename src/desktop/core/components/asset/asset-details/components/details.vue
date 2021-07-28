<template>
  <div>
    <div class="columns">
      <transfer-owner
        ref="assetTransferOwner"
        :name="details.name"
        :service="assetService"
        :id="details.uid"
        v-if="details"
        @update_user="update_owner(details, $event)"
      ></transfer-owner>
      <div class="column is-3">
        <details-skeleton v-if="isloading"></details-skeleton>
        <details-sidecard v-else>
          <template slot="header">
            <main-details-media
              :truncate_value="25"
              :info="{
                name_class: 'is-semiBold-16-600-22',
                name: details.name,
                subtext: details.asset_type && details.asset_type.charAt(0).toUpperCase() + details.asset_type.slice(1),
                properties: details.properties,
                subtext_class: 'is-medium-14-500-17 has-text-theme-black has-opacity-7 is-capitalized',
              }"
            ></main-details-media>
            <sh-dropdown v-if="hasEditAccess" :triggerIsIcon="true">
              <div slot="content">
                <p @click="open_form(AssetFormComponent, { header: 'Edit Asset for' }, details)">
                  <sh-icon :name="'edit'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                  Edit Assets
                </p>
                <p @click="$refs.assetTransferOwner.open_popup()">
                  <sh-icon :name="'transfer'" class="is-24x24 mr-10"></sh-icon>
                  Transfer ownership
                </p>
                <p @click="map_modal = true">
                  <sh-icon :name="'location'" class="is-24x24 mr-10"></sh-icon>
                  Add Location
                </p>
                <p @click="showDeleteModal = true">
                  <sh-icon :name="'delete'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                  Delete asset
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
              <p class="details-card__content-description is-uppercase">
                {{ details.created_at | dateFormat }}
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading">Entity</div>
              <p class="details-card__content-descriptio is-semiBold-16-600-19">{{ details.entity && details.entity.name }}</p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading mb-5">
                Teams
                <div
                  v-if="hasEditAccess"
                  @click="
                    add_teams({
                      teams: details.labels,
                      service: assetService,
                      item_uid: details.uid,
                      asset_id: details.uid,
                    })
                  "
                  class="details-card__content__plus is-pointer"
                >
                  +
                </div>
              </div>
              <p class="details-card__content-description" style="flex-wrap:wrap">
                <primary-tag :tags="details.labels" :toShowCount="2" type="team" :no_wrap="false" :noTopMargin="true"></primary-tag>
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading">
                Users
                <div
                  v-if="hasEditAccess"
                  @click="
                    add_users({
                      users: details.users,
                      service: assetService,
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
              <div class="details-card__content-heading">Tags</div>
              <p class="details-card__content-description" v-if="details.tags.length">
                <type-tag
                  :tags="details.tags"
                  :write_access="hasEditAccess"
                  :service="assetService"
                  :complete="
                    () => {
                      $emit('update');
                    }
                  "
                ></type-tag>
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
        <div v-if="details" class="sh-tabs">
          <ul>
            <li>
              <router-link class="is-medium-18-500-22 has-text-theme-black" active-class="is-active" :to="{ name: 'asset-details-containers' }">
                Containers
                <span>{{ (details.containers && details.containers.length) || 0 }}</span>
              </router-link>
            </li>
            <li>
              <router-link class="is-medium-18-500-22 has-text-theme-black" active-class="is-active" :to="{ name: 'asset-details-groups' }">
                Groups
                <span>{{ (details.groups && details.groups.length) || 0 }}</span>
              </router-link>
            </li>
            <li>
              <router-link class="is-medium-18-500-22 has-text-theme-black" active-class="is-active" :to="{ name: 'asset-details-reports' }">
                Reports
                <span>{{ (resource_metrics && resource_metrics.no_of_reports) || 0 }}</span>
              </router-link>
            </li>
            <li class="ml-auto" v-if="$store.getters.asset_configuration">
              <router-link class="is-medium-18-500-22 has-text-theme-black" active-class="is-active" :to="{ name: 'asset-details-configuration' }">
                Configuration
              </router-link>
            </li>
          </ul>
        </div>
        <keep-alive>
          <router-view :details="details" class="router-asset-details" />
        </keep-alive>

        <div class="sh-tabs mt-30" v-if="$route.name !== 'asset-details-configuration'">
          <ul>
            <li>
              <a :class="{ 'is-active': active_tab == 'terra' }" @click="active_tab = 'terra'">
                Terra
                <span>{{ terra_count }}</span>
              </a>
            </li>
            <li>
              <a :class="{ 'is-active': active_tab == 'therm' }" @click="active_tab = 'therm'">
                Therm
                <span>{{ therm_count }}</span>
              </a>
            </li>
          </ul>
          <div class="py-20" v-if="details">
            <keep-alive>
              <therm-list @count="therm_count = $event" v-if="active_tab == 'therm'" ref="therm_tab" :asset_id="details.uid"></therm-list>
              <terra-list @count="terra_count = $event" v-if="active_tab == 'terra'" ref="terra_tab" :asset_id="details.uid"></terra-list>
            </keep-alive>
          </div>
        </div>
      </div>
    </div>

    <delete-modal
      v-if="showDeleteModal"
      :resourceId="details.uid"
      :resourceName="details ? details.name : ''"
      :resourceType="'asset'"
      :resourceService="assetService"
      @closed="showDeleteModal = false"
      @deleted="
        show_success('Resource successfully deleted');
        $router.push({ name: 'asset-list' });
        getData();
      "
    />
    <pin-modal v-if="showPinModal" :resourceName="details ? details.name : ''" :resourceType="'asset'" @closed="showPinModal = false" />
    <b-modal class="location-modal" :active.sync="map_modal">
      <div class="card">
        <div class="card-content">
          <location-picker class="location-picker-map" v-model="location" :options="options"></location-picker>
          <div @click="update_location" class="is-pulled-right button is-large is-info mt-10 mr-10">save</div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
  import { assetService, userService, metricsService } from "@/desktop/shared/services/";
  import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
  import UserTag from "@/desktop/shared/components/tags/user-tag";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import TypeTag from "@/desktop/shared/components/tags/type-tag/type-tag";

  import AddUsers from "@/desktop/shared/components/add-users-modal";
  import AddTeams from "@/desktop/shared/components/add-teams-modal";

  import ThermList from "@/desktop/therm/components/view-list/view-list";
  import TerraList from "@/desktop/terra/components/terra-list/terra-list";
  import PinModal from "@/desktop/shared/components/pin-modal";
  import ResourceEbs from "@/desktop/core/shared/components/resource-ebs";
  import AssetFormComponent from "./../../asset-form.component.vue";
  import { LocationPicker } from "vue2-location-picker";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import UserTeamPopup from "@/desktop/shared/mixins/user-team-popup.mixin.vue";
  import DetailsSkeleton from "@/desktop/shared/components/skeleton/details-skeleton.vue";
  export default {
    props: ["details", "resource_metrics", "isloading"],
    mixins: [FormPopup, UserTeamPopup],
    data() {
      return {
        therm_count: 0,
        terra_count: 0,
        view_type: "resource",
        activeView: "tickets",
        avatarLink: "https://ui-avatars.com/api/?name=",

        assetUsers: [],
        assetService: assetService,
        active_tab: "terra",
        showDeleteModal: false,
        showPinModal: false,
        hasEditAccess: false,
        update: false,
        updated_description: this.details && this.details.description && this.details.description.length ? this.details.description : null,
        location: {},
        options: {
          // is not required
          map: {
            /** other map options **/
          },
          marker: {
            /** marker options **/
          },
          autocomplete: {
            /** autocomplete options **/
          },
        },
        map_modal: false,
        AssetFormComponent: AssetFormComponent,
        assetService: assetService,
      };
    },
    components: {
      shDropdown,
      detailsSidecard,
      MainDetailsMedia,
      UserTag,
      TypeTag,
      ThermList,
      TerraList,
      PrimaryTag,
      PinModal,
      ResourceEbs,
      LocationPicker,
      DetailsSkeleton,
    },
    created() {
      this.checkEditAccess();
      setTimeout(() => {
        if (this.details && this.details.location && this.details.location.coordinates) {
          this.location["lat"] = this.details.location.coordinates[1];
          this.location["lng"] = this.details.location.coordinates[0];
        } else {
          this.location["lat"] = 0;
          this.location["lat"] = 0;
        }
      }, 2000);
    },

    methods: {
      checkEditAccess() {
        assetService
          .get({ id: this.$route.params.id, query: "edit=true" })
          .then(() => (this.hasEditAccess = true))
          .catch((err) => this.handleErrors(err));
      },
      async update_description() {
        let res = await this.assetService.patch({
          body: {
            description: this.updated_description,
          },
          id: this.details.uid,
        });
        this.details.description = this.updated_description;
        this.update = false;
      },
      async update_location() {
        await this.assetService
          .patch({
            body: {
              location: {
                coordinates: [this.location.lng, this.location.lat],
                type: "Point",
              },
            },
            id: this.details.uid,
          })
          .then((res) => {
            this.$toast.show("Location added successfully", "", this.$store.state.izitoast_options.appSuccess);
          });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .is-borderless {
    border: none !important;
  }

  .pinned-resource-buttons {
    background: white;
    border-radius: 1rem;
    padding: 1rem;
    width: 212px;
    height: 40px;
    border-radius: 6px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.16);
  }
  .location-modal {
    .card {
      padding-bottom: 4rem;
    }
  }
  .location-picker-map {
    height: 650px;
    #map {
      height: 600px;
    }
  }
</style>
