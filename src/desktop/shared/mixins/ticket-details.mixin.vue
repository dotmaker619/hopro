<script>
  import TicketDetails from "@/desktop/tickets/components/ticket-details/ticket-details";

  export default {
    data() {
      return {
        is_ticket_details_popup_open: false,
      };
    },
    methods: {
      open_ticket_details(id) {
        let res = null;
        if (!this.is_ticket_details_popup_open) {
          res = this.$buefy.modal.open({
            props: {
              ticket_id: id,
            },
            parent: this,
            component: TicketDetails,
            destroyOnHide: true,
            hasModalCard: true,
            trapFocus: true,
            customClass: "ticket-details-popup",
            width: "100%",
            height: "100%",
            onCancel: () => this.outputMessage(), // note the arrow
            events: {
              close: () => {
                this.is_ticket_details_popup_open = false;
              },
            },
          });
          if (res) {
            this.is_ticket_details_popup_open = true;
          }
        }
      },
      outputMessage() {
        if (this.$route.name == "ticket-details") {
          this.$router.go(-1);
          this.is_ticket_details_popup_open = false;
        } else {
          this.$emit("close");
          this.is_ticket_details_popup_open = false;
        }
      },
    },
  };
</script>
