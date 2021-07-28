<template>
  <div>
    <div id="activityTrend"></div>
  </div>
</template>

<script>
  const layout = {
    width: 450,
    height: 310,
    showlegend: true,
    legend: { orientation: "h" },
    margin: {
      l: 30,
      r: 0,
      b: 0,
      t: 40,
      pad: 0,
    },
  };
  const config = {
    responsive: true,
    scrollZoom: false,
    displayModeBar: false,
  };
  export default {
    data() {
      return {
        interval: null,
        graphData: [
          {
            x: ["04/05", "04/12", "04/19", "04/26", "05/03"],
            y: [0, 1, 10, 15, 13, 17],
            mode: "lines+markers",
            name: "Blue",
            showlegend: true,
            line: {
              color: "#0098E0",
              width: 1,
            },
          },
        ],
      };
    },
    mounted() {
      if (document.getElementById("plotly-cdn")) return; // was already loaded
      var scriptTag = document.createElement("script");
      scriptTag.src = "https://cdnjs.cloudflare.com/ajax/libs/plotly.js/1.51.1/plotly.min.js";
      scriptTag.id = "plotly-cdn";
      document.getElementsByTagName("head")[0].appendChild(scriptTag);

      this.data_values();
      this.interval = setInterval(() => {
        this.data_values();
      }, 3000);
    },
    methods: {
      data_values() {
        this.graphData[0].y = [
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 100),
        ];
        Plotly.newPlot("activityTrend", this.graphData, layout, config);
      },
    },
    destroyed() {
      clearInterval(this.interval);
    },
  };
</script>

<style lang="scss" scoped></style>
