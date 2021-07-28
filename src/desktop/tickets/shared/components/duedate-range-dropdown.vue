<template>
  <div class="is-sh-dropdown columns is-marginless is-relative is-duedate" v-click-outside="() => (active = false)">
    <div
      class="is-close is-pointer column is-narrow is-relative padding-10"
      v-tooltip="{
        content: `${'Select duedate range'}`,
      }"
      :class="[$route.name == 'reports' ? 'is-paddingless' : 'is-selector']"
      @click="
        active = !active;
        create_cal();
      "
    >
      <p class="is-flex align-center">
        <span @click.stop.prevent="change_duedate([])">
          <sh-icon
            :name="dueText == 'Select Date' || $route.name == 'reports' ? 'select-date' : 'ticket-priority-close'"
            :class="[dueText == 'Select Date' || $route.name == 'reports' ? 'is-24x24 mr-7' : 'is-12x12 mr-5']"
          />
        </span>
        <span>{{ dueText }}</span>
      </p>
    </div>
    <div class="mobile-background" v-if="active" @click="active = !active"></div>
    <div
      class="dueDate-calendar"
      :class="{
        'is-hidden': !active,
        'report-duedate': $route.name == 'reports',
      }"
    >
      <div id="filter_calendar_container"></div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["ticket", "icon_class", "custom_text", "custom_text_class", "due"],
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
      dueText() {
        if (this.due.length == 2) {
          return moment(new Date(this.due[0])).format(" Do MMM") + " - " + moment(new Date(this.due[1])).format(" Do MMM");
        } else if (this.due.length == 1 && this.$route.name == "reports") {
          return moment(new Date(this.due[0])).format(" Do MMM");
        } else {
          return this.$route.name == "reports" ? "Custom" : "Select Date";
        }
      },
    },
    methods: {
      create_cal() {
        if (!this.calendar) {
          this.calendar = new dhx.Calendar("filter_calendar_container", {
            css: `${this.isMobile ? "for-mobile" : "tickets-cal"}`,
            range: true,
            value: this.due.length > 1 ? this.due : new Date(),
          });
        }
        this.calendar.events.on("Change", (date) => {
          this.change_duedate(this.calendar.getValue(true));
        });
      },
      change_duedate(date) {
        this.$emit("change-duedate", date);
      },
    },
  };
</script>
<style lang="scss" scoped>
  .report-duedate {
    bottom: -24px;
  }
  .dueDate-calendar {
    right: -1.6rem;
  }
</style>
