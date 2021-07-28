<template>
  <div class="columns" v-click-outside="() => (show_repeat_cal = false)">
    <div
      class="is-flex is-vcenter is-semiBold-16-600-19 is-pointer"
      @click="show_repeat_cal = !show_repeat_cal"
    >
      <p>
        <sh-icon :name="'calendar'" class="is-16x16 mr-10"></sh-icon>
      </p>
      <p>{{ recur_date.toLocaleDateString() }}</p>
    </div>
    <div
      class="repeat-calendar is-relative"
      :class="{ 'is-hidden': !show_repeat_cal || is_disabled }"
    >
      <div id="repeat-container"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["is_disabled", "date"],
  data() {
    return {
      show_repeat_cal: false,
      recur_date: this.date
    };
  },
  mounted() {
    this.create_cal();
  },

  methods: {
    create_cal() {
      var calendar = new dhx.Calendar("repeat-container", {
        value: new Date()
      });
      calendar.events.on("Change", date => {
        this.recur_date = date;
        this.$emit("set_date", this.recur_date);
      });
    }
  }
};
</script>

<style lang="scss">
#repeat-container {
  position: absolute;
  right: 0;
  top: 3rem;
  box-shadow: 2px 2px 5px 2px #eee;
  z-index: 100;
}
</style>
