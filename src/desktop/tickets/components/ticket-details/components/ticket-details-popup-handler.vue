<template>
  <div></div>
</template>
<script>
  import TicketDetailsMixin from "@/desktop/shared/mixins/ticket-details.mixin.vue";
  export default {
    mixins: [TicketDetailsMixin],
    mounted() {
      setTimeout(() => {
        this.open_ticket_details(this.$route.params.id);
      }, 1000);
    },
  };
</script>
