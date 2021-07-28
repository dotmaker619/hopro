<template>
  <div class="mobile-ticket">
    <router-view></router-view>
    <bulk-actions :selected="selected" v-if="selected.length"></bulk-actions>
    <div class="m-ticket__search-bar" :class="{'is-hidden': hideSearchbar}">
      <search-bar
        @search="$store.commit('tickets/SET_SEARCH_BY', $event)"
        @filter="open_filter = true"
        :placeholder_value="'Search Ticket'" :filter_option="filterOption"
      ></search-bar>
      <filter-dropdown
        :class="{ 'viewer-ticket-filters': is_vertical_window }"
        v-if="open_filter"
        :filtersData="allFiltersData"
        @apply="
          selected_filters = $event;
          $emit('filter', $event);
        "
        v-click-outside="() => (open_filter = false)"
        @close="open_filter = false"
      />
    </div>

    <div class="viewer-filters is-flex is-vcenter has-space-between margin-20" v-if="is_vertical_window">
      <div class="each-filter">
        <SortDropdown />
      </div>
      <div>
        <p @click="open_filter = true" class="is-pointer is-flex is-vcenter">
          <span class="is-medium-14-500-17 has-opacity-5 mr-5"> Filters: </span>
          <span class="is-semiBold-14-600-17 is-pointer is-flex is-vcenter">
            {{ selected_filters ? "Selected" : "None" }}
            <sh-icon :name="`${open_filter ? 'expand' : 'collapse'}`" class="is-16x16 is-pointer"></sh-icon>
          </span>
        </p>
      </div>
    </div>

    <div class="m-ticket__ticketlist has-slimscroll-xs" :class="isMobile ? 'calc_height' : 'notmobile'">
      <p v-if="is_vertical_window && !create_ticket" class="is-flex is-start mr-auto" @click="create_ticket = true">
        <button style="border: none; box-shadow: none" class="sh-button sh-button--create sh-button--inverted sh-button--small">
          New Ticket
        </button>
      </p>
      <div
        class=""
        v-if="create_ticket"
        v-click-outside="() => (create_ticket = false)"
        :class="[{ 'viewer-shadow': is_vertical_window },[customclass? customclass:'create-mobile-ticket' ]]"
      >
        <create-new-ticket
          :without_status="true"
          @hide="create_ticket = false"
          :element="is_vertical_window ? element : null"
          :viewer_ticket="true" 
        ></create-new-ticket>
      </div>
      <div v-if="is_loading && (!tickets || !tickets.length)">
        <mobile-list-skeleton />
      </div>
      <div v-else-if="tickets && tickets.length">
        <div v-for="ticket in tickets" :key="ticket.uid" class="m-ticket-list__item is-flex hover-background">
          <div class="margin-auto">
            <input
              type="checkbox"
              name="check"
              class="sh-custom-checkbox is-thinner rounded"
              :id="ticket.uid"
              v-if="selected.length"
              :checked="selected.includes(ticket.uid) ? true : false"
              @change="$store.dispatch('tickets/select_ticket', ticket.uid)"
            />
          </div>
          <list-item :ticket="ticket" :tags="tags ? (ticket.tags || []).map((t) => (tags[t] ? tags[t] : null)) : null" class="ml-10"></list-item>
        </div>

        <div v-if="is_loading" class="loading">
          <img src="@/assets/icons/ellipsis-animation.svg" class="image is-64x64 margin-auto" />
        </div>
        <div class="has-text-blue is-medium-16-500-19 has-text-centered py-20" @click="load_more" v-else-if="!is_fetched_all">
          Load more
        </div>
      </div>
      <div v-else class="m-no-ticket">
        <div class="m-no-terra--img">
          <img src="@/assets/illustrations/tickets-illustration.svg" alt="" />
        </div>
        <div class="is-flex is-center mt-20 is-medium-16-500-19 has-primary-text">
          No Tickets
        </div>
        <div class="is-flex is-center mt-10 is-regular-12-00-18 has-primary-text has-opacity-8">
          No result found
        </div>
      </div>
    </div>

    <div
      v-if="!create_ticket && isMobile && !is_vertical_window"
      class="is-flex is-vcenter is-center"
      :class="uploadbtnclass?uploadbtnclass:'attachment-mobile-uploadbtn'"
      @click="create_ticket = true"
    >
      <i class="fa fa-plus"></i>
    </div>
    <div class="mobile-background" v-if="create_ticket" @click.stop="create_ticket = false"></div>
  </div>
</template>

<script>
  import SearchBar from "@/mobile/shared/components/searchbar.vue";
  import ListItem from "./components/mobile-list-item";
  import BulkActions from "./components/m-bulk-actions-ticket";
  import FilterDropdown from "@/desktop/tickets/shared/components/filter-card/filter-dropdown";
  import MobileListSkeleton from "@/mobile/shared/components/list-skeleton.vue";
  import { mapState, mapActions, mapGetters } from "vuex";
  import { apiService } from "@/desktop/shared/services/";
  import { set } from "idb-keyval";
  import CreateNewTicket from "@/desktop/tickets/components/tickets-list/components/create-new-ticket";

  import SortDropdown from "@/desktop/tickets/components/tickets-list/components/tickets-top-filters/components/sort-dropdown";

  var infiniteScroll = require("vue-infinite-scroll");
  export default {
    directives: { infiniteScroll },

    props: ["is_loading", "allFiltersData", "is_fetched_all", "element", "is_vertical_window", "customclass", "hideSearchbar", "uploadbtnclass"],
    components: {
      SearchBar,
      ListItem,
      BulkActions,
      FilterDropdown,
      MobileListSkeleton,
      CreateNewTicket,
      SortDropdown,
    },

    data() {
      return {
        tags: null,
        open_filter: false,
        create_ticket: false,
        selected_filters: "",
      };
    },
    computed: {
      ...mapState("tickets", ["tickets", "selected"]),
      filterOption() {
        if(this.isMobile) {
          return true
        } else {
          return false
        }
      }
    },
    watch: {
      tickets: function(val) {
        if (!this.$store.state.is_offline) set("TicketList", val ? val : []);
      },
    },
    async created() {
      this.tags = await apiService.getTags().catch((err) => console.log(err));
      this.$store.commit("SET_TAGS", this.tags);
    },
    methods: {
      load_more() {
        this.$emit("get_more");
      },
    },
  };
</script>
<style lang="scss">
  .m-ticket {
    &__search-bar {
      position: static;
      top: 50px;
      z-index: 1;
    }
    &__bottomnav {
      position: sticky;
      bottom: 0px;
      z-index: 1;
    }
    &__ticketlist {
      overflow-y: auto;
      overflow-x: hidden;
      &.notmobile {
        min-height: 80vh;
      }
      &.calc_height {
        height: calc(100vh - 14rem);
      }
    }

    &-list {
      &__item {
        background-color: $white;
        border-bottom: 1px solid rgba(23, 30, 72, 0.1);
        padding: 1.5rem 1.3rem 1.5rem 0.2rem;
        &:last-child {
          border-bottom: none;
        }

        &__details {
          width: 100%;
        }
      }
    }
  }
  .m-no-ticket {
    background-color: #fff;
    height: calc(100vh - 138px);
    &--img {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      height: 200px;
      img {
        height: 17rem;
        width: 18rem;
      }
    }
  }
  .create-mobile-ticket {
    position: fixed;
    bottom: 0;
    z-index: 100;
    width: 100%;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    overflow: visible;
    height: 13rem;
    .mobile-viewer-create-ticket {
      padding-top: 2em;
    }
  }

  .viewer-ticket-filters {
    .dropdown {
      top: 15rem;
      left: 6rem;
    }
  }

  .viewer-shadow {
    background: white;
    padding: 0 1rem;
    box-shadow: 0 0 5px 0 #2585d3;
    border: solid 1px #2585d3;
    // position: relative;
    border-radius: 0px;
    overflow: visible;
    // position: absolute;
    // top: 100px;
  }
</style>
<style lang="scss" scoped>
.create-details {
  width: 33rem;
}
</style>