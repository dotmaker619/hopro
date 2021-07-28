<template>
  <div class="vault-filters-groupby" v-click-outside="() => (active = false)">
    <span class="heading-1">{{header}}:</span>
    <div class="dropdown" :class="{'is-active':active,'is-right':header=='Group by'}">
      <div class="dropdown-trigger" @click="active=!active">
        <span class="heading-2">{{filters.label}}</span>
        <span class="icon is-small">
          <i class="fas fa-angle-down" aria-hidden="true"></i>
        </span>
      </div>
      <div class="dropdown-menu" role="menu">
        <div class="dropdown-content pb-15">
          <div class="dropdown-header padding-10">
            <span class="is-medium-16-500-19 has-opacity-5 ml-10 pt-10">
              {{header}}
            </span>
          </div>
          <a
            @click="item.enable?filters = item:'';active=false;"
            class="dropdown-item px-20"
            :class="{'is-disabled':!item.enable}"
            v-for="(item,i) in data"
            :key="i"
          >
            <span>{{item.label}}</span>
            <sh-icon v-if="filters.key==item.key" :name="'tick'" class="is-16x16" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['data','filters','header','type'],
  data() {
    return {
      active: false,
    };
  },
  computed:{
    filters: {
      get() {
        if(this.type=='groupby')
        return this.$store.state.vault.group_by;
        else
        return this.$store.state.vault.show_filter;
      },
      set(value) {
        if(this.type=='groupby')
        this.$store.commit("vault/SET_GROUP_BY", value);
        else
        this.$store.commit("vault/SET_SHOW_FILTER", value);
      }
    }
  }
};
</script>

<style lang="scss">
.vault-filters-groupby {
  .dropdown .dropdown-menu .dropdown-content{
    border-radius: 1rem;
    box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.16);
    border: solid 1px rgba(23, 30, 72, 0.1);
    background-color: #ffffff;
    }
  .dropdown-content {
    width: 20rem;
    .dropdown-item {
      font-size: 1.4rem !important;
    }
  }
}
</style>