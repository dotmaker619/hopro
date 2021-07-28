<template>
  <div class="ticket-overview">
    <top-header
      @addDisplayFilter="create_filter_obj($event)"
      @selected_asset="
        assets = $event;
        create_filter_obj({ 'assetUid': $event });
      "
      @apply_filter="parseFilter($event)"
      :assets="assets"
    >
    </top-header>
    <div class="ticket-overview-card">
      <div class="columns" v-if="metrics">
        <div class="column ticket-card" style="height:9rem">
          <div class="is-flex padding-20">
            <sh-icon :name="'hash-blue-bg'" :file="'overview_sprite'" class="is-50x50 mr-15"></sh-icon>
            <div>
              <p class="is-regular-14-500-17 has-text-blue-grey mb-10"># of Tickets</p>
              <p class="is-medium-18-500-22">
                {{ metrics.total }}
              </p>
            </div>
          </div>
        </div>
        <div class="column ticket-card" style="height:9rem">
          <div class="is-flex padding-20">
            <sh-icon :name="'user-blue-bg'" :file="'overview_sprite'" class="is-50x50 mr-15"></sh-icon>
            <div>
              <p class="is-regular-14-500-17 has-text-blue-grey mb-10">Assigned to me</p>
              <p class="is-medium-18-500-22">
                {{ metrics.assigned.total }}
              </p>
            </div>
          </div>
        </div>
        <div class="column ticket-card" style="height:9rem">
          <div class="is-flex padding-20">
            <sh-icon :name="'growth-blue-bg'" :file="'overview_sprite'" class="is-50x50 mr-15"></sh-icon>
            <div>
              <p class="is-regular-14-500-17 has-text-blue-grey mb-10">Created by me</p>
              <p class="is-medium-18-500-22">
                {{ metrics.owner.total }}
              </p>
            </div>
          </div>
        </div>
        <div class="column ticket-card" style="height:9rem">
          <div class="is-flex padding-20">
            <sh-icon :name="'follow-blue-bg'" :file="'overview_sprite'" class="is-50x50 mr-15"></sh-icon>
            <div>
              <p class="is-regular-14-500-17 has-text-blue-grey mb-10">Following</p>
              <p class="is-medium-18-500-22">
                {{ metrics.watching.total }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="columns">
        <div class="column is-4">
          <members :top_header_query="filtersObj" />
          <upcomings :top_header_query="filtersObj" />
        </div>
        <div class="column is-4">
          <priority :top_header_query="filtersObj" />
          <stale :top_header_query="filtersObj" />
        </div>
        <div class="column is-4">
          <tag :top_header_query="filtersObj" />
          <overdue :top_header_query="filtersObj" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import TicketHistory from "./components/history-overview";
  import ActivityTrend from "./components/activity-trend";
  import Members from "./components/members-overview";
  import Priority from "./components/priority-overview";
  import Tag from "./components/tag-overview";
  import Upcomings from "./components/upcomings-overview";
  import Stale from "./components/stale-overview";
  import Overdue from "./components/overdue-overview";
  import TopHeader from "@/desktop/tickets/components/ticket-dashboard/shared/top-header.vue";

  const queryString = require("query-string");
  import { ticketService, userService } from "@/desktop/shared/services/";
  import { mapState, mapActions } from "vuex";
  import TicketDetails from "@/desktop/tickets/components/ticket-details/ticket-details";

  export default {
    components: {
      TicketHistory,
      ActivityTrend,
      Members,
      Priority,
      Tag,
      Upcomings,
      Stale,
      Overdue,
      TopHeader,
    },
    data() {
      return {
        all_tickets: null,
        metrics: null,
        filtersObj: {},
        assets: null,
      };
    },
    created() {
      this.getMetrics();
    },
    methods: {
      async getMetrics() {
        this.metrics = await ticketService
          .get_all_metrics({
            query: queryString.stringify(this.filtersObj),
          })
          .catch((err) => {
            this.handleErrors(err);
          });
      },
      create_filter_obj(query) {
        let newObj = { ...this.filtersObj, ...query };
        this.filtersObj = Object.assign({}, newObj);
        this.getMetrics();
      },
      parseFilter(query) {
        let res = queryString.parse(query);
        this.create_filter_obj(res);
      },
    },
  };
</script>

<style lang="scss">
  .ticket-overview {
    padding: 2rem;
    margin-bottom: 4rem;
    overflow: hidden;
    &-options {
      display: flex;
      margin: 1rem 0;
      justify-content: space-between;
      &__left {
        display: flex;
        align-items: center;
        > span {
          padding: 0 1rem;
        }
        &__title {
          font-family: Barlow-Medium !important;
          font-size: 16px !important;
          font-weight: 500 !important;
        }
      }
      &__right {
        display: flex;
        align-items: center;
        > span {
          padding: 0 0.35rem;
          color: $primary-text;
        }
      }
    }

    &-card {
      .columns .column {
        padding: 0 !important;
      }
    }
  }
  .ticket-card {
    background-color: $white;
    border-radius: 1rem;
    box-shadow: 0 0 3px 0 rgba(23, 30, 72, 0.2);
    margin: 2rem 1rem 0 1rem;
    padding: 1.5rem;
    // min-height: 500px;
    // max-height: 500px;

    &-options {
      display: flex;
      justify-content: space-between;

      &__left {
        display: flex;
        align-items: center;

        img {
          margin-right: 6px;
        }
      }

      &__right {
        display: flex;
        img:not(:last-child) {
          margin-right: 1.5rem;
        }
      }
    }

    &-heading {
      text-align: center;

      &__icon {
        margin-top: 1rem;
        display: flex;
        justify-content: center;
      }

      &__title {
        padding-top: 5px;
        font-family: Barlow-Medium !important;
        font-size: 18px !important;
        font-weight: 500 !important;
        line-height: 22px !important;
        color: $ticket-heading !important;
      }

      &__subtitle {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 1.3rem;
      }
    }

    &-history {
      padding: 0 1.5rem;

      &__card {
        padding: 1rem 0;
      }

      &__title {
        display: flex;
        justify-content: space-between;
        align-items: center;

        &__text {
          color: $primary-text;
          margin-right: 0.7rem;
        }
        &__status {
        }
      }

      &__time {
        color: $primary-text;
        opacity: 0.7;
      }
    }

    &-activity-trend {
      height: 100%;
      img {
        min-height: 100%;
      }
    }

    &-member {
      margin-top: 3rem;
      padding: 0 0.5rem;
      height: 41rem !important;

      &__list {
        display: flex;
        margin: 2rem 0;

        &:last-child {
          margin: 2rem 0 0;
        }
        &:first-child {
          margin: 0 0 2rem;
        }

        .avatar-img {
          height: 4rem;
          width: 4rem;
          border-radius: 50%;
          margin-right: 1rem;
        }

        &__details {
          position: relative;
          width: 100%;

          &__top {
            display: flex;
            justify-content: space-between;
          }

          &__bottom {
            position: absolute;
            bottom: 4px;
            width: 100%;
          }
        }
      }
    }

    &-priority {
      margin-top: 3rem;
      padding: 0 0.5rem;
    }

    &-upcomings {
      margin-top: 3rem;
      padding: 0 0.5rem;
    }
    &-tags {
      margin-top: 3rem;
      padding: 0 0.5rem;
    }

    &-showmore {
      color: $primary;
      padding: 1.5rem 0.5rem 0;
      cursor: pointer;
    }
  }

  .ticket-db-list {
    display: flex;
    margin: 2.5rem 0;
    &:last-child {
      margin: 2.5rem 0 1rem 0;
    }
    > img {
      height: 4rem;
      width: 4rem;
      border-radius: 50%;
      margin-right: 1rem;
    }

    &__details {
      position: relative;
      width: 100%;

      &__topheader {
        color: $secondary-text;
        margin-bottom: 7px;
      }

      &__top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      &__left {
        color: $secondary-text;
        > img {
          height: 1.6rem;
          width: 1.6rem;
        }
      }

      &__right {
        opacity: 0.6;
        color: $primary-text;

        &__item {
          display: flex;
          align-items: center;
          cursor: pointer;
          &:not(:last-child) {
            margin-right: 2rem;
          }

          &__name {
            font-family: Barlow-Medium !important;
            font-size: 14px !important;
            font-weight: 500 !important;
          }
        }
      }

      &__bottom {
        width: 100%;
        margin-top: 1.5rem;
      }
    }
  }

  .is-bottom-border:not(:last-child) {
    border-bottom: 1px solid rgba(23, 30, 72, 0.1);
  }

  .ticket-progress {
    border-radius: 1000px;
    width: 100%;
    background-color: rgba(226, 226, 234, 0.2);
    height: 4px;
  }

  .ticket-value {
    border-radius: 1000px;
    height: 4px;
    background-color: #dbdbdb;

    &-critical {
      background-color: $priority-critical;
    }
    &-high {
      background-color: $priority-high;
    }
    &-medium {
      background-color: $priority-medium;
    }
    &-low {
      background-color: $priority-low;
    }
  }

  .status {
    height: 2.2rem;
    padding: 4px 10px;
    border-radius: 1.8rem;
    text-transform: capitalize;
    color: #000;
    background-color: rgba(0, 0, 0, 0.1);

    &__pending,
    &__1 {
      color: $status-pending;
      background-color: rgba(247, 156, 75, 0.1);
    }

    &__resolved,
    &__3 {
      color: $status-resolved;
      background-color: rgba(82, 64, 185, 0.1);
    }

    &__rejected,
    &__5 {
      color: $status-rejected;
      background-color: rgba(248, 88, 89, 0.1);
    }

    &__inprogress,
    &__2 {
      color: $status-inprogress;
      background-color: rgba(8, 170, 79, 0.1);
    }
    &__closed,
    &__4 {
      color: $status-closed;
      background-color: rgba(185, 187, 199, 0.1);
    }
  }

  .status-icon {
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    background-color: #c1c1c1;
    margin-right: 0.5rem;

    &-raised {
      background-color: $owner;
    }
    &-assigned {
      background-color: $assigned;
    }
    &-watched {
      background-color: $watching;
    }
  }
  .assets-selection {
    display: flex;
    align-items: center;
    position: relative;
    color: $primary-text;
  }
  .option-title {
    opacity: 0.4;
    cursor: pointer;
  }
  .option-value {
    padding: 0 0.35rem;
    cursor: pointer;
  }
  .d-none {
    display: none;
  }

  .ticket-dropdown {
    // display: block;
    // width: 100%;
    display: flex;
    align-items: center;
    position: relative;
    justify-content: center;
  }

  .is-flex-center {
    display: flex;
    align-items: center;
  }
</style>
