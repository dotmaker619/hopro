<template>
    <div id="gcpmap"></div>
</template>
<script>
// import {toLatLon,fromLatLon} from "utm";
import * as utm from "utm";
// import mapboxgl from "mapbox-gl";
// import MapboxDraw from "@mapbox/mapbox-gl-draw";
// import DrawRectangle from "mapbox-gl-draw-rectangle-mode";
import axios from "axios";
export default {
  props: ["process", "gcp"],
  data: function() {
    return {
      map: null,
      draw: null,
      zoneLetter: null,
      zoneNum: null,
      markers: []
    };
  },
  async mounted() {
    let res, token;
    // try {
    //   res = await axios.get(
    //     "https://sensehawk-config.s3.ap-south-1.amazonaws.com/mapbox-gl-token.json"
    //   );
    //   token = res.data.token;
    // } catch (err) {
    //   token = null;
    // }

    // if (!token) mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN;
    // else mapboxgl.accessToken = token;

    this.map = new mapboxgl.Map({
      container: "gcpmap",
      style: "mapbox://styles/mapbox/satellite-v8",
      center: [10, 10],
      zoom: 10,
      maxZoom: 24,
      attributionControl: false
    });
    this.map.on("load", () => {
      this.map.resize();
      // INIT DRAW
      this.calculate_features();
    });
  },
  methods: {
    calculate_features() {
      // Images Features
      let features = [];
      if (this.process && this.process.images && this.process.images.length) {
        for (let image of this.process.images) {
          if (
            !image.exif ||
            !image.exif.GPSLatitude ||
            !image.exif.GPSLongitude
          )
            continue;
          // calculate zones
          let zones = utm.fromLatLon(
            image.exif.GPSLatitude,
            image.exif.GPSLongitude
          );
          this.zoneLetter = zones.zoneLetter;
          this.zoneNum = zones.zoneNum;
          break;
        }

        features = _.filter(
          this.process.images,
          e => e.exif.GPSLongitude && e.exif.GPSLatitude
        ).map((image, i) => {
          return {
            type: "Feature",
            id: i,
            geometry: {
              type: "Point",
              coordinates: [
                image.exif.GPSLongitude || 0,
                image.exif.GPSLatitude || 0
              ]
            },
            properties: {
              filename: image.filename,
              ...(image.misc || {}),
              is_active: 0,
              ...(image.exif || {})
            }
          };
        });
        if (this.map.getLayer("points")) {
          this.map.removeLayer("points");
        }
        if (this.map.getSource("points")) {
          this.map.getSource("points").setData({
            type: "FeatureCollection",
            features: features
          });
        } else {
          this.map.addSource("points", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: features
            }
          });
        }
        this.map.addLayer({
          id: "points",
          source: "points",
          type: "circle",
          paint: {
            "circle-radius": 5,
            "circle-color": "Black",
            "circle-stroke-width": 1.25,
            "circle-stroke-color": [
              "match",
              ["get", "is_active"],
              1,
              "White",
              0,
              "Gray",
              /* other */ "#ccc"
            ]
          }
        });
      }
      // GCP Markers
      let gcp_features = [];
      let is_invalid_gcps = false;
      if (this.gcp && this.gcp.length && this.zoneNum && this.zoneLetter) {
        gcp_features = this.gcp.map((g, i) => {
          try {
            let coordinates = utm.toLatLon(
              g.x,
              g.y,
              this.zoneNum,
              this.zoneLetter
            );
            return {
              type: "Feature",
              id: i,
              geometry: {
                type: "Point",
                coordinates: [
                  coordinates.longitude || 0,
                  coordinates.latitude || 0
                ]
              },
              properties: {
                is_active: 0
              }
            };
          } catch (err) {
            is_invalid_gcps = true;
          }
        });

        if (is_invalid_gcps) {
          this.$toast.show(
            "Invalid GCPs Detected",
            "",
            this.$store.state.izitoast_options.appWarning
          );
        }

        this.markers.forEach(m => {
          m.remove();
        });
        gcp_features.forEach(marker => {
          if (marker && marker.geometry.coordinates) {
            var el = document.createElement("div");
            el.className = "marker";
            this.markers.push(
              new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .addTo(this.map)
            );
          }
        });
      }
      if (gcp_features && gcp_features.length) {
        this.map.flyTo({
          center: gcp_features[0].geometry.coordinates,
          speed: 2,
          zoom: 16
        });
      } else if (features && features.length) {
        this.map.flyTo({
          center: features[0].geometry.coordinates,
          speed: 2,
          zoom: 16
        });
      }
    }
  },
  watch: {
    process: function(val) {
      this.calculate_features();
    },
    gcp: function(val) {
      this.calculate_features();
    }
  }
};
</script>
<style lang="scss">
.marker {
  color: yellow;
  font-weight: bold;
  font-size: 2rem;
  cursor: pointer;
  &::after {
    content: "\002B";
  }
}
#gcpmap {
  width: 100%;
  height: 600px;
  margin-bottom: 2rem;
}
</style>


