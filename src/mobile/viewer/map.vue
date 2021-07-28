<template>
  <div class="mobile-viewer">
    <template v-if="map_loaded">
      <Menu />
      <right-menu />
      <GPS />
    </template>
    <b-loading :is-full-page="true" :active="$store.state.viewer.is_viewer_loading"></b-loading>
    <div id="mobile-viewer"></div>
  </div>
</template>

<script>
import {
  apiService,
  viewService,
  terraService,
  featureTypeGroupService
} from "@/desktop/shared/services/";
import { mapState, mapGetters } from "vuex";
import Menu from "./components/menu/menu";
import RightMenu from "./components/right-menu/right-menu";
import GPS from "./components/gps";
export default {
  data() {
    return {
      map_loaded: false
    };
  },
  components: { Menu, RightMenu, GPS },
  mounted() {
    this.$eventHub.$on("update_element_data", this.update_element_data);

    this.map = new mapboxgl.Map({
      container: "mobile-viewer",
      zoom: 0.3,
      center: [0, 20],
      style: "mapbox://styles/mapbox/light-v10"
      // style: "mapbox://styles/mapbox/satellite-v8"
    });
    // TO TEST
    window.map = this.map;
    this.map.on("style.load", async () => {
      try {
        await Promise.all([this.getDetails(), this.getFeatureTypes()]);
        this.$store.commit("viewer/SET_IS_VIEWER_LOADING", false);
      } catch (err) {
        this.$store.commit("viewer/SET_IS_VIEWER_LOADING", false);
      }
      this.map_loaded = true;

      this.map.on("click", e => {
        this.$store.commit("viewer/SET_SELECTED_FEATURE_ID", null);
      });

      this.map.on("click", "features_layer_fill", e => {
        // e.preventDefault();

        if (e.features && e.features.length) {
          this.$store.commit(
            "viewer/SET_SELECTED_FEATURE_ID",
            e.features[0].properties.custom_feature_id
          );
        } else {
          this.$store.commit("viewer/SET_SELECTED_FEATURE_ID", null);
        }
      });
      this.map.on("click", "features_layer_line", e => {
        // e.preventDefault();

        if (e.features && e.features.length) {
          this.$store.commit(
            "viewer/SET_SELECTED_FEATURE_ID",
            e.features[0].properties.custom_feature_id
          );
        } else {
          this.$store.commit("viewer/SET_SELECTED_FEATURE_ID", null);
        }
      });
    });
  },
  beforeDestroy() {
    this.$eventHub.$off("update_element_data", this.update_element_data);
    this.$store.commit("viewer/RESET_STORE");
  },
  computed: {
    ...mapState("viewer", [
      "feature_type_filters",
      "feature_types",
      "extra_property_filters",
      "selected_feature_id"
    ]),
    ...mapGetters("viewer", ["all_features", "selected_feature"]),
    map: {
      get() {
        return this.$store.state.viewer.map;
      },
      set(value) {
        this.$store.commit("viewer/SET_MAP", value);
      }
    },
    details: {
      get() {
        return this.$store.state.viewer.details;
      },
      set(value) {
        this.$store.commit("viewer/SET_DETAILS", value);
      }
    },
    layer_data: {
      get() {
        return this.$store.state.viewer.layer_data;
      },
      set(value) {
        this.$store.commit("viewer/SET_LAYER_DATA", value);
      }
    }
  },
  watch: {
    extra_property_filters() {
      this.update_features();
    },
    feature_type_filters() {
      this.update_features();
    },
    layer_data() {
      this.update_maps();
      this.update_features();
    },
    selected_feature_id(val) {
      this.set_selected_feature_layer(val);
    }
  },
  methods: {
    update_element_data (element) {
      let index = this.layer_data[
        this.selected_feature.properties.project
      ].features.findIndex(
        f =>
          this.selected_feature.properties.custom_feature_id ==
          f.properties.custom_feature_id
      );

      if (index != -1) {
        this.layer_data[this.selected_feature.properties.project].features[
          index
        ].properties.element = element;

        this.layer_data = { ...this.layer_data };
      }
    },
    set_selected_feature_layer(val) {
      if (!val) {
        if (this.map.getLayer("selected_feature"))
          this.map.setLayoutProperty("selected_feature", "visibility", "none");
        return;
      }

      if (!this.map.getSource("selected_feature")) {
        this.map.addSource("selected_feature", {
          type: "geojson",
          data: {
            features: [this.selected_feature],
            type: "FeatureCollection"
          }
        });
      } else {
        this.map.getSource("selected_feature").setData({
          features: [this.selected_feature],
          type: "FeatureCollection"
        });
      }
      if (!this.map.getLayer("selected_feature"))
        this.map.addLayer({
          id: "selected_feature",
          type: "fill",
          source: "selected_feature",
          paint: {
            "fill-color": "black",
            "fill-opacity": 0.5
          }
        });
      else {
        this.map.setLayoutProperty("selected_feature", "visibility", "visible");
      }
    },
    async update_maps() {
      Object.values(this.layer_data).forEach(layer => {
        if (layer.project) {
          if (
            !this.map.getSource("MAPSOURCE:" + String(layer.project.uid)) &&
            layer.project.reports &&
            layer.project.reports.orthotiles &&
            layer.project.reports.orthotiles.tile_url
          ) {
            this.map.addSource("MAPSOURCE:" + String(layer.project.uid), {
              type: "raster",
              tiles: [
                `${layer.project.reports.orthotiles.tile_url}/{z}/{x}/{y}.png`
              ],
              tileSize: 256
            });
          }
          if (!this.map.getLayer("MAPLAYER:" + String(layer.project.uid))) {
            this.map.addLayer({
              id: "MAPLAYER:" + String(layer.project.uid),
              type: "raster",
              source: "MAPSOURCE:" + String(layer.project.uid)
            });
          }

          this.map.setLayoutProperty(
            "MAPLAYER:" + String(layer.project.uid),
            "visibility",
            layer.is_map ? "visible" : "none"
          );
        }
      });
    },
    async update_features() {
      if (!this.map.getSource("features_source")) {
        this.map.addSource("features_source", {
          type: "geojson",
          data: {
            features: [],
            type: "FeatureCollection"
          }
        });
      }
      if (this.map.getLayer("features_layer_line"))
        this.map.removeLayer("features_layer_line");

      if (this.map.getLayer("features_layer_fill"))
        this.map.removeLayer("features_layer_fill");

      this.map.addLayer({
        id: "features_layer_fill",
        type: "fill",
        source: "features_source",
        paint: {
          "fill-opacity": 0
        }
      });
      this.map.addLayer({
        id: "features_layer_line",
        type: "line",
        source: "features_source",
        paint: {
          "line-width": 2
        }
      });

      let stops = [];
      this.feature_types.forEach(group => {
        group.featureTypes.forEach(f => {
          stops.push([f.id, f.properties.color || "#222"]);
        });
      });

      stops = stops.sort((a, b) => a[0] - b[0]);

      this.map.setPaintProperty("features_layer_line", "line-color", {
        property: "featureTypeId",
        stops: stops,
        default: "black"
      });
      this.map.setPaintProperty("features_layer_fill", "fill-color", {
        property: "featureTypeId",
        stops: stops,
        default: "black"
      });
      this.map.setPaintProperty("features_layer_fill", "fill-opacity", {
        property: "selected_feature",
        stops: [
          [0, 0],
          [1, 0.5]
        ],
        default: 0
      });

      // this.map.setPaintProperty("features_layer_fill", "fill-opacity", {
      //   property: "selected_feature",
      //   default: 1
      // });

      // update the features
      this.map.getSource("features_source").setData({
        type: "FeatureCollection",
        features: this.all_features
        // .map(f => {
        //   f.properties["selected_feature"] =
        //     f.properties.custom_feature_id == this.selected_feature_id ? 1 : 0;
        //   return f;
        // })
      });
    },
    // Fetch Initial Data
    async getDetails(loading = false) {
      let details;
      if (this.$route.name === "therm-viewer") {
        let res = await viewService
          .get_view({
            id: this.$route.params.id,
            query: "hierarchy=true&users=true&complete=true&projects=true"
          })
          .catch(err => {
            this.handleErrors(err);
            this.is_loading = false;
          });
        details = res.data;
      } else if (this.$route.name === "terra-viewer") {
        details = await terraService
          .get_view_details({ id: this.$route.params.id })
          .catch(err => {
            this.handleErrors(err);
            this.is_loading = false;
          });
      }
      this.details = details;
      if (this.details) {
        this.details.groups.forEach(element => {
          element.projects = element.projects.filter(
            p => !p.properties || !p.properties.is_disabled
          );
        });
      }
    },
    async getFeatureTypes() {
      try {
        if (this.$route.name === "therm-viewer") {
          let data = await viewService
            .get_view_issue_types({
              id: this.$route.params.id,
              query: "hierarchy=true"
            })
            .catch(err => {
              this.handleErrors(err);
              this.is_loading = false;
            });
          this.$store.commit("viewer/SET_FEATURE_TYPES", data);
        } else if (this.$route.name === "terra-viewer") {
          let data = await featureTypeGroupService.get_ftg({
            id: this.$route.params.id
          });
          this.$store.commit("viewer/SET_FEATURE_TYPES", data);
        }
      } catch (err) {
        console.log("Error fetching feature Types...");
      }
    }
  }
};
</script>

<style lang="scss">
#mobile-viewer {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  overflow: hidden;

  .mapboxgl-ctrl-top-right {
    margin-top: 5rem;
  }
  a.mapboxgl-ctrl-logo {
    display: none !important;
  }
  .mapboxgl-ctrl-attrib.mapboxgl-compact {
    display: none;
  }
}

.mobile-viewer {
  &-nav {
    position: fixed;
    z-index: 5;
    background: white;
    width: 100%;
    height: 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
  }
  &-topmenu {
    z-index: 5;
    box-shadow: 0 -10px 30px 0 rgba(0, 0, 0, 0.5);
    background-color: $white;
    position: fixed;
    top: 0;
    width: 100%;

    // border-radius: 1rem 1rem 0 0;
    &__nav {
      // position: fixed;
      z-index: 1;
      background: white;
      width: 100%;
      height: 5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
    }

    &__tabs {
      display: flex;
      border-bottom: 1px solid #c4c4c4;
      &_item {
        width: 50%;
        display: flex;
        justify-content: center;
        padding-bottom: 1rem;
        opacity: 0.5;
        color: $primary-text;
        &.is-active {
          opacity: 1;
          color: $primary;
          border-bottom: 3px solid $primary;
          position: relative;
          top: 1.5px;
        }
      }
    }

    &__raster {
      &__item {
        padding: 1.5rem;
        border-bottom: 1px solid rgba(23, 30, 72, 0.1);
      }
    }
  }
  &-application {
    z-index: 10;
    // box-shadow: 0 -10px 30px 0 rgba(0, 0, 0, 0.5);
    // background-color: $white;
    position: absolute;
    // top: 0;
    bottom: 0;
    width: 100%;
    // min-height: 10rem;
    border-radius: 1rem 1rem 0 0;
    // overflow: auto;

    .app-card-indicator {
      height: 0.4rem;
      width: 6.5rem;
      background-color: #5b607e;
      border-radius: 1rem;
      opacity: 0.2;
      justify-content: center;
      position: relative;
      display: flex;
      margin: 0.7rem auto 1rem;
    }

    &__tabs {
      display: flex;
      border-bottom: 1px solid #c4c4c4;
      &_item {
        width: 50%;
        display: flex;
        justify-content: center;
        padding-bottom: 1rem;
        &.is-active {
          border-bottom: 3px solid $primary;
        }
      }
    }

    &__ticket {
      padding: 1rem 1.5rem 1rem 1.5rem;
      display: flex;
      // border-bottom: 1px solid rgba(0, 0, 0,0.1);
      border-bottom: 1px solid rgba(37, 133, 211, 0.1);

      .terra-mobile-ticket-status {
        height: 1.2rem;
        width: 1.2rem;
        background-color: $completed-status;
        border-radius: 2px;
        margin-right: 1rem;
        margin-top: 0.3rem;
      }

      .terra-mobile-ticket-details {
        width: 100%;
      }
    }
  }
  &-cluster {
    z-index: 9;
    box-shadow: 0 -10px 30px 0 rgba(0, 0, 0, 0.5);
    background-color: $white;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    min-height: 10rem;
    border-radius: 1rem 1rem 0 0;
    overflow: auto;

    .app-card-indicator {
      height: 0.4rem;
      width: 6.5rem;
      background-color: #5b607e;
      border-radius: 1rem;
      opacity: 0.2;
      justify-content: center;
      position: relative;
      display: flex;
      margin: 0.7rem auto 1rem;
    }

    &__content {
      padding: 0.5rem 1.5rem 1rem;
    }

    &__list {
      // padding: 2rem 0;

      &__item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem 0;
        &:first-child {
          border-bottom: 1px solid rgba(37, 133, 211, 0.2);
        }

        &:last-child {
          padding: 1rem 0;
        }
      }
    }
  }
  &-ticket-filter {
    z-index: 9;
    box-shadow: 0 -10px 30px 0 rgba(0, 0, 0, 0.5);
    background-color: $white;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    min-height: 100%;
    overflow: auto;

    &__nav {
      // position: fixed;
      z-index: 1;
      background: white;
      width: 100%;
      height: 5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
    }
    &__content {
      padding: 0 1.5rem;

      &__item {
        padding: 1.5rem 0;
      }
    }
  }
  &-details {
    z-index: 9;
    box-shadow: 0 -10px 30px 0 rgba(0, 0, 0, 0.5);
    background-color: $white;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    min-height: 10rem;
    border-radius: 1rem 1rem 0 0;
    overflow: auto;
    &__add {
      position: absolute;
      z-index: 10;
      right: 1.2rem;
      top: 1.2rem;
    }

    &__details {
      padding: 0 1rem;

      &__header {
        color: $primary-text;
        margin: 0.8rem 0 0.5rem;
      }

      &__subheader {
        color: $new-grey;
      }

      .map-details-status {
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        margin-right: 0.5rem;
        background-color: #fa6a60;
      }
    }
    &__project {
      &__details {
        display: flex;
        padding: 2.4rem 1.6rem;
        border-bottom: 1px solid rgba(23, 30, 72, 0.1);
        .ml-4 {
          margin-left: 4px;
        }
        .project-details {
          width: 50%;

          &__name {
            border-radius: 4px;
            background-color: rgb(92, 126, 247, 0.15);
            padding: 0.6rem 1rem;
            display: inline-block;
            margin-top: 0.5rem;
          }
          &__value {
            border-radius: 4px;
            background-color: #fff;
            padding: 0.6rem 0rem;
            display: inline-block;
            margin-top: 0.5rem;
          }
        }
      }

      &__list {
        // padding-top: 1rem;
        margin: 1rem 1.6rem;
        .project-list__item {
          border-bottom: 1px solid rgba(23, 30, 72, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }
  }
  &-filter {
    z-index: 12;
    // box-shadow: 0 -10px 30px 0 rgba(0, 0, 0, 0.5);
    background-color: $white;
    position: absolute;
    // left: 0;
    bottom: 0;
    width: 100%;
    min-height: 30rem;
    border-radius: 1rem 1rem 0 0;
    overflow: auto;

    .app-card-indicator {
      height: 0.4rem;
      width: 6.5rem;
      background-color: #5b607e;
      border-radius: 1rem;
      opacity: 0.2;
      justify-content: center;
      position: relative;
      display: flex;
      margin: 0.7rem auto 1rem;
    }
    .filter-submit-button {
      margin: 3rem 1.5rem;
    }

    .filter-content {
      padding: 1rem 1.5rem;

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      &__property {
        padding-top: 1.5rem;

        &__search {
          display: flex;
          align-items: center;
          border-bottom: 2px solid rgba(23, 30, 72, 0.1);
          &__icon {
            // position: relative;
            // top: 5px;
            // left: 2px;
          }
          input {
            width: 100%;
            border: 0;
            color: #171e48;
            font-size: 1.4rem;
            // line-height: 3rem;
            // border-bottom: 1px solid rgba(23, 30, 72, 0.01);
            // border-bottom: 2px solid rgba(23, 30, 72, 0.1);
            background-color: #fff;
            margin: 1rem;

            &:focus {
              outline: none;
            }

            &::placeholder {
              color: rgba(23, 30, 72, 0.4);
            }

            &--error {
              border-color: rgba(255, 87, 34, 0.5);
            }
          }
        }
      }
      &__values {
        padding-top: 2rem;

        &__search {
          display: flex;
          align-items: center;
          border-bottom: 2px solid rgba(23, 30, 72, 0.1);
          &__icon {
            position: relative;
            // top: 5px;
            // left: 2px;
          }
          input {
            width: 100%;
            border: 0;
            color: #171e48;
            font-size: 1.4rem;
            // line-height: 3rem;
            // border-bottom: 1px solid rgba(23, 30, 72, 0.01);
            // border-bottom: 2px solid rgba(23, 30, 72, 0.1);
            background-color: #fff;
            margin: 1rem;

            &:focus {
              outline: none;
            }

            &::placeholder {
              color: rgba(23, 30, 72, 0.4);
            }

            &--error {
              border-color: rgba(255, 87, 34, 0.5);
            }
          }
        }
      }
    }
  }
  &-create-ticket {
    z-index: 11;
    // position: absolute;
    // top: 0;
    height: 100%;
    width: 100%;
    
    // border-radius: 1rem 1rem 0 0;
    overflow: auto;

    .create-details {
      padding: 1.5rem;
      // box-shadow: 0 -5px 20px 0 rgba(0, 0, 0, 0.3);
      background-color: $white;
      // min-height: 10rem;
      width: 100%;
      position: absolute;
      bottom: 0;
      height: 18rem;
      &__status {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        background-color: #8e91a7;
        margin-right: 1.5rem;
      }
      &__name {
        width: 100%;
        input {
          width: 100%;
          border: 0;
          color: #171e48;
          font-size: 1.6rem;
          line-height: 3rem;
          border-bottom: 1px solid rgba(23, 30, 72, 0.01);
          background-color: #fff;

          &:focus {
            outline: none;
          }

          &::placeholder {
            color: rgba(23, 30, 72, 0.4);
          }

          &--error {
            border-color: rgba(255, 87, 34, 0.5);
          }
        }
      }

      .status-circle {
        width: 20px;
        height: 20px;
        border-radius: 14px;
        border: solid 1px rgba(91, 96, 126, 0.1);
        background-color: var(--white);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 5px;
      }
    }
  }
}
.terra-close {
  background-color: $primary !important;
}
.terra-fab {
  background-color: $primary;
  height: 3.6rem;
  width: 3.6rem;
  position: absolute;
  bottom: 20px;
  right: 15px;
  z-index: 11;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.duedate-text {
  color: $new-grey;
}
.project-list {
  &:last-child {
    .terra-project {
      align-items: center;
      width: 100%;
      border-bottom: none;
      &__name {
        color: $primary;
      }
    }
  }
  .terra-project {
    // display: flex;
    // justify-content: space-between;
    align-items: center;
    width: 100%;
    border-bottom: 1px solid rgba(37, 133, 211, 0.1);
    &__name {
      color: $primary;
    }
  }
}

.app-card-indicator {
  height: 0.4rem;
  width: 6.5rem;
  background-color: #5b607e;
  border-radius: 1rem;
  opacity: 0.2;
  justify-content: center;
  position: relative;
  display: flex;
  margin: 0.7rem auto 1rem;
}

.filter-dropdown-button {
  height: 4rem;
  margin: 3rem 1.5rem 1.5rem;
  border-radius: 6px;
  box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
  border: solid 1px $primary;
  background-color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary;
  cursor: pointer;
  &:hover {
    background-color: $primary;
    color: $white;
    box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
  }
}
</style>
