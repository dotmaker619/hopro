<template>
  <div>
    <div class="year-block is-new">
      <p v-for="year in 12" :key="year" :class="{ is_selected: month_of_year.includes(year) }" @click="add_year(year)">{{ list_of_year[year] }}</p>
    </div>

    <div class="is-flex mt-20 on-vcenter">
      <input type="checkbox" name="on" id="on" class="sleek-checkbox" checked v-model="freq" />
      <label for="on" class="ml-20 is-regular-16-00-19 no-whitespace-wrap">On the:</label>

      <div class="frequency-dropdown" v-click-outside="() => (date_dropdown = false)">
        <p class="frequency-dropdown--selection pb-5 is-pointer" :class="[!freq ? 'is-disabled' : null]" @click="date_dropdown = !date_dropdown">
          <span class="is-semiBold-16-600-19">
            {{ week_number == -1 ? "" : week_number
            }}{{ week_number == 1 ? "st" : week_number == 2 ? "nd" : week_number == 3 ? "rd" : week_number == 4 ? "th" : "Last" }}
          </span>
          <sh-icon :name="'expand'" class="is-16x16" :class="{ 'rotate180': !date_dropdown }"></sh-icon>
        </p>
        <div class="frequency-dropdown--content has-slimscroll-xs" v-if="date_dropdown">
          <p
            class="is-medium-16-00-19 is-pointer"
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
        <p class="frequency-dropdown--selection pb-5 is-pointer" :class="[!freq ? 'is-disabled' : null]" @click="day_dropdown = !day_dropdown">
          <span class="is-semiBold-16-600-19">{{ week_day }}</span>
          <sh-icon :name="'expand'" class="is-16x16" :class="{ 'rotate180': !day_dropdown }"></sh-icon>
        </p>
        <div class="frequency-dropdown--content is-left has-slimscroll-xs" v-if="day_dropdown">
          <p
            class="is-medium-16-00-19 is-pointer"
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
        list_of_year: {
          1: "Jan",
          2: "Feb",
          3: "Mar",
          4: "Apr",
          5: "May",
          6: "Jun",
          7: "Jul",
          8: "Aug",
          9: "Sept",
          10: "Oct",
          11: "Nov",
          12: "Dec",
        },
        month_of_year: [1],
        freq: true,
        week_number: 1,
        date_dropdown: false,
        day_dropdown: false,
        week_day: "Monday",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      };
    },
    created() {
      this.create_year_rule();
    },
    methods: {
      create_year_rule() {
        if (this.existing_rule.month) {
          this.month_of_year = this.existing_rule.month;
          this.existing_rule.week_number ? this.week_number = this.existing_rule.week_number[0] : 0;
        }
        if (this.existing_rule.weekdays) {
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
      add_year(month) {
        if (this.month_of_year.includes(month)) {
          this.month_of_year = this.month_of_year.filter((item) => item !== month);
        } else {
          this.month_of_year.push(month);
        }
      },

      //Called from parent component
      set_year_rule() {
        let year_rule = {};

        year_rule.bymonth = this.month_of_year;
        year_rule.bysetpos = this.week_number;
        year_rule.byweekday = [];
        if (this.week_day == "Monday") {
          year_rule.byweekday = RRule.MO;
        } else if (this.week_day == "Tuesday") {
          year_rule.byweekday = RRule.TU;
        } else if (this.week_day == "Wednesday") {
          year_rule.byweekday = RRule.WE;
        } else if (this.week_day == "Thursday") {
          year_rule.byweekday = RRule.TH;
        } else if (this.week_day == "Friday") {
          year_rule.byweekday = RRule.FR;
        } else if (this.week_day == "Saturday") {
          year_rule.byweekday = RRule.SA;
        } else if (this.week_day == "Suunday") {
          year_rule.byweekday = RRule.SU;
        }
        return year_rule;
      },
    },
  };
</script>

<style lang="scss">
  .year-block {
    display: flex;
    justify-content: space-around;
    &.is-new {
      flex-wrap: wrap;
      p {
        width: 7.99rem;
      }
    }

    .is_selected {
      font-family: Barlow-semiBold;
      font-size: 14px;
      font-weight: 600;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.21;
      letter-spacing: normal;
      text-align: center;
      color: #171e48;
      opacity: 1;
      background-color: #eef2ff;
    }
    p {
      font-family: Barlow-Medium;
      border: 1px solid #ddd;
      width: 8.3rem;
      text-align: center;
      height: 3.6rem;
      opacity: 0.6;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.21;
      color: #171e48;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

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
