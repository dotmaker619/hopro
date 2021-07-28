<template>
  <div class="columns">
    <div class="column is-8" style="height: 560px; width: 100%">
      <div id="imagesmap"></div>
    </div>
    <div class="column is-4" v-if="active_thumbnail">
      <thumbnail-details
        :details="active_thumbnail"
        :image="raw_images[active_thumbnail.filename]"
      ></thumbnail-details>
    </div>
  </div>
</template>
<script>
// import MapboxDraw from "@mapbox/mapbox-gl-draw";
import ThumbnailDetails from "./thumbnail-details";

import axios from "axios";
import { mapState } from "vuex";

export default {
  props: ["report_details", "raw_images"],
  components: {
    ThumbnailDetails,
  },
  data: function () {
    return {
      active_thumbnail: null,
      map: null,
      draw: null,
    };
  },
  computed: {
    ...mapState("processing", ["selected_images"]),
  },
  watch: {
    selected_images() {
      if (this.selected_images.length) {
        let dict = {};
        this.selected_images.forEach((ele) => {
          dict[ele] = ele;
        });
        let featureIds = [];
        this.draw.getAll().features.forEach((element) => {
          if (dict[element.properties.filename]) featureIds.push(element.id);
        });
        this.draw.changeMode("simple_select", { featureIds: featureIds });
      }
    },
  },
  async mounted() {
    this.map = new mapboxgl.Map({
      container: "imagesmap",
      style: "mapbox://styles/mapbox/satellite-v8",
      center: [10, 10],
      zoom: 10,
      maxZoom: 24,
      attributionControl: false,
    });
    let features = [];
    if (this.report_details) {
      features = _.filter(
        Object.keys(this.report_details.datas).map((key) => ({
          ...this.report_details.datas[key],
          key,
        })),
        (e) => e.exif && e.exif.GPSLongitude && e.exif.GPSLatitude
      ).map((image, i) => {
        return {
          type: "Feature",
          id: i,
          geometry: {
            type: "Point",
            coordinates: [
              image.exif.GPSLongitude || 0,
              image.exif.GPSLatitude || 0,
            ],
          },
          properties: {
            filename: image.key,
            ...(image.misc || {}),
            is_active: 0,
            ...(image.exif || {}),
          },
        };
      });
    }
    this.map.on("style.load", () => {
      setInterval(() => {
        this.map.resize();
      }, 1000);
    });
    this.map.on("load", () => {
      // INIT DRAW
      this.map.resize();
      this.draw = new MapboxDraw({
        keybindings: false,
        userProperties: true,
        displayControlsDefault: false,
      });
      this.map.addControl(this.draw);
      // INIT DRAW
      this.draw.set({
        type: "FeatureCollection",
        features: features,
      });
      if (this.selected_images.length) {
        let dict = {};
        this.selected_images.forEach((ele) => {
          dict[ele] = ele;
        });
        let featureIds = [];
        this.draw.getAll().features.forEach((element) => {
          if (dict[element.properties.filename]) featureIds.push(element.id);
        });
        this.draw.changeMode("simple_select", { featureIds: featureIds });
      }

      this.map.on("draw.selectionchange", (e) => {
        let selected_images = e.features.map((f) => {
          return f.properties.filename;
        });
        this.$store.commit("processing/SET_SELECTED_IMAGES", selected_images);

        if (e.features && e.features.length)
          this.active_thumbnail = e.features[0].properties;
        else this.active_thumbnail = null;
      });
      if (features && features.length) {
        this.map.flyTo({
          center: features[0].geometry.coordinates,
          speed: 2,
          zoom: 16,
        });
      }
    });
  },
};
</script>
<style>
#imagesmap {
  width: 100%;
  height: 560px;
}
</style>

