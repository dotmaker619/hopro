<template>
  <div class="is-pointer is-relative">
    <div id="mapp"></div>
  </div>
</template>
<script>
import { assetService } from "@/desktop/shared/services/";
import axios from "axios";
export default {
  async mounted() {
    this.$eventHub.$on("update_dashboard", this.init_map);

    this.init_map();
  },
  beforeDestroy() {
    this.$eventHub.$off("update_dashboard", this.init_map);
  },
  methods: {
    async init_map() {
      let self = this;
      let { results } = await assetService.getAll({
        query: "users=true&labels=true",
      });

      let features = results.map((r) => {
        return {
          type: "Feature",
          properties: {
            asset: r,
            description: "" + r.uid,
            id: "ak16821829---" + r.uid,
            mag: 1,
            time: 1504834613166,
            felt: null,
            tsunami: 0,
          },
          geometry: r.location,
        };
      });

      let featuresCollection = { type: "FeatureCollection", features };

      var map = new mapboxgl.Map({
        container: "mapp",
        zoom: 0.3,
        center: [0, 20],
        style: "mapbox://styles/mapbox/light-v10",
      });

      map.addControl(new mapboxgl.NavigationControl());

      // filters for classifying assets into five categories based on magnitude
      var mag1 = ["<", ["get", "mag"], 2];
      var mag2 = ["all", [">=", ["get", "mag"], 2], ["<", ["get", "mag"], 3]];
      var mag3 = ["all", [">=", ["get", "mag"], 3], ["<", ["get", "mag"], 4]];
      var mag4 = ["all", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]];
      var mag5 = [">=", ["get", "mag"], 5];

      // colors to use for the categories
      var colors = ["#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c"];

      map.on("load", function () {
        map.loadImage("/img/icons/asset.png", (error, image) => {
          if (error) throw error;
          map.addImage("asset-image", image);
          // add a clustered GeoJSON source for a sample set of assets
          map.addSource("assets", {
            type: "geojson",
            data: featuresCollection,
            //  "https://docs.mapbox.com/mapbox-gl-js/assets/assets.geojson",
            cluster: false,
            clusterRadius: 80,
            clusterProperties: {
              // keep separate counts for each magnitude category in a cluster
              mag1: ["+", ["case", mag1, 1, 0]],
              mag2: ["+", ["case", mag2, 1, 0]],
              mag3: ["+", ["case", mag3, 1, 0]],
              mag4: ["+", ["case", mag4, 1, 0]],
              mag5: ["+", ["case", mag5, 1, 0]],
            },
          });
          // circle and symbol layers for rendering individual assets (unclustered points)
          // map.addLayer({
          //   id: "asset_circle",
          //   type: "circle",
          //   source: "assets",
          //   filter: ["!=", "cluster", true],
          //   paint: {
          //     "circle-color": [
          //       "case",
          //       mag1,
          //       colors[0],
          //       mag2,
          //       colors[1],
          //       mag3,
          //       colors[2],
          //       mag4,
          //       colors[3],
          //       colors[4]
          //     ],
          //     "circle-opacity": 0.6,
          //     "circle-radius": 12
          //   }
          // });
          map.addLayer({
            id: "asset_label",
            type: "symbol",
            source: "assets",
            filter: ["!=", "cluster", true],
            layout: {
              "icon-image": "asset-image",
              "icon-size": 0.5,
              // "text-field": [
              //   "number-format",
              //   ["get", "mag"],
              //   { "min-fraction-digits": 1, "max-fraction-digits": 1 }
              // ],
              // "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              // "text-size": 10
            },
            paint: {
              "text-color": [
                "case",
                ["<", ["get", "mag"], 3],
                "black",
                "white",
              ],
            },
            "icon-allow-overlap": true,
          });

          // map.on("click", "asset_circle", function(e) {
          //   self.$emit("show_details", e.features[0].properties.asset);
          //   var coordinates = e.features[0].geometry.coordinates.slice();
          //   var description = e.features[0].properties.description;
          //   // alert(JSON.stringify(e.features[0].properties));
          // });
          // objects for caching and keeping track of HTML marker objects (for performance)
          var markers = {};
          var markersOnScreen = {};

          function updateMarkers() {
            var newMarkers = {};
            var features = map.querySourceFeatures("assets");

            // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
            // and add it to the map if it's not there already
            for (var i = 0; i < features.length; i++) {
              var coords = features[i].geometry.coordinates;
              var props = features[i].properties;
              if (!props.cluster) continue;
              var id = props.cluster_id;

              var marker = markers[id];
              if (!marker) {
                var el = createDonutChart(props);
                marker = markers[id] = new mapboxgl.Marker({
                  element: el,
                }).setLngLat(coords);
              }
              newMarkers[id] = marker;
              if (!markersOnScreen[id]) marker.addTo(map);
            }
            // for every marker we've added previously, remove those that are no longer visible
            for (id in markersOnScreen) {
              if (!newMarkers[id]) markersOnScreen[id].remove();
            }
            markersOnScreen = newMarkers;
          }
          // after the GeoJSON data is loaded, update markers on the screen and do so on every map move/moveend
          map.on("data", function (e) {
            if (e.sourceId !== "assets" || !e.isSourceLoaded) return;

            map.on("move", updateMarkers);
            map.on("moveend", updateMarkers);
            updateMarkers();
          });
        });
      });

      // code for creating an SVG donut chart from feature properties
      function createDonutChart(props) {
        var offsets = [];
        var counts = [
          props.mag1,
          props.mag2,
          props.mag3,
          props.mag4,
          props.mag5,
        ];
        var total = 0;
        for (var i = 0; i < counts.length; i++) {
          offsets.push(total);
          total += counts[i];
        }
        var fontSize =
          total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
        var r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
        var r0 = Math.round(r * 0.6);
        var w = r * 2;

        var html =
          '<div><svg width="' +
          w +
          '" height="' +
          w +
          '" viewbox="0 0 ' +
          w +
          " " +
          w +
          '" text-anchor="middle" style="font: ' +
          fontSize +
          'px sans-serif">';

        for (i = 0; i < counts.length; i++) {
          html += donutSegment(
            offsets[i] / total,
            (offsets[i] + counts[i]) / total,
            r,
            r0,
            colors[i]
          );
        }
        html +=
          '<circle cx="' +
          r +
          '" cy="' +
          r +
          '" r="' +
          r0 +
          '" fill="white" /><text dominant-baseline="central" transform="translate(' +
          r +
          ", " +
          r +
          ')">' +
          total.toLocaleString() +
          "</text></svg></div>";
        var el = document.createElement("div");
        el.innerHTML = html;

        return el.firstChild;
      }

      function donutSegment(start, end, r, r0, color) {
        if (end - start === 1) end -= 0.00001;
        var a0 = 2 * Math.PI * (start - 0.25);
        var a1 = 2 * Math.PI * (end - 0.25);
        var x0 = Math.cos(a0),
          y0 = Math.sin(a0);
        var x1 = Math.cos(a1),
          y1 = Math.sin(a1);
        var largeArc = end - start > 0.5 ? 1 : 0;

        return [
          '<path d="M',
          r + r0 * x0,
          r + r0 * y0,
          "L",
          r + r * x0,
          r + r * y0,
          "A",
          r,
          r,
          0,
          largeArc,
          1,
          r + r * x1,
          r + r * y1,
          "L",
          r + r0 * x1,
          r + r0 * y1,
          "A",
          r0,
          r0,
          0,
          largeArc,
          0,
          r + r0 * x0,
          r + r0 * y0,
          '" fill="' + color + '" />',
        ].join(" ");
      }
    },
  },
};
</script>

<style>
#mapp {
  border: 7px solid #fff;
  position: absolute;
  border-radius: 1rem;
  top: 0;
  bottom: 0;
  min-height: 45rem;
  max-height: 45rem;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 3px 5px 0 rgba(23, 30, 72, 0.05);
}
</style>
 
