<template>
  <div>
    <div class="ticket-overview-options">
      <div class="ticket-overview-options__left">
        <span class="is-flex align-center">
          <span class="ticket-overview-options__left__title">Reports</span>
        </span>
      </div>
      <div class="ticket-overview-options__right">
        <span class="add-new-report" @click="create_report_popup()" v-if="reportData && reportData.length">
          <span class="is-semiBold-14-600-17 has-text-blue">Add a Report</span>
        </span>
      </div>
    </div>

    <grid-layout
      v-if="!is_loading && reportData && reportData.length"
      :layout.sync="reportData"
      :col-num="2"
      :row-height="15"
      :is-draggable="true"
      :is-resizable="true"
      :is-mirrored="false"
      :vertical-compact="true"
      :margin="[15, 15]"
      :use-css-transforms="true"
      class="is-relative"
    >
      <!-- @layout-updated="update_data()" -->
      <grid-item v-for="item in reportData" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i" :key="item.i" :minH="15">
        <!-- @resized="update_data()" -->
        <report-graph
          :width="item.w"
          :card="item.report"
          :index="item.i"
          @update-card="update_graph($event, item.i)"
          @delete-report="delete_graph(item.i)"
        ></report-graph>
      </grid-item>
    </grid-layout>
    <div v-else class="no-report-card">
      <img src="@/assets/illustrations/no-report-illustration.svg" alt />
      <span class="mt-30 is-medium-20-500-24 has-primary-text">No Reports</span>
      <div class="add-report is-semiBold-14-600-17" @click="create_report_popup()">Add a Report</div>
    </div>
  </div>
</template>

<script>
  import CreateReportComponent from "./components/create-report-popup";
  import ReportGraph from "./components/report-graph";
  import { ticketService } from "@/desktop/shared/services/";
  import VueGridLayout from "vue-grid-layout";

  export default {
    components: {
      GridLayout: VueGridLayout.GridLayout,
      GridItem: VueGridLayout.GridItem,
      CreateReportComponent,
      ReportGraph,
    },
    data() {
      return {
        reportData: [],
        is_loading: false,
      };
    },
    created() {
      this.get_all_reports();
    },
    mounted() {
      if (document.getElementById("report-highchart")) return; // was already loaded
      var scriptTag = document.createElement("script");
      scriptTag.src = "https://code.highcharts.com/8.2/highcharts.js";
      scriptTag.id = "report-highchart";
      document.getElementsByTagName("head")[0].appendChild(scriptTag);
      if (document.getElementById("report-highchart2")) return; // was already loaded
      var scriptTag2 = document.createElement("script");
      scriptTag2.src = "https://code.highcharts.com/8.2/highcharts-more.js";
      scriptTag2.id = "report-highchart2";
      document.getElementsByTagName("head")[0].appendChild(scriptTag2);
      if (document.getElementById("report-highchart3")) return; // was already loaded
      var scriptTag3 = document.createElement("script");
      scriptTag3.src = "https://code.highcharts.com/8.2/modules/full-screen.js";
      scriptTag3.id = "report-highchart3";
      document.getElementsByTagName("head")[0].appendChild(scriptTag3);
      if (document.getElementById("report-highchart4")) return; // was already loaded
      var scriptTag4 = document.createElement("script");
      scriptTag4.src = "https://code.highcharts.com/8.2/modules/no-data-to-display.js";
      scriptTag4.id = "report-highchart4";
      document.getElementsByTagName("head")[0].appendChild(scriptTag4);
    },

    methods: {
      async get_all_reports() {
        this.is_loading = true;
        let { reportData } = await ticketService.get_chart_reports({}).catch((err) => this.handleErrors);

        this.reportData = [...(reportData || [])];
        this.is_loading = false;
      },
      create_report_popup() {
        this.$modal.show(
          CreateReportComponent,
          {
            add_report_filter: (body) => {
              let id = this.get_uuid();
              if (id) {
                let new_chart = {
                  x: 0,
                  y: 0,
                  w: 2,
                  h: 20,
                  i: _.toString(id),
                  report: body,
                  moved: false,
                };
                this.reportData.push(new_chart);
                let res = ticketService.update_chart_reports({ body: { reportData: this.reportData } }).catch((err) => this.handleErrors);
              }
            },
          },
          {
            width: "48%",
            scrollable: false,
            height: "auto",
          }
        );
      },
      get_uuid() {
        let unique = Math.floor(Math.random() * 1000);

        if (this.reportData && this.reportData.length && _.find(this.reportData, (data) => parseInt(data.i) == unique)) {
          this.get_uuid();
        } else {
          return unique;
        }
      },
      async update_data() {
        let res = await ticketService.update_chart_reports({ body: { reportData: this.reportData } }).catch((err) => this.handleErrors);

        this.reportData = [...(res.data.reportData || [])];
      },
      update_graph(card, index) {
        for (let j = 0; j < this.reportData.length; j++) {
          if (this.reportData[j].i == index) this.reportData[j].report = card;
        }
        this.reportData = Object.assign([], this.reportData);
        this.update_data();
      },
      delete_graph(index) {
        this.reportData = _.remove(this.reportData, (report) => {
          return report.i != index;
        });

        let res = ticketService.update_chart_reports({ body: { reportData: this.reportData } }).catch((err) => this.handleErrors);
      },
      // expand_graph(index) {
      //   for (let j = 0; j < this.reportData.length; j++) {
      //     if (this.reportData[j].i == index) {
      //       this.reportData[j].w == 2 ? (this.reportData[j].w = 1) : (this.reportData[j].w = 2);
      //     }
      //   }
      //   this.reportData = Object.assign([], this.reportData);
      //   this.update_data();
      // },
    },
  };
</script>

<style lang="scss">
  .vue-grid-item.cssTransforms {
    background-color: $white;
    border-radius: 1rem;
    box-shadow: 0 0 3px 0 rgba(23, 30, 72, 0.2);
    padding: 1.5rem;
    &:hover {
      box-shadow: 0 0 10px 0 rgba(37, 133, 211, 0.3);
    }
  }

  .highchart-chart {
    height: auto;
    width: auto;
    position: relative;
    z-index: 1000;
    text-transform: capitalize;
    .report-options {
      visibility: hidden;
      position: absolute;
      z-index: 10000;
      right: 0;
    }
    &:hover {
      .report-options {
        visibility: visible;
      }
    }
  }
  .add-new-report {
    cursor: pointer;
    height: 3.6rem;
    width: 15rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid $primary;
    border-radius: 4px;
    background-color: $white;
    color: $primary;
    margin-left: 2rem;
  }
  .ticket-overview-options {
    margin: 1.5rem 1.5rem 0;
  }

  .highcharts-scrolling {
    &::-webkit-scrollbar {
      width: 0.1rem !important;
      height: 0.3rem !important;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 1rem !important;
      background: rgba(0, 0, 0, 0.2) !important;
    }
  }
  .no-report-card {
    height: 50rem;
    border-radius: 10px;
    box-shadow: 0 0 3px 0 rgba(23, 30, 72, 0.2);
    background-color: $white;
    margin: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .add-report {
      margin-top: 1.3rem;
      width: 141px;
      height: 44px;
      border-radius: 6px;
      box-shadow: 0 2px 5px 0 rgba(37, 133, 211, 0.3);
      border: solid 1px $primary;
      background-color: $white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $primary;
      cursor: pointer;
    }
  }
</style>
