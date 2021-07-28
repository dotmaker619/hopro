<template>
  <div class="highchart-chart">
    <div class="is-pulled-right is-flex is-vcenter report-options mr-20">
      <!-- <sh-icon :name="'ticket-download'" class="is-24x24 mr-10 is-pointer" /> -->
      <sh-icon :name="'ticket-expand-maximize'" class="is-24x24 mr-10 is-pointer" @click.native="chart.fullscreen.toggle()" />
      <div class="options-dropdown" v-click-outside="() => (active = false)">
        <sh-icon @click.native="active = !active" :name="'3-dots-menu'" class="is-16x16 is-pointer" />
        <div class="options-dropdown--options" v-if="active">
          <p class="is-regular-16-500-19 is-pointer has-text-centered is-flex is-vcenter pl-20" @click="edit_report_popup">
            <sh-icon @click.native="active = !active" :name="'edit-box'" class="is-16x16 mr-15" />
            <span>Edit</span>
          </p>
          <p class="is-regular-16-500-19 is-pointer has-text-centered is-flex is-vcenter pl-20" @click="$emit('delete-report')">
            <sh-icon @click.native="active = !active" :name="'delete-2'" class="is-16x16 mr-15" />
            <span>Delete</span>
          </p>
        </div>
      </div>
    </div>
    <div :id="index"></div>
  </div>
</template>
<script>
  import { ticketService } from "@/desktop/shared/services/";
  import { mapState } from "vuex";
  import CreateReportComponent from "./create-report-popup";

  export default {
    props: ["card", "index", "width"],
    components: {
      CreateReportComponent,
    },
    data() {
      return {
        chart: null,
        active: false,
        series: null,
        report: null,
        bubble_series: null,
        categories: null,
        status_colors: ["#747891", "#3dd598", "#f79c4b", "#f85859", "#8578cd"],
        priority_colors: ["#08aa4f", "#0ab5ff", "#07c7e0", "#FFA22F", "#FF5722"],
        assignee_colors: ["#A461D8", "#FFA22F", "#FF5722", "#0AB5FF", "#FF01FC"],
        tags_colors: ["#ffa22f", "#ff5722", "#f9306d", "#4169e1", "#7b69ee", "#5f81ff", "#0ab5ff", "#07c7e0", "#07a192", "#2ea62d"],
      };
    },
    created() {
      this.getReport();
    },
    mounted() {
      if (document && document.addEventListener) {
        document.addEventListener("webkitfullscreenchange", this.exitHandler, false);
        document.addEventListener("mozfullscreenchange", this.exitHandler, false);
        document.addEventListener("fullscreenchange", this.exitHandler, false);
        document.addEventListener("MSFullscreenChange", this.exitHandler, false);
      }
    },
    watch: {
      card(new_val, old_val) {
        let is_same = _.isEqual(new_val, old_val);
        if (!is_same) {
          this.getReport();
        }
      },
      selected_asset(new_val, old_val) {
        this.getReport();
      },

      width(new_val, old_val) {
        setTimeout(() => {
          this.chart.reflow();
        }, 1000);
      },
    },

    computed: {
      ...mapState(["TAGS"]),
    },
    beforeDestroy() {
      this.chart = null;
      document.removeEventListener("webkitfullscreenchange", this.exitHandler);
      document.removeEventListener("mozfullscreenchange", this.exitHandler);
      document.removeEventListener("fullscreenchange", this.exitHandler);
      document.removeEventListener("MSFullscreenChange", this.exitHandler);
    },
    methods: {
      exitHandler() {
        if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
          this.plot_chart(this.card.type_of_graph);
        }
      },
      async getReport() {
        if (this.card.filters && this.card.filters.duration) {
          // 1. Convert duration into duedate and startdate
          let endDate;
          let startDate;
          switch (this.card.filters.duration) {
            case "Today":
              startDate = new Date().toISOString();
              break;
            case "Tomorrow":
              endDate = moment().add(1, "days");
              startDate = new Date().toISOString();
              break;
            case "Yesterday":
              startDate = moment().subtract(1, "days");
              endDate = new Date().toISOString();
              break;
            case "Last week":
              startDate = moment().subtract(7, "days");
              endDate = new Date().toISOString();
              break;
            case "Last month":
              startDate = moment().subtract(30, "days");
              endDate = new Date().toISOString();
              break;
            case "Last year":
              startDate = moment().subtract(365, "days");
              endDate = new Date().toISOString();
              break;
            case "Custom":
              startDate = this.card.filters.dueDateStart;
              endDate = this.card.filters.dueDateEnd;
              break;

            default:
              startDate = null;
              endDate = null;
              break;
          }
          // 2.  add dueDate
          this.card.filters["dueDateStart"] = startDate ? new Date(startDate).toISOString() : null;
          this.card.filters["dueDateEnd"] = endDate ? new Date(endDate).toISOString() : null;
          // delete this.card.filters.duration;
          // 3. Proceed
        }
        let body = {
          filters: this.card.filters,
          x: {
            key: this.card.xAxis,
            extract: false,
          },
          y: {
            key: this.card.yAxis,
            extract: false,
          },
        };
        this.report = await ticketService.get_report({ body }).catch((err) => {
          this.handleErrors(err);
        });

        this.add_graph_settings();
      },
      add_graph_settings() {
        if (this.card.xAxis == "assignee") {
          this.categories = this.report.map((el) => this.generate_user_name(el.x));
        } else if (this.card.xAxis == "tags") {
          this.categories = this.report.map((el) => this.generate_tag_name(el.x));
        } else {
          this.categories = this.report.map((el) => el.x);
        }

        //Setting series
        // 1. No Y axis value
        if (!this.card.is_grouped) {
          if (this.card.type_of_graph == "Pie chart") {
            this.series = this.report.map((el) => {
              return {
                name: this.card.xAxis == "assignee" ? this.generate_user_name(el.x) : this.card.xAxis == "tags" ? this.generate_tag_name(el.x) : el.x,
                data: el.y.map((y) => {
                  return {
                    name:
                      this.card.xAxis == "assignee"
                        ? this.generate_user_name(y.type)
                        : this.card.xAxis == "tags"
                        ? this.generate_tag_name(y.type)
                        : y.type,
                    y: y.count,
                  };
                }),
              };
            });
          } else {
            this.series = [
              {
                data: _.flatten(this.report.map((el) => el.y.map((y) => y.count))),
              },
            ];
          }
          // Graph has both x and y values
        } else {
          const anotherEmptyObject = {};
          for (const item of this.report) {
            const { y } = item;
            for (const yItem of y) {
              const { type, count } = yItem;
              const finalType = type === undefined ? "other" : type;
              if (!anotherEmptyObject[finalType]) {
                anotherEmptyObject[finalType] = [];
              }
              anotherEmptyObject[finalType].push(count);
            }
          }

          this.series = Object.keys(anotherEmptyObject).map((key) => {
            return {
              name:
                this.card.yAxis == "assignee"
                  ? this.generate_user_name(key)
                  : this.card.yAxis == "tags"
                  ? key.split(",").map((uid) => (this.TAGS && this.TAGS[uid] ? this.TAGS[uid].name : uid))
                  : key,
              data: anotherEmptyObject[key],
            };
          });
        }
        this.plot_chart(this.card.type_of_graph);
      },
      plot_chart(graph_type) {
        if (Highcharts)
          Highcharts.setOptions({
            colors: this.card.is_grouped
              ? this.card.xAxis == "priority"
                ? this.priority_colors
                : this.card.xAxis == "status"
                ? this.status_colors
                : this.card.xAxis == "assignee"
                ? this.assignee_colors
                : this.tags_colors
              : [...this.assignee_colors, ...this.status_colors, ...this.tags_colors],
            credits: {
              enabled: false,
            },
            lang: {
              noData: "No data to display",
            },
            noData: {
              style: {
                fontWeight: "500",
                fontSize: "18px",
                color: "#171e48",
                fontFamily: "Barlow-Medium",
              },
            },
          });
        if (graph_type == "Scatter") {
          this.bubble_chart_data();
        } else if (graph_type == "Pie chart") {
          if (!this.card.is_grouped) {
            this.simple_pie_chart_data();
          } else {
            this.pie_chart_data();
          }
        } else {
          this.chart_data();
        }
      },
      chart_data() {
        this.chart = Highcharts.chart(this.index, {
          chart: {
            type: this.card.type_of_graph == "Line chart" ? "line" : this.card.type_of_graph == "Vertical Bar" ? "column" : "bar",
          },

          title: {
            text: this.card.title ? this.card.title : "",
            align: "left",
          },
          xAxis: {
            categories: this.categories,
            crosshair: false,
            labels: {
              enabled: true,
            },
          },
          yAxis: {
            crosshair: true,
            min: 0,
            title: {
              text: "",
            },
            stackLabels: {
              enabled: true,
              style: {
                fontWeight: "bold",
                color: (Highcharts.defaultOptions.title.style && Highcharts.defaultOptions.title.style.color) || "gray",
              },
            },
          },
          responsive: {
            rules: [
              {
                condition: {
                  maxWidth: 500,
                },
                chartOptions: {
                  legend: {
                    layout: "horizontal",
                    align: "center",
                    verticalAlign: "bottom",
                  },
                },
              },
            ],
          },
          legend: {
            enabled: this.card.is_grouped ? true : false,
          },
          tooltip: {
            pointFormat: this.card.is_grouped ? "Value: {series.name} <br/>Total: {point.y} " : "Total: {point.y} ",
          },
          plotOptions: {
            series: {
              stacking: this.card.stacked ? "normal" : "",
              dataLabels: {
                enabled: true,
              },
              colorByPoint: this.card.is_grouped ? false : true,
            },
            column: {
              stacking: this.card.stacked ? "normal" : "",
              dataLabels: {
                enabled: true,
              },
            },
          },
          series: this.series,
        });
      },
      pie_chart_data() {
        var colors = Highcharts.getOptions().colors;
        let categories = this.categories;

        let xAxisData = [];
        let yAxisData = [];
        let pieChartData = [];

        for (let i in this.report) {
          pieChartData.push({
            y: this.report.map((el) => el.y.map((d) => d.count))[i].reduce((accumulator, count) => accumulator + count) / 100,
            color: colors[i],
            drilldown: {
              name:
                this.card.xAxis == "assignee"
                  ? this.report.map((el) => this.generate_user_name(el.x))[i]
                  : this.card.xAxis == "tags"
                  ? _.toString(this.generate_tag_name(this.report.map((el) => el.x)[i]))
                  : this.report.map((el) => el.x)[i],
              categories: this.report.map((el) => el.y.map((d) => d.type))[i],
              data: this.report.map((el) => el.y.map((d) => d.count))[i],
            },
          });
        }

        let data = pieChartData;

        let j;
        let dataLen = data.length;
        let drillDataLen;
        let brightness;

        if (categories && categories.length) {
          // Build the data arrays
          for (let i = 0; i < dataLen; i += 1) {
            // add browser data

            xAxisData.push({
              name: this.card.xAxis == "tags" ? this.generate_tag_name(categories[i].x) : categories[i],
              y: data[i].y,
              color: data[i].color,
            });

            // add version data
            drillDataLen = data[i].drilldown.data.length;

            for (j = 0; j < drillDataLen; j += 1) {
              brightness = 0.2 - j / drillDataLen / 5;
              yAxisData.push({
                name:
                  this.card.yAxis == "assignee"
                    ? this.generate_user_name(data[i].drilldown.categories[j])
                    : this.card.yAxis == "tags"
                    ? _.toString(this.generate_tag_name(_.flatten(data[i].drilldown.categories)))
                    : data[i].drilldown.categories[j],

                y: data[i].drilldown.data[j],
                color: Highcharts.color(data[i].color)
                  .brighten(brightness)
                  .get(),
              });
            }
          }
        }

        this.chart = Highcharts.chart(this.index, {
          chart: {
            type: "pie",
          },
          title: {
            text: `<p class="mr-20"> ${this.card.title}</p>`,
            useHTML: true,
            align: "left",
          },
          legend: {
            enabled: true,
          },

          plotOptions: {
            pie: {
              shadow: false,
              center: ["50%", "50%"],
            },
            showInLegend: true,
          },
          tooltip: {
            valueSuffix: "%",
          },

          series: [
            {
              name: this.card.xAxis,
              data: xAxisData,
              size: "50%",
              dataLabels: {
                formatter: function() {
                  return this.y > 5 ? this.point.name : null;
                },
                color: "#ffffff",
                distance: -30,
              },
            },
            {
              name: this.card.yAxis,
              data: yAxisData,
              size: "80%",
              innerSize: "60%",
              dataLabels: {
                formatter: function() {
                  // display only if larger than 1
                  return this.y > 1 ? "<b>" + this.point.name + ":</b> " + this.y + "%" : null;
                },
              },
              id: "versions",
            },
          ],
        });
      },
      simple_pie_chart_data() {
        this.chart = Highcharts.chart(this.index, {
          chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: "pie",
          },
          title: {
            text: this.card.title ? this.card.title : "",
          },
          tooltip: {
            pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
          },
          legend: {
            enabled: true,
          },
          accessibility: {
            point: {
              valueSuffix: "%",
            },
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: "pointer",
              size: 250,
              dataLabels: {
                enabled: true,
                format: "<b>{point.name}</b>: {point.percentage:.1f} %",
              },
            },
            showInLegend: true,
          },
          series: [
            {
              name: this.card.xAxis,
              colorByPoint: true,
              data: _.flatten(this.series.map((el) => el.data)),
            },
          ],
        });
      },
      bubble_chart_data() {
        this.bubble_series = this.report.map((el) => {
          return {
            name: this.card.xAxis == "assignee" ? this.generate_user_name(el.x) : this.card.xAxis == "tags" ? this.generate_tag_name(el.x) : el.x,
            data: el.y.map((y) => {
              return {
                name:
                  this.card.yAxis == "assignee"
                    ? this.generate_user_name(y.type)
                    : this.card.yAxis == "tags"
                    ? this.generate_tag_name(y.type)
                    : y.type,
                value: y.count,
              };
            }),
          };
        });
        this.chart = Highcharts.chart(this.index, {
          chart: {
            type: "packedbubble",
            height: "50%",
          },
          title: {
            text: this.card.title ? this.card.title : "",
            align: "left",
          },
          tooltip: {
            useHTML: true,
            pointFormat: "<b>{point.name}:</b> {point.value}",
          },
          plotOptions: {
            packedbubble: {
              minSize: this.card.is_grouped ? "30%" : "50%",
              maxSize: this.card.is_grouped ? "50%" : "70%",
              zMin: 0,
              zMax: 1000,
              layoutAlgorithm: {
                splitSeries: this.card.is_grouped ? true : false,
                gravitationalConstant: 0.02,
              },
              dataLabels: {
                enabled: true,
                format: "{point.value}",
                filter: {
                  property: "y",
                  operator: ">",
                  value: 20,
                },
                style: {
                  color: "black",
                  textOutline: "none",
                  fontWeight: "normal",
                },
              },
            },
          },
          series: this.bubble_series,
        });
      },
      edit_report_popup() {
        this.$modal.show(
          CreateReportComponent,
          {
            existing_card: this.card,
            update_report_filter: (body) => {
              let new_chart = {
                x: 0,
                y: 0,
                w: 2,
                h: 18,
                i: this.index,
                report: body,
                moved: false,
              };
              this.$emit("update-card", body);
            },
          },
          {
            width: "48%",
            scrollable: false,
            height: "auto",
          }
        );
      },
      generate_user_name(val) {
        return this.$store.getters.state_users[val] && this.$store.getters.state_users[val].first_name
          ? `${this.$store.getters.state_users[val].first_name} ${this.$store.getters.state_users[val].last_name} `
          : this.$store.getters.state_users[val] && this.$store.getters.state_users[val].email
          ? this.$store.getters.state_users[val].email
          : this.$store.getters.state_users[val];
      },
      generate_tag_name(val) {
        return _.flatten(
          val.map((a) => {
            if (this.TAGS && this.TAGS[a]) {
              return this.TAGS[a].name ? this.TAGS[a].name : a;
            } else {
              return a;
            }
          })
        );
      },
    },
  };
</script>
<style lang="scss">
  .options-dropdown {
    position: relative;
    &--options {
      width: 13rem;
      height: 9.6rem;
      border-radius: 1rem;
      box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
      border: solid 1px rgba(23, 30, 72, 0.15);
      background-color: $white;
      position: absolute;
      right: 0;
      top: 2rem;
      z-index: 10;
      :hover {
        background: $pale-white-background;
      }
      p {
        height: calc(9.6rem / 2);
      }
    }
  }
</style>
