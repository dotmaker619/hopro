<template>
  <div class="columns" style="margin-bottom:0">
    <div class="column is-8" style="padding-bottom:0" :class="{'is-12':preview_data}">
      <div id="map" :style="{'height':preview_data?'435px':'700px'}"></div>
    </div>
  </div>
</template>
<script>


import axios from "axios";

export default {
  props: ["report_details", "raw_images", "preview_data", "missions_data"],
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
    if (this.report_details) {
      features = _.filter(
        Object.values(this.report_details.datas),
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
    } else if (this.preview_data) {
      features = _.filter(
        this.preview_data,
        e => e.GPSLongitude && e.GPSLatitude
      ).map((image, i) => {
        return {
          type: "Feature",
          id: i,
          geometry: {
            type: "Point",
            coordinates: [image.GPSLongitude, image.GPSLatitude]
          },
          properties: {
            filename: image.filename,
            ...(image.misc || {}),
            is_active: 0,
            ...(image || {})
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
      if (this.missions_data) {
        if (this.missions_data.boundary)
          this.map.addLayer({
            id: "mission",
            type: "line",
            source: {
              type: "geojson",
              data: this.missions_data.boundary
            },
            layout: {},
            paint: {
              "line-color": "white",
              "line-width": 3
            }
          });
        if (this.missions_data.details.path)
          this.map.addLayer({
            id: "path",
            type: "line",
            source: {
              type: "geojson",
              data: this.missions_data.details.path
            },
            layout: {},
            paint: {
              "line-color": "#888",
              "line-width": 1
            }
          });
      }

      if (features && features.length) {
        this.map.flyTo({
          center: features[0].geometry.coordinates,
          speed: 2,
          zoom: 16
        });
      } else if (this.missions_data && this.missions_data.boundary) {
        this.map.flyTo({
          center: this.missions_data.boundary.geometry.coordinates[0][0],
          speed: 2,
          zoom: 17
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

