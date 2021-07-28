<template>
  <div>
    <div v-show="has_chart_data">
      <div id="summaryCircle"></div>
    </div>
    <div v-if="!has_chart_data">
      <img src="@/assets/icons/no-chart.svg" alt="" />
    </div>
  </div>
</template>
<script>
  const queryString = require("query-string");
  import { ticketService, userService } from "@/desktop/shared/services/";
  import { mapState, mapActions } from "vuex";

  const chart_layout = {
    title: "",
    height: 200,
    width: 200,
    showlegend: false,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0,
      pad: 0,
    },
  };

  export default {
    data() {
      return {
        has_chart_data: false,

        graph_data: null,
        chart_data: [
          {
            values: [],
            labels: ["Created By", "Assigned", "Wacthing"],
            name: "Summary Chart",
            textinfo: "none",
            hole: 0.65,
            type: "pie",
            // hovertemplate: "label: %{value}",
            hoverinfo: "label+value",
            hoverlabel: {
              bgcolor: "#171E48",
              bordercolor: "#171E48",
              borderradius: "10px",
              font: {
                color: "#fff",
              },
            },
            marker: {
              colors: ["#54CBE0", "#6882FF", "#FFA16C"],
              line: {
                color: "#fff",
                width: 1,
              },
            },
          },
        ],
      };
    },
    created() {
      this.is_chart_loading = true;
      this.getMetrics();
    },
    // mounted() {
    // Plotly.newPlot('summaryCircle', this.chart_data, chart_layout, {displayModeBar: false});
    // this.orgChannel = this.$store.state.PUSHER.subscribe(`private-tickets-org_${this.$store.state.current_organization.uid}`);

    // this.orgChannel.bind("TICKETS_UPDATED", (data) => {
    //   let updatedTickets = data.uids || [];
    //   this.getMetrics();
    // });
    // },
    mounted() {
      if (document.getElementById("plotly-cdn")) return; // was already loaded
      var scriptTag = document.createElement("script");
      scriptTag.src = "https://cdnjs.cloudflare.com/ajax/libs/plotly.js/1.51.1/plotly.min.js";
      scriptTag.id = "plotly-cdn";
      document.getElementsByTagName("head")[0].appendChild(scriptTag);
    },
    methods: {
      async getMetrics() {
        this.graph_data = await ticketService.get_all_metrics({}).catch((err) => this.handleErrors(err));

        if (this.graph_data.owner.total == 0 && this.graph_data.assigned.total == 0 && this.graph_data.watching.total == 0) {
          this.has_chart_data = false;
        } else {
          this.chart_data[0].values = [this.graph_data.owner.total, this.graph_data.assigned.total, this.graph_data.watching.total];
          this.has_chart_data = true;
          let summary = document.getElementById("summaryCircle");

          if (summary) {
            Plotly.newPlot("summaryCircle", this.chart_data, chart_layout, { displayModeBar: false });
          }
        }
      },
    },
  };
</script>
