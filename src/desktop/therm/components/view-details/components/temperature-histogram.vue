<template>
  <div>
    <div class="header mb-10">
      <h2 class="is-semiBold-18-600-22">Temperature Histogram</h2>
      <ProjectDropdown :details="details" @change="getData" />
    </div>
    <div class="box" id="temperatureHistogram"></div>
  </div>
</template>
<script>
  import { viewService } from "@/desktop/shared/services/";
  import ProjectDropdown from "./project-dropdown";

  const chart_options = {
    height: 255,
    width: 575,
    xaxis: {
      title: {
        text: "Temperature Difference",
        font: {
          family: "Barlow-Medium",
          size: 15,
          color: "#171e48",
        },
      },
    },
    yaxis: {
      title: {
        text: "# Issues",
        font: {
          family: "Barlow-Medium",
          size: 15,
          color: "#171e48",
        },
      },
    },
    margin: {
      l: 50,
      r: 20,
      b: 40,
      t: 20,
      pad: 4,
    },
  };
  const chart_modalbar_options = {
    modeBarButtonsToRemove: [
      // "zoom2d",
      // "pan2d",
      // "zoomIn2d",
      // "zoomOut2d",
      // "toImage",
      "select2d",
      "lasso2d",
      "autoScale2d",
      "resetScale2d",
      "hoverClosestCartesian",
      "hoverCompareCartesian",
      "zoom3d",
      "pan3d",
      "resetCameraDefault3d",
      "resetCameraLastSave3d",
      "hoverClosest3d",
      "orbitRotation",
      "tableRotation",
      "zoomInGeo",
      "zoomOutGeo",
      "resetGeo",
      "hoverClosestGeo",
      "sendDataToCloud",
      "hoverClosestGl2d",
      "hoverClosestPie",
      "toggleHover",
      "resetViews",
      "toggleSpikelines",
      "resetViewMapbox",
    ],
    responsive: true,
    displaylogo: false,
  };

  export default {
    props: ["details"],
    components: {
      ProjectDropdown,
    },
    mounted() {
      if (document.getElementById("plotly-cdn")) return; // was already loaded
      var scriptTag = document.createElement("script");
      scriptTag.src = "https://cdnjs.cloudflare.com/ajax/libs/plotly.js/1.51.1/plotly.min.js";
      scriptTag.id = "plotly-cdn";
      document.getElementsByTagName("head")[0].appendChild(scriptTag);
    },
    data() {
      return {
        chartData: [
          {
            x: [],
            type: "histogram",
            marker: {
              color: "#5B70FA",
              opacity: 1,
            },
          },
        ],
      };
    },
    created() {
      this.getData();
    },
    methods: {
      async getData(project = "all") {
        if (project == "all") {
          this.chartData[0].x = await viewService.get_view_temperature_data({
            id: this.$route.params.id,
          });
        } else {
          this.chartData[0].x = await viewService.get_view_project_temperature_data({
            id: this.$route.params.id,
            project_id: project,
          });
        }
        Plotly.newPlot("temperatureHistogram", this.chartData, chart_options, chart_modalbar_options);
      },
    },
  };
</script>

<style lang="scss">
  .box {
    .plot-container {
      .svg-container {
        .main-svg {
          position: absolute !important;
        }
      }
    }
  }
</style>
