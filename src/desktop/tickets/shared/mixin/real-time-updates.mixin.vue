<script>
import { ticketService } from "@/desktop/shared/services/";
import { mapState, mapActions, mapGetters } from "vuex";
const queryString = require("query-string");

export default {
  data() {
    return {
      realTimeQuery: null
    };
  },
  computed: {
    ...mapState("tickets", ["tickets", "is_filters_selected"]),
    ...mapState(["PUSHER", "current_organization"])
  },

  methods: {
    async post_message_to_viewer(updates) {
      if (this.$route.name.includes("viewer")) {
        let wn = document.getElementById(this.$route.name).contentWindow;
        wn.postMessage(
          {
            name: "tickets_updates",
            data: updates.uids
          },
          this.$route.name === "terra-viewer"
            ? process.env.VUE_APP_TERRA_VIEWER
            : process.env.VUE_APP_THERM_VIEWER
        );
      }
    },
    set_org_tickets_event() {
      let orgChannel = this.$store.state.PUSHER.subscribe(
        `private-tickets-org_${this.current_organization.uid}`
      );
      orgChannel.bind("TICKETS_UPDATED", data => {
        let updatedTickets = data.uids || [];
        this.post_message_to_viewer(data);
        this.updateTicketsRealtime(updatedTickets);
      });
      orgChannel.bind("TICKETS_ADDED", data => {
        this.post_message_to_viewer(data);
        if (!["dashboard"].includes(this.$route.name)) {
          this.addRealtimeTicket(data);
        }
      });

      orgChannel.bind("TICKETS_REMOVED", data => {
        if (data && data.uids) {
          this.$store.dispatch("tickets/remove_tickets", data.uids);
          this.post_message_to_viewer(data);
        }
      });
    },
    addRealtimeTicket(data) {
      setTimeout(async () => {
        if (data && data.uids) {
          let existingTicketUids = _.map(
            _.filter(this.tickets || []),
            ticket => ticket.uid
          );
          let queryUids = _.difference(data.uids, existingTicketUids);
          queryUids = queryUids.length > 0 ? queryUids : [null];
          let uidsQuery = queryUids
            .map(newticketUid => "&ticketUid=" + newticketUid)
            .join("");


          if (this.is_filters_selected) {
            return;
          } else {
            let query = {
              internal: this.is_internal
            };
            if (this.element && this.element.uid != data.elementUid) {
              return;
            } else {
              query["element"] = data.elementUid;
            }
            let res = await this.fetch_tickets(
              queryString.stringify(query) + `${uidsQuery}`
            );
            res.data.map(ticket => {
              this.$store.dispatch("tickets/add_realtime_ticket", ticket);
            });
          }
        }
      }, 500);
    },

    async updateTicketsRealtime(ticketUids) {
      let existingTicketUids = _.intersection(
        ticketUids,
        _.map(_.flatMap(this.tickets || []), ticket => ticket.uid)
      );
      this.realTimeQuery = existingTicketUids
        .map(newticketUid => "&ticketUid=" + newticketUid)
        .join("");
      let { data } = await this.fetch_tickets("tags=true" + this.realTimeQuery);
      let updatedTickets = data;
      updatedTickets.forEach(async ticket => {
        let updated = _.omit(ticket, [
          "organization",
          "owner",
          "elmentUid",
          "elementType",
          "element",
          "stage"
        ]);
        this.$store.dispatch("tickets/add_ticket_details", updated);
      });
    },
    async fetch_tickets(query) {
      return await ticketService
        .getAll({
          query: query
        })
        .catch(err => {
          this.handleErrors(err);
        });
    }
  }
};
</script>

