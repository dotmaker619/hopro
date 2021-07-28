<template>
  <div
    class="is-sh-dropdown startDate columns is-flex align-center"
    v-click-outside="() => (active = false)"
    @mouseenter="allow_remove_startdate = true"
    @mouseleave="allow_remove_startdate = false"
    :class="[ticket && !ticket.writeAccess ? 'is-not-allowed' : null]"
  >
    <div class="is-selector is-close">
      <p class="is-flex is-vcenter" @click="toggle_dropdown" :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]">
        <sh-icon v-if="ticket.startDate" :name="'calendar'" class="mr-10 is-18x18" />
        <sh-icon v-else :name="'select-start-date'" class="mr-10 is-24x24" />

        <span :class="[ticket.startDate ? 'is-medium-16-500-19' : ' is-medium-14-500-17 has-opacity-5 has-text-theme-black']">
          {{ ticket.startDate ? new Date(ticket.startDate).toLocaleDateString() : "Select Date" }}
        </span>
      </p>

      <p class="column is-narrow is-pointer" v-if="ticket && ticket.startDate && allow_remove_startdate" @click="remove_startdate">
        <sh-icon :name="'remove-delete'" class="is-8x8" />
      </p>
    </div>
    <div class="mobile-background-new" v-if="active && isMobile" @click="active = !active"></div>
    <div class="" :class="[{ 'is-hidden': !active }, `${isMobile ? 'mobile-cal-container': 'startDate-calendar'}`]">
      <div :id="`startdate_container${ticket ? ticket.uid : 'new'}`"></div>
    </div>
  </div>
</template>

<script>
  import { DateTime } from "luxon";

  export default {
    props: ["ticket"],
    data() {
      return {
        active: false,
        selected_date_for_start: this.start,
        startdate: null,
        start: null,
        allow_remove_startdate: false,
        calendar: null,
        user_interaction: false,
      };
    },
    created() {
      if (!this.ticket || !this.ticket.startDate) {
        this.start = new Date();
      } else {
        this.start = new Date(this.ticket.startDate);
      }
    },

    beforeDestroy() {
      this.calendar = null;
    },
    methods: {
      create_cal() {
        this.calendar = new dhx.Calendar(`startdate_container${this.ticket ? this.ticket.uid : "new"}`, {
          css: `${this.isMobile?'for-mobile':'startdate-cal'}`,
          timePicker: true,
          value: this.start,
        });
        this.calendar.events.on("Change", (date) => {
          this.user_interaction = true;
          this.start = date;
          this.change_startdate();
        });
      },

      days_to_startdate(startDate) {
        let givenDate = new DateTime.fromISO(startDate);
        let today = new DateTime.local();
        return Math.floor(givenDate.diff(today, "days").days);
      },

      change_startdate() {
        this.selected_date_for_start = new Date(this.start).toISOString();
        this.$emit("change-startdate", this.start);
        this.active = false;
        this.start = null;
        this.user_interaction = false;
      },
      remove_startdate() {
        this.selected_date_for_start = null;
        this.$emit("change-startdate", null);
        this.active = false;
        this.start = null;
        this.user_interaction = false;
      },
      toggle_dropdown() {
        this.active = !this.active;
        if (!this.calendar) {
          this.create_cal();
        }
      },
    },
  };
</script>
<style lang="scss">
  .startDate {
    cursor: pointer;
    position: relative;
    left: -1.5rem;
    .is-selector {
      padding: 1.1rem;
      @include for-size(tablet) {
        padding: 5px 2rem;
      }
    }
  }
  .adjust_positioning {
    position: relative;
    top: 2rem;
  }
  .startDate-calendar {
    position: absolute;
  }
  .for-mobile {
    width: 100vw !important;
    position: fixed;
    right: 0;
    bottom: 0;
    top: auto;
  }
  .startdate-cal {
    background-color: $white;
    box-shadow: 0px 0px 5px 1px #ddd;
    border-radius: 0.5rem;
    z-index: 100;
    background: $white;
    position: relative;
    @include for-size(portrait-tablets) {
      width: 100vw !important;
      position: fixed;
      right: 0;
      bottom: 0;
      top: auto;
    }
    @include for-size(tablet) {
      width: 100vw !important;
      position: fixed;
      right: 0;
      bottom: 0;
      top: auto;
    }
  }
  .dhx_calendar-day--selected::before {
    background-color: $primary;
    &.dhx_calendar-day--weekend {
      color: #fff;
    }
  }

  .dhx_calendar-day--selected {
    &.dhx_calendar-day--weekend {
      color: #fff;
    }
  }

  .dhx_calendar-day--weekend {
    color: $primary;
  }
  .dhx_calendar-day {
    padding: 0.5rem;
  }
</style>
