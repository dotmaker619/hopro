<template>
  <div class="ticket-priority-expand">
    <div class="pt-10 mr-10">
      <div class="ticket-overview-options">
        <div class="ticket-overview-options__left">
          <span class="is-flex align-center">
            <sh-icon @click.native="$router.go(-1)" v-if="$route.name != 'overview'" :name="'ticket-header-back'" class="is-16x16 mr-10 is-pointer" />
            <span class="ticket-overview-options__left__title">
              Overview
            </span>
          </span>
        </div>
      </div>
    </div>

    <div class="columns is-gapless">
      <div class="column is-8">
        <div class="ticket-priority-card">
          <div class="ticket-priority-card__header">
            <div class="ticket-priority-card__header__left">
              <sh-icon :name="'ticket-card-priority'" class="is-30x30 mr-10" />
              <span class="ticket-priority-card__header__left__title">Priority</span>
            </div>
            <div class="is-flex-center">
              <div
                class="is-flex-center mr-20 is-pointer"
                @click="getPriority('priority', 'status', {})"
                @mouseover="refresh = true"
                @mouseleave="refresh = false"
              >
                <sh-icon :name="'ticket-history-recents'" class="is-20x20 mr-5" />
                <div class="is-medium-12-500-14 has-opacity-5 has-text-danger" v-if="refresh">Refresh</div>
                <div class="is-medium-12-500-14 has-opacity-5" v-else>{{ since }} mins ago</div>
              </div>
              <div class="is-flex-center  is-not-allowed">
                <sh-icon :name="'ticket-download'" class="is-20x20 mr-5" />
                <div class="is-medium-12-500-14 has-opacity-5 is-not-allowed">Export as CSV</div>
              </div>
            </div>
          </div>
          <div class="ticket-priority-card__content has-slimscroll">
            <div class="ticket-priority-card__content__item" v-for="(priority, index) in eachCount" :key="index">
              <div class="ticket-priority-card__content__item__right">
                <div class="columns is-flex-center is-marginless">
                  <div class="column is-3 is-paddingless">
                    <div class="priority-item-name is-medium-16-500-19">
                      <sh-icon :name="`ticket-priority-${index}`" class="is-16x16 mr-5" />
                      <span class="is-capitalized">
                        {{ index }}
                      </span>
                    </div>
                  </div>
                  <div class="column is-7 is-paddingless">
                    <ticket-multiple-progress :values="priority" @filter_by="filter_ticket_list($event, index)"></ticket-multiple-progress>
                  </div>
                  <div class="column is-2 is-paddingless member-total is-flex align-center is-center mr-5">
                    <sh-icon :name="'ticket-tag-icon'" class="is-20x20 mr-5" />

                    <span class="is-medium-14-500-17"> {{ priority.length ? priority.map((e) => e.count).reduce((a, b) => a + b) : 0 }} </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column is-4 ">
        <div class="ticket-priority-config-card">
          <div class="ticket-priority-config-header">
            Configure
          </div>

          <div>
            <div class="priority-config" v-for="config in priority_config" :key="config">
              <label class="is-flex is-pointer" @click="add_filter(config)">
                <input type="checkbox" class="sh-custom-checkbox" :value="config" v-model="selected_filter" />
                <span class="is-medium-16-500-22 ml-10">{{ config }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column is-12 mt-20">
        <tickets-list :extra_query="extra_query"></tickets-list>
      </div>
    </div>
  </div>
</template>

<script>
  import TicketsList from "@/desktop/tickets/components/tickets-list/tickets-list";

  import OverviewMixin from "../../../shared/mixins/overview.mixin";

  import TicketMultipleProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-multiple-progress";
  export default {
    mixins: [OverviewMixin],
    components: {
      TicketMultipleProgress,
      TicketsList,
    },
    data() {
      return {
        allPriority: [],
        eachCount: {
          "critical": [],
          "medium": [],
          "low": [],
          "high": [],
        },
        priority_config: ["All", "Assigned", "Raised"],
        selected_filter: [],
        extra_query: {},
      };
    },
    created() {
      if (this.$route.query && this.$route.query.filter) {
        let filter = this.$route.query.filter.filter;
        this.selected_filter.push(this.$route.query.filter.key);
        this.add_filter(filter);
      } else {
        this.getPriority("priority", "status", {});
      }
    },
    methods: {
      async getPriority(xkey, ykey, filter) {
        (this.eachCount = {
          "critical": [],
          "medium": [],
          "low": [],
          "high": [],
        }),
          (this.allPriority = await this.getReport(xkey, ykey, filter));
        if (this.allPriority) {
          this.allPriority.map((item) => {
            return (this.eachCount[item.x] = item.y);
          });
        }

        this.eachCount = Object.assign({}, this.eachCount);
      },

      add_filter(e) {
        if (e) {
          this.selected_filter.includes(e) ? (this.selected_filter = _.pull(this.selected_filter, e)) : this.selected_filter.push(e);
        }
        let filter = {};
        if (this.selected_filter.includes("Assigned")) {
          filter["takenUp"] = this.$store.state.claims.user_id;
          this.$store.dispatch("tickets/add_tickets", []);
          this.extra_query["raised"] && !this.selected_filter.includes("raised") ? delete this.extra_query["raised"] : null;
          this.extra_query = { ...this.extra_query, ...filter };
          this.selected_filter = _.pull(this.selected_filter, "All");
        }
        if (this.selected_filter.includes("Raised")) {
          filter["owner"] = this.$store.state.claims.user_id;
          this.$store.dispatch("tickets/add_tickets", []);
          this.extra_query["takenUp"] && !this.selected_filter.includes("Assigned") ? delete this.extra_query["takenUp"] : null;
          this.extra_query = { ...this.extra_query, ...{ raised: this.$store.state.claims.user_id } };
          this.selected_filter = _.pull(this.selected_filter, "All");
        }
        if (e == "All") {
          _.pullAll(this.selected_filter, ["Assigned", "Raised"]);
          for (var keys in filter) delete filter[keys];
          for (var keys in this.extra_query) delete this.extra_query[keys];
        }

        this.getPriority("priority", "status", filter);
        this.extra_query = Object.assign({}, this.extra_query);
      },
      filter_ticket_list(status, priority) {
        this.$store.dispatch("tickets/add_tickets", []);
        let new_query = { status: status, priority: priority, offset: 0 };
        this.extra_query = Object.assign({}, new_query);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .ticket-priority-expand {
    padding: 1rem;
  }

  .ticket-priority-config {
    &-card {
      background-color: $white;
      border-radius: 1rem;
      box-shadow: 0 0 3px 0 rgba(23, 30, 72, 0.2);
      margin: 2rem 1rem 0 1rem;
    }
    &-header {
      border-bottom: 1px solid #f0f1f3;
      padding: 1.5rem 3rem;
      font-family: Barlow-Medium;
      font-size: 18px;
      font-weight: 500;
      line-height: 22px;
      color: $ticket-heading;
    }
  }

  .ticket-priority-card {
    background-color: $white;
    border-radius: 1rem;
    box-shadow: 0 0 3px 0 rgba(23, 30, 72, 0.2);
    margin: 2rem 1rem 0 1rem;
    padding: 1.5rem 1.5rem 3rem 1.5rem;

    &__header {
      display: flex;
      justify-content: space-between;

      &__left {
        display: flex;
        align-items: center;
        &__title {
          font-family: Barlow-Medium !important;
          font-size: 18px !important;
          font-weight: 500 !important;
          line-height: 22px !important;
          color: $ticket-heading;
        }
      }
    }

    &__content {
      max-height: 380px;
      overflow-y: auto;
      &__item {
        display: flex;
        align-items: center;
        padding: 2rem 0 2rem 2.5rem;

        img {
          border-radius: 50%;
        }
        .priority-item-name {
          display: flex;
          align-items: center;
          color: $secondary-text;
          // padding-bottom: 0.5rem;
        }
        .item-desc {
          color: $primary-text;
          opacity: 0.7;
          // min-width: 15rem;
          // max-width: 15rem;
        }

        &__right {
          position: relative;
          width: 100%;
        }
      }
    }
  }
  .member-total {
    text-align: center;
  }
  .priority-config:first-child {
    padding: 2rem 3rem 1rem 3rem;
  }
  .priority-config {
    padding: 1rem 3rem 1rem 3rem;
  }
  .priority-config:last-child {
    padding: 1rem 3rem 2rem 3rem;
  }
</style>
