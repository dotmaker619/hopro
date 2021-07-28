<template>
  <div class="month-block">
    <div class="mb-10">
      <b-radio class="radio mr-30" type="is-info" v-model="freq" native-value="each">
        <span class="is-regular-16-00-19">Each:</span>
      </b-radio>
      <div class="calendar_manual mt-20" v-if="freq == 'each'">
        <p
          v-for="number in 35"
          :key="number"
          @click="add_month_dates(number)"
          :class="{ is_selected: month_dates.includes(number > 31 ? number - 36 : number) }"
        >
          {{ number > 31 ? number - 36 : number }}
        </p>
      </div>
    </div>

    <div class="is-flex">
      <b-radio class="radio mr-20" type="is-info" v-model="freq" native-value="on">
        <span class="is-regular-16-00-19 no-whitespace-wrap">On the:</span>
      </b-radio>

      <div class="frequency-dropdown" v-click-outside="() => (date_dropdown = false)">
        <p class="frequency-dropdown--selection pb-5 is-pointer" :class="{ 'is-disabled': freq != 'on' }" @click="date_dropdown = !date_dropdown">
          <span class="is-semiBold-16-600-19 has-text-theme-black "
            >{{ week_number == -1 ? "" : week_number
            }}{{ week_number == 1 ? "st" : week_number == 2 ? "nd" : week_number == 3 ? "rd" : week_number == 4 ? "th" : "Last" }}</span
          >

          <sh-icon :name="'expand'" class="is-16x16" :class="{ 'rotate180': !date_dropdown }"></sh-icon>
        </p>
        <div class="frequency-dropdown--content has-slimscroll-xs" v-if="date_dropdown">
          <p
            class="is-medium-16-600-19 is-pointer"
            @click.stop="
              i == 5 ? (week_number = -1) : (week_number = i);
              date_dropdown = false;
            "
            v-for="i in 5"
            :key="i"
          >
            {{ i == 1 ? "1st" : i == 2 ? "2nd" : i == 3 ? "3rd" : i == 5 ? "Last" : "4th" }}
          </p>
        </div>
      </div>
      <div class="frequency-dropdown" v-click-outside="() => (day_dropdown = false)">
        <p class="frequency-dropdown--selection pb-5 is-pointer" :class="{ 'is-disabled': freq != 'on' }" @click="day_dropdown = !day_dropdown">
          <span class="is-semiBold-16-600-19">{{ week_day }}</span>

          <sh-icon :name="'expand'" class="is-16x16" :class="{ 'rotate180': !day_dropdown }"></sh-icon>
        </p>
        <div class="frequency-dropdown--content is-left has-slimscroll-xs" v-if="day_dropdown">
          <p
            class="is-medium-16-600-19 is-pointer"
            @click.stop="
              week_day = day;
              day_dropdown = false;
            "
            v-for="day in days"
            :key="day"
          >
            {{ day }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { RRule } from "rrule";

  export default {
    props: ["existing_rule"],
    data() {
      return {
        freq: "each",
        month_dates: [],
        week_number: 1,
        date_dropdown: false,
        day_dropdown: false,
        week_day: "Monday",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      };
    },
    created() {
      this.create_month_rule();
    },
    methods: {
      create_month_rule() {
        if (this.existing_rule.month_date) {
          this.freq = "each";
          this.month_dates = this.existing_rule.month_date;
        } else if (this.existing_rule.week_number) {
          this.freq = "on";
          this.week_number = this.existing_rule.week_number[0];
          if (this.existing_rule.weekdays.includes(0)) {
            this.week_day = "Monday";
          }
          if (this.existing_rule.weekdays.includes(1)) {
            this.week_day = "Tuesday";
          }
          if (this.existing_rule.weekdays.includes(2)) {
            this.week_day = "Wednesday";
          }
          if (this.existing_rule.weekdays.includes(3)) {
            this.week_day = "Thursday";
          }
          if (this.existing_rule.weekdays.includes(4)) {
            this.week_day = "Friday";
          }
          if (this.existing_rule.weekdays.includes(5)) {
            this.week_day = "Saturday";
          }
          if (this.existing_rule.weekdays.includes(6)) {
            this.week_day = "Sunday";
          }
        }
      },
      set_month_rule() {
        let month_rule = {};
        if (this.freq == "each") {
          month_rule.bymonthday = this.month_dates;
        } else {
          month_rule.bysetpos = this.week_number;
          month_rule.byweekday = [];
          if (this.week_day == "Monday") {
            month_rule.byweekday = RRule.MO;
          } else if (this.week_day == "Tuesday") {
            month_rule.byweekday = RRule.TU;
          } else if (this.week_day == "Wednesday") {
            month_rule.byweekday = RRule.WE;
          } else if (this.week_day == "Thursday") {
            month_rule.byweekday = RRule.TH;
          } else if (this.week_day == "Friday") {
            month_rule.byweekday = RRule.FR;
          } else if (this.week_day == "Saturday") {
            month_rule.byweekday = RRule.SA;
          } else if (this.week_day == "Suunday") {
            month_rule.byweekday = RRule.SU;
          }
        }
        return month_rule;
      },
      add_month_dates(number) {
        let date = number > 31 ? number - 36 : number;
        if (this.month_dates.includes(date)) {
          this.month_dates = this.month_dates.filter((item) => item !== date);
        } else {
          this.month_dates.push(date);
        }
      },
    },
  };
</script>

<style lang="scss">
  .week-block {
    p {
      border: 1px solid #ddd;
      width: 100%;
      text-align: center;
      height: 3rem;

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

  .calendar_manual {
    display: flex;
    width: calc(4.6rem * 7);
    flex-wrap: wrap;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: inset 0px 0px 0px 1px rgba(23, 30, 72, 0.2);
    margin-bottom: 2rem;

    p {
      cursor: pointer;
      width: 4.6rem;
      height: 4.6rem;
      border: solid 1px #e4e5e9;
      text-align: center;
      font-size: 14px;
      opacity: 0.7;
      font-weight: 500;
      line-height: 1.21;
      color: #171e48c7;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .is_selected {
      background-color: #dee5fe;
      font-weight: 600;
      color: #171e48;
      border: solid 1px #e4e5e9;
    }
  }
</style>
