<template>
  <div class="ticket-card">
    <div class="ticket-card-options">
      <div
        class="ticket-card-options__left is-pointer"
        @click="getMembers('assignee', 'status', {})"
        @mouseover="refresh = true"
        @mouseleave="refresh = false"
      >
        <sh-icon :name="'ticket-history-recents'" class="is-24x24 mr-5" />
        <div class="is-medium-12-500-14 has-opacity-5 has-text-danger" v-if="refresh">Refresh</div>
        <div class="is-medium-12-500-14 has-opacity-5" v-else>{{ since }} mins ago</div>
      </div>
      <div class="ticket-card-options__right">
        <sh-icon :name="'ticket-download'" class="is-24x24 mr-15 is-pointer is-hidden" />
        <span @click="member_expand()" :class="[!eachCount || !Object.keys(eachCount).length ? 'has-no-access' : null]">
          <sh-icon :name="'ticket-expand-maximize'" class="is-24x24 is-pointer" />
        </span>
      </div>
    </div>

    <div class="ticket-card-heading">
      <div class="ticket-card-heading__icon">
        <sh-icon :name="'ticket-card-members'" class="is-50x50" />
      </div>
      <div class="ticket-card-heading__title ">
        Members
      </div>
      <div class="ticket-card-heading__subtitle">
        <!-- <div :class="`member-status member-status__${member_status}`"></div> Active -->
        <div class="member-state">
          <div :class="`member-status member-status__active`"></div>
        </div>
        <div class="ticket-dropdown">
          <span class="option-value is-medium-14-500-17">All</span>
          <ticket-dropdown
            @filter_selection="add_filter($event)"
            v-if="open_ticket_dropdown"
            v-click-outside="() => (open_ticket_dropdown = false)"
            :dropdown_items="dropdown_items"
          ></ticket-dropdown>
        </div>
      </div>
    </div>
    <div class="ticket-card-member" v-if="eachCount && Object.keys(eachCount).length">
      <div class="ticket-card-member__list" v-for="(stats, user_id, index) in eachCount" :key="user_id">
        <template v-if="index < 7">
          <div class="mr-10 avatar-img" v-if="$store.getters.state_users[user_id]">
            <user-avatar :user="$store.getters.state_users[user_id]" class="is-pointer" :show_tooltip="true" :pxsize="32"></user-avatar>
          </div>

          <div class="ticket-card-member__list__details" v-if="$store.getters.state_users[user_id]">
            <div class="ticket-card-member__list__details__top is-medium-16-500-19">
              <div class="ticket-db-list__details__left">
                <span class="is-capitalized" v-username="$store.getters.state_users[user_id]"></span>
              </div>
              <div class="ticket-db-list__details__right">{{ (stats.closed && stats.closed.count) || 0 }}/{{ stats.total }}</div>
            </div>
            <div class="ticket-card-member__list__details__bottom">
              <ticket-progress
                :total="stats.total"
                :value="(stats.closed && stats.closed.count) || 0"
                :valueClass="'member-progress-value'"
              ></ticket-progress>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div v-else>
      <p class="is-regular-14-500-17 has-text-centered has-opacity-8 py-20">
        No tickets found for the selected filters!
      </p>
    </div>

    <div class="ticket-card-showmore is-medium-14-500-17">
      <span v-if="showmore" class="is-pointer" @click="member_expand()" :class="[!eachCount || !Object.keys(eachCount).length ? 'has-no-access has-text-grey' : null]">
        <span class="mr-10">Show more</span>
        <img src="@/assets/icons/tickets/showmore-arrow.png" alt="" />
      </span>
    </div>
  </div>
</template>

<script>
  import TicketDropdown from "../../../shared/filters/ticket-dropdown";
  import OverviewMixin from "../../../shared/mixins/overview.mixin";
  import TicketProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-progress.vue";

  export default {
    mixins: [OverviewMixin],
    props: ["top_header_query"],
    components: {
      TicketDropdown,
      TicketProgress,
    },
    watch: {
      top_header_query() {
        this.getMembers("assignee", "status", {});
      },
    },
    data() {
      return {
        open_ticket_dropdown: false,
        eachCount: {},
        allMembers: null,
        dropdown_items: [
          { id: "1", name: "All" },
          { id: "2", name: "Active" },
        ],

        ticketMember: [],
        showmore: true,
      };
    },
    created() {
      this.getMembers("assignee", "status", {});
    },

    methods: {
      async getMembers(xkey, ykey, filter) {
        this.eachCount = {};
        this.allMembers = await this.getReport(xkey, ykey, filter);
        if (this.allMembers) {
          this.allMembers.map((item) => {
            if (item.x && this.$store.getters.state_users[item.x]) {
              return (this.eachCount[item.x] = {
                closed: _.remove(item.y, function(y) {
                  return y.type == "closed";
                })[0],
                total: _.sumBy(item.y, function(o) {
                  return o.count;
                }),
              });
            }
          });
        }

        this.eachCount = Object.assign({}, this.eachCount);
      },
      add_filter(e) {
        let filter;
        switch (e) {
          case "Active":
            filter = { "Active": true };
            break;
          default:
            filter = {};
        }
        this.getMembers("assignee", "status", filter);
      },

      member_expand() {
        this.$router.push({ name: "overview-member" });
      },
    },
  };
</script>

<style lang="scss">
  .ticket-card-height {
    // min-height: 500px !important;
    // max-height: 680px !important;
  }

  .member-state {
    height: 1rem;
    width: 1rem;
    background-color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    .member-status {
      width: 6px;
      height: 6px;
      background-color: #00dda4;
      border-radius: 50%;
    }
  }
</style>
