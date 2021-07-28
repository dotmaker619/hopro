<template>
  <div>
    <div class="pt-10 ml-10">
      <top-header></top-header>
    </div>

    <div class="columns">
      <div class="column is-12 mt-20">
        <tickets-list :extra_query="filter_query"></tickets-list>
      </div>
    </div>
  </div>
</template>
<script>
  import TicketsList from "@/desktop/tickets/components/tickets-list/tickets-list";
  import TopHeader from "@/desktop/tickets/components/ticket-dashboard/shared/top-header";

  export default {
    data() {
      return {
        filter_query: {},
      };
    },
    components: {
      TicketsList,
      TopHeader,
    },
    created() {
      if (this.$route && this.$route.query) {
        if (this.$route.query.key == "upcoming") {
          this.filter_query = {
            overdue: false,
            sort: "dueDate",
          };
        } else if (this.$route.query.key == "stale") {
          this.filter_query = {
            overdue: true,
            sort: "-updatedAt",
          };
        } else if (this.$route.query.key == "overdue") {
          this.filter_query = {
            overdue: true,
            sort: "dueDate",
          };
        }
      } else {
        this.$route.go(-1);
      }
    },
  };
</script>
