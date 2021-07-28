<template>
  <div class="search-box" :class="{ 'has-no-top-border': $route.name.includes('viewer') }">
    <div class="search-box-searchicon">
      <m-icon :name="'search'" class="is-16x16" :file="'tickets-sprite'"></m-icon>
    </div>
    <div class="search-box-input">
      <input
        @input="find_tickets"
        :class="{ 'has-no-top-border': $route.name.includes('viewer') }"
        id="search"
        autocomplete="off"
        type="text"
        :placeholder="`${placeholder_value}`"
      />
    </div>
    <!-- <div> -->
      <div class="search-box-filter" v-if="!$store.state.is_offline && !$route.name.includes('viewer') && filter_option">
        <m-icon :name="'ticket-search-filter'" class="is-16x16" :file="'tickets-sprite'" @click.native="$emit('filter')"></m-icon>
      </div>
    <!-- </div> -->
  </div>
</template>

<script>
  import SearchbarMixin from "@/desktop/core/shared/components/searchbar.mixin.vue";
  export default {
    mixins: [SearchbarMixin],
    props: {
      placeholder_value: {
        type: String,
        default: "Search",
      },
      filter_option: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      find_tickets(e) {
        this.search_keyword = e.target.value;
        this.search();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .search-box {
    background-color: $white;
    height: 4.4rem;
    display: flex;
    align-items: center;
    width: 100%;
    // box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    border-top: 1px solid rgba(23, 30, 72, 0.1);
    border-bottom: 1px solid rgba(23, 30, 72, 0.1);
    &-input {
      width: 100%;
      input {
        width: 100%;
        font-family: Barlow-Medium;
        font-size: 14px;
        font-weight: 500;
        padding-right: 1rem;
        height: 4.4rem;
        // text-indent: 1rem;
        color: #171e48;
        font-size: 1.4rem;
        border-top: 1px solid rgba(23, 30, 72, 0.1);
        border-right: 0 solid rgba(23, 30, 72, 0.1);
        border-bottom: 1px solid rgba(23, 30, 72, 0.1);
        border-left: 0px solid rgba(23, 30, 72, 0.1);
        background-color: #fff;

        &:focus {
          outline: none;
          background-color: rgb(37, 133, 211, 0.05);
        }

        &::placeholder {
          color: rgba(23, 30, 72, 0.4);
        }

        &--error {
          border-color: rgba(255, 87, 34, 0.5);
        }
      }
    }
    &-searchicon {
      padding: 0 1rem 0 1.4rem;
      height: 4.4rem;
      display: flex;
      justify-content: center;
      align-items: center;
      border-left: 1px solid rgba(23, 30, 72, 0.1);
    }
    &-filter {
      min-width: 4.4rem;
      height: 4.4rem;
      display: flex;
      justify-content: center;
      align-items: center;
      border-left: 1px solid rgba(23, 30, 72, 0.1);
    }
  }

  .has-no-top-border {
    border-top: none !important;
  }
</style>
