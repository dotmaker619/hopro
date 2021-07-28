<template>
  <div class="ticket-card ticket-card-height">
    <div class="ticket-card-options">
      <div
        class="ticket-card-options__left is-pointer"
        @click="getPriority('priority', 'status', {})"
        @mouseover="refresh = true"
        @mouseleave="refresh = false"
      >
        <sh-icon :name="'ticket-history-recents'" class="is-24x24 mr-5" />
        <div class="is-medium-12-500-14 has-opacity-5 has-text-danger" v-if="refresh">Refresh</div>
        <div class="is-medium-12-500-14 has-opacity-5" v-else>{{ since }} mins ago</div>
      </div>
      <div class="ticket-card-options__right">
        <sh-icon :name="'ticket-download'" class="is-24x24 mr-15 is-pointer is-hidden" />
        <span
          @click="$router.push({ name: 'overview-priority', query: { filter: selected_filter } })"
          :class="[!eachCount || !Object.keys(eachCount).length ? 'has-no-access' : null]"
        >
          <sh-icon :name="'ticket-expand-maximize'" class="is-24x24 is-pointer" />
        </span>
      </div>
    </div>

    <div class="ticket-card-heading">
      <div class="ticket-card-heading__icon">
        <sh-icon :name="'ticket-card-priority'" class="is-50x50" />
      </div>
      <div class="ticket-card-heading__title ">
        Priority
      </div>
      <div class="ticket-card-heading__subtitle">
        <div @click="open_ticket_dropdown = !open_ticket_dropdown" class="ticket-dropdown">
          <span class="option-value is-medium-14-500-17">{{ selected_filter && selected_filter.key ? selected_filter.key : "All" }}</span>
          <sh-icon v-if="open_ticket_dropdown" :name="'expand'" class="is-16x16 is-pointer" />
          <sh-icon v-else :name="'collapse'" class="is-16x16 is-pointer" />
          <ticket-dropdown
            :selected_filter="(selected_filter && selected_filter.key) || 'All'"
            @filter_selection="add_filter"
            v-if="open_ticket_dropdown"
            v-click-outside="() => (open_ticket_dropdown = false)"
            :dropdown_items="dropdown_items"
          ></ticket-dropdown>
        </div>
      </div>
    </div>

    <div class="ticket-card-priority" v-if="eachCount && Object.keys(eachCount).length">
      <div class="ticket-db-list" v-for="(priority, i) in eachCount" :key="i">
        <div class="ticket-db-list__details">
          <div class="ticket-db-list__details__top is-medium-16-500-19">
            <div class="ticket-db-list__details__left priority-title">
              <sh-icon :name="`ticket-priority-${i}`" class="is-16x16 mr-5" />
              <span class="is-capitalized">{{ i }}</span>
            </div>
            <div class="ticket-db-list__details__right">{{ (priority.closed && priority.closed.count) || 0 }}/{{ priority.total }}</div>
          </div>
          <div class="ticket-db-list__details__bottom">
            <ticket-progress :total="priority.total" :value="(priority.closed && priority.closed.count) || 0" :color="i"></ticket-progress>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p class="is-regular-14-500-17 has-text-centered has-opacity-8 py-20">
        No tickets found for the selected filters!
      </p>
    </div>

    <div
      class="ticket-card-showmore is-medium-14-500-17"
      :class="[!eachCount || !Object.keys(eachCount).length ? 'has-no-access has-text-grey' : null]"
      @click="$router.push({ name: 'overview-priority', query: { filter: selected_filter } })"
    >
      Show more
      <img src="@/assets/icons/tickets/showmore-arrow.png" alt="" />
    </div>
  </div>
</template>

<script>
  import TicketDropdown from "../../../shared/filters/ticket-dropdown";
  import TicketProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-progress.vue";
  import OverviewMixin from "../../../shared/mixins/overview.mixin";

  export default {
    mixins: [OverviewMixin],
    props: ["top_header_query"],
    components: {
      TicketDropdown,
      TicketProgress,
    },
    data() {
      return {
        open_ticket_dropdown: false,
        allPriority: [],
        selected_filter: null,
        eachCount: {},
        dropdown_items: [
          { id: "1", name: "All" },
          { id: "2", name: "Assigned" },
          { id: "3", name: "Raised" },
        ],
      };
    },
    watch: {
      top_header_query() {
        this.add_filter();
      },
    },
    created() {
      this.getPriority("priority", "status", {});
    },

    methods: {
      async getPriority(xkey, ykey, filter) {
        this.eachCount = {};
        this.allPriority = await this.getReport(xkey, ykey, filter);
        if (this.allPriority) {
          this.allPriority.map((item) => {
            return (this.eachCount[item.x] = {
              closed: _.remove(item.y, function(y) {
                return y.type == "closed";
              })[0],
              total: _.sumBy(item.y, function(o) {
                return o.count;
              }),
            });
          });
        }

        this.eachCount = Object.assign({}, this.eachCount);
      },

      add_filter(e) {
        let filter;
        switch (e) {
          case "Assigned":
            filter = { "takenUp": this.$store.state.claims.user_id };
            break;
          case "Raised":
            filter = { "owner": this.$store.state.claims.user_id };
            break;
          default:
            filter = {};
        }
        this.selected_filter = {
          key: e,
          filter,
        };
        this.getPriority("priority", "status", filter);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .ticket-card-height {
    // max-height: 680px !important;
  }

  .priority-title {
    display: flex;
    align-items: center;

    img {
      margin-right: 5px;
    }
  }
</style>
