<template>
  <div
    class="ticket-checklist-card is-pointer"
    @click="$router.push({ name: 'schedule-details', params: { id: ticket.schedule.uid, ticket: ticket.uid } })"
  >
    <div>
      <sh-icon v-if="ticket.bookmark" :name="'ticket-checklist-favorite-selected'" class="is-18x18 is-pointer mr-10" />
      <sh-icon v-else :name="'ticket-checklist-favorite is-vhidden'" class="is-18x18 is-pointer mr-10" />
    </div>
    <div class="ticket-checklist-card__right">
      <div class="ticket-checklist-card__top">
        <div class="is-semiBold-16-600-19 mr-10">{{ ticket.name }}</div>
      </div>
      <div class="ticket-checklist-card__content">
        <div class="schedule-desc rrule_string has-opacity-7 has-text-theme-black">
          {{ recurrence_text }}
        </div>
        <div class="ticket-checklist-card__content-sec">
          <div class="ticket-checklist-card__content-sec__left">
            <user-tag
              :custom_class="'tiny-user-avatar'"
              :tagsCountToShow="4"
              :custom_size="24"
              :users="[...(ticket.readUsers || []), ...(ticket.writeUsers || [])]"
            ></user-tag>
          </div>
          <div class="ticket-checklist-card__content-sec__right">
            <span class="is-medium-16-500-19 has-opacity-7"
              >{{ (ticket.checklistsStats && ticket.checklistsStats.checkedItems) || 0 }}/{{
                (ticket.checklistsStats && ticket.checklistsStats.totalItems) || 0
              }}</span
            >
          </div>
        </div>
        <div class="mt-10">
          <ticket-progress
            :total="(ticket.checklistsStats && ticket.checklistsStats.totalItems) || 0"
            :value="(ticket.checklistsStats && ticket.checklistsStats.checkedItems) || 0"
            :valueClass="'member-progress-value'"
          ></ticket-progress>
        </div>
        <div class="mt-15">
          <div class="is-flex align-center" v-if="!next_occurance">
            <sh-icon :name="'ticket-scheduled'" class="is-20x20 mr-10" />
            <span class="schedule-stopped is-medium-14-500-17">Schedule Stopped</span>
          </div>
          <div v-else>
            <span class="schedule-occurance is-medium-14-500-17">Next Occurance:</span>
            <span class="schedule-occurance-in is-semiBold-14-600-17">{{ next_occurance }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import { RRule, rrulestr } from "rrule";
  import TicketProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-progress.vue";

  export default {
    props: ["ticket"],
    data() {
      return {
        fav_checklist: false,
      };
    },
    components: {
      UserTag,
      TicketProgress,
    },
    computed: {
      recurrence_text() {
        if (this.ticket && this.ticket.schedule && this.ticket.schedule.rrule != null) {
          return new RRule.fromString(this.ticket.schedule.rrule).toText();
        } else {
          return "";
        }
      },
      next_occurance() {
        if (this.ticket && this.ticket.schedule && this.ticket.schedule.rrule != null) {
          let after = new RRule(RRule.parseString(this.ticket.schedule.rrule)).after(new Date());
          let a = moment(after);
          let b = moment(new Date());
          return "in " + a.diff(b, "days") + " days";
        } else {
          return null;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .schedule-occurance {
    opacity: 0.7;
    color: $primary-text;

    &-in {
      margin-left: 0.7rem;
      color: $primary-text;
    }
  }
  .schedule-stopped {
    color: $schedule-stopped;
  }
  .schedule-desc {
    font-family: Barlow-Regular !important;
    font-size: 14px !important;
    font-weight: normal !important;
  }
</style>
