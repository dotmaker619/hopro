<template>
  <div>
    <tickets-list :is_grouped="true" v-if="activeView == 'tickets'"></tickets-list>
    <!-- <vault :element="details.element" @update_element="details.element = $event" /> -->
    <div v-else>Vault</div>
  </div>
</template>

<script>
import TicketsList from "@/desktop/tickets/components/tickets-list/tickets-list";
export default {
  props: ["activeView"],
  components: {
    TicketsList
  }
};
</script>

<style>
</style>