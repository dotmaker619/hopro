<template>
  <div class="assets-selection" v-click-outside="() => (active = false)">
    <div class="is-flex align-center" @click="active = !active">
      <span class="is-medium-14-500-17 option-title">Show:</span>
      <span class="option-value is-semiBold-14-600-17 is-pointer">{{
        active_filters.length
          ? "Selected (" + active_filters.length + ")"
          : "All"
      }}</span>
      <sh-icon :name="`${active?'expand':'collapse'}`" class="is-16x16 is-pointer"></sh-icon>
    </div>
    <div
      class="dropdown"
      v-if="active"
      v-click-outside="() => (active = false)"
    >
      <div class="dropdown-header">
        <span class="is-medium-16-500-19 has-opacity-5 mr-15">
          Show
        </span>
      </div>

      <div class="display-dropdown-content has-slimscroll">
        <div
          class="display-dropdown-content__item"
          v-for="(filter, key, i) in filters"
          :key="i"
          @click="
            filter.active = !filter.active;
            filters = [...filters];
            is_filters_dropdown = false;
          "
        >
          <span class="is-medium-14-500-24 cardfilter-item-name">{{
            filter.label
          }}</span>
          <span>
            <sh-icon
              v-if="filter.active"
              :name="'ticket-show-tick'"
              class="is-14x14"
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      active: false,
    };
  },
  computed: {
    filters: {
      get() {
        return this.$store.state.tickets.filters;
      },
      set(value) {
        this.$store.commit("tickets/SET_FILTERS", value);
      },
    },
    group_by: {
      get() {
        return this.$store.state.tickets.group_by;
      },
      set(value) {
        this.$store.commit("tickets/SET_GROUP_BY", value);
      },
    },
    active_filters() {
      let selected = [];
      this.filters.forEach((f) => {
        if (f.active) selected.push(f.label);
      });
      return selected;
    },
  },
};
</script>

<style lang="scss">
.tickets-filters-filters {
  .dropdown-content {
    width: 160px;
  }
}
</style>
<style lang="scss" scoped>
.assets-selection {
  display: flex;
  align-items: center;
  position: relative;
  color: $primary-text;
}

.dropdown {
  box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.16);
  border: solid 1px rgba(23, 30, 72, 0.1);
  background-color: #ffffff;
  position: absolute;
  width: 200px;
  // height: 412px;
  z-index: 1;
  border-radius: 2rem;
  // padding: 2rem;
  // overflow: auto;
  top: 25px;
  left: 12px;
  display: block;

  &-header {
    padding: 2rem 2rem 0;
  }

  &-input {
    margin: 0 2rem;
  }
}

.display-dropdown-content {
  margin-top: 1rem;
  &__item {
    padding: 1.2rem 3rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &:hover {
      background-color: #f7f8ff;
    }
    &:last-child:hover {
      border-radius: 0 0 2rem 2rem;
      background-color: #f7f8ff;
    }
  }
  .cardfilter-item-name {
    color: #171e48;
  }

  .cardfilter-icon {
    height: 2.4rem;
    width: 2.4rem;
    background-color: red;
    border-radius: 50%;
    color: white;
    display: flex;
    line-height: 24px;
    justify-content: center;
    text-transform: uppercase;
    margin: 0 0 0 15px;
  }
}
</style>
