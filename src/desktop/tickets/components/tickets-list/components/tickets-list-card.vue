<template>
  <div class="tickets-card">
    <div class="tickets-card--header is-semiBold-18-600-22" :class="[[type ? `is-${type.name}` : null], `${type.name.split(' ').join('-')}-status`]">
      <div class="tickets-card--header__icon is-flex mr-10 is-pointer" @click="active = !active">
        <sh-icon
          :name="'chevron-white'"
          class="is-18x18 padding-4"
          :class="[{ 'rotate-90': active }, `is-${type.name.split(' ').join('-')}`]"
        ></sh-icon>
      </div>

      <p class="is-capitalized">{{ type.name }}</p>
      <p class="counter">{{ tickets.length }}</p>
      <p
        v-if="!create_new"
        class="has-text-new-grey is-medium-14-500-17 ml-15 is-pointer is-flex is-vcenter card-create-new"
        @click="create_new = true"
      >
        <sh-icon :name="'plus'" class="is-12x12 mr-5"></sh-icon>
        <span>
          New Ticket
        </span>
      </p>
    </div>

    <div v-if="create_new" class="mb-30 overflow-visible" v-click-outside="() => (create_new = false)">
      <create-new-ticket
        :status="grouped_by == 'status' ? type : null"
        :priority="grouped_by == 'priority' ? type : null"
        v-if="tickets"
        :element="element"
      ></create-new-ticket>
    </div>

    <div
      infinite-scroll-disabled="loading || is_fetched_all"
      class="tickets-card--list has-slimscroll-xs"
      v-infinite-scroll="getData"
      infinite-scroll-immediate-check="true"
      infinite-scroll-distance="0"
      style="max-height:100vh;overflow-x:hidden; overflow-y:scroll"
      v-if="active"
    >
      <div v-for="item in tickets" :key="item.uid">
        <tickets-list-item :ticket="item" :is_grouped="is_grouped" :is_viewer_small="is_viewer_small"></tickets-list-item>
      </div>
      <div v-if="loading" class="has-text-centered mb-10">
        <!-- <i class="fa fa-spinner fa-spin"></i> -->
        <tickets-list-skeleton></tickets-list-skeleton>
      </div>
      <!-- <div v-if="!create_new" :class="[is_viewer_small ? 'has-order-1' : 'has-order-2']" class="new_ticket">
        <p class="has-text-blue-grey is-medium-14-500-17">
          <span
            @click="create_new = true"
            class="is-pointer"
            :class="{ 'is-disabled': ($route.name == 'tickets-list' && !has_asset) || $route.name == 'dashboard' }"
          >
            <i class="fas fa-plus mr-10"></i>New Ticket
          </span>
        </p>
      </div> -->
    </div>
  </div>
</template>

<script>
  import TicketsListItem from "./tickets-list-item";
  import CreateNewTicket from "./create-new-ticket";
  import { ticketService } from "@/desktop/shared/services/";
  import { mapState } from "vuex";
  const queryString = require("query-string");
  import TicketsListSkeleton from "@/desktop/shared/components/skeleton/tickets/tickets-list-skeleton.vue";
  var infiniteScroll = require("vue-infinite-scroll");
  export default {
    directives: { infiniteScroll },
    props: ["tickets", "type", "is_grouped", "element", "is_viewer_small", "has_asset", "grouped_by", "extra_query"],
    data() {
      return {
        is_fetched_all: false,
        loading: false,
        active: true,
        create_new: false,
        page_size: 30,
      };
    },
    components: {
      TicketsListItem,
      CreateNewTicket,
      TicketsListSkeleton,
    },
    created() {
      this.$eventHub.$on("close_create_ticket", this.close_create_ticket);
      this.getData();
    },
    beforeDestroy() {
      this.$eventHub.$off("close_create_ticket", this.close_create_ticket);
    },
    computed: {
      ...mapState("tickets", ["group_by", "filters", "sort_by", "search_by", "selected_asset", "is_internal"]),
      apply_filter() {
        return this.is_internal, this.selected_asset, this.sort_by, this.filters, this.search_by, this.group_by, Date.now();
      },
    },
    watch: {
      apply_filter() {
        this.is_fetched_all = false;
        this.getData(true);
      },
    },
    methods: {
      close_create_ticket () {
        this.create_new = false;
      },
      getData(zero_offset) {
        if (this.is_fetched_all) return;
        if (this.element && _.isString(this.element)) return;
        let query = {
          pageSize: this.page_size,
          offset: zero_offset ? 0 : this.tickets.length,
          q: this.search_by,
          tags: true,
          isTemplate: false,
          assetUid: this.$route.query.asset || null,
          internal: this.is_internal,
        };
        if (this.element && this.element.uid) query["element"] = this.element.uid;
        this.filters.forEach((filter) => {
          if (filter.key && filter.active) query[filter.key] = filter.value;
        });
        let assets_query = "";
        this.selected_asset.forEach((asset) => {
          assets_query += "&assetUid=" + asset;
        });
        if (this.sort_by.key) query["sort"] = (this.sort_by.order ? "-" : "") + this.sort_by.key;
        query[this.group_by.filter_key] = this.type.value;
        query = { ...query, ...this.extra_query };
        this.loading = true;
        ticketService
          .getAll({
            query: queryString.stringify(query) + assets_query,
          })
          .then((res) => {
            this.loading = false;
            this.$store.dispatch("tickets/add_tickets", [...this.$store.state.tickets.tickets, ...res.data]);
            if (!res.data.length || res.data.length < this.page_size) {
              this.is_fetched_all = true;
            }
          })
          .catch((err) => {
            this.loading = false;
            this.handleErrors(err);
          });
      },
    },
  };
</script>

<style lang="scss">
  .tickets-card {
    background-color: $white;
    margin-bottom: 2rem;
    overflow: visible;
    &.is_borderless {
      border-left: none;
      background-color: $primary-background;
    }
    .card-create-new {
      visibility: hidden;
    }
    &--header {
      padding: 2rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      font-family: Barlow-SemiBold;
      font-size: 18px;
      font-weight: 600;
      line-height: 22px;
      &.pending-status {
        color: $pending-status;
      }
      &.in-progress-status {
        color: $completed-status;
      }
      &.resolved-status {
        color: $resolved-status;
      }
      &.closed-status {
        color: $closed-status;
      }
      &.rejected-status {
        color: $rejected-status;
      }
      &.Critical-status {
        color: $priority-critical;
      }
      &.High-status {
        color: $priority-high;
      }

      &.Medium-status {
        color: $priority-medium;
      }
      &.Low-status {
        color: $priority-low;
      }
      &__icon {
        border-radius: 100%;
        overflow: hidden;
        height: 18px;
        width: 18px;
        .is-pending {
          background: $pending-status;
        }
        .is-in-progress {
          background: $completed-status;
        }
        .is-resolved {
          background: $resolved-status;
        }
        .is-closed {
          background: $closed-status;
        }
        .is-rejected {
          background: $rejected-status;
        }
        .is-Critical {
          background: $priority-critical;
        }
        .is-High {
          background: $priority-high;
        }

        .is-Medium {
          background: $priority-medium;
        }
        .is-Low {
          background: $priority-low;
        }
      }
      .counter {
        border-radius: 100px;
        background-color: #dee5f0;
        margin-left: 1rem;
        display: inline-block;
        height: 2.2rem;
        width: 2.2rem;
        font-size: 1.4rem;
        text-align: center;
        color: $light-grey-text;
        line-height: 2rem;
      }
    }

    .name-block {
      display: flex;
      align-items: baseline;
    }

    &:hover {
      .card-create-new {
        visibility: visible;
      }
    }
  }

  .pending-status {
    border-color: $pending-status;
  }
  .inprogress-status {
    border-color: $completed-status;
  }
  .resolved-status {
    border-color: $resolved-status;
  }
  .closed-status {
    border-color: $closed-status;
  }
  .rejected-status {
    border-color: $rejected-status;
  }
  .has-order-1 {
    order: 1;
  }
  .has-order-2 {
    order: 2;
  }
  .rotate-90 {
    transform: rotate(-90deg);
  }
  .new_ticket {
    position: sticky;
    bottom: 0;
    height: 5rem;
    background: white;
    width: 100%;
    border-top: 1px solid #eee;
    padding: 1.5rem 10rem;
  }
</style>
