<template>
  <div>
    <div v-if="is_loading">
      <mobile-list-skeleton :items="3" />
    </div>
    <div v-else>
      <!-- <div style="height:calc(100vh - 50px);overflow:auto"> -->
        <div>
        <div v-if="element_tickets && element_tickets.length">
          <div
            v-for="ticket in element_tickets"
            :key="ticket.uid"
            class="m-ticket-list__item is-flex"
          >
            <list-item :ticket="ticket" class="ml-10"></list-item>
          </div>
        </div>
        <div v-else class="m-no-ticket" style="min-height:50vh;height:auto">
          <div class="m-no-terra--img">
            <img src="@/assets/illustrations/tickets-illustration.svg" alt />
          </div>
          <div class="is-flex is-center mt-20 is-medium-16-500-19 has-primary-text">No Tickets</div>
          <div
            class="is-flex is-center mt-10 is-regular-12-00-18 has-primary-text has-opacity-8"
          >No result found</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { ticketService } from "@/desktop/shared/services/";
import ListItem from "@/mobile/modules/tickets/components/tickets-list/components/mobile-list-item.vue";
import MobileListSkeleton from "@/mobile/shared/components/list-skeleton.vue";
const queryString = require("query-string");

export default {
  props: ["state", "element"],
  data() {
    return {
      ticket_tab: true,
      is_loading: false,
      is_create_new: false,
      orgChannel: null
    };
  },
  components: {
    ListItem,
    MobileListSkeleton,
  },
  created() {
    this.get_tickets();
  },
  computed: {
    ...mapState(["current_organization", "PUSHER"]),
    ...mapState("tickets", ["tickets"]),
    ...mapState("viewer", ["cluster_tickets"]),
    element_tickets() {
      if (!this.element || _.isString(this.element)) return [];
      return (this.tickets || []).filter(
        f => f.targetElement && f.targetElement.uid == this.element.uid
      );
    }
    // ...mapState("viewer", ["selected_feature"])
  },
  watch: {
    element() {
      this.get_tickets();
    }
  },
  methods: {
    async get_tickets() {
      try {
        this.$store.dispatch("tickets/add_tickets", []);

        if (!this.element || _.isString(this.element)) return;
        this.is_loading = true;

        let results = await ticketService
          .getAll({
            query: "element=" + this.element.uid
          })
          .catch(err => {
            this.handleErrors(err);
          });
        this.$store.dispatch("tickets/add_tickets", results.data);
        this.is_loading = false;
      } catch (err) {
        this.tickets = [];
        this.is_loading = false;
      }
    }
  }
};
</script>

<style>
.create-card-app {
  position: fixed;
  bottom: 0;
  z-index: 13;
}
</style>