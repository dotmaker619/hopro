<template>
  <div>
    <div class="mobile-viewer-rightmenu__icon mobile-viewer-rightmenu__icon-marker">
      <sh-icon
        @click.native="remove_marker()"
        v-if="map_marker_active"
        :file="'terra_sprite'"
        :name="'terra-location-active'"
        class="is-18x18"
      ></sh-icon>
      <sh-icon v-else @click.native="add_marker()" :file="'terra_sprite'" :name="'terra-location'" class="is-18x18"></sh-icon>
    </div>
    <div>
      <swipeable-bottom-sheet
        v-if="map_marker_active"
        class="mobile-viewer-rightmenu__icon-marker-create"
        :openY="0.0"
        :halfY="0.7"
        ref="swipeableBottomSheet"
      >
        <div @click="update_to_geo_location()">
          <sh-icon :file="'terra_sprite'" :name="`terra-gps${current_loc ? '-active' : ''}`" class="is-24x24 is-pulled-right mr-10"></sh-icon>
        </div>
        <CreateNewTicket :element="element" :open_on_create="true" />
      </swipeable-bottom-sheet>
    </div>
  </div>
</template>

<script>
  import { SwipeableBottomSheet } from "@/mobile/shared/components/swipe-bottom-card";
  import CreateNewTicket from "@/desktop/tickets/components/tickets-list/components/create-new-ticket.vue";
  import { mapState } from "vuex";
  export default {
    data() {
      return {
        centroid: [],
        map_marker_active: false,
        current_loc: false,
      };
    },
    components: {
      SwipeableBottomSheet,
      CreateNewTicket,
    },
    computed: {
      ...mapState("viewer", ["map", "layer_data", "active_layer", "cluster_tickets"]),
      element() {
        if (this.layer_data[this.active_layer] && this.layer_data[this.active_layer].project_details) {
          if (_.isString(this.layer_data[this.active_layer].project_details.element))
            return this.layer_data[this.active_layer].project_details.element;

          //  else
          return {
            ...this.layer_data[this.active_layer].project_details.element,
            centroid: this.centroid,
          };
        }
        return null;
      },
    },
    watch: {
      layer_data() {
        if (this.map_marker_active) {
          this.remove_marker();
          this.add_marker(this.centroid, false);
        }
      },
      cluster_tickets() {
        if (this.map_marker_active) {
          this.remove_marker();
          this.add_marker(this.centroid, false);
        }
      },
    },
    beforeDestroy() {
      this.remove_marker();
      this.$eventHub.$off("update_element_data", this.update_element_data);
    },
    created() {
      this.$eventHub.$on("update_element_data", this.update_element_data);
    },
    methods: {
      update_element_data (element) {
        let layer_data = { ...this.layer_data };
        layer_data[this.active_layer].project_details.element = element;
        this.$store.commit("viewer/SET_LAYER_DATA", layer_data);
      },
      remove_marker() {
        if (this.map.getLayer("mapMarker")) this.map.removeLayer("mapMarker");
        if (this.map.getSource("mapMarker")) this.map.removeSource("mapMarker");
        map.removeImage("mapMarker");

        this.map_marker_active = false;
      },
      update_to_geo_location() {
        if (navigator.geolocation) {
          this.current_loc = true;
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.remove_marker();
              this.add_marker([position.coords.longitude, position.coords.latitude]);
            },
            (error) => {
              console.log("Location permissions denied");
            }
          );
        }
      },
      add_marker(centroid, is_fly = true) {
        this.map_marker_active = true;
        if (this.layer_data[this.active_layer] && this.layer_data[this.active_layer].meta && this.layer_data[this.active_layer].meta.center) {
          this.centroid = centroid || this.layer_data[this.active_layer].meta.center.slice(0, 2);
        } else if (
          this.layer_data[this.active_layer] &&
          this.layer_data[this.active_layer].features &&
          this.layer_data[this.active_layer].features.length
        ) {
          let centroid = turf.centroid({
            type: "FeatureCollection",
            features: [this.layer_data[this.active_layer].features[0]],
          });

          this.centroid = centroid.geometry.coordinates;
        }
        let map = this.map;
        let self = this;
        var canvas = map.getCanvasContainer();
        var geojson = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: this.centroid,
              },
            },
          ],
        };
        map.loadImage("/img/icons/map-marker.png", (error, image) => {
          if (error) {
            console.log("Imaage exists");
            //   throw error
          } else {
            map.addImage("mapMarker", image);
          }

          // map.on("load", function() {
          // Add a single point to the map
          if (is_fly)
            this.map.flyTo({
              center: this.centroid,
              zoom: 17,
              speed: 5,
            });
          function onMove(e) {
            var coords = e.lngLat;

            // Set a UI indicator for dragging.
            canvas.style.cursor = "grabbing";

            // Update the Point feature in `geojson` coordinates
            // and call setData to the source layer `point` on it.
            geojson.features[0].geometry.coordinates = [coords.lng, coords.lat];
            self.centroid = geojson.features[0].geometry.coordinates;
            map.getSource("mapMarker").setData(geojson);
          }

          function onUp(e) {
            var coords = e.lngLat;

            // Print the coordinates of where the point had
            // finished being dragged to on the map.
            //   coordinates.style.display = "block";
            //   coordinates.innerHTML =
            // "Longitude: " + coords.lng + "<br />Latitude: " + coords.lat;
            //   canvas.style.cursor = "";

            // Unbind mouse/touch events
            map.off("mousemove", onMove);
            map.off("touchmove", onMove);
          }
          map.addSource("mapMarker", {
            type: "geojson",
            data: geojson,
          });
          // if (
          //   map.getLayer("features_layer_line") ||
          //   map.getLayer("asset_label")
          // ) {
          //   alert("hii")
          //   map.addLayer(
          //     {
          //       id: "mapMarker",
          //       type: "symbol",
          //       source: "mapMarker",
          //       layout: {
          //         "icon-image": "mapMarker",
          //         "icon-size": 1
          //       }
          //     },
          //     map.getLayer("asset_label") ? "asset_label" : "features_layer_line"
          //   );
          // } else {
          map.addLayer({
            id: "mapMarker",
            type: "symbol",
            source: "mapMarker",
            layout: {
              "icon-image": "mapMarker",
              "icon-size": 1,
            },
          });
          // }

          // When the cursor enters a feature in the point layer, prepare for dragging.
          map.on("mouseenter", "mapMarker", function() {
            map.setPaintProperty("mapMarker", "circle-color", "#3bb2d0");
            canvas.style.cursor = "move";
          });

          map.on("mouseleave", "mapMarker", function() {
            map.setPaintProperty("mapMarker", "circle-color", "#3887be");
            canvas.style.cursor = "";
          });

          map.on("mousedown", "mapMarker", function(e) {
            // Prevent the default map drag behavior.
            e.preventDefault();

            canvas.style.cursor = "grab";

            map.on("mousemove", onMove);
            map.once("mouseup", onUp);
          });

          map.on("touchstart", "mapMarker", function(e) {
            if (e.points.length !== 1) return;

            // Prevent the default map drag behavior.
            e.preventDefault();

            map.on("touchmove", onMove);
            map.once("touchend", onUp);
          });
          map.on("click", (e) => {
            this.map_marker_active = false;
            this.remove_marker();
          });
        });
      },
    },
  };
</script>

<style lang="scss">
  .mobile-viewer-rightmenu__icon-marker-create {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 8;
    height: 23rem;
  }
</style>
