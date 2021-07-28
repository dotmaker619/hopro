<template>
  <div class="ticket-member-expand">
    <div class="pt-10 mr-10">
      <div class="ticket-overview-options">
        <div class="ticket-overview-options__left">
          <span class="is-flex align-center">
            <sh-icon
              @click.native="$router.go(-1)"
              v-if="$route.name != 'overview'"
              :name="'ticket-header-back'"
              class="is-16x16 mr-10 is-pointer"
            />
            <span class="ticket-overview-options__left__title">
              Overview
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="columns is-gapless">
      <div class="column is-8">
        <div class="ticket-member-card">
          <div class="ticket-member-card__header">
            <div class="ticket-member-card__header__left">
              <sh-icon :name="'ticket-card-members'" class="is-30x30 mr-10" />
              <span class="ticket-member-card__header__left__title"
                >Members</span
              >
            </div>
            <div class="is-flex-center">
              <div
                class="is-flex-center mr-20 is-pointer"
                @click="getMembers('assignee', 'status', {})"
                @mouseover="refresh = true"
                @mouseleave="refresh = false"
              >
                <sh-icon
                  :name="'ticket-history-recents'"
                  class="is-20x20 mr-5"
                />
                <div
                  class="is-medium-12-500-14 has-opacity-5 has-text-danger"
                  v-if="refresh"
                >
                  Refresh
                </div>
                <div class="is-medium-12-500-14 has-opacity-5" v-else>
                  {{ since }} mins ago
                </div>
              </div>
              <div
                class="is-flex-center is-pointer is-not-allowed"
                @click="export_csv()"
              >
                <sh-icon :name="'ticket-download'" class="is-20x20 mr-5" />
                <div class="is-medium-12-500-14 has-opacity-5 is-not-allowed">
                  Export as CSV
                </div>
              </div>
            </div>
          </div>
          <div class="ticket-member-card__content has-slimscroll">
            <div
              class="ticket-member-card__content__item"
              v-for="(member, index, eachindex) in eachCount"
              :key="index"
            >
              <div style="width:50px">
                <user-avatar
                  :user="$store.getters.state_users[index]"
                  class="mr-10"
                  :show_tooltip="true"
                ></user-avatar>
              </div>
              <div class="ticket-member-card__content__item__right">
                <div
                  class="item-name is-medium-16-500-19"
                  v-username="$store.getters.state_users[index] ? $store.getters.state_users[index] : null"
                >
                  {{ $store.getters.state_users[index] ? null : "Unknown" }}
                </div>
                <div class="columns is-flex-center is-marginless">
                  <div class="column is-4 is-paddingless">
                    <div class="item-desc is-regular-14-00-17">
                      {{
                        $store.getters.state_users[index] && $store.getters.state_users[index].role
                          ? $store.getters.state_users[index].role
                          : ""
                      }}
                    </div>
                  </div>
                  <div class="column is-6 is-paddingless">
                    <ticket-multiple-progress
                      :values="member"
                      @filter_by="filter_ticket_list($event, index)"
                    ></ticket-multiple-progress>
                  </div>
                  <div
                    class="column is-2 is-paddingless member-total is-flex align-center is-center mr-5"
                  >
                    <sh-icon :name="'ticket-tag-icon'" class="is-20x20 mr-5" />
                    <span class="is-medium-14-500-17"> {{ totalCount[eachindex] }} </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column is-4 ">
        <div class="ticket-member-config-card">
          <div class="ticket-member-config-header">
            Configure
          </div>
          <div>
            <div class="member-config">
              <label class="is-flex is-pointer">
                <input
                  id="all"
                  :checked="filter == 'All'"
                  @click="
                    filter = 'All';
                    add_filter();
                  "
                  type="checkbox"
                  class="sh-custom-checkbox"
                />
                <label for="all" class="is-regular-14-00-22 ml-10">All</label>
              </label>
            </div>
            <div class="member-config">
              <label class="is-flex is-pointer">
                <input
                  :checked="filter == 'Active'"
                  @click="
                    filter = 'Active';
                    add_filter();
                  "
                  type="checkbox"
                  id="active"
                  class="sh-custom-checkbox"
                />
                <label for="active" class="is-medium-16-500-22 ml-10"
                  >Active</label
                >
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
      eachCount: {},
      member_details: null,
      filter: "All",
      extra_query: {},
      totalCount: []
    };
  },
  created() {
    this.getMembers("assignee", "status", {});
  },
  computed: {
    memberTotal() {
      let counts = {};
    },
  },
  methods: {
    async getMembers(xkey, ykey, filter) {
      this.member_details = await this.getReport(xkey, ykey, filter);
      if (this.member_details) {
        this.member_details.map((item) => {
          if (this.$store.getters.state_users[item.x]) {
            this.eachCount[item.x] = item.y;
          }
        });
      }
      this.eachCount = Object.assign({}, this.eachCount);
      let tempcount = this.eachCount;
      Object.values(tempcount).forEach((val) => {
        let membertotal = val.reduce((a, b) => a + b.count, 0);
        this.totalCount.push(membertotal) 
      });
    },
    add_filter() {
      switch (this.filter) {
        case "Active":
          filter = { Active: true };
          break;
        default:
          filter = {};
      }
      this.getMembers("assignee", "status", filter);
    },
    export_csv() {
      //"export";
    },
    filter_ticket_list(status, user) {
      this.$store.dispatch("tickets/add_tickets", []);
      let new_query = { status: status, takenUp: user, offset: 0 };
      this.extra_query = Object.assign({}, new_query);
    },
  },
};
</script>

<style lang="scss" scoped>
.ticket-member-expand {
  padding: 1rem;
}

.ticket-member-config {
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

.ticket-member-card {
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
      padding: 2rem 0 0 2.5rem;

      img {
        border-radius: 50%;
      }
      .item-name {
        color: $secondary-text;
      }
      .item-desc {
        color: $primary-text;
        opacity: 0.7;
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
.member-config:first-child {
  padding: 2rem 3rem 1rem 3rem;
}
.member-config {
  padding: 1rem 3rem 1rem 3rem;
}
.member-config:last-child {
  padding: 1rem 3rem 2rem 3rem;
}
</style>
