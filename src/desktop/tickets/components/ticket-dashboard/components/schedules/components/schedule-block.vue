<template>
  <div>
    <div class="ticket-checklists-items">
      <span class="is-flex is-pointer">
        <sh-icon @click.native="open_today = -1" v-if="open_today == when" :name="'ticket-checklist-expand'" class="is-24x24" />
        <sh-icon v-else @click.native="open_today = when" :name="'ticket-checklist-collapse'" class="is-24x24" />
        <span class="is-medium-16-500-19">{{ schedule_times(when) }}</span></span
      >
    </div>
    <div class="ticket-checklists-item" v-if="open_today == when">
      <div v-for="ticket in tickets" :key="ticket.uid">
        <schedule-card :ticket="ticket"> </schedule-card>
      </div>
    </div>
  </div>
</template>
<script>
  import ScheduleCard from "@/desktop/tickets/components/ticket-dashboard/components/schedules/components/schedule-card";

  export default {
    props: ["tickets", "when"],
    components: {
      ScheduleCard,
    },
    data() {
      return {
        open_today: this.when,
      };
    },
    methods: {
      schedule_times(date) {
        let scheduleKey;

        switch (date) {
          case "0":
            scheduleKey = "Yearly";
            break;
          case "1":
            scheduleKey = "Monthly";
            break;
          case "2":
            scheduleKey = "Weekly";
            break;
          case "3":
            scheduleKey = "Daily";
            break;

          default:
            scheduleKey = "Stopped";
            break;
        }
        return scheduleKey;
      },
    },
  };
</script>
