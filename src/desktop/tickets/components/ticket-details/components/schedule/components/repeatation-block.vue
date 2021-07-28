<template>
  <div class="padding-20 mt-30">
    <p class="is-flex is-vcenter">
      <input type="checkbox" class=" sleek-checkbox is-thinner" id="until" v-model="repeat_forever" />
      <label class="is-regular-16-00-19 ml-10" for="until">Repeat {{ repeat_forever ? "forever" : "until:" }}</label>
    </p>
    <div v-if="!repeat_forever">
      <div class="pt-20 is-flex">
        <p class="is-flex is-vcenter mr-30">
          <b-radio class="radio" type="is-info" v-model="until" native-value="date">
            <span class="is-regular-16-00-19">Date</span>
          </b-radio>
        </p>
        <repeat-date-calendar :is_disabled="until != 'date'" :date="date" @set_date="date = $event"></repeat-date-calendar>
      </div>
      <div class="pt-20 is-flex">
        <p class="is-flex is-vcenter">
          <b-radio class="radio" type="is-info" v-model="until" native-value="occurance">
            <span class="is-regular-16-00-19 mr-20">Occurs</span>
          </b-radio>
        </p>
        <div class="is-flex">
          <input
            :class="{ 'is-disabled': until != 'occurance' }"
            type="number"
            min="1"
            name="internal"
            id="internal"
            class="small-input is-semiBold-16-600-19"
            v-model="interval"
          />
          <p :class="{ 'has-text-lightgrey': until != 'occurance' }" class="is-medium-16-500-19">Times</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import RepeatDateCalendar from "./repeat-date.vue";

  export default {
    props: ["existing_rule"],
    components: {
      RepeatDateCalendar,
    },
    data() {
      return {
        until: "date",
        repeat_forever: true,
        interval: 1,
        date: new Date(),
      };
    },
    created() {
      if (this.existing_rule) {
        if (this.existing_rule.interval) {
          this.repeat_forever = false;
          this.until = "occurance";
          this.interval = this.existing_rule.interval;
        } else if (this.existing_rule.date) this.repeat_forever = false;
        this.until = "date";
        this.date = new Date(this.existing_rule.date);
      } else {
        this.repeat_forever = true;
      }
    },
  };
</script>

<style lang="scss">
  .px-25 {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }

  .ml-35 {
    margin-left: 3.5rem;
  }
</style>
