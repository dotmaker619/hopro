<template>
  <div>
    <div class="ticket-overview-options">
      <div class="ticket-overview-options__left">
        <span class="is-flex align-center">
          <sh-icon
            @click.native="$router.go(-1)"
            v-if="$route.name != 'overview' && $route.name != 'schedules'"
            :name="'ticket-header-back'"
            class="is-16x16 mr-10 is-pointer"
          />
          <span class="ticket-overview-options__left__title">
            {{ component_name }}
          </span>
        </span>
        <asset-dropdown class="px-10"></asset-dropdown>
        <span @click="openDisplayDropdown = !openDisplayDropdown" class="assets-selection">
          <span class="is-medium-14-500-17 option-title">Show:</span>
          <span class="option-value is-semiBold-14-600-17">{{ selected_display_option || "All" }}</span>
          <sh-icon :name="`${openDisplayDropdown?'expand':'collapse'}`" class="is-16x16 is-pointer"></sh-icon>
          <display-dropdown
            @filterDisplay="
              selected_display_option = $event.key;
              $emit('addDisplayFilter', $event.filter);
            "
            v-if="openDisplayDropdown"
            v-click-outside="() => (openDisplayDropdown = false)"
          ></display-dropdown>
        </span>
        <span @click="open_filter = true" class="assets-selection">
          <span>
            <span class="is-medium-14-500-17 option-title">Filters: </span>
            <span class="option-value is-semiBold-14-600-17">All</span>
          </span>
          <sh-icon :name="`${open_filter?'expand':'collapse'}`" class="is-16x16 is-pointer"></sh-icon>
          <filter-dropdown
            v-if="open_filter"
            v-click-outside="() => (open_filter = false)"
            :filtersData="allFiltersData"
            @apply="
              $emit('apply_filter', $event);
              open_filter = false;
            "
            @close="open_filter = false"
          />
        </span>
      </div>
      <div class="ticket-overview-options__right is-medium-14-500-17">
        <slot name="right-side"></slot>
      </div>
    </div>
    <div class="columns" v-if="openFilterDropdown">
      <div class="column is-12">
        <filter-card :ticket="all_tickets"></filter-card>
      </div>
    </div>
  </div>
</template>

<script>
  import AssetDropdown from "@/desktop/tickets/components/tickets-list/components/tickets-top-filters/components/asset-dropdown.vue";
  import DisplayDropdown from "@/desktop/tickets/components/ticket-dashboard/shared/filters/display-dropdown";
  import FilterDropdown from "@/desktop/tickets/shared/components/filter-card/filter-dropdown";
  export default {
    props: ["assets"],
    components: {
      AssetDropdown,
      DisplayDropdown,
      FilterDropdown,
    },

    data() {
      return {
        openAssetsDropdown: false,
        openFilterDropdown: false,
        openDisplayDropdown: false,
        open_filter: false,
        allFiltersData: {},
        selected_display_option: "All",
        selectd_assets: null,
      };
    },

    computed: {
      component_name() {
        if (this.$route.name == "overview") {
          return "Overview";
        } else if (this.$route.path.includes("checklists")) {
          return "Checklists";
        } else if (this.$route.path.includes("schedules")) {
          return "Schedules";
        } else if (this.$route.name == "overview-member") {
          return "Overview";
        } else if (this.$route.name == "overview-priority") {
          return "Overview";
        } else if (this.$route.name == "templates") {
          return "Templates";
        } else if (this.$route.name == "template-details") {
          return "Templates";
        } else if (this.$route.name == "filtered-tickets-list") {
          return `Showing ${this.$route.query.key} tickets`;
        }
      },
    },
    created() {
      this.selectd_assets = this.assets;
    },
    methods: {
      activate_filter() {
        this.openFilterDropdown = !this.openFilterDropdown;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .add-new-checklist {
    cursor: pointer;
    height: 3.6rem;
    width: 15rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid $primary;
    border-radius: 4px;
    background-color: $white;
    color: $primary;
    margin-left: 2rem;
  }
</style>
