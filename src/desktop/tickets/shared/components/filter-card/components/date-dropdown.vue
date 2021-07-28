<template>
  <div class="filter-cal">
    <input
      class="filter-cal-input"
      @click="create_popup"
      type="text"
      id="date-cal"
      autocomplete="off"
      :value="selectedDate ? new Date(selectedDate).toLocaleDateString() : null"
    />
    <img src="@/assets/icons/tickets/filter/date.svg" alt="" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      show_cal: false,
      calendar: null,
      cal_popup: null,
    };
  },
  mounted() {
    this.create_cal();
  },
  methods: {
    create_cal() {
      if (!this.calendar)
        this.calendar = new dhx.Calendar(null, {
          css: " project-properties__body__row__input is-date",
          dateFormat: "%d/%m/%y",
        });

      this.cal_popup = new dhx.Popup();
      this.cal_popup.attach(this.calendar);

      this.calendar.events.on("change", (date) => {
        this.selectedDate = date;
        this.cal_popup.hide();
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
