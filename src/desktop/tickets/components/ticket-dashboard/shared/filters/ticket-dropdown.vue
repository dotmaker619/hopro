<template>
  <div class="dropdown-layout">
    <div class="dropdown" @click.stop="active = !active" v-click-outside="() => (active = false)">
      <div v-if="dropdown_header" class="dropdown-header">
        <span class="is-medium-16-500-19 has-opacity-5 mr-15">
          Show
        </span>
      </div>
      <div class="ticket-dropdown-content has-slimscroll">
        <div
          class="ticket-dropdown-content__item"
          v-for="(dropdown_item, i) in dropdown_items"
          :key="i"
          @click="
            filter = dropdown_item.name;
            $emit('filter_selection', filter);
          "
        >
          <span class="is-medium-14-500-24 cardfilter-item-name is-flex align-center">
            <div v-if="has_icon" :class="`status-icon status-icon-${dropdown_item.name}`"></div>
            {{ dropdown_item.name }}
          </span>
          <span>
            <sh-icon v-if="filter == dropdown_item.name" :name="'ticket-show-tick'" class="is-14x14" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["dropdown_items", "dropdown_header", "has_icon", "selected_filter"],
    data() {
      return {
        search_display: [],
        filter: null,
      };
    },
    mounted() {
      this.filter = this.selected_filter ? this.selected_filter : this.dropdown_items[0].name;
    },
  };
</script>

<style lang="scss" scoped>
  .dropdown-layout {
    position: absolute;
    width: inherit;
    display: flex;
    justify-content: center;
  }

  .dropdown {
    box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.16);
    border: solid 1px rgba(23, 30, 72, 0.1);
    background-color: #ffffff;
    position: absolute;
    width: 200px;
    z-index: 1;
    border-radius: 1rem;
    top: 15px;
    // left: 12px;
    display: block;

    &-header {
      padding: 2rem 2rem 0;
      text-align: left;
    }

    &-input {
      margin: 0 2rem;
    }
  }

  .ticket-dropdown-content {
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
      text-transform: capitalize;
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
