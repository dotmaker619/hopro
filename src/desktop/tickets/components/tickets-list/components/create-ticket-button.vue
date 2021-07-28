<template>
  <div>
    <span v-if="access('tickets', 'modify_tickets')">
      <p class="column is-flex is-start py-10 mb-5 no-padding-left" 
      >
      <!-- :class="{'is-disabled': !element}" -->
        <button
          class="sh-button sh-button--create"
          :class="{ 'sh-button--inverted sh-button--small':!no_result } "
          @click="$emit('create_ticket')"
        >{{no_result ? 'Create ' : null}}New Ticket</button>
      </p>
    </span>
    <span v-else @click="no_access_popup('tickets', 'modify_tickets')">
      <p class="column is-flex is-start py-10 mb-5 no-padding-left is-not-allowed is-disabled">
        <button
          class="sh-button sh-button--create"
          :class="{ 'sh-button--inverted sh-button--small':!no_result } "
        >{{no_result ? 'Create ' : null}}New Ticket</button>
      </p>
    </span>
  </div>
</template>
<script>
export default {
  props: ["element", "no_result"]
};
</script>