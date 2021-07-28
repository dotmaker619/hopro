<template>
  <div class="assets-selection" v-click-outside="() => (active = false)">
    <div class="is-flex align-center" @click="active = !active">
      <span class="is-medium-14-500-17 option-title">Sort by:</span>
      <span class="option-value is-semiBold-14-600-17 is-pointer">{{ sort_by.label || "None" }}</span>
      <sh-icon :name="`${active ? 'expand' : 'collapse'}`" class="is-16x16 is-pointer"></sh-icon>
    </div>
    <div class="dropdown" v-if="active" v-click-outside="() => (active = false)">
      <div class="dropdown-header">
        <span class="is-medium-16-500-19 has-opacity-5 mr-15">
          Sort by
        </span>
      </div>
      <div class="display-dropdown-content has-slimscroll">
        <div class="display-dropdown-content__item" v-for="(item, key, i) in data" :key="i" @click="set_sortby(item)">
          <span class="is-medium-14-500-24 cardfilter-item-name">{{ item.label }}</span>
          <span>
            <i v-if="item.label == sort_by.label" :class="`fas fa-sort-${sort_by.order ? 'up' : 'down'}`"></i>
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
        data: [
          { label: "Status", key: "status", order: false },
          { label: "Name", key: "name", order: false },
          { label: "Raised", key: "owner", order: false },
          { label: "Priority", key: "priority", order: false },
          { label: "Assignee", key: "takenUp", order: false },
          { label: "Progress", key: "progress", order: false },
          { label: "DueDate", key: "dueDate", order: false },
        ],
      };
    },
    computed: {
      sort_by: {
        get() {
          return this.$store.state.tickets.sort_by;
        },
        set(value) {
          this.$store.commit("tickets/SET_SORT_BY", value);
        },
      },
    },
    methods: {
      set_sortby(item) {
        if (this.sort_by.key == item.key) {
          this.sort_by = { ...this.sort_by, order: !this.sort_by.order };
        } else this.sort_by = { ...item };
      },
    },
  };
</script>

<style lang="scss">
  .tickets-filters-sort {
    .dropdown-content {
      width: 150px;
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
    border-radius: 1rem;
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
