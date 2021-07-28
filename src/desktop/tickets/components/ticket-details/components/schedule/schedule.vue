<template>
  <div class="padding-40">
    <div class="schedule-status" v-if="schedule && schedule.rrule">
      <div>
        <p class="is-medium-16-500-19 rrule_string mb-10">{{ recurrence_text }}</p>
        <p class="is-regular-16-00-00">
          Next occurance:
          <span class="is-semiBold-16-500-19">in {{ next_occurance }} days</span>
        </p>
      </div>
      <div class="is-flex" v-if="schedule.recurWhen">
        <span class="is-semiBold-16-500-19 is-capitalized mr-20 ticket-status-tag" :class="'is-' + schedule.recurWhen">{{
          status[schedule.recurWhen]
        }}</span>
        <sh-icon :name="'delete-2'" class="is-22x22 is-pointer" :class="{ 'is-disabled': !has_access }" @click.native="remove_recurrence"></sh-icon>
      </div>
    </div>

    <div v-if="(schedule && schedule.rrule) || create_schedule">
      <div class="schedule-action">
        <div>
          <p class="is-semiBold-16-600-19 is-vcenter is-flex">
            <sh-icon :name="'recurrence-recurs'" class="is-20x20 mr-10"></sh-icon>
            <span class="has-text-blue">Set Recurrence</span>
          </p>
        </div>
        <div>
          <div class="frequency-dropdown" v-click-outside="() => (status_dropdown = false)">
            <div class="columns align-baseline">
              <p class="is-semiBold-16-500-19 ml-10 column">On:</p>
              <p class="column">
                <status-dropdown
                  :disabled_status="[1, 2]"
                  @update-ticket-status="ticket_status = $event.value"
                  :current_status="ticket_status ? ticket_status : 3"
                  class="is-26x26 mr-10"
                  :show_names="true"
                ></status-dropdown>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="schedule-divider"></div>
      <recurrence :schedule="schedule" :uid="uid" :access="has_access" style="height:100%" :ticket_status="ticket_status"></recurrence>
    </div>
    <div v-else>
      <div class="no-result">
        <div class="no-results__image">
          <img slot="image" src="@/assets/illustrations/no-activity-illustration.svg" alt />
        </div>
        <div class="no-results__text is-medium-20-500-24 has-opacity-8">No Schedule</div>
        <p class="is-regular-14-00-17 has-opacity-8">No recurrence schedule added to the ticket</p>
        <div class="no-results__button mt-20" :class="{ 'is-disabled': !has_access }">
          <div class="sh-button sh-button--inverted" @click="create_schedule = true">Create Schedule</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { RRule, rrulestr } from "rrule";

  import StatusDropdown from "@/desktop/tickets/shared/components/status-dropdown";
  import StatusTag from "@/desktop/shared/components/tags/status-tag";
  import Recurrence from "./components/schedule-body";

  export default {
    props: ["schedule", "uid", "has_access"],
    data() {
      return {
        status_dropdown: false,
        ticket_status: null,
        create_schedule: false,
        status: {
          1: "pending",
          2: "in progress",
          3: "resolved",
          4: "closed",
          5: "rejected",
        },
      };
    },
    components: {
      StatusDropdown,
      StatusTag,
      Recurrence,
    },
    computed: {
      recurrence_text() {
        if (this.schedule && this.schedule.rrule != null) {
          return new RRule.fromString(this.schedule.rrule).toText();
        } else {
          return null;
        }
      },
      next_occurance() {
        if (this.schedule && this.schedule.rrule != null) {
          let after = new RRule(RRule.parseString(this.schedule.rrule)).after(new Date());
          let a = moment(after);
          let b = moment(new Date());
          return a.diff(b, "days");
        } else {
          return null;
        }
      },
    },
    created() {
      if (this.$route.name == "schedules" || this.$route.name == "schedule-details") {
        this.create_schedule = true;
      }
      this.ticket_status = this.schedule ? this.schedule.recurWhen : null;
    },
    methods: {
      async remove_recurrence() {
        this.$store.dispatch("tickets/update_ticket_value", {
          value: {
            schedule: null,
          },
          id: this.uid,
        });
      },
    },
  };
</script>
<style lang="scss">
  .schedule {
    &-status {
      justify-content: space-between;
      margin: auto;
      margin-bottom: 3rem;
      display: flex;
      padding: 2.2rem 3.5rem;
      width: 63rem;
      height: 10rem;
      object-fit: contain;
      border-radius: 10px;
      box-shadow: 0 2px 7px 0 rgba(23, 30, 72, 0.1);
      border: solid 1px rgba(23, 30, 72, 0.15);
      background-color: #ffffff;
    }
    &-action {
      width: 63rem;
      margin: auto;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      padding-right: 10rem;
      align-items: center;
    }
    &-divider {
      width: 63rem;
      margin: 0 auto;
      background-color: #eee;
      position: relative;
      height: 1px;
    }
  }

  .ticket-status-tag {
    font-size: 1.4rem;
    font-weight: 600;
    padding: 0.5rem 2rem;
    border-radius: 20px;
    width: max-content;
    display: flex;
    justify-content: center;
    height: 3rem;
    &.is-1 {
      color: $pending-status;
      background: transparentize($pending-status, 0.8);
    }
    &.is-2 {
      color: $completed-status;
      background: transparentize($completed-status, 0.8);
    }
    &.is-3 {
      color: $resolved-status;
      background: transparentize($resolved-status, 0.8);
    }
    &.is-4 {
      color: $closed-status;
      background: transparentize($closed-status, 0.8);
    }
    &.is-5 {
      color: $rejected-status;
      background: transparentize($rejected-status, 0.8);
    }
  }

  .rrule_string::first-letter {
    text-transform: capitalize;
  }
</style>
