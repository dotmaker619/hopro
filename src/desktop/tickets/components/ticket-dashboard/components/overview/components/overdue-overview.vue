<template>
  <div class="ticket-card ticket-card-height">
    <div class="ticket-card-options">
      <div class="ticket-card-options__left is-pointer" @click="getOverdueTickets()" @mouseover="refresh = true" @mouseleave="refresh = false">
        <sh-icon :name="'ticket-history-recents'" class="is-24x24 mr-5" />
        <div class="is-medium-12-500-14 has-opacity-5 has-text-danger" v-if="refresh">Refresh</div>
        <div class="is-medium-12-500-14 has-opacity-5" v-else>{{ since }} mins ago</div>
      </div>
      <div class="ticket-card-options__right" :class="[!overdueTickets || !overdueTickets.length ? 'has-no-access' : null]">
        <sh-icon :name="'ticket-download'" class="is-24x24 mr-15 is-pointer is-hidden" />
        <sh-icon
          :name="'ticket-expand-maximize'"
          class="is-24x24 is-pointer"
          @click.native="$router.push({ name: 'filtered-tickets-list', query: { key: 'overdue' } })"
        />
      </div>
    </div>

    <div class="ticket-card-heading">
      <div class="ticket-card-heading__icon">
        <sh-icon :name="'ticket-card-overdue'" class="is-50x50" />
      </div>
      <div class="ticket-card-heading__title ">
        Overdue
      </div>
      <div class="ticket-card-heading__subtitle">
        <div @click="open_ticket_dropdown = !open_ticket_dropdown" class="ticket-dropdown">
          <span class="option-value is-medium-14-500-17">{{ filter || "All" }}</span>
          <sh-icon :name="`${open_ticket_dropdown?'expand':'collapse'}`" class="is-16x16 is-pointer"></sh-icon>
          <ticket-dropdown
            @filter_selection="
              filter = $event;
              add_filter();
            "
            :selected_filter="filter"
            v-if="open_ticket_dropdown"
            v-click-outside="() => (open_ticket_dropdown = false)"
            :dropdown_items="dropdown_items"
          ></ticket-dropdown>
        </div>
      </div>
    </div>

    <div class="ticket-card-priority" v-if="overdueTickets && overdueTickets.length">
      <div class="ticket-db-list" v-for="overdue in overdueTickets" :key="overdue.name">
        <div class="ticket-db-list__details">
          <div class="ticket-db-list__details__topheader is-medium-16-500-19">
            {{ overdue.name }}
          </div>
          <div class="ticket-db-list__details__top is-medium-16-500-19">
            <div class="ticket-db-list__details__left">
              <span class="is-medium-12-500-14" :class="`status status__${overdue.status}`">
                {{ status_options[overdue.status-1] }}
              </span>
            </div>
            <div class="ticket-db-list__details__right">
              <div class="is-flex align-center">
                <span v-if="overdue.commentsCount" class="ticket-db-list__details__right__item">
                  <sh-icon :name="'ticket-comments'" class="is-18x18" />
                </span>
                <span v-if="overdue.attachmentsCount" class="ticket-db-list__details__right__item">
                  <sh-icon :name="'ticket-attachements'" class="is-18x18" />
                  <span class="ticket-db-list__details__right__item__name">{{ overdue.attachmentsCount }}</span>
                </span>
                <span class="ticket-db-list__details__right__item">
                  <sh-icon :name="'ticket-checklists'" class="is-18x18" />
                  <span class="ticket-db-list__details__right__item__name">
                    {{ (overdue.checklistsStats && overdue.checklistsStats.checkedItems) || 0 }}/{{
                      (overdue.checklistsStats && overdue.checklistsStats.totalItems) || 0
                    }}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div class="ticket-db-list__details__bottom overdue-progress">
            <ticket-progress
              :total="(overdue.checklistsStats && overdue.checklistsStats.totalItems) || 0"
              :value="(overdue.checklistsStats && overdue.checklistsStats.checkedItems) || 0"
              :valueClass="'overdue-progress-value'"
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
      :class="[!overdueTickets || !overdueTickets.length ? 'has-no-access has-text-grey' : null]"
      class="ticket-card-showmore is-medium-14-500-17 is-pointer"
      @click="$router.push({ name: 'filtered-tickets-list', query: { key: 'overdue' } })"
    >
      Show more
      <img src="@/assets/icons/tickets/showmore-arrow.png" alt="" />
    </div>
  </div>
</template>

<script>
  import TicketDropdown from "../../../shared/filters/ticket-dropdown";
  import { ticketService } from "@/desktop/shared/services/";
  const queryString = require("query-string");
  import TicketProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-progress.vue";

  export default {
    components: {
      TicketDropdown,
      TicketProgress,
    },
    props: ["top_header_query"],
    data() {
      return {
        refresh: false,
        lastFetchedAt: null,
        now: new Date(),
        filter: null,
        open_ticket_dropdown: false,
        overdueTickets: null,
        status_options: ['pending', 'in progress', 'resolved', 'closed', 'rejected'],
        dropdown_items: [
          { id: "1", name: "All" },
          { id: "2", name: "Assigned to me" },
          { id: "3", name: "Assigned by me" },
          { id: "4", name: "Created by me" },
          { id: "5", name: "Watching" },
        ],
      };
    },
    created() {
      this.getOverdueTickets();
      setInterval(() => {
        this.now = Date.now();
      }, 60000);
    },
    computed: {
      since() {
        var a = moment(this.lastFetchedAt);
        var b = moment(this.now);
        return b.diff(a, "minutes");
      },
    },
    watch: {
      top_header_query() {
        this.getOverdueTickets();
      },
    },
    methods: {
      async getOverdueTickets(filter) {
        this.lastFetchedAt = new Date().toISOString();
        let query = {
          pageSize: 3,
          pageNumber: 1,
          isTemplate: false,
          overdue: true,
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
        this.overdueTickets = data;
      },
      add_filter() {
        let query = {};

        switch (this.filter) {
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
        this.getOverdueTickets(query);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .ticket-card-height {
    // max-height: 680px !important;
  }
  .overdue-progress {
    margin-top: 1rem !important;
  }
</style>
