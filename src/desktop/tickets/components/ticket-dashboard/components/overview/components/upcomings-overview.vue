<template>
  <div class="ticket-card ticket-card-height">
    <div class="ticket-card-options">
      <div class="ticket-card-options__left is-pointer" @click="getUpcomingTickets()" @mouseover="refresh = true" @mouseleave="refresh = false">
        <sh-icon :name="'ticket-history-recents'" class="is-24x24 mr-5" />
        <div class="is-medium-12-500-14 has-opacity-5 has-text-danger" v-if="refresh">Refresh</div>
        <div class="is-medium-12-500-14 has-opacity-5" v-else>{{ since }} mins ago</div>
      </div>
      <div class="ticket-card-options__right" :class="[!upcomingTickets || !upcomingTickets.length ? 'has-no-access' : null]">
        <sh-icon :name="'ticket-download'" class="is-24x24 mr-15 is-pointer is-hidden" />
        <sh-icon
          :name="'ticket-expand-maximize'"
          class="is-24x24 is-pointer"
          @click.native="$router.push({ name: 'filtered-tickets-list', query: { key: 'upcoming' } })"
        />
      </div>
    </div>

    <div class="ticket-card-heading">
      <div class="ticket-card-heading__icon">
        <sh-icon :name="'ticket-card-upcomings'" class="is-50x50" />
      </div>
      <div class="ticket-card-heading__title ">
        Upcomings
      </div>
      <div class="ticket-card-heading__subtitle is-medium-14-500-17">
        All
      </div>
    </div>

    <div class="ticket-card-upcomings" v-if="upcomingTickets && upcomingTickets.length">
      <div class="ticket-db-list" v-for="upcoming in upcomingTickets" :key="upcoming.name">
        <div class="ticket-db-list__details">
          <div class="ticket-db-list__details__topheader is-medium-16-500-19">
            {{ upcoming.name }}
          </div>
          <div class="ticket-db-list__details__top is-medium-16-500-19">
            <div class="ticket-db-list__details__left">
              <span class="is-medium-12-500-14" :class="`status status__${upcoming.status.name}`">
                {{ upcoming.status.name }}
              </span>
            </div>
            <div class="ticket-db-list__details__right">
              <div class="is-flex align-center">
                <span v-if="upcoming.commentsCount" class="ticket-db-list__details__right__item">
                  <sh-icon :name="'ticket-comments'" class="is-18x18" />
                </span>
                <span v-if="upcoming.attachmentsCount" class="ticket-db-list__details__right__item">
                  <sh-icon :name="'ticket-attachements'" class="is-18x18" />
                  <span class="ticket-db-list__details__right__item__name">{{ upcoming.attachmentsCount }}</span>
                </span>
                <span class="ticket-db-list__details__right__item">
                  <sh-icon :name="'ticket-checklists'" class="is-18x18" />
                  <span class="ticket-db-list__details__right__item__name">
                    {{ (upcoming.checklistsStats && upcoming.checklistsStats.checkedItems) || 0 }}/{{
                      (upcoming.checklistsStats && upcoming.checklistsStats.totalItems) || 0
                    }}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div class="ticket-db-list__details__bottom upcoming-progress">
            <ticket-progress
              :total="(upcoming.checklistsStats && upcoming.checklistsStats.totalItems) || 0"
              :value="(upcoming.checklistsStats && upcoming.checklistsStats.checkedItems) || 0"
              :valueClass="'upcoming-progress-value'"
            ></ticket-progress>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p class="is-regular-14-500-17 has-text-centered has-opacity-8 py-20">
        No tickets found for the selected filters!
      </p>
    </div>

    <div
      :class="[!upcomingTickets || !upcomingTickets.length ? 'has-no-access has-text-grey' : null]"
      class="ticket-card-showmore is-medium-14-500-17 is-pointer"
      @click="$router.push({ name: 'filtered-tickets-list', query: { key: 'upcoming' } })"
    >
      Show more
      <img src="@/assets/icons/tickets/showmore-arrow.png" alt="" />
    </div>
  </div>
</template>

<script>
  import { ticketService } from "@/desktop/shared/services/";
  const queryString = require("query-string");
  import TicketProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-progress.vue";

  export default {
    components: {TicketProgress,},
    data() {
      return {
        refresh: false,
        lastFetchedAt: null,
        now: new Date(),
        upcomingTickets: null,
      };
    },
    props: ["top_header_query"],
    created() {
      this.getUpcomingTickets();
      setInterval(() => {
        this.now = Date.now();
      }, 60000);
    },
    watch: {
      top_header_query() {
        this.getUpcomingTickets();
      },
    },
    computed: {
      since() {
        var a = moment(this.lastFetchedAt);
        var b = moment(this.now);
        return b.diff(a, "minutes");
      },
    },
    methods: {
      async getUpcomingTickets(filter) {
        this.lastFetchedAt = new Date().toISOString();
        let query = {
          pageSize: 3,
          pageNumber: 1,
          isTemplate: false,
          overdue: false,
          sort: "dueDate",
        };

        query = { ...query, ...filter, ...this.top_header_query };
        let { data } = await ticketService
          .getAll({
            query: queryString.stringify(query),
          })
          .catch((err) => {
            this.handleErrors(err);
          });
        this.upcomingTickets = data;
        this.upcomingTickets = Object.assign({}, this.upcomingTickets);
      },
      add_filter(filter) {
        let query = {};

        switch (filter) {
          case "Assigned to me":
            query = { "takenUp": this.$store.state.claims.user_id };
            break;
          case "Assigned by me":
            query = { "owner": this.$store.state.claims.user_id };
            break;
          case "Created by me":
            query = { "owner": this.$store.state.claims.user_id, "takenUpNot": this.$store.state.claims.user_id };
            break;
          case "Watching":
            query = { "watcher": this.$store.state.claims.user_id };
            break;
          default:
            query = {};
        }
        this.getUpcomingTickets(query);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .ticket-card-height {
    // max-height: 680px !important;
  }
  .upcoming-progress {
    margin-top: 1rem !important;
  }
</style>
