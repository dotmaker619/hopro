<template>
  <div class="schedule-main">
    <div class="schedule--main--body mt-20">
      <div class="schedule--main--body__top is-flex has-space-between pl-20 pr-20 pb-20">
        <div class="is-flex mr-20">
          <p class="is-regular-16-500-19 has-text-light-grey">Every</p>
          <input type="number" name="internal" id="internal" class="small-input has-text-centered pb-5 is-semiBold-16-600-19" v-model="interval" />
          <!-- <p class="is-regular-16-500-19 has-text-light-grey">{{ recurrence_frequency == "Daily" ? "Day" : recurrence_frequency }}</p> -->
        </div>
        <p class="is-regular-16-500-19 has-text-light-grey">Frequency</p>
        <div class="frequency-dropdown is-pointer" v-click-outside="() => (frequency_dropdown = false)">
          <p class="frequency-dropdown--selection" @click="frequency_dropdown = !frequency_dropdown">
            <span class="pb-5 is-semiBold-16-600-19 ">{{ recurrence_frequency }}</span>
            <sh-icon :name="'expand'" class="is-16x16" :class="{ 'rotate180': !frequency_dropdown }"></sh-icon>
          </p>
          <div class="frequency-dropdown--content" v-if="frequency_dropdown">
            <div v-for="(option, i) in frequency_options" :key="i">
              <p
                class="is-regular-16-500-19 is-pointer"
                @click.stop="
                  recurrence_frequency = option;
                  frequency_dropdown = false;
                "
              >
                {{ option }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="time-selection px-20">
        <week-picker v-if="recurrence_frequency == 'Week'" ref="week" :existing_rule="existingSet"></week-picker>
        <month-picker v-if="recurrence_frequency == 'Month'" ref="month" :existing_rule="existingSet"></month-picker>
        <year-picker v-if="recurrence_frequency == 'Year'" ref="year" :existing_rule="existingSet"></year-picker>
      </div>
    </div>
    <repeatation-block ref="repeatation" :existing_rule="existingSet"></repeatation-block>

    <div class="is-flex is-vcenter padding-10 ml-10 skip">
      <input type="checkbox" name="create" class="sleek-checkbox" id="create" v-model="skip" />
      <label for="create" class="is-regular-16-00-19 ml-10">
        Skip missed ticket
        <b-tooltip
          class="is-lowercase is-inline-flex"
          label="When checked, if a ticket is missed because the status of the ticket was not updated before due date, that ticket will be skipped. This means, only tickets in the future are possible."
          position="is-left"
          multilined
          animated
          size="is-large"
          type="is-dark"
        >
          <p class="ml-10 info">
            <i class="fas fa-question-circle"></i>
          </p>
        </b-tooltip>
      </label>
    </div>

    <div class="mr-20 mt-40 is-flex is-vcenter" :class="{ 'is-disabled': !access }">
      <button
        style="height: 5rem;
    width: 13rem;"
        class="sh-button is-semiBold-16-600-19 mr-20 button has-text-white padding-10"
        :class="[is_loading ? 'is-loading' : null]"
        @click="setRecurringRule"
      >
        Save
      </button>
      <p class="is-semiBold-16-500-19 has-text-blue is-pointer" @click="resetRule">Clear All</p>
    </div>
  </div>
</template>

<script>
  import { RRule, RRuleSet, rrulestr } from "rrule";
  import RepeatationBlock from "./repeatation-block";
  import YearPicker from "./year-picker";
  import WeekPicker from "./week-picker";
  import MonthPicker from "./month-picker";
  import { ticketService } from "@/desktop/shared/services/";
  export default {
    props: ["schedule", "uid", "ticket_status", "access"],
    data() {
      return {
        frequency_dropdown: false,
        frequency_options: ["Week", "Month", "Year", "Daily"],
        create_new: true,
        skip: false,
        recurrence_frequency: "Month",
        interval: 1,
        existingSet: {},
        is_loading: false,
        is_saved: false,
      };
    },
    components: {
      RepeatationBlock,
      YearPicker,
      WeekPicker,
      MonthPicker,
    },
    created() {
      this.start_recurrence();
    },

    methods: {
      start_recurrence(ticket_id) {
        if (this.schedule) {
          if (this.schedule.rrule) {
            this.setExistingRule(this.schedule.rrule);
          }
        }
      },
      setRecurringRule() {
        this.is_loading = true;
        let recurSet = {};
        recurSet.dtstart = new Date();
        recurSet.interval = this.interval;
        this.$refs.repeatation.repeat_forever == false
          ? this.$refs.repeatation.until == "date"
            ? (recurSet.until = this.$refs.repeatation.date)
            : (recurSet.count = this.$refs.repeatation.interval)
          : null;
        if (this.recurrence_frequency == "Week") {
          recurSet.freq = RRule.WEEKLY;
          recurSet.byweekday = this.$refs.week.set_week_rule();
        } else if (this.recurrence_frequency == "Month") {
          recurSet.freq = RRule.MONTHLY;
          recurSet = { ...recurSet, ...this.$refs.month.set_month_rule() };
        } else if (this.recurrence_frequency == "Year") {
          recurSet.freq = RRule.YEARLY;
          recurSet = { ...recurSet, ...this.$refs.year.set_year_rule() };
        } else if (this.recurrence_frequency == "Daily") {
          recurSet.freq = RRule.DAILY;
        }
        let data = {
          schedule: {
            rrule: new RRule(recurSet).toString(),
            createNewTicket: this.create_new,
            recurWhen: this.ticket_status,
            skipOccurrence: this.skip,
          },
        };
        this.$store.dispatch("tickets/update_ticket_value", {
          value: data,
          id: this.uid,
        });
        this.setExistingRule(data.schedule.rrule);

        setTimeout(() => {
          this.is_loading = false;
        }, 1000);
      },

      async remove_recurrence() {
        this.$store.dispatch("tickets/update_ticket_value", {
          value: {
            rrule: null,
          },
          id: this.uid,
        });
        this.setExistingRule(res.data.rrule);
      },
      setExistingRule(rule) {
        this.skip = this.schedule ? this.schedule.skipOccurrence : false;
        this.create_new = this.schedule ? this.schedule.createNewTicket : true;
        const { options: existingRules } = new RRule.fromString(rule);

        this.interval = existingRules.interval;
        this.existingSet.interval = existingRules.count;
        this.existingSet.date = existingRules.until;
        if (existingRules.freq == 0) {
          // If occurance is yealy
          this.recurrence_frequency = "Year";
          this.existingSet.month = existingRules.bymonth;
        } else if (existingRules.freq == 1) {
          // If occurance is Monthly
          this.recurrence_frequency = "Month";
          existingRules.bymonthday && existingRules.bymonthday.length
            ? (this.existingSet.month_date = existingRules.bymonthday)
            : ((this.existingSet.week_number = existingRules.bysetpos), (this.existingSet.weekdays = existingRules.byweekday));
        } else if (existingRules.freq == 2) {
          // If occurance is weekly
          this.recurrence_frequency = "Week";
          this.existingSet.weekdays = existingRules.byweekday;
        } else if (existingRules.freq == 3) {
          // If occurance is weekly
          this.recurrence_frequency = "Daily";
          this.existingSet.interval = existingRules.interval;
        } else {
          this.recurrence_frequency = "Month";
          this.existingSet.month_date = existingRules.bymonthday;
        }

        this.existingSet = Object.assign({}, this.existingSet);
      },
      resetRule() {
        this.setExistingRule(this.schedule.rrule);
        if (this.recurrence_frequency == "Month") {
          this.$refs.month.create_month_rule();
        } else if (this.recurrence_frequency == "Week") {
          this.$refs.week.create_week_rule();
        } else if (this.recurrence_frequency == "Year") {
          this.$refs.year.create_year_rule();
        } else {
          this.recurrence_frequency = "Daily";
        }
      },
    },
  };
</script>

<style lang="scss">
  .schedule-main {
    width: 36rem;
    margin: auto;
    &--body {
      &__main {
        margin-top: 3.3rem;
      }
    }
  }
  .small-input {
    border: none;
    border-bottom: 1px solid #ddd;
    width: 5rem;
    margin-left: 10px;
  }
  .frequency-dropdown {
    position: relative;
    width: 100%;
    margin-left: 2rem;
    &--selection {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #ddd;
    }
    &--content {
      position: absolute;
      background: white;
      width: 17rem;
      border: 1px solid #ddd;
      border-radius: 1rem;
      box-shadow: 2px 2px 5px 0px #eee;
      z-index: 10;
      max-height: 20rem;
      overflow: auto;
      &.is-left {
        right: 0;
      }
      p {
        padding: 1rem;
      }
      p:not(:last-child) {
        border-bottom: 1px solid #eee;
      }
      p:hover {
        background: $primary-background;
      }
    }
  }
  .rotate180 {
    transform: rotate(180deg);
  }
  .skip {
    .info {
      visibility: hidden;
    }
    &:hover {
      .info {
        visibility: visible;
        cursor: help;
      }
    }
  }
  .recurrence_dropdown {
    z-index: 10;
  }
  .sh-custom-checkbox {
    margin-right: 1rem;
    &.is-thinner {
      height: 2.5rem;
      width: 2.5rem;
    }
  }
  .sleek-checkbox {
    position: relative;
    height: 2rem;
    width: 2rem;
    visibility: hidden;
    margin-right: 0.5rem;
    vertical-align: middle;
    cursor: pointer;
    z-index: 5;
    &::before {
      content: "";
      position: absolute;
      visibility: visible;
      background-color: #fff;
      border: 1px solid #b8bbc8;
      height: 2.3rem;
      width: 2.3rem;
      border-radius: 4px;
      box-shadow: 0 1px 3px 0 rgba(23, 30, 72, 0.1);
      z-index: 2;
      background-color: $white;
    }
    &:hover::before {
      background-color: $white;
    }
    &::after {
      border-width: 0px 0px 0px 0px;
      visibility: visible;
    }
    &:checked::before {
      background: $primary;
      border: 1px solid #b8bbc8;
      height: 2.3rem;
      width: 2.3rem;
      border-radius: 4px;
      box-shadow: 0 1px 3px 0 rgba(23, 30, 72, 0.1);
      overflow: hidden;
      visibility: visible;
      backface-visibility: none;
    }
    &:checked::after {
      position: absolute;
      content: "";
      z-index: 3;
      visibility: visible;
      left: 9px;
      top: 5px;
      width: 6px;
      height: 11px;
      border: solid #fff;
      border-width: 0px 2px 2px 0px;
      transform: rotate(45deg);
    }
  }
  .b-radio.radio input[type="radio"]:checked + .check:before {
    -webkit-transform: scale(0.5);
    transform: scale(0.3);
  }
  .b-radio.radio input[type="radio"] + .check.is-info:before {
    background: $primary;
  }
  .b-radio.radio input[type="radio"]:checked + .check.is-info {
    border-color: $primary;
    border-width: 2px;
  }
  .b-radio.radio input[type="radio"] + .check {
    border: 1px solid #7a7a7a;
  }
</style>
