<template>
  <div>
    <div class="mobile-background" @click="$emit('close')"></div>

    <div class="dropdown" @click="active = true" v-click-outside="() => (active = false)">
      <div class="dropdown-header">
        <span>
          <span class="is-medium-14-500-17 has-primary-text mr-10">Filters</span>
          <span
            class="is-medium-14-500-17 is-pointer"
            @click="
              resetFilters();
              $emit('close');
            "
            :class="{ 'selected-filter': selected_filter }"
          >Clear All</span>
        </span>
        <span class="is-pointer" @click.stop.prevent="$emit('close')">
          <sh-icon :name="'ticket-close-filter'" class="is-10x10" />
        </span>
      </div>
      <div class="filter-dropdown-content">
        <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
          <span class="has-opacity-5">Status</span>
          <span>
            <all-filter-dropdown
              :add_icon_on_hover="false"
              :user_count="3"
              :is_name_hidden="true"
              :search_layout="false"
              :component="'status'"
              :allFilters="allFiltersData.status"
              @updateValue="allFiltersData.status = $event"
            />
          </span>
        </div>

        <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
          <span class="has-opacity-5">Priority</span>
          <span>
            <all-filter-dropdown
              :add_icon_on_hover="false"
              :user_count="3"
              :is_name_hidden="true"
              :search_layout="false"
              :component="'priority'"
              :allFilters="allFiltersData.priority"
              @updateValue="allFiltersData.priority = $event"
            />
          </span>
        </div>

        <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
          <span class="has-opacity-5">Assignee</span>
          <span class="is-flex align-center" @click.stop.prevent>
            <watcher-dropdown
              :ticket_watchers="allFiltersData.assignee"
              @update-watchers="allFiltersData.assignee = $event"
              :custom_icon="'add-users-teams'" :user_count="3"
            ></watcher-dropdown>
          </span>
        </div>

        <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
          <span class="has-opacity-5">Due date</span>
          <span class="is-flex align-center">
            <duedate-dropdown
              :icon_class="'is-20x20 mr-5'"
              class="is-medium-14-500-17 has-text-new-grey"
              :due="allFiltersData.dueDate"
              @change-duedate="allFiltersData.dueDate = $event"
            ></duedate-dropdown>
          </span>
        </div>

        <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
          <span class="has-opacity-5">Tags</span>
          <span class="is-flex align-center">
            <div v-if="isMobile">
              <mobile-tags-dropdown
                @input="allFiltersData.tags = $event"
                :initial_value.sync="allFiltersData.tags"
                :search_layout="true"
                :component="'tags'"
              />
            </div>
            <div v-else>
              <all-filter-dropdown
                :add_icon_on_hover="false"
                :search_layout="false"
                :component="'tags'"
                :allFilters="allFiltersData.tags"
                @updateValue="allFiltersData.tags = $event"
              />
            </div>
          </span>
        </div>

        <div class="filter-dropdown-footer">
          <label
            class="filter-dropdown-footer__item"
            v-for="item in filterOptions"
            :key="item.header"
          >
            <span class="is-flex">
              <sh-icon :name="item.icon" class="is-16x16 mr-10" />
              <span class="is-medium-14-500-17 has-primary-text">{{ item.header }}</span>
            </span>
            <span>
              <input
                type="checkbox"
                class="sh-custom-checkbox"
                autocomplete="false"
                v-model="allFiltersData.options"
                :id="item.value"
                :value="item.value"
              />
            </span>
          </label>
          <div @click="apply" class="filter-dropdown-button is-semiBold-14-600-17">Apply Filters</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AllFilterDropdown from "@/desktop/tickets/shared/components/filter-card/components/all-filter-dropdown";
import UserTag from "@/desktop/shared/components/tags/user-tag-new";
import DuedateDropdown from "@/desktop/tickets/shared/components/duedate-range-dropdown";
import WatcherDropdown from "@/desktop/tickets/shared/components/watchers-dropdown";
import MobileTagsDropdown from "@/mobile/viewer/shared/components/mobile-tags-dropdown.vue";

export default {
  components: {
    AllFilterDropdown,
    UserTag,
    WatcherDropdown,
    DuedateDropdown,
    MobileTagsDropdown
  },
  props: ["filtersData"],
  data() {
    return {
      allFiltersData: {
        priority: [],
        status: [],
        options: [],
        assignee: [],
        tags: [],
        dueDate: []
      },
      selected_filter: true,
      active: false,
      filterOptions: [
        {
          header: "Favorites",
          icon: "ticket-star-rating",
          value: "bookmarked"
        },
        { header: "Archived", icon: "ticket-archieved", value: "archived" }
      ]
    };
  },
  created() {
    for (let k in this.filtersData) {
      this.$set(this.allFiltersData, k, [...this.filtersData[k]]);
    }
  },
  methods: {
    apply() {
      for (let k in this.allFiltersData) {
        this.filtersData[k] = [...this.allFiltersData[k]];
      }
      let str = this.filterQueryString();
      this.$emit("close");
      this.$emit("apply", str);
    },
    filterQueryString() {
      let val = this.allFiltersData;
      let str = "";
      str += this.getQueryString(val.status, "status");
      str += this.getQueryString(val.priority, "priority");
      str += this.getQueryString(
        val.assignee.map(d => d.uid),
        "takenUp"
      );
      str += this.getQueryString(val.tags, "tag");
      str +=
        val.dueDate.length > 1
          ? "&startDate=" +
            val.dueDate[0].toISOString() +
            "&dueDate=" +
            val.dueDate[1].toISOString()
          : "";
      str += val.options.reduce((c, d) => (c += `&${d}=true`), "");
      return str;
    },
    getQueryString(arr, query) {
      let str = "";
      arr.forEach(val => {
        str += `&${query}=` + val;
      });
      return str;
    },
    resetFilters() {
      Object.keys(this.filtersData).forEach(key => {
        this.filtersData[key] = [];
      });
      this.$emit("apply", "");
    }
  }
};
</script>

<style lang="scss" scoped>
.dropdown {
  box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.16);
  border: solid 1px rgba(23, 30, 72, 0.1);
  background-color: #ffffff;
  position: absolute;
  width: 260px;
  z-index: 1;
  border-radius: 1rem;
  top: auto;
  // left: 12px;
  right: 1.2rem;
  display: block;
  @include for-size(portrait-tablets) {
    position: fixed;
    width: 100vw;
    top: auto;
    left: 0;
    bottom: 0;
    z-index: 100;
  }
  @include for-size(tablet) {
    position: fixed;
    width: 100vw;
    top: auto;
    left: 0;
    bottom: 0;
    z-index: 100;
  }

  &-header {
    padding: 2rem 2rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(23, 30, 72, 0.15);
  }

  &-input {
    margin: 0 2rem;
  }
  &-content {
    padding: 2rem;
  }
}
.filter-dropdown-content {
  border-bottom: 1px solid rgba(23, 30, 72, 0.15);
  &__item {
    min-height: 4.2rem;
    padding: 1.2rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.filter-dropdown-footer {
  &__item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 2rem 2rem;
    cursor: pointer;
    &:first-child {
      padding: 2rem 2rem 0.5rem 2rem;
    }
    &:last-child {
      padding: 2rem 2rem 0rem;
    }
  }
}
.filter-dropdown-button {
  height: 4rem;
  margin: 0 2rem 2rem;
  border-radius: 6px;
  box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
  border: solid 1px $primary;
  background-color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary;
  cursor: pointer;
  &:hover {
    background-color: $primary;
    color: $white;
    box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
  }
}

.is-options-list {
  z-index: 10;

  width: 20rem;
  border-radius: 10px;
  box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.16);
  border: solid 1px rgba(23, 30, 72, 0.1);
  background-color: $white;
  .input {
    height: 4rem;
  }

  .control.has-icons-left .icon.is-left {
    height: 4rem;
    width: 1.5rem;
  }
  .item--text {
    width: 15ch;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
.add-followers {
  visibility: hidden;
}
.selected-filter {
  color: $primary;
}
</style>
