<template>
  <div class="dropdown" @click.stop="active = !active" v-click-outside="() => (active = false)">
    <div class="dropdown-header">
      <span class="is-medium-16-500-19 has-opacity-5 mr-15">
        Show
      </span>
    </div>

    <div class="display-dropdown-content has-slimscroll">
      <div
        class="display-dropdown-content__item"
        v-for="(display_item, i) in displayItems"
        :key="i"
        @click="
          filter = display_item.name;
          $emit('filterDisplay', {filter: display_item.filter, key: display_item.name});
        "
      >
        <span class="is-medium-14-500-24 cardfilter-item-name">{{ display_item.name }}</span>
        <span>
          <sh-icon v-if="filter == display_item.name" :name="'ticket-show-tick'" class="is-14x14" />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        displayItems: [
          { id: "1", name: "All Time", filter: {} },
          { id: "2", name: "Overdue", filter: { "overdue": true } },
          { id: "3", name: "Favorites", filter: { "bookmarked": true } },
          { id: "4", name: "Archived", filter: { "archived": true } },
          { id: "5", name: "Created by me", filter: { "owner": this.$store.state.claims.user_id } },
          { id: "6", name: "Assigned to me", filter: { "takenUp": this.$store.state.claims.user_id } },
        ],
        search_display: [],
        filter: "All Time",
      };
    },
  };
</script>

<style lang="scss" scoped>
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
