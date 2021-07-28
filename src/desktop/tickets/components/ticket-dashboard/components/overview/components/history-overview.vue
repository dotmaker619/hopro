<template>
  <div class="ticket-card">
    <div class="ticket-card-options">
      <div class="ticket-card-options__left">
        <sh-icon :name="'ticket-history-recents'" class="is-24x24 mr-5" />
        <div class="is-medium-12-500-14 has-opacity-5">18 hours ago</div>
      </div>
      <div class="ticket-card-options__right">
        <sh-icon :name="'ticket-download'" class="is-24x24 mr-15 is-pointer" />
        <sh-icon :name="'ticket-expand-maximize'" class="is-24x24 is-pointer" />
      </div>
    </div>

    <div class="ticket-card-heading">
      <div class="ticket-card-heading__icon">
        <sh-icon :name="'ticket-card-history'" class="is-50x50" />
      </div>
      <div class="ticket-card-heading__title">
        History
      </div>
      <div class="ticket-card-heading__subtitle">
        <div @click="open_ticket_dropdown = !open_ticket_dropdown" class="ticket-dropdown">
          <span class="option-value is-medium-14-500-17">All</span>
          <sh-icon :name="`${open_ticket_dropdown?'expand':'collapse'}`" class="is-16x16 is-pointer"></sh-icon>
          <ticket-dropdown
            v-if="open_ticket_dropdown"
            v-click-outside="() => (open_ticket_dropdown = false)"
            :dropdown_items="dropdown_items"
          ></ticket-dropdown>
        </div>
      </div>
    </div>

    <div class="ticket-card-history">
      <div v-for="ticket in ticketHistory" :key="ticket" class="ticket-card-history__card is-bottom-border">
        <div class="ticket-card-history__title">
          <div>
            <span class="ticket-card-history__title__text is-semiBold-16-600-19">
              {{ ticket.name }}
            </span>
            <span class="ticket-card-history__title__status is-medium-12-500-14" :class="`status status__${ticket.status.name}`">
              {{ ticket.status ? ticket.status.name : "Pending" }}
            </span>
          </div>
          <div class="is-regular-14-00-17 ticket-card-history__time">
            {{ ticket.updatedAt | prettyDate }}
          </div>
        </div>
        <div>{{ "No description found" }}</div>
      </div>
    </div>

    <div class="ticket-card-showmore is-medium-14-500-17">
      Show more
      <img src="@/assets/icons/tickets/showmore-arrow.png" alt="" />
    </div>
  </div>
</template>

<script>
  import TicketDropdown from "../../../shared/filters/ticket-dropdown";
  import { ticketService } from "@/desktop/shared/services/";
  const queryString = require("query-string");

  export default {
    components: {
      TicketDropdown,
    },
    data() {
      return {
        open_ticket_dropdown: false,
        ticketHistory: [],
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
      this.getHistory();
    },
    methods: {
      async getHistory() {
        let recenty_accessed_tickets;
        let query = {
          pageSize: 5,
          pageNumber: 1,
          sort: "-updatedAt",
        };
        this.$route.query.asset ? (query.assetUid = this.$route.query.asset) : null;
        recenty_accessed_tickets = [...(this.$store.state.RECENTLY_ACCESSED_RESOURCES.tickets || [])];
        let recent_tickets;
        if (recenty_accessed_tickets && recenty_accessed_tickets.length) {
          recent_tickets = recenty_accessed_tickets.map((ticket) => "&ticketUid=" + ticket).join("");
        }
        let { data } = await ticketService
          .getAll({
            query: `${queryString.stringify(query)}${recent_tickets}`,
          })
          .catch((err) => {
            this.handleErrors(err);
          });
        this.ticketHistory = data;
      },
    },
  };
</script>

<style lang="scss"></style>
