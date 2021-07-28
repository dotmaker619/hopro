<template>
  <no-result-dashboard-app v-if="!has_app_access('tickets')" class="mb-20">
    <img slot="image" style="width:300px" src="@/assets/illustrations/no-permissions-illustration.svg" alt srcset />
    <div slot="title">No Access</div>
    <div slot="button" class="sh-button sh-button--create">Request access</div>
    <div slot="no-result-desc">
      Oops! You don't have enough permissions to access the feature/functionality.
      <br />Your administrator should be able to give access to this feature if registered.
      <br />
      <br />Want this feature to be enabled for your organization?
    </div>
  </no-result-dashboard-app>
  <div v-else-if="($route.meta && $route.meta.screen == 'mobile') || is_vertical_window">
    <mobile-ticket-list
      :element="element"
      @filter="getAllfilter"
      @get_more="load_more"
      :ticketService="ticketService"
      :is_fetched_all="is_fetched_all"
      :is_loading="isTicketsLoading"
      :allFiltersData="allFiltersData"
      :uploadbtnclass="uploadbtnclass"
      :is_vertical_window="is_vertical_window" :customclass="customclass" :hideSearchbar="hideSearchbar"
    ></mobile-ticket-list>
  </div>
  <div class="tickets" v-else>
    <router-view></router-view>
    <div class="tickets-top-section" v-if="$route.name !== 'dashboard'" :class="{ 'is-hidden': extra_query }">
      <ticket-list-filters v-if="!$route.name.includes('viewer')"></ticket-list-filters>
      <div class="columns is-flex is-vcenter">
        <div class="column is-5 is-flex is-vcenter">
          <searchbar @search="$store.commit('tickets/SET_SEARCH_BY', $event)"></searchbar>

          <div class="filter__btn" @click="open_filter = true" :class="{ 'is-active': filtersQueryString.length }">
            <i class="fas fa-filter"></i>
          </div>
          <div class="is-relative" style="left: 22rem;top: 2.2rem;">
            <filter-dropdown
              v-if="open_filter"
              v-click-outside="() => (open_filter = false)"
              :filtersData="allFiltersData"
              @apply="getAllfilter"
              @close="open_filter = false"
            />
          </div>
        </div>
        <div class="column is-5">
          <bulk-actions-bar></bulk-actions-bar>
        </div>

        <div class="column is-2 is-flex is-end">
          <create-ticket-button
            @create_ticket="create_pending_ticket = true"
            v-if="!create_pending_ticket"
            :element="asset_details ? asset_details.element : element"
          ></create-ticket-button>
        </div>
      </div>
    </div>
    <div class="tickets-main-section">
      <div class="tickets-main-section--columns is-vcenter">
        <ticket-headers :small_viewer="is_vertical_window" :sorting_key="sort_key" @update_sort_key="sort_key = $event"></ticket-headers>
      </div>

      <div v-if="create_pending_ticket">
        <create-new-ticket
          :small_viewer="is_vertical_window"
          :without_status="true"
          :element="asset_details ? asset_details.element : element"
        ></create-new-ticket>
      </div>
      <div class="mb-60">
        <div v-if="group_by.key">
          <div v-for="(item, i) in $store.state.tickets.describe[group_by.filter_key]" :key="i">
            <tickets-list-card
              :extra_query="extra_query"
              :tickets="grouped_tickets[item.value] || []"
              :type="item"
              :grouped_by="group_by.filter_key ? group_by.filter_key : null"
              :is_grouped="group_by.key ? true : false"
              :element="asset_details ? asset_details.element : element"
              :has_asset="asset_details ? true : false"
              :is_viewer_small="is_vertical_window"
            ></tickets-list-card>
          </div>
        </div>
        <div v-else>
          <div
            infinite-scroll-immediate-check="true"
            infinite-scroll-disabled="isTicketsLoading || is_fetched_all"
            class="tickets-card--list has-slimscroll-xs"
            v-infinite-scroll="load_more"
            infinite-scroll-distance="0"
            :class="[$route.name == 'therm-viewer' || $route.name == 'terra-viewer' ? 'tickets-height-65' : 'tickets-height-150']"
            style="overflow-x:hidden; overflow-y:scroll"
          >
            <div v-if="sorted_tickets.length">
              <div v-for="item in sorted_tickets" :key="item.uid">
                <tickets-list-item
                  :ticket="item"
                  :is_grouped="group_by.key ? true : false"
                  :is_vertical_window="is_vertical_window"
                ></tickets-list-item>
              </div>
            </div>
            <div v-if="!sorted_tickets.length && !isTicketsLoading">
              <no-results>
                <img slot="image" src="@/assets/illustrations/tickets-illustration.svg" alt />
                <div slot="button" @click="create_pending_ticket = true">
                  <create-ticket-button
                    v-if="!create_pending_ticket && $route.name != 'template-details'"
                    :element="asset_details ? asset_details.element : element"
                    @create_ticket="create_pending_ticket = true"
                    :no_result="true"
                  ></create-ticket-button>
                </div>
              </no-results>
            </div>
            <div class="has-text-centered mb-10" v-if="isTicketsLoading">
              <tickets-list-skeleton></tickets-list-skeleton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import searchbar from "@/desktop/core/shared/components/searchbar";
  import FilterDropdown from "@/desktop/tickets/shared/components/filter-card/filter-dropdown";
  import TicketListFilters from "./components/tickets-top-filters/tickets-top-filters";
  import CreateTicketButton from "@/desktop/tickets/components/tickets-list/components/create-ticket-button";
  import CreateNewTicket from "./components/create-new-ticket";
  import BulkActionsBar from "@/desktop/tickets/shared/components/bulk-actions";
  import ticketsListCard from "./components/tickets-list-card";
  import TicketsListItem from "./components/tickets-list-item";
  import TicketHeaders from "./components/ticket-headers";
  import { ticketService, assetService } from "@/desktop/shared/services/";
  import { mapState, mapActions, mapGetters } from "vuex";
  import mobileTicketList from "@/mobile/modules/tickets/components/tickets-list/mobile-tickets-list";
  import TicketsListSkeleton from "@/desktop/shared/components/skeleton/tickets/tickets-list-skeleton.vue";
  const queryString = require("query-string");

  const infiniteScroll = require("vue-infinite-scroll");
  export default {
    directives: { infiniteScroll },
    props: {
      element: {},
      is_grouped: {
        type: Boolean,
        default: true,
      },
      is_vertical_window: {
        type: Boolean,
        default: false,
      },
      extra_query: {
        type: Object,
        default: null,
      },
      customclass: {
        type: String,
        default: null,
      },
      hideSearchbar: {
        type: Boolean,
        default: false
      },
      uploadbtnclass: {
        type: String,
        default: null
      },
    },
    components: {
      searchbar,
      TicketsListSkeleton,
      BulkActionsBar,
      TicketListFilters,
      CreateTicketButton,
      CreateNewTicket,
      ticketsListCard,
      TicketsListItem,
      TicketHeaders,
      FilterDropdown,
      mobileTicketList,
    },
    data() {
      return {
        isTicketsLoading: false,
        create_pending_ticket: false,
        realTimeQuery: null,
        asset_details: null,
        sort_key: null,
        is_fetched_all: false,
        page_size: 30,
        open_filter: false,
        allFiltersData: {},
        filtersQueryString: "",
      };
    },
    created() {
      if (!this.has_app_access("tickets")) return;

      this.reset_filters();
      this.$store.dispatch("tickets/add_tickets", []);

      this.$eventHub.$on("update_element_data", this.update_element_data);
      // this.getData(true);
      this.$eventHub.$on("get-other-tickets", this.getData);

      this.$eventHub.$on("close_create_ticket", this.close_create_ticket);
      if (this.$route.query.asset) {
        this.get_asset();
      }
      document.addEventListener("keyup", this.clear_selection);
    },
    computed: {
      ...mapState("tickets", ["tickets", "group_by", "filters", "sort_by", "search_by", "selected_asset", "is_internal", "selected"]),
      ...mapState(["PUSHER", "current_organization", "izitoast_options", "users"]),
      grouped_tickets() {
        if (!this.group_by && !this.group_by.key) return _.groupBy(this.sorted_tickets, "status");
        else return _.groupBy(this.sorted_tickets, this.group_by.key);
      },
      sorted_tickets() {
        if (!this.sort_key) return this.tickets;
        let sort_by;
        let order = this.sort_key.startsWith("-") ? "desc" : "asc";
        let key = this.sort_key.startsWith("-") ? this.sort_key.slice(1, this.sort_key.length) : this.sort_key;
        switch (key) {
          case "name":
            sort_by = "name";
            break;
          case "raised":
            sort_by = "owner.uid";
            break;
          case "priority":
            sort_by = "priority.value";
            break;
          case "assignee":
            sort_by = "takenUp.uid";
            break;
          case "progress":
            sort_by = "progress";
            break;

          case "duedate":
            sort_by = "dueDate";
            break;
          default:
            sort_by = "createAt";
        }
        return _.orderBy(this.tickets, [sort_by], [order]);
      },
      apply_filter() {
        return this.is_internal, this.selected_asset, this.sort_by, this.filters, this.search_by, this.group_by, Date.now();
      },
    },
    watch: {
      extra_query() {
        this.is_fetched_all = false;
        this.getData(true);
      },
      apply_filter() {
        this.clear_selected_tickets();
        this.is_fetched_all = false;
        this.getData();
      },
    },
    beforeDestroy() {
      // this.$store.commit('tickets/RESET_STORE');

      this.clear_selected_tickets();
      this.$store.commit("tickets/SET_SEARCH_BY", "");
      this.$store.commit("tickets/SET_GROUP_BY", {
        label: "None",
        key: null,
        filter_key: null,
        enable: true,
      });
      this.$store.dispatch("tickets/add_tickets", []);
      this.$eventHub.$off("update_element_data", this.update_element_data);
      this.$eventHub.$off("close_create_ticket", this.close_create_ticket);
      this.$eventHub.$off("get-other-tickets", this.getData);
      document.removeEventListener("keyup", this.clear_selection);
    },
    methods: {
      update_element_data(element) {
        if (!this.asset_details) return;
        this.asset_details.element = element;
        this.asset_details = Object.assign(this.asset_details);
      },
      close_create_ticket() {
        this.create_pending_ticket = false;
      },
      clear_selection(evt) {
        if (this.selected && this.selected.length) {
          if (evt.keyCode == 27) {
            this.clear_selected_tickets();
          }
        }
      },
      clear_selected_tickets() {
        this.$store.dispatch("tickets/select_ticket");
      },
      getAllfilter(val) {
        this.filtersQueryString = val;
        this.$store.dispatch("tickets/add_tickets", []);
        this.is_fetched_all = false;
        this.getData(true);
        this.$store.commit("tickets/IS_FILTERS_SELECTED", val ? true : false);
      },

      load_more() {
        this.getData(true);
      },
      reset_filters() {
        let filters = [
          { label: "Archived", key: "archived", value: true, active: false },
          {
            label: "Favorites",
            key: "bookmarked",
            value: true,
            active: this.$route.path.includes("/ticket-dashboard/favorites") ? true : false,
          },
          { label: "Overdue", key: "overdue", value: true, active: false },
          {
            label: "Assigned to me",
            key: "takenUp",
            value: this.$store.state.claims ? this.$store.state.claims.user_id : null,
            active: false,
          },
          {
            label: "Created by me",
            key: "owner",
            value: this.$store.state.claims ? this.$store.state.claims.user_id : null,
            active: false,
          },
        ];
        this.$store.commit("tickets/SET_FILTERS", filters);
      },
      async getData(loading = false) {
        this.$store.dispatch("tickets/add_tickets", []);
        try {
          if (this.group_by.key || this.is_fetched_all || (this.element && _.isString(this.element))) return;
          this.isTicketsLoading = true;
          let query = {
            pageSize: this.page_size,
            offset: this.tickets.length,
            q: this.search_by,

            isTemplate: false,

            internal: this.is_internal,
          };
          if (this.element && this.element.uid) query["element"] = this.element.uid;
          this.filters.forEach((filter) => {
            if (filter.key && filter.active) query[filter.key] = filter.value;
          });
          if (this.sort_by.key) query["sort"] = (this.sort_by.order ? "-" : "") + this.sort_by.key;

          if (this.element && this.element.geometry) {
            this.isTicketsLoading = false;
            return;
          }
          let assets_query = "";
          if (this.selected_asset.length > 0) {
            this.selected_asset.forEach((asset) => {
              assets_query += "&assetUid=" + asset;
            });
          }
          query = { ...query, ...this.extra_query };
          if (this.element && this.element.dataUid) {
            query.dataUid = this.element.dataUid;
          }
          let { data, headers } = await this.fetch_tickets(queryString.stringify(query) + assets_query + this.filtersQueryString);
          if (!data.length || data.length < this.page_size) {
            this.is_fetched_all = true;
          }
          this.$store.dispatch("tickets/add_tickets", [...this.tickets, ...data]);

          this.$store.dispatch("tickets/add_tickets_total_count", headers["x-total-count"]);
          this.isTicketsLoading = false;
        } catch (err) {
          console.log(err);
          this.isTicketsLoading = false;
          this.$store.dispatch("tickets/add_tickets", []);
        }
      },
      async fetch_tickets(query) {
        return await ticketService
          .getAll({
            query: query,
          })
          .catch((err) => {
            this.handleErrors(err);
          });
      },

      async get_asset() {
        this.asset_details = await assetService.get({ id: this.$route.query.asset }).catch((err) => {
          this.handleErrors(err);
        });
      },
    },
  };
</script>

<style lang="scss">
  .tickets {
    &-top-section {
      padding: 2rem;
    }
    &-main-section {
      // padding: 2rem 3rem;
      &--columns {
        background: white;
        margin-bottom: 0px !important;
        height: 5.5rem;
        border-bottom: 1px solid #eee;
      }
    }
  }
  .height-40 {
    height: 4rem;
  }
  .tickets-height-65 {
    height: 65vh;
  }
  .tickets-height-150 {
    height: 150vh;
  }

  .filter__btn {
    cursor: pointer;
    height: 4rem;
    min-width: 4rem;
    box-shadow: 2px 2px 4px 0px rgba(23, 30, 72, 0.164);
    border: none;
    border-radius: 0.5rem;
    margin: 0 1.5rem;
    background: white;
    i {
      color: $grey-text;
      margin: auto;
      position: relative;
      top: 1rem;
      left: 1.3rem;
    }
    &.is-active {
      i {
        color: $primary;
        margin: auto;
      }
    }
  }
</style>
