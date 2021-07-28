<template>
  <div class="tickets-filters-groupby" v-click-outside="() => (active = false)">
    <span class="heading-1">Group By:</span>

    <div class="dropdown is-right" :class="{'is-active':active}">
      <div class="dropdown-trigger" @click="active=!active">
        <span class="heading-2">{{group_by.label}}</span>
        <span class="icon is-small">
          <i class="fas fa-angle-down" aria-hidden="true"></i>
        </span>
      </div>
      <div class="dropdown-menu" role="menu">
        <div class="dropdown-content">
          <a
            @click="item.enable?group_by = item:''"
            class="dropdown-item"
            :class="{'is-disabled':!item.enable}"
            v-for="(item,i) in data"
            :key="i"
          >
            <span>{{item.label}}</span>
            <sh-icon v-if="group_by.key==item.key" :name="'tick'" class="is-16x16" />
          </a>
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
  props: ['data'],
  computed: {
    group_by: {
      get() {
        return this.$store.state.tickets.group_by;
      },
      set(value) {
        this.$store.commit("tickets/SET_GROUP_BY", value);
      }
    }
  }
};
</script>

<style lang="scss">
.tickets-filters-groupby {
  .dropdown-content {
    width: 135px;
    .dropdown-item {
      font-size: 1.4rem !important;
    }
  }
}
</style>