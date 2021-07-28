<template>
  <div class="ticket-card">
    <div class="ticket-card-options">
      <div class="ticket-card-options__left">
        <sh-icon :name="'ticket-history-recents'" class="is-24x24 mr-5" />
        <div class="is-medium-12-500-14 has-opacity-5">18 hours ago</div>
      </div>
      <div class="ticket-card-options__right">
        <sh-icon :name="'ticket-download'" class="is-24x24 mr-15 is-pointer" />
        <sh-icon :name="'ticket-expand-maximize'" class="is-24x24 is-pointer" />
      </div>
    </div>

    <div class="ticket-card-heading">
      <div class="ticket-card-heading__icon">
        <sh-icon :name="'ticket-card-activity-trends'" class="is-50x50"/>
      </div>
      <div class="ticket-card-heading__title ">
        Activity Trends
      </div>
      <div class="ticket-card-heading__subtitle is-medium-14-500-17">
        <div @click="open_ticket_dropdown = !open_ticket_dropdown" class="ticket-dropdown">
          <div class="status-icon status-icon-raised mr-10"></div>
          <span class="option-value is-semiBold-14-500-17">Raised</span>
          <sh-icon :name="`${open_ticket_dropdown?'expand':'collapse'}`" class="is-16x16 is-pointer"></sh-icon>
          <ticket-dropdown
            v-if="open_ticket_dropdown"
            v-click-outside="() => (open_ticket_dropdown = false)"
            :dropdown_items="dropdown_items"
            :has_icon="true"
          ></ticket-dropdown>
        </div>
      </div>
    </div>

    <div class="ticket-card-activity-trend">
      <activity-trend-graph></activity-trend-graph>
    </div>
  </div>
</template>

<script>
import TicketDropdown from '../../../shared/filters/ticket-dropdown'
import ActivityTrendGraph from "../../../shared/filters/activity-trend-graph";
export default {
  components: {
    ActivityTrendGraph,
    TicketDropdown
  },
  data() {
    return {
      open_ticket_dropdown: false,
      ticketHistory: [
        {
          title: "Inverter Power failure",
          status: "inprogress",
          desc: "Saideep: I have attached three files. Please check it...",
          time: "5m ago",
        },
        {
          title: "String Failure at 2nd Row",
          status: "pending",
          desc: "Saideep: I have attached three files. Please check it...",
          time: "10m ago",
        },
        {
          title: "Cleaning Schedule",
          status: "resolved",
          desc: "Saideep: I have attached three files. Please check it...",
          time: "12h ago",
        },
        {
          title: "Cabling Issue",
          status: "pending",
          desc: "Saideep: I have attached three files. Please check it...",
          time: "18h ago",
        },
      ],
      dropdown_items: [
        { id: "1", name: "raised" },
        { id: "2", name: "assigned"},
        { id: "3", name: "watched"},
      ],
    };
  },
};
</script>

<style lang="scss">
.activity-trend__subtitle {
}
</style>
