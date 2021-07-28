<template>
  <div id="gps">
    <!-- <span class="tag">{{location}}</span> -->
    <sh-icon
      @click.native="fly(location)"
      v-if="active"
      :file="'terra_sprite'"
      :name="'terra-gps-active'"
      class="is-36x36"
    ></sh-icon>
    <sh-icon
      v-else
      @click.native="location_permissions()"
      :file="'terra_sprite'"
      :name="'terra-gps'"
      class="is-36x36"
    ></sh-icon>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      location: null,
      active: false,
      watch_id: null
    };
  },
  computed: {
    ...mapState("viewer", ["map"])
  },
  beforeDestroy() {
    if (this.watch_id) navigator.geolocation.clearWatch(this.watch_id);
  },
  methods: {
    fly(location) {
      this.map.flyTo({
        center: location,
        zoom: 17,
        speed: 5
      });
      this.active = true;
    },

    watch_position() {
      this.watch_id = navigator.geolocation.watchPosition(
        position => {
          var latitude = position.coords.latitude;
          var longitude = position.coords.longitude;
          this.location = [longitude, latitude];
          if (this.map.getSource("gps")) {
            this.map.getSource("gps").setData({
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                  }
                }
              ]
            });
          }
        },
        err => {
          if (err.code == 1) {
            alert("Error: Access is denied!");
          } else if (err.code == 2) {
            alert("Error: Position is unavailable!");
          }
        },
        { enableHighAccuracy: true }
      );
    },
    location_permissions() {
      if (navigator.geolocation) {
        this.current_loc = true;
        navigator.geolocation.getCurrentPosition(
          position => {
            this.add_gps([position.coords.longitude, position.coords.latitude]);
            this.watch_position();
          },
          error => {
            console.log("Location permissions denied");
          }
        );
      }
    },
    add_gps(location) {
      var map = this.map;

      var size = 100;

      // implementation of CustomLayerInterface to draw a pulsing dot icon on the map
      // see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
      var pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),

        // get rendering context for the map canvas when layer is added to the map
        onAdd: function() {
          var canvas = document.createElement("canvas");
          canvas.width = this.width;
          canvas.height = this.height;
          this.context = canvas.getContext("2d");
        },

        // called once before every frame where the icon will be used
        render: function() {
          var duration = 1000;
          var t = (performance.now() % duration) / duration;

          var radius = (size / 2) * 0.3;
          var outerRadius = (size / 2) * 0.7 * t + radius;
          var context = this.context;

          // draw outer circle
          context.clearRect(0, 0, this.width, this.height);
          context.beginPath();
          context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
          );
          context.fillStyle = "rgba(38, 133, 211," + (1 - t) + ")";
          context.fill();

          // draw inner circle
          context.beginPath();
          context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
          context.fillStyle = "rgba(38, 133, 211, 1)";
          context.strokeStyle = "white";
          context.lineWidth = 2 + 4 * (1 - t);
          context.fill();
          context.stroke();

          // update this image's data with data from the canvas
          this.data = context.getImageData(0, 0, this.width, this.height).data;

          // continuously repaint the map, resulting in the smooth animation of the dot
          map.triggerRepaint();

          // return `true` to let the map know that the image was updated
          return true;
        }
      };

      map.addImage("pulsing-dot", pulsingDot, { pixelRatio: 2 });

      map.addSource("gps", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: location
              }
            }
          ]
        }
      });
      map.addLayer({
        id: "gps",
        type: "symbol",
        source: "gps",
        layout: {
          "icon-image": "pulsing-dot"
        }
      });
      this.fly(location);
    },
    remove_gps() {
      this.map.removeImage("pulsing-dot");
      if (this.map.getLayer("gps")) this.map.removeLayer("gps");
      if (this.map.getSource("gps")) this.map.removeSource("gps");
    }
  }
};
</script>
<style lang="scss" scoped>
#gps {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1;
}
</style>