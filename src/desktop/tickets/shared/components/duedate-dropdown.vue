<template>
  <div
    class="is-sh-dropdown columns is-marginless is-relative is-duedate"
    v-click-outside="() => (active = false)"
    :class="[left ? 'duedate-dropdown' : '']"
  >
    <div
      class=" is-close is-pointer column is-narrow is-relative"
      v-tooltip="{
        content: `${tooltip}`,
      }"
      :class="[{ 'is-danger': is_overdue }, { 'is-selector': (!create_new || due) && !bulk_selection }]"
      @click="
        active = !active;
        create_cal();
      "
    >
      <p v-if="due && !bulk_selection" class="is-flex">
        <sh-icon :name="is_overdue ? 'due-date-danger' : 'due-date-dark'" class=" is-18x18 mr-5"></sh-icon>
        <span :class="{ 'has-text-danger': is_overdue }" v-if="!bulk_selection">{{ new Date(due).toISOString() | sinceDays }}</span>
      </p>
      <div class="is-flex is-vcenter is-pointer" v-else>
        <sh-icon :name="icon ? icon : 'select-date'" :class="[icon_class ? icon_class : 'is-24x24 mr-7']" />
        <span class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black" v-if="!create_new && !bulk_selection">Select Date</span>
      </div>
      <span v-if="due && !bulk_selection" class="is-pointer ml-10 close-mark" @click="change_duedate(null)">
        <sh-icon :name="'ticket-priority-close'" class="is-8x8" />
      </span>
    </div>
    <div class="mobile-background-new" v-if="active && isMobile" @click="active = !active"></div>
    <div
      class=""
      :class="[{ 'is-hidden': !active || !`calendar_container${ticket ? ticket.uid : 'new'}${in_details ? '-details' : null}`}, `${isMobile? 'mobile-cal-container':'dueDate-calendar'}`]"
    >
      <div
        :id="`calendar_container${bulk_selection ? 'bulk_calendar_container' : ticket ? ticket.uid : 'new'}${in_details ? '-details' : null}`"
      ></div>
    </div>
  </div>
</template>

<script>
  import { DateTime } from "luxon";

  export default {
    props: ["ticket", "create_new", "due", "in_details", "bulk_selection", "left", "icon", "icon_class", "update"],
    data() {
      return {
        active: false,
        calendar: null,
      };
    },
    beforeDestroy() {
      this.calendar = null;
    },

    computed: {
      tooltip() {
        return this.due ? moment(new Date(this.due)).format(" Do MMM YYYY, h:mm:ss a") : "Set a duedate";
      },
      is_overdue() {
        let givenDate = new DateTime.fromISO(this.due);
        let today = new DateTime.local();
        let difference = Math.floor(givenDate.diff(today, "days").days);
        return difference < 0;
      },
    },
    methods: {
      create_cal() {
        if (!this.calendar) {
          this.calendar = new dhx.Calendar(
            `calendar_container${this.bulk_selection ? "bulk_calendar_container" : this.ticket ? this.ticket.uid : "new"}${
              this.in_details ? "-details" : null
            }`,
            {
              css: `${this.isMobile?'for-mobile':'tickets-cal'}`,
              timePicker: true,
              value: this.due ? new Date(this.due) : new Date(),
            }
          );
        }
        this.calendar.events.on("Change", (date) => {
          this.change_duedate(date);
        });
      },
      change_duedate(date) {
        this.$emit("change-duedate", date);
        this.active = false;
      },
    },
  };
</script>
<style lang="scss">
.mobile-cal-container {
  position: fixed;
  z-index: 1000;
}
  .adjust_positioning {
    position: relative;
    top: 2rem;
  }
  .for-mobile {
      width: 100vw !important;
      position: fixed;
      right: 0;
      bottom: 0;
      top: auto;
    }
  .tickets-cal {
    background-color: $white;
    box-shadow: 0px 0px 5px 1px #ddd;
    border-radius: 0.5rem;
    position: relative;
    top: 2rem;
    // @include for-size(portrait-tablets) {
    //   width: 100vw !important;
    //   position: fixed;
    //   right: 0;
    //   bottom: 0;
    //   top: auto;
    // }
    // @include for-size(tablet) {
    //   width: 100vw !important;
    //   position: fixed;
    //   right: 0;
    //   bottom: 0;
    //   top: auto;
    // }
  }
  .dhx_calendar-day--selected::before {
    background-color: $primary;
    &.dhx_calendar-day--weekend {
      color: #fff;
    }
  }
  .dhx_calendar-day--selected {
    &.dhx_calendar-day--weekend {
      color: #fff !important;
    }
  }
  .dhx_calendar-day--weekend {
    color: $primary;
  }
  .dhx_calendar-day {
    padding: 0.5rem;
  }
  .is-sh-dropdown {
    &.is-duedate {
      .close-mark {
        visibility: hidden;
      }
      &:hover {
        .close-mark {
          visibility: visible;
        }
      }
    }
  }
  .duedate-dropdown {
    position: relative;
    left: -1.2rem;
    .for-mobile {
      width: 100vw !important;
      position: fixed;
      right: 0;
      bottom: 0;
      top: auto;
    }
    .tickets-cal {
      position: absolute;
      // top: -35rem;
      right: -35rem;
      top: 0;
      
      // @include for-size(portrait-tablets) {
      //   width: 100vw !important;
      //   position: fixed;
      //   right: 0;
      //   bottom: 0;
      //   top: auto;
      // }
    //   @include for-size(tablet) {
    //   width: 100vw !important;
    //   position: fixed;
    //   right: 0;
    //   bottom: 0;
    //   top: auto;
    // }
    }
    .is-selector {
      padding: 1rem;
      @include for-size(portrait-tablets) {
        padding: 0.5rem;
      }
    }
  }
</style>
