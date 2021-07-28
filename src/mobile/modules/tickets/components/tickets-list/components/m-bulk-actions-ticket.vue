<template>
  <div class="bulk-actions is-flex is-vcenter has-space-between pl-15 pr-30">
    <div class="is-flex is-vcenter">
      <sh-icon class="is-14x14 mr-10" :name="'close'" @click.native="$store.dispatch('tickets/select_ticket', null)"></sh-icon>
      <p class="is-semiBold-18-600-22">{{ selected.length }} {{ selected.length == 1 ? "Item" : "Items" }}</p>
    </div>
    <div class="is-flex is-vcenter">
      <p>
        <status-dropdown
          :size="28"
          style="position:static;margin-right:10px  "
          :show_names="false"
          @update-ticket-status="bulk_update_tickets({ status: parseInt($event.value) })"
        ></status-dropdown>
      </p>
      <p>
        <priority-dropdown
          class="mr-10"
          :bulk_action="true"
          @change_ticket_priority="bulk_update_tickets({ priority: parseInt($event) })"
        ></priority-dropdown>
      </p>
      <p>
        <duedate-dropdown
          :bulk_selection="true"
          :icon="'due-date'"
          :icon_class="'is-24x24 mr-10 is-paddingless'"
          @change-duedate="bulk_update_tickets({ dueDate: new Date($event).toISOString() })"
        >
          ></duedate-dropdown
        >
      </p>
      <p>
        <user-dropdown
          :is_name_hidden="true"
          :pxsize="20"
          :icon="'assignee'"
          @update-user="bulk_update_tickets({ takenUp: $event })"
          :can_unassign="false"
        ></user-dropdown>
      </p>
    </div>
  </div>
</template>
<script>
  import DuedateDropdown from "@/desktop/tickets/shared/components/duedate-dropdown";
  import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
  import PriorityDropdown from "@/desktop/tickets/shared/components/priority-dropdown";
  import StatusDropdown from "@/desktop/tickets/shared/components/status-dropdown";
  export default {
    props: ["selected"],
    components: {
      DuedateDropdown,
      UserDropdown,
      PriorityDropdown,
      StatusDropdown,
    },

    methods: {
      async bulk_update_tickets(value) {
        this.$store.dispatch("tickets/update_multiple_tickets", {
          tickets: this.selected,
          value: value,
        });
      },
    },
  };
</script>
<style lang="scss" scoped>
  .bulk-actions {
    position: absolute;

    top: 0;
    left: 0;
    width: 100%;
    background: white;
    z-index: 1000;
    height: 5rem;
  }
</style>
