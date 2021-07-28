<template>
  <div class="recents">
    <div class="tabs py-20">
      <ul>
        <li @click="active_tab='tickets'" :class="{'is-active':active_tab==='tickets'}">
          <a class="is-medium-18-500-22 has-text-theme-black">Tickets</a>
        </li>
        <!-- @click="active_tab='files'" -->
        <!-- <li @click="active_tab='tickets'" :class="{'is-active':active_tab==='files'}">
          <a class="is-medium-18-500-22 has-text-theme-black">Vault</a>
        </li>-->
      </ul>
      <!-- <bulk-actions-bar></bulk-actions-bar> -->
    </div>
    <div class="tab-content">
      <recent-tickets v-show="active_tab==='tickets'" />
      <recent-files v-show="active_tab==='files'" />
    </div>
  </div>
</template>
<script>
import BulkActionsBar from "@/desktop/tickets/shared/components/bulk-actions";

import recentTickets from "./components/recent-tickets";
import recentFiles from "./components/recent-files.vue";
export default {
  data() {
    return {
      active_tab: "tickets"
    };
  },
  components: {
    recentTickets,
    recentFiles,
    BulkActionsBar
  }
};
</script>
