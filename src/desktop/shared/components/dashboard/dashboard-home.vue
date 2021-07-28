<template>
  <div class="main">
    <app-details></app-details>
    <app-summary v-if="$store.getters.is_show_dashboard_tickets_chart_widget"></app-summary>    
    <app-recents></app-recents>
  </div>
</template>
<script>
import Details from "./details.component.vue";
import Summary from "./summary.component.vue";
import Recents from "./recents/recents.component.vue";
export default {
  components: {
    "app-details": Details,
    "app-summary": Summary,
    "app-recents": Recents
  }
};
</script>

<style lang="scss">
.main {
  background-color: #f4f7fc !important;
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
