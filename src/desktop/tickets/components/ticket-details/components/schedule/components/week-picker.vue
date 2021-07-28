<template>
  <div class="week-block">
    <p
      v-for="day in days"
      :key="day"
      @click="select_days(day)"
      class="has-text-theme-back"
      :class="[selected_weekdays.includes(day) ? 'is_selected is-semiBold-14-600-17': 'is-medium-14-500-17 has-opacity-6' ]"
    >{{day}}</p>
  </div>
</template>

<script>
import { RRule } from "rrule";

export default {
  props: ["existing_rule"],
  data() {
    return {
      days: ["Mo", "Tu", "Wd", "Th", "Fr", "Sa", "Su"],
      selected_weekdays: []
    };
  },
  created() {
    this.create_week_rule();
  },
  methods: {
    create_week_rule() {
      if (
        this.existing_rule &&
        this.existing_rule.weekdays &&
        this.existing_rule.weekdays.length
      ) {
        if (this.existing_rule.weekdays.includes(0)) {
          this.selected_weekdays.push("Mo");
        }
        if (this.existing_rule.weekdays.includes(1)) {
          this.selected_weekdays.push("Tu");
        }
        if (this.existing_rule.weekdays.includes(2)) {
          this.selected_weekdays.push("We");
        }
        if (this.existing_rule.weekdays.includes(3)) {
          this.selected_weekdays.push("Th");
        }
        if (this.existing_rule.weekdays.includes(4)) {
          this.selected_weekdays.push("Fr");
        }
        if (this.existing_rule.weekdays.includes(5)) {
          this.selected_weekdays.push("Sa");
        }
        if (this.existing_rule.weekdays.includes(6)) {
          this.selected_weekdays.push("Su");
        }
      }
    },
    select_days(day) {
      if (this.selected_weekdays.includes(day)) {
        this.selected_weekdays = this.selected_weekdays.filter(
          item => item !== day
        );
      } else {
        this.selected_weekdays.push(day);
      }
    },
    set_week_rule() {
      let rule = [];
      if (this.selected_weekdays.includes("Mo")) {
        rule.push(RRule.MO);
      }
      if (this.selected_weekdays.includes("Tu")) {
        rule.push(RRule.TU);
      }
      if (this.selected_weekdays.includes("We")) {
        rule.push(RRule.WE);
      }
      if (this.selected_weekdays.includes("Th")) {
        rule.push(RRule.TH);
      }
      if (this.selected_weekdays.includes("Fr")) {
        rule.push(RRule.FR);
      }
      if (this.selected_weekdays.includes("Sa")) {
        rule.push(RRule.SA);
      }
      if (this.selected_weekdays.includes("Su")) {
        rule.push(RRule.SU);
      }

      return rule;
    }
  }
};
</script>

<style lang="scss">
.week-block {
  display: flex;
  justify-content: space-around;
  .is_selected {
    background-color: #eef2ff;
    font-weight: 600;
    opacity: 1;
    text-align: center;
    color: #171e48;
  }
  p {
    cursor: pointer;
    border: 1px solid #ddd;
    width: 18px;
    height: 3.6rem;
    opacity: 0.6;
    font-size: 14px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.21;
    letter-spacing: normal;
    color: #171e48;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background-color: $primary-background;
    }
    &:first-child {
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
    }
    &:last-child {
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  }
}
</style>