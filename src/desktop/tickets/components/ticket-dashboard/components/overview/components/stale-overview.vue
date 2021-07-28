<template>
  <div class="ticket-card ticket-card-height">
    <div class="ticket-card-options">
      <div class="ticket-card-options__left is-pointer" @click="getStaleTickets()" @mouseover="refresh = true" @mouseleave="refresh = false">
        <sh-icon :name="'ticket-history-recents'" class="is-24x24 mr-5" />
        <div class="is-medium-12-500-14 has-opacity-5 has-text-danger" v-if="refresh">Refresh</div>
        <div class="is-medium-12-500-14 has-opacity-5" v-else>{{ since }} mins ago</div>
      </div>
      <div class="ticket-card-options__right" :class="[!staleTickets || !staleTickets.length ? 'has-no-access' : null]">
        <sh-icon :name="'ticket-download'" class="is-24x24 mr-15 is-pointer is-hidden" />
        <sh-icon
          :name="'ticket-expand-maximize'"
          class="is-24x24 is-pointer"
          @click.native="$router.push({ name: 'filtered-tickets-list', query: { key: 'stale' } })"
        />
      </div>
    </div>

    <div class="ticket-card-heading">
      <div class="ticket-card-heading__icon">
        <sh-icon :name="'ticket-card-stale'" class="is-50x50" />
      </div>
      <div class="ticket-card-heading__title ">
        Stale
      </div>
      <div class="ticket-card-heading__subtitle">
        <div @click="open_ticket_dropdown = !open_ticket_dropdown" class="ticket-dropdown">
          <span class="option-value is-medium-14-500-17">{{ selected }}</span>
          <sh-icon :name="`${open_ticket_dropdown?'expand':'collapse'}`" class="is-16x16 is-pointer"></sh-icon>
          <ticket-dropdown
            @addFilter="
              getStaleTickets($event.query);
              selected = $event.selected;
            "
            :selected_filter="selected"
            v-if="open_ticket_dropdown"
            v-click-outside="() => (open_ticket_dropdown = false)"
            :dropdown_items="dropdown_items"
            :dropdown_sec_items="dropdown_sec_items"
          ></ticket-dropdown>
        </div>
      </div>
    </div>

    <div class="ticket-card-priority" v-if="staleTickets && staleTickets.length">
      <div class="ticket-db-list" v-for="stale in staleTickets" :key="stale.uid">
        <div class="ticket-db-list__details">
          <div class="ticket-db-list__details__topheader is-medium-16-500-19">
            {{ stale.name }}
          </div>
          <div class="ticket-db-list__details__top is-medium-16-500-19">
            <div class="ticket-db-list__details__left">
              <span class="is-medium-12-500-14" :class="`status status__${stale.status.name}`">
                {{ stale.status.name }}
              </span>
            </div>
            <div class="ticket-db-list__details__right">
              <div class="is-flex align-center">
                <span v-if="stale.commentsCount" class="ticket-db-list__details__right__item">
                  <sh-icon :name="'ticket-comments'" class="is-18x18" />
                </span>
                <span v-if="stale.attachmentsCount" class="ticket-db-list__details__right__item">
                  <sh-icon :name="'ticket-attachements'" class="is-18x18" />
                  <span class="ticket-db-list__details__right__item__name">{{ stale.attachmentsCount }}</span>
                </span>
                <span class="ticket-db-list__details__right__item" v-if="stale.checklistsStats">
                  <sh-icon :name="'ticket-checklists'" class="is-18x18" />
                  <span class="ticket-db-list__details__right__item__name">
                    {{ (stale.checklistsStats && stale.checklistsStats.checkedItems) || 0 }}/{{
                      (stale.checklistsStats && stale.checklistsStats.totalItems) || 0
                    }}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div class="ticket-db-list__details__bottom stale-progress" v-if="stale.checklistsStats">
            <ticket-progress
              :total="(stale.checklistsStats && stale.checklistsStats.totalItems) || 0"
              :value="(stale.checklistsStats && stale.checklistsStats.checkedItems) || 0"
              :valueClass="'stale-progress-value'"
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
      :class="[!staleTickets || !staleTickets.length ? 'has-no-access has-text-grey' : null]"
      class="ticket-card-showmore is-medium-14-500-17 is-pointer"
      @click="$router.push({ name: 'filtered-tickets-list', query: { key: 'stale' } })"
    >
      Show more
      <img src="@/assets/icons/tickets/showmore-arrow.png" alt="" />
    </div>
  </div>
</template>

<script>
  import TicketDropdown from "../../../shared/filters/ticket-two-dropdown";
  import { ticketService } from "@/desktop/shared/services/";
  const queryString = require("query-string");
  import TicketProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-progress.vue";

  export default {
    components: {
      TicketDropdown,
      TicketProgress,
    },
    props: ["top_header_query"],
    watch: {
      top_header_query() {
        this.getStaleTickets();
      },
    },
    data() {
      return {
        refresh: false,
        selected: "All | Since Yesterday",
        lastFetchedAt: null,
        now: new Date(),
        open_ticket_dropdown: false,
        staleTickets: null,
        dropdown_items: [
          { id: "1", name: "All" },
          { id: "2", name: "Assigned to me" },
          { id: "3", name: "Assigned by me" },
          { id: "4", name: "Created by me" },
          { id: "5", name: "Watching" },
        ],
        dropdown_sec_items: [
          { id: "1", name: "Since Yesterday" },
          { id: "2", name: "Since Last Week" },
          { id: "3", name: "Since Last Month" },
          { id: "4", name: "Since Last Year" },
        ],
      };
    },
    created() {
      this.getStaleTickets();
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
    methods: {
      async getStaleTickets(filter) {
        this.lastFetchedAt = new Date().toISOString();
        let query = {
          pageSize: 3,
          pageNumber: 1,
          isTemplate: false,
          overdue: true,
          sort: "-updatedAt",
        };

        query = { ...query, ...filter, ...this.top_header_query };
        let { data } = await ticketService
          .getAll({
            query: queryString.stringify(query),
          })
          .catch((err) => {
            this.handleErrors(err);
          });
        this.staleTickets = data;
        this.staleTickets = Object.assign({}, this.staleTickets);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .ticket-card-height {
    // max-height: 680px !important;
  }
  .stale-progress {
    margin-top: 1rem !important;
  }
</style>
