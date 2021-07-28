<template>
  <div class="summary">
    <div class="summary-title is-medium-20-500-24">Ticket Summary</div>
    <no-result-dashboard-app v-if="!has_app_access('tickets')">
      <img
        slot="image"
        style="width:300px"
        src="@/assets/illustrations/no-permissions-illustration.svg"
        alt
        srcset
      />
      <div slot="title">No Access</div>
      <div slot="button" class="sh-button sh-button--create">Request access</div>
      <div slot="no-result-desc">
        Oops! You don't have enough permissions to access the feature/functionality.
        <br />Your administrator should be able to give access to this feature if registered.
        <br />
        <br />Want this feature to be enabled for your organization?
      </div>
    </no-result-dashboard-app>
    <div v-else class="summary-content">
      <div class="columns">
        <!-- START - TICKET CHART -->
        <div class="column is-paddingless is-3 ticket-chart">
          <div class="summary-content-item">
            <div class="summary-content-item__heading">Tickets Chart</div>

            <!-- START - DONUT GRAPH -->
            <div class="circle">
              <summary-chart></summary-chart>
            </div>
            <!-- END - DONUT GRAPH -->

            <!-- START - GRAPH LEGEND VALUES -->
            <div v-if="chart_data_loading" class="columns">
              <div class="column" v-for="item in 3" :key="item">
                <dashboard-chart-skeleton></dashboard-chart-skeleton>
              </div>
            </div>
            <div v-else class="columns">
              <div class="column" v-for="item in ticketStatusMetrics" :key="item.title">
                <div>
                  <div class="stat-title is-semiBold-14-600-17">{{ item.header }}</div>
                  <div :class="`stat-bar bg-${item.title}`"></div>
                  <div class="stat-count">{{ item.value.total }}</div>
                </div>
              </div>
            </div>
            <!-- END - GRAPH LEGEND VALUES -->
          </div>
        </div>
        <!-- END - TICKET CHART -->

        <!-- START - TICKET STATUS -->
        <div class="column pa-0 is-3 ticket-status">
          <div class="summary-content-item">
            <div class="summary-content-item__heading">Tickets Status</div>

            <div v-if="chart_data_loading" summary-content-item__status>
              <dashboard-status-skeleton></dashboard-status-skeleton>
            </div>

            <div
              v-else
              class="summary-content-item__status"
              v-for="item in ticketStatusMetrics"
              :key="item.title"
            >
              <div>
                <div class="level status-item">
                  <div class="level-left">
                    <div :class="`rect bg-${item.title}`"></div>
                    <div class="is-medium-16-500-19">{{ item.header }}</div>
                  </div>
                  <div class="level-right">
                    <div class="is-medium-16-500-19">{{ item.value.total }}</div>
                  </div>
                </div>
                <div class="summary-content-item__progress">
                  <div v-if="!item.value.total" class="empty-status" @click="empty_tickets()">
                    <div
                      v-tooltip="{ content: `${item.header}` + ': ' + '0' , html: false}"
                      class="empty-status__bar"
                    ></div>
                  </div>
                  <div v-else>
                    <status-progress
                      :first_val="{ name: 'Pending', value: item.value.pending }"
                      :second_val="{ name: 'In Progress', value: item.value.inprogress }"
                      :third_val="{ name: 'Resolved', value: item.value.resolved }"
                      :fourth_val="{ name: 'Closed', value: item.value.closed }"
                      :fifth_val="{ name: 'Rejected', value: item.value.rejected }"
                      @show_status="getData($event, item.title)"
                    ></status-progress>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- END - TICKET STATUS -->

        <!-- START - TOP TICKETS -->
        <div class="column is-paddingless is-6">
          <div class="summary-content-item top-tickets">
            <div class="summary-content-item__heading">Top Tickets</div>
            <div v-if="top_tickets_loading">
              <dashboard-toptickets-skeleton></dashboard-toptickets-skeleton>
            </div>
            <div v-else-if="top_tickets && top_tickets.length">
              <div class="columns mt-15">
                <div class="column summary-content-item__subheading">Ticket Name</div>
                <div class="column summary-content-item__subheading">Assigned to the user</div>
              </div>
              <div v-for="(ticket, i) in top_tickets" :key="i" class="tt is-border-bottom">
                <div
                  :class="`tt-status tt-status__${ticket.status}`"
                >
                {{status_options[ticket.status]}}
                </div>
                <div class="columns">
                  <div class="column">
                    <div
                      class="tt-name is-pointer"
                      @click="show_details(ticket.uid)"
                    >{{ ticket.name }}</div>
                    <div class="tt-duedate" v-if="ticket.dueDate">
                      <span class="tt-duedate__title">Due Date:</span>
                      <span class="tt-duedate__value">{{ ticket.dueDate | sinceDays }}</span>
                    </div>
                    <div class="tt-duedate" v-else>
                      <span class="is-medium-14-500-17 no-assigned">*No Due Date Set</span>
                    </div>
                  </div>
                  <div class="column is-flex is-vcenter tt-assigned">
                    <div v-if="ticket.takenUp && ticket.takenUp.uid">
                      <info-block
                        :info="{
                          name: `${ticket.takenUp.first_name ? ticket.takenUp.first_name + ' ' + ticket.takenUp.last_name : ticket.takenUp.email}`,
                          bottom: ticket.takenUp.email ? ticket.takenUp.email : '*Email not found',
                          name_class: 'is-semiBold-16-500-19',
                          bottom_class: 'is-medium-14-500-17 has-opacity-7 has-text-theme-black is-lowercase mt-5',
                          image: ticket.takenUp.display_picture,
                          type: 'userManagement',
                        }"
                      ></info-block>
                    </div>
                    <div v-else class="is-medium-14-500-17 no-assigned">
                      <i class="far fa-user mr-5"></i>
                      *No Users Assigned
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-tickets">
              <img
                src="@/assets/illustrations/no-top-ticket-illustration.svg"
                class="pt-70 margin-auto is-flex is-center is-vcenter"
                alt
              />
              <div class="is-flex is-center is-medium-20-500-24 pt-20">No Tickets</div>
            </div>
          </div>
        </div>
        <!-- END - TOP TICKETS -->
      </div>
    </div>
  </div>
</template>
<script>
import InfoBlock from "@/desktop/shared/components/info-block";
import StatusProgress from "@/desktop/shared/components/status-progress";
import SummaryChart from "@/desktop/tickets/shared/components/summary-chart";
const queryString = require("query-string");
import { ticketService, userService } from "@/desktop/shared/services/";
import { mapState, mapActions } from "vuex";
import DashboardChartSkeleton from "@/desktop/shared/components/skeleton/dashboard/summary/chart.vue";
import DashboardStatusSkeleton from "@/desktop/shared/components/skeleton/dashboard/summary/status-skeleton.vue";
import TicketDetailsMixin from "@/desktop/shared/mixins/ticket-details.mixin.vue";
import DashboardTopTicketsSkeleton from "@/desktop/shared/components/skeleton/dashboard/summary/top-tickets.vue";
export default {
  mixins: [TicketDetailsMixin],
  data() {
    return {
      top_tickets: null,
      statusMetrics: null,
      ticketStatusMetrics: [],
      chart_data_loading: false,
      top_tickets_loading: false,
      status_options: ['','pending', 'in progress', 'resolved', 'closed', 'rejected'],
    };
  },
  components: {
    InfoBlock,
    StatusProgress,
    SummaryChart,
    DashboardChartSkeleton,
    DashboardStatusSkeleton,
    DashboardTopTicketsSkeleton
  },
  created() {
    if (!this.has_app_access("tickets")) return;

    this.getData(false);
    this.getMetrics();
  },
  methods: {
    show_details(uid) {
      this.open_ticket_details(uid);
    },
    async getMetrics() {
      this.chart_data_loading = true;
      let { owner, assigned, watching } = await ticketService
        .get_all_metrics({})
        .catch(err => {
          this.handleErrors(err);
          this.chart_data_loading = false;
        });
      this.ticketStatusMetrics = [
        {
          header: "Created By",
          title: "owner",
          value: owner
        },
        {
          header: "Assigned",
          title: "assigned",
          value: assigned
        },
        {
          header: "Watching",
          title: "watching",
          value: watching
        }
      ];

      setTimeout(() => {
        this.chart_data_loading = false;
      }, 0);
    },
    async getData(status_value, status_category) {
      this.top_tickets_loading = true;
      let query = {
        pageSize: 3,
        pageNumber: 1,
        tags: true,
        sortPriority: true,
        sort: "asc"
      };

      let { data } = await ticketService
        .getAll({
          query: `${queryString.stringify(query)}${
            status_value ? "&status=" + status_value : ""
          }${
            status_category == "owner"
              ? "&owner=" + this.$store.state.claims.user_id
              : ""
          }${
            status_category == "watching"
              ? "&watchers=" + this.$store.state.claims.user_id
              : ""
          }${
            status_category == "assigned"
              ? "&takenUp=" + this.$store.state.claims.user_id
              : ""
          }`
        })
        .catch(err => {
          this.handleErrors(err);
        });
      this.get_users(data);

      this.top_tickets = _.orderBy(data, status_category);
      this.top_tickets_loading = false;
    },
    get_users(tickets) {
      let all_users = _.keyBy(this.$store.state.users, "uid");
      tickets.forEach(ticket => {
        ticket.takenUp = _.pick(all_users[ticket.takenUp.uid], [
          "first_name",
          "last_name",
          "display_picture",
          "email",
          "uid"
        ]);
      });
    },
    empty_tickets() {
      this.top_tickets = "";
    }
  }
};
</script>
<style lang="scss" scoped>
.bg-owner {
  background-color: $owner !important;
}
.bg-assigned {
  background-color: $assigned !important;
}
.bg-watching {
  background-color: $watching !important;
}
.summary {
  margin: 2rem 1rem;

  &-title {
    margin: 0 0 1.5rem 0;
  }

  &-content {
    background-color: #fff;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05);
    border: solid 1px #eeeeee;
    border-radius: 15px;

    &-item {
      margin: 0rem 2rem 2.5rem 2rem;
      display: flex;
      flex-direction: column;

      &__heading {
        font-family: Barlow-Medium;
        font-size: 18px;
        font-weight: 500;
        line-height: 22px;
        color: #454b6d;
      }

      &__subheading {
        color: #8d95aa;
        font-family: Barlow-Medium;
        font-size: 14px;
        font-weight: 500;
        line-height: 17px;
      }

      &__progress {
        margin: 3rem 0 0rem 0;
      }

      &__status {
        margin: 1.8rem 0;
      }
    }
  }
}

.stat {
  &-title {
    color: #8d95aa;
  }

  &-capitalized::first-letter {
    text-transform: capitalize;
  }

  &-bar {
    margin-top: 0.5rem;
    height: 3px;
    width: 25px;
    border-radius: 50px;
  }

  &-count {
    margin-top: 12px;
    font-family: Barlow-Medium;
    font-size: 16px;
    font-weight: 500;
    line-height: 19px;
    color: #171e48;
  }
}

.status {
  &-item {
    margin: 0;

    &-capitalized::first-letter {
      text-transform: capitalize;
    }
  }

  &-item:first-child {
    margin-top: 2.2rem;
  }
}

.pa-0 {
  padding: 0 !important;
  margin: 0.75rem 0 !important;
}

.tt {
  &:not(:last-child) {
    padding-bottom: 16px;
  }

  &-status {
    display: inline-block;
    font-family: Barlow-Medium;
    font-size: 12px;
    font-weight: 500;
    line-height: 14px;
    text-transform: capitalize;
    padding: 6px 10px;
    border-radius: 18px;
    margin: 15px 0px 5px;
    color: #000;
    background-color: rgba(0, 0, 0, 0.1);

    &__1 {
      color: #f79c4b;
      background-color: rgba(247, 156, 75, 0.1);
    }

    &__2 {
      color: #00D89E;
      background-color: rgba(0, 216, 158,0.1);
    }

    &__3 {
      color: #8678CC;
      background-color: rgba(134, 120, 204, 0.1);
    }

    &__4 {
      color: #727891;
      background-color: rgba(114, 120, 145, 0.1);
    }
    &__5 {
      color: #FF494B;
      background-color: rgba(255, 73, 75, 0.1);
    }
  }

  &-name {
    font-family: Barlow-Medium;
    font-size: 16px;
    font-weight: 500;
    line-height: 19px;
    color: #171e48;
    margin-bottom: 5px;
  }

  &-duedate {
    font-size: 14px;
    line-height: 17px;
    color: #393c42;

    &__title {
      font-family: Barlow-Regular;
      font-weight: normal;
    }

    &__value {
      font-family: Barlow-Medium;
      font-weight: 500;
    }
  }
}

.tt-assigned {
  img {
    height: 40px;
    width: 40px;
    border-radius: 50%;
    margin-right: 10px;
  }
}

.ticket-chart {
  border-right: 1px solid #eeeeee;
  margin: 3.5rem 0 !important;
}

.ticket-status {
  border-right: 1px solid #eeeeee;
  padding: 2.75rem 0 1.25rem !important;
}

.top-tickets {
  // height: 100%;
  margin: 2.5rem 2rem 0rem 2rem;
}

.ticket-unassigned {
  color: #171e48;
  opacity: 0.4;
}

.is-border-bottom:not(:last-child) {
  border-bottom: 1px solid #eeeeee;
}

.circle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 40px;
}

.rect {
  height: 12px;
  width: 12px;
  border-radius: 2px;
  margin-right: 1rem;
}
.no-tickets {
  height: 100%;
}

.no-assigned {
  opacity: 0.9;
  color: #8a8ea3;
}
.empty-status {
  background-color: $white;
  width: 80%;
  opacity: 0.9;
  height: 0.5rem;
  display: flex;
  flex-wrap: nowrap;
  cursor: pointer;

  &__bar {
    width: 100%;
    background: #e9e9e9;
    height: 0.6rem;
    margin: 0 1px;
    border-radius: 1rem;
  }
}
</style>
