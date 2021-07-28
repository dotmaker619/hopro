<script>
  import { ticketService } from "@/desktop/shared/services/";
  

  export default {
    data() {
      return {
        lastFetchedAt: null,
        now: new Date(),
        refresh: false
      };
    },
    created() {
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
      async getReport(xkey, ykey, filter = {}) {
        this.lastFetchedAt = new Date().toISOString();
        let allFilters = { ...{ "organization": this.$store.state.current_organization.uid }, ...filter, ...(this.top_header_query || {}) };
        let body = {
          "filters": allFilters,
          "x": {
            "key": xkey,
          },
          "y": {
            "key": ykey,
          },
        };
        return await ticketService.get_report({ body }).catch((err) => {
          this.handleErrors(err);
        });
      },
    },
  };
</script>
