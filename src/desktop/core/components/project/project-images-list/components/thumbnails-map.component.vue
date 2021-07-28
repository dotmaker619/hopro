<template>
  <div class="columns">
    <div class="column is-8">
      <div id="map"></div>
    </div>
    <div class="column is-4" v-if="report_details && raw_images && active_thumbnail">
      <thumbnail-details
        :image="raw_images[active_thumbnail.key]"
        :details="report_details.datas[active_thumbnail.key]"
      ></thumbnail-details>
    </div>
  </div>
</template>
<script>
import ThumbnailDetails from "./thumnails-details.component";

import axios from "axios";
export default {
  props: ["report_details", "raw_images"],
  components: {
    ThumbnailDetails
  },
  data: function() {
    return {
      active_thumbnail: null,
      map: null
    };
  },
  async mounted() {
    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/satellite-v8",
      center: [10, 10],
      zoom: 10,
      maxZoom: 24,
      attributionControl: false
    });
    let features = [];
    if (this.report_details && this.report_details.datas) {
      features = _.filter(
        Object.keys(this.report_details.datas).map(key => ({ ...this.report_details.datas[key], key })),
        e => e.exif && e.exif.GPSLongitude && e.exif.GPSLatitude
      ).map((image, i) => {
        return {
          type: "Feature",
          id: i,
          geometry: {
            type: "Point",
            coordinates: [
              (image.exif && image.exif.GPSLongitude) || 0,
              (image.exif && image.exif.GPSLatitude) || 0
            ]
          },
          properties: {
            key:image.key,
            filename: image.filename,
            ...(image.misc || {}),
            is_active: 0,
            ...(image.exif || {})
          }
        };
      });
    }

    this.map.on("load", () => {
      this.map.resize();
      this.map.addLayer({
        id: "points",
        type: "circle",
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: features
          }
        },
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

      if (features && features.length) {
        this.map.flyTo({
          center: features[0].geometry.coordinates,
          speed: 2,
          zoom: 16
        });
      }

      this.map.on("click", "points", e => {
        let features = this.map.getSource("points")._data.features.map(f => {
          if (f.id === e.features[0].id) f.properties.is_active = 1;
          else f.properties.is_active = 0;

          return f;
        });

        this.map.getSource("points").setData({
          type: "FeatureCollection",
          features
        });
        this.active_thumbnail = e.features[0].properties;
      });
      // On hover change pointer cursor.
      this.map.on("mouseenter", "points", () => {
        this.map.getCanvas().style.cursor = "pointer";
      });
      this.map.on("mouseleave", "points", () => {
        this.map.getCanvas().style.cursor = "";
      });
    });
  }
};
</script>
<style scoped>
#map {
  width: 100%;
  height: 600px;
}
</style>

