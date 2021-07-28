<template>
  <div class="create-report has-slimscroll" @keyup.enter="add_report">
    <div class="create-report__header">
      <div class="is-semiBold-20-600-000">{{ graph_title || "Create new report" }}</div>
      <div @click="$emit('close')">
        <sh-icon :name="'close'" class="is-pointer is-18x18"></sh-icon>
      </div>
    </div>
    <div class="create-report__image">
      <sh-icon :name="'report-create'" :file="'report_sprite'" class="is-100x100"></sh-icon>
    </div>
    <div class="create-report__content">
      <div>
        <input v-focus class="create-report__content__input mb-30" type="text" placeholder="Graph Title" v-model="graph_title" />
      </div>
      <div class="create-report__content__axis">
        <div class="create-report__content__axis--item mr-20">
          <div class="is-regular-14-00-00">Field</div>
          <div>
            <div class="is-flex is-between align-center is-pointer bb-1 pb-10" @click="active_x_axis = !active_x_axis">
              <span class="is-medium-16-500-00 is-capitalized">{{ x_axis_filter }}</span>
              <span>
                <sh-icon :name="active_x_axis ? 'expand' : 'collapse'" class="is-16x16 is-pointer"></sh-icon>
              </span>
            </div>
            <div v-if="active_x_axis" class="item-list" v-click-outside="() => (active_x_axis = false)">
              <div
                class="item-list-xaxis is-medium-16-500-00 is-capitalized"
                @click="
                  x_axis_filter = item;
                  active_x_axis = false;
                "
                v-for="(item, index) in xaxis_options"
                :key="index"
              >
                {{ item == "dueDate" ? "due date" : item == "statusUpdatedAt" ? "status updated at" : item }}
              </div>
            </div>
          </div>
        </div>
        <div class="create-report__content__axis--item ml-20">
          <div class="is-regular-14-00-00">Group By</div>
          <div>
            <div class="is-flex is-between align-center is-pointer bb-1 pb-10" @click="active_y_axis = !active_y_axis">
              <span class="is-medium-16-500-00 is-capitalized" :class="{ 'has-text-blue-grey has-opacity-7': !y_axis_filter }">{{
                y_axis_filter ? y_axis_filter : "Select"
              }}</span>
              <span>
                <sh-icon :name="active_y_axis ? 'expand' : 'collapse'" class="is-16x16 is-pointer"></sh-icon>
              </span>
            </div>
            <div v-if="active_y_axis" class="item-list" v-click-outside="() => (active_y_axis = false)">
              <div
                class="item-list-xaxis is-medium-16-500-00 is-capitalized"
                @click="
                  y_axis_filter = item;
                  active_y_axis = false;
                "
                v-for="(item, index) in yaxis_options"
                :key="index"
              >
                {{ item == "dueDate" ? "due date" : item == "statusUpdatedAt" ? "status updated at" : item }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="create-report__content__chart">
        <div class="is-semiBold-16-600-00">Chart Type</div>
        <div class="create-report__content__chart__filter">
          <div
            v-for="(item, index) in chart_type"
            :key="index"
            @click="selected_chart = item.name"
            class="filter--item"
            :class="{ 'is-active': selected_chart == item.name }"
          >
            <sh-icon
              :name="'selected-chart'"
              :file="'report_sprite'"
              class="is-24x24 selected-chart"
              :class="{ 'is-hidden': selected_chart != item.name }"
            ></sh-icon>
            <sh-icon
              :name="`${item.icon}`"
              :file="'report_sprite'"
              class="is-36x36"
              :class="`${selected_chart == item.name ? '' : 'has-opacity-5'}`"
            ></sh-icon>
            <span class="is-medium-14-500-00 mt-10">{{ item.name }}</span>
          </div>
        </div>
      </div>
      <div v-if="selected_chart == 'Horizontal Bar' || selected_chart == 'Vertical Bar'" class="is-flex align-center mt-30">
        <input name="stacked" type="checkbox" class="sh-custom-checkbox" v-model="stacked" />
        <label for="stacked" class="is-medium-14-500-00 ml-5 is-pointer">Stacked</label>
      </div>
      <div>
        <div class="mt-40">
          <div>
            <span class="is-semiBold-16-600-00 mr-15">Add Filters</span>
            <span v-if="is_filter_selected" class="is-medium-14-500-17 has-accent-text is-pointer" @click="reset_filters">Clear All</span>
          </div>
          <div class="is-flex">
            <div class="filter-dropdown-content mr-20 is-half">
              <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
                <div class="is-regular-14-00-00 mb-5">Status</div>
                <div>
                  <all-filter-dropdown
                    :add_icon_on_hover="false"
                    :user_count="3"
                    :is_name_hidden="true"
                    :search_layout="false"
                    :component="'status'"
                    :allFilters="allFiltersData.status"
                    @updateValue="allFiltersData.status = $event"
                  />
                </div>
              </div>
            </div>
            <div class="filter-dropdown-content ml-20 is-half">
              <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
                <div class="is-regular-14-00-00 mb-5">Priority</div>
                <div>
                  <all-filter-dropdown
                    :add_icon_on_hover="false"
                    :user_count="3"
                    :is_name_hidden="true"
                    :search_layout="false"
                    :component="'priority'"
                    :allFilters="allFiltersData.priority"
                    @updateValue="allFiltersData.priority = $event"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="is-flex">
            <div class="filter-dropdown-content mr-20 is-half">
              <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
                <div class="is-regular-14-00-00 mb-5">Assignee</div>
                <div>
                  <user-dropdown
                    :ticket_watchers="allFiltersData.takenUp.map((u) => $store.getters.state_users[u])"
                    @update-watchers="allFiltersData.takenUp = $event.map((e) => e.uid)"
                    :custom_icon="'add-users-teams'"
                    :user_count="4"
                    :no_access="false"
                  ></user-dropdown>
                </div>
              </div>
            </div>
            <div class="filter-dropdown-content ml-20 is-half">
              <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
                <div class="is-regular-14-00-00 mb-5">Due Date</div>
                <div>
                  <duration-dropdown
                    :duration="allFiltersData.duration"
                    @update-duration="allFiltersData.duration = $event"
                    @clear-duration="
                      allFiltersData.duration = null;
                      allFiltersData.dueDateEnd = null;
                      allFiltersData.dueDateStart = null;
                    "
                    @custom-date="custom_date_selection"
                    :dueDate="allFiltersData.dueDateEnd"
                    :startDate="allFiltersData.dueDateStart"
                  ></duration-dropdown>
                </div>
              </div>
            </div>
          </div>
          <div class="is-flex">
            <div class="filter-dropdown-content is-full">
              <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
                <div class="is-regular-14-00-00 mb-5">Tags</div>
                <div>
                  <all-filter-dropdown
                    :add_icon_on_hover="false"
                    :user_count="3"
                    :is_name_hidden="true"
                    :search_layout="true"
                    :component="'tags'"
                    :allFilters="allFiltersData.tags"
                    @updateValue="allFiltersData.tags = $event"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="is-flex">
            <div class="filter-dropdown-content is-full">
              <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
                <div class="is-regular-14-00-00 mb-5">Assets</div>
                <div class="report-create-asset-dropdown">
                  <AssetDropdown :hide_title="true" />
                </div>
              </div>
            </div>
          </div>
          <div></div>
        </div>
        <div @click="add_report" class="create-report__content__btn is-semiBold-16-600-00">{{ existing_card ? "Update Report" : "Add Report" }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import AllFilterDropdown from "@/desktop/tickets/shared/components/filter-card/components/all-filter-dropdown";
  import UserDropdown from "@/desktop/tickets/shared/components/watchers-dropdown";
  import DurationDropdown from "@/desktop/tickets/components/ticket-dashboard/components/reports/components/duration-dropdown";
  import AssetDropdown from "@/desktop/tickets/components/tickets-list/components/tickets-top-filters/components/asset-dropdown";
  import { mapState } from "vuex";
  export default {
    props: ["existing_card", "add_report_filter", "update_report_filter"],
    components: {
      AllFilterDropdown,
      UserDropdown,
      DurationDropdown,
      AssetDropdown,
    },
    data() {
      return {
        active_x_axis: false,
        active_y_axis: false,
        x_axis_filter: "assignee",
        y_axis_filter: null,

        xaxis_options: ["assignee", "priority", "tags", "status", "dueDate", "statusUpdatedAt"],
        yaxis_options: ["assignee", "priority", "tags", "status", "dueDate", "statusUpdatedAt", "None"],
        chart_type: [
          { id: 0, name: "Horizontal Bar", icon: "horizontal-chart-bar" },
          { id: 1, name: "Vertical Bar", icon: "vertical-chart-bar" },
          { id: 2, name: "Pie chart", icon: "piechart" },
          { id: 3, name: "Line chart", icon: "linechart" },
          { id: 4, name: "Scatter", icon: "scatter-chart" },
        ],
        selected_chart: "Horizontal Bar",
        allFiltersData: {
          priority: [],
          status: [],
          takenUp: [],
          tags: [],
          duration: null,
          dueDateEnd: null,
          dueDateStart: null,
        },
        graph_title: "",
        report_filter: {},
        stacked: false,
      };
    },
    created() {
      if (this.existing_card) {
        this.graph_title = this.existing_card.title;
        this.x_axis_filter = this.existing_card.xAxis;
        this.y_axis_filter = this.existing_card.xAxis == this.existing_card.yAxis ? null : this.existing_card.yAxis;
        this.selected_chart = this.existing_card.type_of_graph;
        this.existing_card.stacked ? (this.stacked = this.existing_card.stacked) : null;
        this.allFiltersData.takenUp = this.existing_card.filters.takenUp || [];
        this.allFiltersData.duration = this.existing_card.filters.duration || null;
        this.allFiltersData.priority = this.existing_card.filters.priority || [];
        this.allFiltersData.status = this.existing_card.filters.status || [];
        this.allFiltersData.tags = this.existing_card.filters.tags || [];
        this.allFiltersData["dueDateStart"] = this.existing_card.filters.dueDateStart || null;
        this.allFiltersData["dueDateEnd"] = this.existing_card.filters.dueDateEnd || null;
      }
    },
    computed: {
      ...mapState("tickets", ["selected_asset"]),

      is_filter_selected() {
        if (
          (this.allFiltersData.priority && this.allFiltersData.priority.length) ||
          (this.allFiltersData.status && this.allFiltersData.status.length) ||
          (this.allFiltersData.takenUp && this.allFiltersData.takenUp.length) ||
          // (this.allFiltersData.dueDate && this.allFiltersData.dueDate.length) ||
          this.allFiltersData.duration ||
          (this.allFiltersData.tags && this.allFiltersData.tags.length)
        ) {
          return true;
        } else {
          return false;
        }
      },
    },
    methods: {
      custom_date_selection(date) {
        if (date && date.length == 1) {
          this.allFiltersData["dueDateStart"] = null;
          this.allFiltersData["dueDateEnd"] = new Date(date[0]).toISOString();
        } else if (date.length == 2) {
          this.allFiltersData["dueDateStart"] = new Date(date[0]).toISOString();
          this.allFiltersData["dueDateEnd"] = new Date(date[1]).toISOString();
        }
        this.allFiltersData.duration = "Custom";
      },
      add_report() {
        if (!this.graph_title) {
          this.$toast.show("Title can not be empty", "", this.$store.state.izitoast_options.appError);
          return;
        }

        let filters = {};
        _.forIn(this.allFiltersData, (value, key) => {
          return (filters[key] = value);
        });

        let allFilters = {
          ...{ organization: this.$store.state.current_organization.uid },
          ...{ assetUid: this.selected_asset },

          ...filters,
        };
        this.report_filter = {
          filters: allFilters,
          xAxis: this.x_axis_filter,
          yAxis: this.y_axis_filter && this.y_axis_filter !== "None" ? this.y_axis_filter : this.x_axis_filter,
          title: this.graph_title,
          type_of_graph: this.selected_chart,
          is_grouped: this.y_axis_filter && this.y_axis_filter !== "None" && this.y_axis_filter !== this.x_axis_filter ? true : false,
        };
        if (this.stacked) this.report_filter["stacked"] = true;

        if (this.existing_card) {
          this.update_report_filter(this.report_filter);
        } else {
          this.add_report_filter(this.report_filter);
        }
        this.$emit("close");
      },
      reset_filters() {
        this.$store.commit("tickets/SET_SELECTED_ASSET", []);
        this.allFiltersData = {
          priority: [],
          status: [],
          takenUp: [],
          tags: [],
          dueDate: [],
        };
      },
    },
  };
</script>
<style lang="scss" scoped>
  .create-report {
    height: 80vh;
    overflow: auto;
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2rem 4rem;
    }
    &__image {
      display: flex;
      justify-content: center;
    }
    &__content {
      padding: 0 12rem 4rem;

      &__input {
        width: 100%;
        border: 0;
        color: $primary-text;
        font-size: 1.6rem;
        line-height: 4rem;
        border-bottom: 1px solid rgba(23, 30, 72, 0.1);
        background-color: transparent;

        &:focus {
          outline: none;
        }

        &::placeholder {
          color: rgba(23, 30, 72, 0.4);
        }

        &--error {
          border-color: rgba(255, 87, 34, 0.5);
        }
      }

      &__axis {
        display: flex;
        margin-bottom: 3rem;
        &--item {
          width: 50%;
          position: relative;
          .bb-1 {
            border-bottom: solid 1px rgba(112, 112, 112, 0.15);
          }
          .item-list {
            width: 16.6rem;
            position: absolute;
            box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
            border: solid 1px rgba(23, 30, 72, 0.15);
            background-color: $white;
            border-radius: 0 0 1rem 1rem;
            z-index: 10;
            &-xaxis {
              padding: 1.3rem 1.5rem;
              &:hover {
                cursor: pointer;
                background-color: rgba(92, 126, 247, 0.1);
              }
            }
          }
        }
      }

      &__chart {
        &__filter {
          display: grid;
          grid-gap: 1rem;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 2rem;
          .filter--item {
            height: 8.6rem;
            border-radius: 4px;
            border: solid 1px #dbdce3;
            background-color: $white;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            position: relative;

            &.is-active {
              border: solid 2px $primary;
            }
            .selected-chart {
              position: absolute;
              top: -8px;
              right: -8px;
            }
            &:hover {
              cursor: pointer;
              background-color: rgba(92, 126, 247, 0.05);
            }
          }
        }
      }

      &__btn {
        background-color: $primary;
        height: 5rem;
        border-radius: 6px;
        color: $white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-top: 4rem;
      }
    }
  }
</style>

<style lang="scss" scoped>
  .dropdown {
    box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.16);
    border: solid 1px rgba(23, 30, 72, 0.1);
    background-color: $white;
    position: absolute;
    width: 26rem;
    z-index: 1;
    border-radius: 1rem;
    top: 2.5rem;
    left: 12px;
    display: block;

    &-header {
      padding: 2rem 2rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(23, 30, 72, 0.15);
    }

    &-input {
      margin: 0 2rem;
    }
    &-content {
      padding: 2rem;
    }
  }
  .filter-dropdown-content {
    border-bottom: 1px solid rgba(23, 30, 72, 0.15);
    &__item {
      min-height: 4.2rem;
      padding: 1.5rem 0 1.2rem;
    }
  }

  .filter-dropdown-footer {
    &__item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 2rem 2rem;
      cursor: pointer;
      &:first-child {
        padding: 2rem 2rem 0.5rem 2rem;
      }
      &:last-child {
        padding: 2rem 2rem 0rem;
      }
    }
  }
  .filter-dropdown-button {
    height: 4rem;
    margin: 0 2rem 2rem;
    border-radius: 6px;
    box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
    border: solid 1px $primary;
    background-color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary;
    cursor: pointer;
    &:hover {
      background-color: $primary;
      color: $white;
      box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
    }
  }

  .is-options-list {
    z-index: 10;

    width: 20rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.16);
    border: solid 1px rgba(23, 30, 72, 0.1);
    background-color: $white;
    .input {
      height: 4rem;
    }

    .control.has-icons-left .icon.is-left {
      height: 4rem;
      width: 1.5rem;
    }
    .item--text {
      width: 15ch;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  .add-followers {
    visibility: hidden;
  }
  .selected-filter {
    color: $primary;
  }
  .is-full {
    width: 100%;
  }

  .report-create-asset-dropdown {
    padding-top: 2rem;
  }
</style>
