<template>
  <div id="checklist-field" class="checklist-field">
    <checklists
      :checklist="{ name: 'Checklist', uid: '12312323', items: [] }"
      :is_ticket_without_checklists="false"
      :ticket="{ writeAccess: true }"
      :keep_open="false"
      :service="formsService"
      @created="openChecklist"
    ></checklists>
  </div>
</template>

<script>
  import { formsService } from "@/desktop/shared/services";

  import checklists from "@/desktop/tickets/components/ticket-details/components/task-list/components/checklist-component";

  export default {
    components: {
      checklists,
    },
    data() {
      return {
        formsService,
      };
    },
    methods: {
      openChecklist(checklist) {
        checklist.active = true;
      },
    },
  };
</script>

<style lang="scss">
  #checklist-field {
    .checklist-item--heading,
    .checklist-divider {
      display: none !important;
    }
  }
</style>
<style scoped>
  .checklist-field {
    padding: 15px;
    padding-left: 0px;
  }
</style>
