<template>
  <div>
    <transfer-owner
      ref="assetTransferOwner"
      :name="active.name"
      :service="assetService"
      :id="active.uid"
      @update_user="update_owner(active, $event)"
    ></transfer-owner>

    <delete-modal
      v-if="showDeleteModal"
      :resourceId="active.uid"
      :resourceName="active.name"
      :resourceType="'asset'"
      :resourceService="assetService"
      @closed="showDeleteModal = false"
      @deleted="
        show_success('Resource successfully deleted');
        getData();
      "
    />

    <div class="top-section mb-5">
      <div class="top-container">
        <div class="top-container__left is-medium-14-500-17 medium-opacity">
          Assets Dashboard
        </div>
        <div class="top-container__right">
          <span>
            <img
              class="image is-16x16 mr-5"
              :src="
                map_visible
                  ? require('@/assets/icons/asset-map-dark.svg')
                  : require('@/assets/icons/asset-map.svg')
              "
              alt
            />
          </span>
          <div
            @click="map_visible = !map_visible"
            :class="{
              'map-active': map_visible,
              'medium-opacity': !map_visible,
            }"
            class="is-medium-14-500-17 is-pointer mr-40"
          >
            Asset Map
          </div>
          <div class="is-medium-14-500-17 medium-opacity mr-5">Group by:</div>
          <div
            class="sh-dropdown"
            v-click-outside="() => (groupby_active = false)"
          >
            <div
              @click="groupby_active = !groupby_active"
              class="map-active is-pointer mr-40 ml-5"
            >
              <p class="is-flex is-vcenter">
                <span>{{ groupby.name }}</span>
                <sh-icon :name="'chevron-down'" class="is-10x10 ml-5"></sh-icon>
              </p>
              <!-- <img src="@/assets/icons/chevron-down.svg" alt /> -->
            </div>
            <ul class="sh-dropdown-content" v-if="groupby_active" @click.stop>
              <li
                v-for="option in groupby_select"
                :key="option.name"
                class="sh-dropdown-content__item"
                @click="
                  groupby = option;
                  groupby_active = false;
                "
              >
                <div
                  class="sh-dropdown-content__item--text is-medium-16-500-19 is-capitalized"
                >
                  {{ option.name }}
                </div>
              </li>
            </ul>
          </div>
          <div class="is-medium-14-500-17 medium-opacity mr-5">Sort by:</div>

          <div
            class="sh-dropdown is-disabled"
            v-click-outside="() => (sortby_active = false)"
          >
            <div @click="sortby_active = false" class="map-active mr-40 ml-5">
              <p class="is-flex is-vcenter">
                <span>{{ sortby.name }}</span>
                <sh-icon :name="'chevron-down'" class="is-10x10 ml-5"></sh-icon>
              </p>
              <!-- {{ sortby.name }}
              <img src="@/assets/icons/chevron-down.svg" alt />-->
            </div>
            <ul class="sh-dropdown-content" v-if="sortby_active" @click.stop>
              <li
                v-for="option in sortby_select"
                :key="option.name"
                class="sh-dropdown-content__item"
              >
                <div
                  class="sh-dropdown-content__item--text is-medium-16-500-19 is-capitalized"
                >
                  {{ option.name }}
                </div>
              </li>
            </ul>
          </div>
          <div class="is-medium-14-500-17">
            <div
              v-if="!$store.getters.is_org_user"
              class="list-top-section--create"
            >
              <a
                v-if="access('core', 'create_assets')"
                @click="
                  open_form(AssetFormComponent, { header: 'Create Asset for' })
                "
              >
                <div class="sh-button sh-button--create">New Asset</div>
              </a>
              <a v-else @click="no_access_popup('core', 'create_assets')">
                <div class="sh-button sh-button--create">New Asset</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="main-section" v-if="map_visible">
      <div class="columns">
        <div class="map column">
          <asset-map></asset-map>
        </div>
      </div>
    </div>
    <div v-if="grouped_data">
      <div v-if="isLoading" class="columns px-20 pt-20">
        <div class="column is-3" v-for="(item, index) in 4" :key="index">
          <home-skeleton></home-skeleton>
        </div>
      </div>
      <div v-else v-for="(group, key) in grouped_data" :key="group.data[0].uid">
        <div class="is-inline-flex" v-if="group.data.length > 0">
          <img
            class="is-pointer ml-15"
            @click="toggle_group_visibility(group)"
            :class="{ 'rotate-chevron': !group.visible }"
            src="@/assets/icons/chevron-circle-down.svg"
            alt
          />
          <div>
            <span class="is-medium-14-500-17 mr-5 entity-name is-capitalized">
              <span v-if="group.grouped_by == 'tags'">
                <span v-if="key.toString().length > 0" class="mt-20 is-flex">
                  <assigned-tags
                    :tags="tagslist(key)"
                    :write_access="false"
                    :number_of_tags_to_display="tagslist(key).length"
                  />
                  <span class="entity-count is-flex icon">{{
                    group.data.length
                  }}</span>
                </span>
                <span v-else>No tags</span>
              </span>
              <span v-else-if="key == 'undefined'">{{ "All Entities" }}</span>
              <span v-else>{{ key ? key : "None" }}</span>
            </span>
            <span
              v-if="
                group.grouped_by !== 'tags' ||
                (group.grouped_by == 'tags' && !key.toString().length > 0)
              "
              class="entity-count icon"
            >
              {{ group.data.length }}
            </span>
          </div>
        </div>
        <div
          class="asset-container"
          style="margin-bottom: 2rem"
          v-if="group.visible"
        >
          <AssetComponent
            @disable_asset="disable_asset($event)"
            @delete_asset="
              showDeleteModal = true;
              active = $event;
            "
            @transfer_ownership="
              active = $event;
              $refs.assetTransferOwner.open_popup();
            "
            @asset_form="
              open_form(
                AssetFormComponent,
                { header: 'Edit Asset for' },
                $event
              )
            "
            @open_modal="
              open_app_modal = $event.uid;
              active = $event;
            "
            v-for="asset in group.data"
            :key="asset.uid"
            :item="asset"
          ></AssetComponent>
        </div>
      </div>
    </div>

    <b-modal
      class="applications-container-small"
      :active.sync="open_app_modal"
      :width="974"
      scroll="keep"
    >
      <div class="applications-container">
        <div class="card">
          <div class="card-header" style="box-shadow: none">
            <div
              class="card-header-title is-capitalized is-semibold-18-600-22 modal-title"
            >
              Choose Application
            </div>
          </div>
          <div class="card-content" style="padding: 1rem 3rem 3rem 3rem">
            <div
              class="application-card"
              v-for="app in applications"
              :key="app.name"
            >
              <div class="card is-pointer" @click="goto_app(app)">
                <div class="columns">
                  <div class="column is-3 is-paddingless">
                    <figure class="app-icon pt-5">
                      <img
                        :src="
                          app.icon_round ||
                          'https://bulma.io/images/placeholders/1280x960.png'
                        "
                        alt="cover_image"
                      />
                    </figure>
                  </div>
                  <div class="column is-paddingless">
                    <div
                      class="card-content is-paddingless is-block application-card__details__text"
                    >
                      <p class="is-medium-18-500-22 mt-5">{{ app.name }}</p>
                      <p
                        class="application-description is-regular-14-500-22 mt-5"
                      >
                        {{ app.description }}
                      </p>
                      <router-link
                        v-if="access(app.permissions_key)"
                        :to="{ name: app.to, query: { asset: open_app_modal } }"
                      >
                        <div class="is-inline-flex mt-20">
                          <p
                            class="is-pointer is-large is-white is-medium-16-500-19 has-text-blue"
                          >
                            View Application
                          </p>
                          <div class="ml-5">
                            <img
                              src="@/assets/icons/right-arrow-active.svg"
                              alt
                            />
                          </div>
                        </div>
                      </router-link>
                      <a
                        v-else
                        @click.stop="no_access_popup(app.permissions_key)"
                      >
                        <div class="is-inline-flex mt-20">
                          <p
                            class="is-pointer is-large is-white is-medium-16-500-19 has-text-blue"
                          >
                            View Application
                          </p>
                          <div class="ml-5">
                            <img
                              src="@/assets/icons/right-arrow-active.svg"
                              alt
                            />
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import {
  assetService,
  userService,
  teamService,
} from "@/desktop/shared/services/";
import AssetComponent from "./asset.component";
import AssetFormComponent from "@/desktop/core/components/asset/asset-form.component.vue";
import AssignUserAssets from "@/desktop/core/components/user/user-details/components/assign-user-assets";
import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
import AssetMap from "./assetmap.component";
import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
import HomeSkeleton from "@/desktop/shared/components/skeleton/home-skeleton.vue";
import { mapState } from "vuex";

export default {
  components: {
    AssetComponent,
    AssignedTags,
    AssetMap,
    HomeSkeleton,
  },
  mixins: [FormPopup],
  data() {
    return {
      isLoading: false,
      assetService: assetService,
      open_app_modal: false,
      active: { uid: null },
      showDeleteModal: false,
      groupby: { value: "", name: "All" },
      sortby: { value: "", name: "None" },
      map_visible: false,
      groupby_active: false,
      sortby_active: false,
      sortby_select: [
        {
          name: "Location",
          value: "",
        },
      ],
      AssetFormComponent: AssetFormComponent,
      groupby_select: [
        {
          name: "All",
          value: "",
        },
        {
          name: "Entity",
          value: "entity.name",
        },
        {
          name: "Type",
          value: "asset_type",
        },
        {
          name: "Tags",
          value: "tags",
        },
      ],
      applications: [
        {
          name: "Terra",
          image: require("@/assets/icons/png/terra-app.png"),
          icon: require("@/assets/icons/png/terra.png"),
          icon_round: require("@/assets/icons/png/terra-round.png"),
          to: "terra-list",
          description: "Monitoring solution and other terrain tools.",
          permissions_key: "terra",
        },
        {
          name: "Thermal",
          image: require("@/assets/icons/png/thermal-app.png"),
          icon: require("@/assets/icons/png/thermal.png"),
          icon_round: require("@/assets/icons/png/thermal-round.png"),
          to: "therm-view-list",
          description: "Find defects that degrade the site performance.",
          permissions_key: "therm",
        },
        {
          name: "Processing",
          image: require("@/assets/icons/png/processing-app.png"),
          icon: require("@/assets/icons/png/processing.png"),
          icon_round: require("@/assets/icons/png/processing-round.png"),
          to: "process-list",
          description: "Photogrammetry and various other tools.",
          permissions_key: "processing",
        },
        {
          name: "Missions",
          image: require("@/assets/icons/png/missions-app.png"),
          icon: require("@/assets/icons/png/missions.png"),
          icon_round: require("@/assets/icons/png/missions-round.png"),
          to: "mission-list",
          description: "Plan a flight path and use our link mobile app to fly.",
          permissions_key: "missions",
        },
        {
          name: "Tickets",
          image: require("@/assets/icons/png/tickets-app.png"),
          icon: require("@/assets/icons/png/tickets.png"),
          icon_round: require("@/assets/icons/png/tickets-round.png"),
          to: "tickets",
          description:
            "Fix defects on site with tickets and better collaboration.",
          permissions_key: "tickets",
        },
        {
          name: "Vault",
          image: require("@/assets/icons/png/vault-app.png"),
          icon: require("@/assets/icons/png/vault.png"),
          icon_round: require("@/assets/icons/png/vault-round.png"),
          to: "vault",
          description: "Store files, lock and share them with your teammates.",
          permissions_key: "vault",
        },
      ],
    };
  },
  computed: {
    ...mapState(["assets"]),
    grouped_data() {
      let property = this.groupby.value;
      let grps = _.groupBy(this.assets, property);
      for (let key in grps) {
        let data = grps[key];
        grps[key] = {};
        grps[key]["data"] = data;
        grps[key]["visible"] = true;
        grps[key]["grouped_by"] = property;
      }

      return grps;
    },
    assetTypeTagsToShow() {
      return 1;
    },
  },
  created() {
    analytics.page("Home");
    if (!this.assets || !this.assets.length) this.getData();
    this.$eventHub.$on("refresh-asset-list", this.getData);
  },
  beforeDestroy() {
    this.$eventHub.$off("refresh-asset-list", this.getData);
  },
  methods: {
    goto_app(app) {
      this.access(app.permissions_key)
        ? this.$router.push({
            name: app.to,
            query: { asset: this.open_app_modal },
          })
        : this.no_access_popup(app.permissions_key);
    },
    tagslist(key) {
      return key.toString().split(",");
    },
    public_asset_count(group) {
      return group.data.filter((obj) => obj.public == true).length;
    },
    toggle_group_visibility(group) {
      group.visible = !group.visible;
      //fix for not updating the dom after toggle
      this.$forceUpdate();
    },
    async disable_asset(data) {
      let res = await assetService.patch({
        body: {
          public: !data.is_disable,
        },
        id: data.id,
      });
      if (res.success) {
        if (!data.is_disable == false) {
          this.$toast.show(
            "Asset disabled successfully",
            "",
            this.$store.state.izitoast_options.appSuccess
          );
        }
        this.getData(false);
      } else this.$toast.show("Failed to complete the action");
    },
    async getData(is_loading = true) {
      try {
        // if (this.assets) return;
        this.isLoading = is_loading;
        let query = "page_size=1000&page_number=1";
        //   query.labels = true;
        let { results } = await assetService.getAssetsDashboard({ query });
        // this.assets = results;
        this.$store.commit("SET_ASSETS", results);
        this.isLoading = false;
      } catch (err) {
        this.handleErrors(err);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.map-active {
  opacity: 1;
  font-family: Barlow-semibold;
  font-size: 14px;
  font-weight: 600;
  color: #171e48;
}
.main-section {
  margin: 2rem;
  margin-bottom: 0;
  height: 50rem;
  background-color: #f4f7fc;
}
.top-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  &__right {
    display: flex;
    align-items: center;
    color: #393c42;
    .select {
      margin-top: 3px;
      background-color: transparent;
      //   border-color: transparent;
      .select-value {
        font-family: Barlow-semibold;
        font-size: 14px;
        font-weight: 600;
        color: #171e48;
      }
      select {
        // border-color: transparent;
        background-color: transparent;
      }
    }
  }
  &__left {
    color: #393c42;
  }
  .medium-opacity {
    opacity: 0.7;
  }
}
.entity-chevron-down {
  padding: 0rem 0.5rem 0rem 0.5rem;
  background-color: white;
  border: 1px solid gray;
  border-radius: 50%;
  margin-right: 0.4rem;
}
.rotate-chevron {
  transform: rotate(-90deg);
  margin-top: -2px;
}
.entity-name {
  opacity: 0.7;
}
.entity-count {
  font-family: Barlow-bold;
  font-size: 12px;
  color: #171e48;
  opacity: 0.7;
  background-color: #dee5f0;
  border-radius: 50%;
  margin-left: 5px;
  padding: 1.3rem 1.3rem;
}
.asset-container {
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
}
.applications-container .card-content {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .application-card {
    .card {
      padding: 2.5rem 2.5rem 2.5rem 3rem;
      border-radius: 10px;
      border: solid 1px rgba(23, 30, 72, 0.15);
    }
    .card:hover {
      box-shadow: 0 5px 10px 0 rgba(92, 126, 247, 0.3);
      border: solid 1px $primary;
    }
    .application-description {
      text-align: left;
      color: #171e48;
      font-size: 14px;
    }
  }
}
.modal-title {
  font-family: Barlow-semibold;
  font-size: 20px;
  font-weight: 600;
  color: #171e48;
  padding: 15px 4rem !important;
}
@media (min-width: 300px) {
  .application-card {
    width: 50%;
    padding: 1rem;
  }
}
@media (min-width: 600px) {
  .application-card {
    width: 33.33%;
    padding: 1rem;
  }
}
.sh-dropdown-content {
  width: 10.5rem;
  box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
  border: solid 1px rgba(23, 30, 72, 0.15);
  right: 0rem;
  top: 2.5rem;
  padding: 1rem 0;
  border-radius: 1rem;
  &__item {
    padding: 0.5rem 2rem;
  }
}
.sh-dropdown-content__item--text {
  padding: 0.3rem 0rem;
  span {
    white-space: nowrap;
    line-height: 50px;
  }
}
</style>
