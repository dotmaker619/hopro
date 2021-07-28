<template>
  <div>
    <div class="watchers-dropdown is-relative">
      <div v-if="$route.name == 'reports'">
        <span class="is-flex align-center is-pointer is-between">
          <span class="is-medium-16-500-00 mr-5 has-width-100" @click="filterActive = true">{{
            filter.length == 0 ? "None" : "Select (" + filter.length + ")"
          }}</span>
          <div v-if="filter.length" @click="filter = []" class="filter-down-arrow">
            <sh-icon :name="'filter-close'" class="is-8x8"></sh-icon>
          </div>
          <div v-else @click="filterActive = true" class="filter-down-arrow">
            <sh-icon :name="'filter-downarrow'" class="is-8x8"></sh-icon>
          </div>
        </span>
      </div>

      <div v-else @click="filterActive = true">
        <span class="is-flex align-center is-pointer">
          <span class="mr-5">{{ filter.length == 0 ? "None" : "Select (" + filter.length + ")" }}</span>
          <sh-icon :name="'filter-downarrow'" class="is-8x8"></sh-icon>
        </span>
        <sh-icon :name="'ticket-filter-status-add'" class="is-24x24 is-pointer is-hidden"></sh-icon>
      </div>

      <div
        v-click-outside="() => (filterActive = false)"
        v-if="filterActive"
        class="filter-dropdown"
        :class="{ 'report-filter-dropdown': $route.name == 'reports' }"
      >
        <div v-if="search_layout" class="filter-dropdown-search">
          <p class="control has-icons-left has-icons-right">
            <input class="input pt-10" type="email" placeholder="Search" v-model="searchQuery" />
            <span class="icon is-small is-left">
              <sh-icon :name="'search'" class="is-16x16"></sh-icon>
            </span>
          </p>
        </div>
        <div class="filter-dropdown-body has-slimscroll-xs">
          <div v-if="component == 'status'">
            <div v-for="item in status_options" :key="item.name" @click="selected_status(item.value)">
              <div class="filter-dropdown-body__item">
                <div class="is-flex align-center">
                  <div :class="`status-indicator status-${item.value}`"></div>
                  <div class="is-capitalized">{{ item.name }}</div>
                </div>
                <span>
                  <sh-icon v-if="filter.includes(item.value)" :name="'ticket-show-tick'" class="is-10x10 tick-icon" />
                  <sh-icon v-if="filter.includes(item.value)" :name="'ticket-close-filter'" class="is-10x10 remove-icon" />
                </span>
              </div>
            </div>
          </div>
          <div v-if="component == 'priority'">
            <div v-for="item in priority_options" :key="item.name" @click="selected_status(item.value)">
              <div class="filter-dropdown-body__item">
                <div class="is-flex align-center">
                  <sh-icon :name="`ticket-priority-${item.name}`" class="is-18x18 mr-5" />
                  <div class="is-capitalized has-primary-text is-medium-16-500-19">
                    {{ item.name }}
                  </div>
                </div>
                <span>
                  <sh-icon v-if="filter.includes(item.value)" :name="'ticket-show-tick'" class="is-10x10 tick-icon" />
                  <sh-icon v-if="filter.includes(item.value)" :name="'ticket-close-filter'" class="is-10x10 remove-icon" />
                </span>
              </div>
            </div>
          </div>
          <div v-if="component == 'tags'">
            <div v-for="item in filtered_tags" :key="item.name" @click="selected_status(item.value)">
              <div class="filter-dropdown-body__item">
                <div class="is-flex align-center">
                  <div class="is-capitalized is-medium-14-500-17 mr-15" :style="`color: ${item.color}`">
                    {{ item.name | truncate(15) }}
                  </div>
                </div>
                <span>
                  <sh-icon v-if="filter.includes(item.value)" :name="'ticket-show-tick'" class="is-10x10 tick-icon" />
                  <sh-icon v-if="filter.includes(item.value)" :name="'ticket-close-filter'" class="is-10x10 remove-icon" />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="filter-dropdown-bottom">
          <span class="is-pointer is-flex align-center" @click="filter = []">
            <sh-icon :name="'ticket-filter-clear-all'" class="is-12x12 mr-10" />
            <span>Clear all</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ticketService, userService } from "@/desktop/shared/services/";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";

  export default {
    props: [
      "ticket",
      "ticket_watchers",
      "is_duplicate",
      "user_count",
      "add_icon_on_hover",
      "is_name_hidden",
      "component",
      "search_layout",
      "allFilters",
    ],
    data() {
      return {
        filterActive: false,
        searchQuery: "",
        // item: true,
        is_loading: false,
        watchers: [],
        user_interaction: false,
        status_options: [
          {
            name: "pending",
            value: 1,
          },
          {
            name: "in progress",
            value: 2,
          },
          {
            name: "resolved",
            value: 3,
          },
          {
            name: "closed",
            value: 4,
          },
          {
            name: "rejected",
            value: 5,
          },
        ],
        priority_options: [
          {
            name: "critical",
            value: 1,
          },
          {
            name: "high",
            value: 2,
          },
          {
            name: "medium",
            value: 3,
          },
          {
            name: "low",
            value: 4,
          },
        ],
        tags_options: Object.values(this.$store.state.TAGS).map((d) => {
          return { value: d.uid, name: d.name, color: d.color };
        }),
      };
    },
    components: {
      UserTag,
    },
    computed: {
      filter: {
        get() {
          return this.allFilters;
        },
        set(val) {
          this.$emit("updateValue", val);
        },
      },
      filtered_tags() {
        return this.tags_options.filter((tag) => {
          return tag.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        });
      },
    },
    methods: {
      selected_status(value) {
        if (!this.filter.includes(value)) {
          this.filter.push(value);
        } else {
          let arr = this.filter.indexOf(value);
          this.filter.splice(arr, 1);
        }
      },
    },
  };
</script>
<style lang="scss">
  .filter-dropdown {
    position: absolute;
    right: -50%;
    width: 21rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.16);
    border: solid 1px rgba(23, 30, 72, 0.1);
    background-color: $white;
    z-index: 10;
    @include for-size(portrait-tablets) {
      right: 1rem;
    }

    &-search {
      border-bottom: solid 1px rgba(23, 30, 72, 0.1);
      .control input {
        border: none;
      }
    }
    &-body {
      max-height: 26rem;
      overflow: auto;

      &__item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        cursor: pointer;

        &:hover {
          background-color: #f5f9fd;
          box-shadow: 0 0.5px 0 0 rgba(23, 30, 72, 0.1);

          .remove-icon {
            display: block;
          }
          .tick-icon {
            display: none;
          }
        }
        .tick-icon {
          display: block;
        }
        .remove-icon {
          display: none;
        }
      }
    }

    &-bottom {
      border-top: solid 1px rgba(23, 30, 72, 0.1);
      padding: 1rem 2rem;
    }
  }

  .status-indicator {
    height: 1.4rem;
    width: 1.4rem;
    border-radius: 0.2rem;
    margin-right: 1rem;
    &.status-1 {
      background-color: $pending-status;
    }
    &.status-2 {
      background-color: $completed-status;
    }
    &.status-3 {
      background-color: $resolved-status;
    }
    &.status-4 {
      background-color: $closed-status;
    }
    &.status-5 {
      background-color: $rejected-status;
    }
  }
  .has-width-100 {
    width: 100%;
  }
  .filter-down-arrow {
    height: 1.8rem;
    display: flex;
    align-items: center;
  }
  .report-filter-dropdown {
    position: absolute;
    // right: 0;
    left: 6rem;
    bottom: -1.2rem;
    width: 21rem;
  }
</style>
