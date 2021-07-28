<template>
  <div class="duration-dropdown" v-click-outside="() => (active = false)">
    <div class=" duration-dropdown--header" @click="active = !active">
      <sh-icon :name="'select-date'" class="is-24x24 mr-7" />
      <span class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black">{{ selected ? custom_dates : "Select Date" }}</span>
    </div>
    <div class="duration-dropdown--body" v-if="active">
      <p v-for="(option, i) in options" :key="i" @click="update_selection(option)" :class="{ 'has-background-hovered': option == selected }">
        {{ option }}
      </p>
      <p :class="{ 'has-background-hovered': duration == 'Custom' }">
        <duedate-dropdown
          :icon_class="'is-14x14 mr-7'"
          :due="startDate && dueDate ? [new Date(startDate), new Date(dueDate)] : dueDate ? [new Date(dueDate)] : []"
          @change-duedate="
            selected = $event;
            $emit('custom-date', selected);
          "
        ></duedate-dropdown>
      </p>
      <p
        class="filter-dropdown-bottom"
        @click="
          selected = null;
          $emit('clear-duration');
        "
      >
        <span class="is-pointer is-flex align-center" @click="filter = []">
          <sh-icon :name="'ticket-filter-clear-all'" class="is-12x12 mr-10" />
          <span>Clear all</span>
        </span>
      </p>
    </div>
  </div>
</template>
<script>
  import DuedateDropdown from "@/desktop/tickets/shared/components/duedate-range-dropdown";

  export default {
    props: ["duration", "dueDate", "startDate"],
    data() {
      return {
        active: false,
        options: ["Today", "Tomorrow", "Yesterday", "Last week", "Last month", "Last year"],
        selected: null,
      };
    },
    components: {
      DuedateDropdown,
    },
    computed: {
      custom_dates() {
        if (typeof this.selected == "string") {
          return this.selected;
        } else {
          if (this.selected && this.selected.length == 2) {
            return `${moment(this.selected[0]).format("DD MMM YY")} - ${moment(this.selected[1]).format("DD MMM YY")}`;
          } else if (this.selected && this.selected.length == 1) {
            return moment(this.selected[0]).format("DD MMM YY");
          } else {
            return this.selected;
          }
        }
      },
    },
    created() {
      if (!this.duration) return;
      if (this.duration == "Custom") {
        if (this.dueDate && this.startDate) {
          this.selected = [this.startDate, this.dueDate];
        } else if (!this.startDate) {
          this.selected = [this.dueDate];
        }
      } else {
        this.selected = this.duration;
      }
    },
    methods: {
      update_selection(val) {
        this.selected = val;
        this.active = false;
        this.$emit("update-duration", this.selected);
      },
    },
  };
</script>
<style lang="scss" scoped>
  .duration-dropdown {
    position: relative;
    &--header {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    &--body {
      border-radius: 10px;
      width: 27rem;
      position: absolute;
      background: white;
      font-family: Barlow-Medium;
      border-bottom-left-radius: 10px;
      border-top: 0 solid transparent;
      border-bottom-right-radius: 10px;
      box-shadow: 0 22px 30px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px rgba(23, 30, 72, 0.1);
      border-top: none;
      bottom: 0;
      overflow: hidden;
      p {
        height: 4rem;
        padding: 0.7rem 1.7rem;
        display: flex;
        align-items: center;
        background-color: $white;
        font-family: Barlow-Medium;
        font-size: 1.6rem;
        font-weight: 500;
        line-height: 1.9rem;
        &:hover {
          background-color: $primary-background;
          cursor: pointer;
        }
        &.has-background-hovered {
          background-color: $primary-background;
        }
      }
    }
  }
</style>
