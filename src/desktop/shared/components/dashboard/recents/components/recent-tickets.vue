<template>
  <div>
    <div class="mb-20 bulk-recent-actions">
      <bulk-actions-bar></bulk-actions-bar>
    </div>
    <div class="tickets-main-section">
      <div class="tickets-main-section--columns is-vcenter">
        <ticket-headers :sorting_key="sort_key" @update_sort_key="sort_key = $event"></ticket-headers>
      </div>
    </div>
    <div v-if="sorted_tickets.length">
      <div v-for="item in sorted_tickets" :key="item.uid">
        <tickets-list-item :ticket="item"></tickets-list-item>
      </div>
    </div>
    <div v-else>
      <div class="has-text-centered mb-10" v-if="isTicketsLoading">
        <tickets-list-skeleton></tickets-list-skeleton>
      </div>
      <no-results v-else>
        <img slot="image" src="@/assets/illustrations/tickets-illustration.svg" alt />
      </no-results>
    </div>
  </div>
</template>

<script>
  import BulkActionsBar from "@/desktop/tickets/shared/components/bulk-actions";
  import TicketsListItem from "@/desktop/tickets/components/tickets-list/components/tickets-list-item";
  import { mapState, mapActions, mapGetters } from "vuex";
  import TicketHeaders from "@/desktop/tickets/components/tickets-list/components/ticket-headers";
  import { ticketService, assetService } from "@/desktop/shared/services/";
  import TicketsListSkeleton from "@/desktop/shared/components/skeleton/tickets/tickets-list-skeleton.vue";
  import OrderMixin from "@/desktop/shared/mixins/order.mixin.vue";
  const queryString = require("query-string");

  export default {
    components: {
      TicketsListSkeleton,
    },
    mixins: [OrderMixin],
    data() {
      return {
        sort_key: null,
        data: [],
        isTicketsLoading: true,
        orgChannel: null,
      };
    },
    components: {
      BulkActionsBar,
      TicketsListItem,
      TicketHeaders,
    },
    beforeDestroy() {
      this.$store.dispatch("tickets/add_tickets", []);
      document.removeEventListener("keyup", this.clear_selected_tickets);
    },
    created() {
      if (!this.has_app_access("tickets")) return;

      this.$store.state.firebase_database
        .ref(`/userProfile/${this.$store.state.claims.user_id}/organizations/${this.$store.state.current_organization.uid}/recentlyAccessed/tickets/`)
        .once("value", (snapshot) => {
          this.getData(snapshot.val() || []);
        });
      document.addEventListener("keyup", this.clear_selected_tickets);
    },
    computed: {
      ...mapState("tickets", ["is_internal", "selected", "tickets"]),
      ...mapState(["PUSHER", "current_organization"]),
      sorted_tickets() {
        if (!this.sort_key) return this.tickets;
        let sort_by;
        let order = this.sort_key.startsWith("-") ? "desc" : "asc";
        let key = this.sort_key.startsWith("-") ? this.sort_key.slice(1, this.sort_key.length) : this.sort_key;
        switch (key) {
          case "name":
            sort_by = "name";
            break;
          case "raised":
            sort_by = "owner.uid";
            break;
          case "priority":
            sort_by = "priority.value";
            break;
          case "assignee":
            sort_by = "takenUp.uid";
            break;
          case "progress":
            sort_by = "meta.itemsChecked";
            break;
          case "tasks":
            sort_by = "meta.itemsChecked";
            break;
          case "duedate":
            sort_by = "dueDate";
            break;
          default:
            sort_by = "createAt";
        }
        return _.orderBy(this.tickets, [sort_by], [order]);
      },
    },

    methods: {
      clear_selected_tickets (evt) {
        if (this.selected && this.selected.length) {
          if (evt.keyCode == 27) {
            this.$store.dispatch("tickets/select_ticket", null);
          }
        }
      },
      async getData(recents_uids) {
        try {
          this.isTicketsLoading = true;
          let query = {
            pageSize: 10,
            pageNumber: 1,
            tags: true,
          };

          let recents_data = [];
          if (recents_uids.length) {
            let { data } = await ticketService
              .getAll(`${recents_uids.map((ticket) => "&ticketUid=" + ticket).join("")}`)
              .catch((err) => this.handleErrors(err));
            recents_data = this.maintain_order(recents_uids, data);
          }
          query.sort = "-updatedAt";
          let result = await ticketService
            .getAll({
              query: queryString.stringify(query),
            })
            .catch((err) => {
              this.handleErrors(err);
            });

          let sorted_data = result.data;
          this.$store.dispatch("tickets/add_tickets", _.uniqBy([...(recents_data || []), ...(sorted_data || [])], (d) => d.uid).slice(0, 10));
          this.isTicketsLoading = false;
        } catch (err) {
          console.log(err);
          this.isTicketsLoading = false;
          this.$store.dispatch("tickets/add_tickets", []);
        }
      },
    },
  };
</script>

<style lang="scss">
  .bulk-recent-actions {
    width: 450px;
    margin-left: auto;
    margin-top: -66px;
    position: absolute;
    right: 0;
    padding-right: 2rem;
  }
</style>
