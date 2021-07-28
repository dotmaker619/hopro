<template>
  <div class="dropdown-layout">
    <div class="dropdown" @click.stop="active = !active" v-click-outside="() => (active = false)">
      <div class="ticket-content">
        <div class="ticket-content-left">
          <div class="ticket-dropdown-content has-slimscroll">
            <div
              class="ticket-dropdown-content__item"
              v-for="(dropdown_item, i) in dropdown_items"
              :key="i"
              @click="
                filter = dropdown_item.name;
                create_query();
              "
            >
              <span class="is-medium-14-500-24 cardfilter-item-name is-flex align-center">
                <div v-if="has_icon" :class="`status-icon status-icon-${dropdown_item.name}`"></div>
                {{ dropdown_item.name }}
              </span>
              <span>
                <sh-icon v-if="filter == dropdown_item.name" :name="'ticket-show-tick'" class="is-14x14" />
              </span>
            </div>
          </div>
        </div>
        <div class="ticket-content-right">
          <div class="ticket-dropdown-content has-slimscroll">
            <div
              class="ticket-dropdown-content__item"
              v-for="(dropdown_item, i) in dropdown_sec_items"
              :key="i"
              @click="
                duration_filter = dropdown_item.name;
                create_query();
              "
            >
              <span class="is-medium-14-500-24 cardfilter-item-name is-flex align-center">
                <div v-if="has_icon" :class="`status-icon status-icon-${dropdown_item.name}`"></div>
                {{ dropdown_item.name }}
              </span>
              <span>
                <sh-icon v-if="duration_filter == dropdown_item.name" :name="'ticket-show-tick'" class="is-14x14" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  

  export default {
    props: ["dropdown_items", "dropdown_header", "has_icon", "dropdown_sec_items", "selected_filter"],
    data() {
      return {
        search_display: [],
        filter: "All Time",
        duration_filter: "Since Yesterday",
      };
    },
    mounted() {
      if (this.selected_filter) {
        let filters = this.selected_filter.split("|");
        this.filter = filters[0].trim();
        this.duration_filter = filters[1].trim();
      } else {
        this.filter = this.dropdown_items[0].name;
      }
    },

    methods: {
      create_query() {
        let userFilter;
        switch (this.filter) {
          case "Assigned to me":
            userFilter = { "takenUp": this.$store.state.claims.user_id };
            break;
          case "Assigned by me":
            userFilter = { "owner": this.$store.state.claims.user_id };
            break;
          case "Created by me":
            userFilter = { "owner": this.$store.state.claims.user_id, "takenUpNot": this.$store.state.claims.user_id };
            break;
          case "Watching":
            userFilter = { "watcher": this.$store.state.claims.user_id };
            break;
          default:
            userFilter = {};
        }

        let durationFilter;
        switch (this.duration_filter) {
          case "Since Yesterday":
            durationFilter = {
              "updatedAtStart": moment()
                .subtract(1, "day")
                .add(1, "day")
                .toISOString(),
            };
            break;
          case "Since Last Week":
            durationFilter = {
              "updatedAtStart": moment()
                .subtract(1, "week")
                .add(1, "day")
                .toISOString(),
            };
            break;
          case "Since Last Month":
            durationFilter = {
              "updatedAtStart": moment()
                .subtract(1, "month")
                .add(1, "day")
                .toISOString(),
            };
            break;
          case "Since Last Year":
            durationFilter = {
              "updatedAtStart": moment()
                .subtract(1, "year")
                .add(1, "day")
                .toISOString(),
            };
            break;
          default:
            durationFilter = {};
        }

        let query = { ...userFilter, ...durationFilter };

        this.$emit("addFilter", { query, selected: this.filter + " | " + this.duration_filter });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .dropdown-layout {
    position: absolute;
    width: inherit;
    display: flex;
    justify-content: center;
  }

  .dropdown {
    box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.16);
    border: solid 1px rgba(23, 30, 72, 0.1);
    background-color: #ffffff;
    position: absolute;
    width: 40rem;
    z-index: 1;
    border-radius: 2rem;
    top: 15px;
    // left: 12px;
    display: block;

    &-header {
      padding: 2rem 2rem 0;
      text-align: left;
    }

    &-input {
      margin: 0 2rem;
    }
  }

  .ticket-dropdown-content {
    margin-top: 1rem;
    &__item {
      padding: 1.2rem 3rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      &:hover {
        background-color: #f7f8ff;
      }
      &:last-child:hover {
        border-radius: 0 0 2rem 2rem;
        background-color: #f7f8ff;
      }
    }
    .cardfilter-item-name {
      text-transform: capitalize;
      color: #171e48;
    }

    .cardfilter-icon {
      height: 2.4rem;
      width: 2.4rem;
      background-color: red;
      border-radius: 50%;
      color: white;
      display: flex;
      line-height: 24px;
      justify-content: center;
      text-transform: uppercase;
      margin: 0 0 0 15px;
    }
  }

  .ticket-content {
    display: flex;

    &-left {
      width: 50%;
      border-right: 1px solid rgba(23, 30, 72, 0.1);
    }

    &-right {
      width: 50%;
    }
  }
</style>
