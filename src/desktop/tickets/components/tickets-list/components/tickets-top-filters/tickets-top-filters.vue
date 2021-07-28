<template>
  <div class="tickets-top-filters">
    <div class="left ">
      <div class="is-flex header mr-10">
        <h1 class="left-heading">Tickets</h1>
        <a v-if="$store.getters.is_internal_user" @click="is_internal = !is_internal" class="left-internal-filter" :class="{ 'active': is_internal }"
          >Internal</a
        >
      </div>
      <div class="each-filter">
        <AssetDropdown />
      </div>
      <div class="each-filter">
        <FiltersDropdown />
      </div>
      <div class="each-filter">
        <SortDropdown />
      </div>
    </div>
    <div class="right">
      <GroupByDropdown :data="data" />
    </div>
  </div>
</template>

<script>
  import AssetDropdown from "./components/asset-dropdown";
  import FiltersDropdown from "./components/filters-dropdown";
  import GroupByDropdown from "./components/group-by-dropdown";
  import SortDropdown from "./components/sort-dropdown";
  export default {
    components: {
      AssetDropdown,
      FiltersDropdown,
      SortDropdown,
      GroupByDropdown,
    },
    data() {
      return {
        data: [
          { label: "None", key: null, filter_key: null, enable: true },
          {
            label: "Status",
            key: "status",
            filter_key: "status",
            enable: true,
          },
          {
            label: "Priority",
            key: "priority",
            filter_key: "priority",
            enable: true,
          },
        ],
      };
    },
    computed: {
      is_internal: {
        get() {
          return this.$store.state.tickets.is_internal;
        },
        set(value) {
          this.$store.commit("tickets/SET_IS_INTERNAL", value);
        },
      },
    },
  };
</script>

<style lang="scss">
  .tickets-top-filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    .header {
      align-items: center;
    }
    .left {
      // flex: 0 1 55%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .each-filter {
        margin: 0 1rem;
      }
      &-heading {
        font-family: Barlow-Medium;
        font-size: 16px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.19;
        letter-spacing: normal;
        text-align: left;
        color: $primary-text;
      }
      &-internal-filter {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 10px;
        width: 74px;
        height: 30px;
        border-radius: 6px;
        border: solid 1px rgba(91, 96, 126, 0.3);
        background-color: white;
        opacity: 0.7;
        font-family: Barlow-SemiBold;
        font-size: 14px;
        font-weight: 600;
        line-height: 1.21;
        text-align: left;
        color: #171e48;
        &.active {
          background: #171e48;
          color: white;
        }
      }
    }
    .right {
      display: flex;
    }
    .heading-1 {
      opacity: 0.4;
      font-family: Barlow-Medium;
      font-size: 14px;
      font-weight: 500;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.21;
      letter-spacing: normal;
      text-align: left;
      color: #171e48;
    }
    .heading-2 {
      margin-left: 7px;
      margin-right: 7px;
      font-family: Barlow-SemiBold;
      font-size: 14px;
      font-weight: 600;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.21;
      letter-spacing: normal;
      text-align: left;
      color: #171e48;
      cursor: pointer;
    }

    .dropdown-content {
      border-radius: 12px;
      box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
      border: solid 1px rgba(23, 30, 72, 0.15);
      background-color: white;
      .dropdown-item {
        padding-right: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;
        font-family: Barlow-Medium;
        font-size: 16px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        line-height: 3.13;
        letter-spacing: normal;
        text-align: left;
        color: #171e48;
        &:hover {
          background-color: #f4f6fe;
        }
      }
    }
  }
</style>
