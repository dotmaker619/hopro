<template>
  <div class="status-progress">
    <div
      class="status-progress__bar first"
      @click="$emit('show_status', 1)"
      v-tooltip="{ content: first_val.name+': '+first_val.value , html: false}"
      :style="{ width: total.first + '%' }"
    ></div>
    <div
      class="status-progress__bar second"
      @click="$emit('show_status', 2)"
      v-tooltip="{ content: second_val.name+': '+second_val.value , html: false}"
      :style="{ width: total.second + '%' }"
    ></div>
    <div
      class="status-progress__bar third"
      @click="$emit('show_status', 3)"
      v-tooltip="{ content: third_val.name+': '+third_val.value , html: false}"
      :style="{ width: total.third + '%' }"
    ></div>
    <div
      class="status-progress__bar fourth"
      @click="$emit('show_status', 4)"
      v-tooltip="{ content: fourth_val.name+': '+fourth_val.value , html: false}"
      :style="{ width: total.fourth + '%' }"
    ></div>
    <div
      class="status-progress__bar fifth"
      @click="$emit('show_status', 5)"
      v-tooltip="{ content: fifth_val.name+': '+fifth_val.value , html: false}"
      :style="{ width: total.fifth + '%' }"
    ></div>
  </div>
</template>

<script>
export default {
  // props: {
  //   first_val: {
  //     type: Number,
  //     default: 0,
  //   },
  //   second_val: {
  //     type: Number,
  //     default: 0,
  //   },
  //   third_val: {
  //     type: Number,
  //     default: 0,
  //   },
  //   fourth_val: {
  //     type: Number,
  //     default: 0,
  //   },
  //   fifth_val: {
  //     type: Number,
  //     default: 0,
  //   },
  // },

  props: ["first_val", "second_val", "third_val", "fourth_val", "fifth_val"],
  computed: {
    total() {
      let total =
        this.first_val.value + this.second_val.value + this.third_val.value + this.fourth_val.value;
      var percent = {
        first: (this.first_val.value * 100) / total,
        second: (this.second_val.value * 100) / total,
        third: (this.third_val.value * 100) / total,
        fourth: (this.fourth_val.value * 100) / total,
        fifth: (this.fifth_val.value * 100) / total,
      };

      return percent;
    },
  },
};
</script>

<style lang="scss" scoped>
.status-progress {
  background: $white;
  width: 80%;
  opacity: 0.9;
  height: 0.5rem;
  display: flex;
  flex-wrap: nowrap;
  cursor: pointer;

  &__bar {
    height: 0.6rem;
    margin: 0 1px;
    border-radius: 1rem;
  }
}
.first {
  background-color: $pending-status;
}
.second {
  background-color: $completed-status;
}
.third {
  background-color: $resolved-status;
}
.fourth {
  background-color: $closed-status;
}
.fifth {
  background-color: $rejected-status;
}
</style>
