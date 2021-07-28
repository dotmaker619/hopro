<template>
  <div class="ticket-card ticket-card-height">
    <div class="ticket-card-options">
      <div
        class="ticket-card-options__left is-pointer"
        @click="getTags('tags', 'status', {})"
        @mouseover="refresh = true"
        @mouseleave="refresh = false"
      >
        <sh-icon :name="'ticket-history-recents'" class="is-24x24 mr-5" />
        <div class="is-medium-12-500-14 has-opacity-5 has-text-danger" v-if="refresh">Refresh</div>
        <div class="is-medium-12-500-14 has-opacity-5" v-else>{{ since }} mins ago</div>
      </div>
      <div class="ticket-card-options__right" :class="[!eachCount || !Object.keys(eachCount).length ? 'has-no-access' : null]">
        <sh-icon :name="'ticket-download'" class="is-24x24 mr-15 is-pointer is-hidden" />
        <sh-icon
          :name="'ticket-expand-maximize'"
          class="is-24x24 is-pointer"
          @click.native="$router.push({ name: 'overview-tag', query: { filter: selected_filter } })"
        />
      </div>
    </div>

    <div class="ticket-card-heading">
      <div class="ticket-card-heading__icon">
        <sh-icon :name="'ticket-card-tags'" class="is-50x50" />
      </div>
      <div class="ticket-card-heading__title ">
        Tags
      </div>

      <div class="ticket-card-heading__subtitle">
        <div @click="open_ticket_dropdown = !open_ticket_dropdown" class="ticket-dropdown">
          <span class="option-value is-medium-14-500-17"> {{ selected_filter }} </span>
          <sh-icon v-if="open_ticket_dropdown" :name="'expand'" class="is-16x16 is-pointer" />
          <sh-icon v-else :name="'collapse'" class="is-16x16 is-pointer" />
          <ticket-dropdown
            :selected_filter="selected_filter"
            @filter_selection="
              $event == 'Each' ? (extract = true) : (extract = false);
              extract_tags();
            "
            v-if="open_ticket_dropdown"
            v-click-outside="() => (open_ticket_dropdown = false)"
            :dropdown_items="dropdown_items"
          ></ticket-dropdown>
        </div>
      </div>
    </div>
    <div class="loading" v-if="is_loading">
      <img src="@/assets/icons/ellipsis-animation.svg" class="image is-64x64 margin-auto" />
    </div>
    <div class="ticket-card-tags" v-else-if="eachCount && Object.keys(eachCount).length">
      <div class="ticket-db-list" v-for="(tag, i) in eachCount" :key="i">
        <div class="ticket-db-list__details" v-if="tag.details">
          <div class="ticket-db-list__details__top is-medium-16-500-19">
            <div class="ticket-db-list__details__left tag-title">
              <span class="is-capitalized" :style="`color:${(tag.details && tag.details.color) || 0}`">{{ i | truncate(24 || "") }}</span>
            </div>
            <div class="ticket-db-list__details__right">{{ (tag.closed && tag.closed.count) || 0 }}/{{ tag.total }}</div>
          </div>
          <div class="ticket-db-list__details__bottom">
            <ticket-progress :total="tag.total" :value="(tag.closed && tag.closed.count) || 0" :valueClass="'tag-progress-value'"></ticket-progress>
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
      @click="$router.push({ name: 'overview-tag', query: { filter: selected_filter } })"
      :class="[!eachCount || !Object.keys(eachCount).length ? 'has-no-access has-text-grey' : null]"
    >
      Show more
      <img src="@/assets/icons/tickets/showmore-arrow.png" alt="" />
    </div>
  </div>
</template>

<script>
  import TicketDropdown from "../../../shared/filters/ticket-dropdown";
  import { ticketService } from "@/desktop/shared/services/";
  import TicketProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-progress.vue";

  import { mapState } from "vuex";

  export default {
    components: {
      TicketDropdown,
      TicketProgress,
    },

    props: ["top_header_query"],
    data() {
      return {
        is_loading: false,
        refresh: false,
        lastFetchedAt: null,
        now: new Date(),
        selected_filter: "Each",
        open_ticket_dropdown: false,
        allTags: null,
        eachCount: {},
        extract: true,
        dropdown_items: [
          { id: "1", name: "Exact" },
          { id: "2", name: "Each" },
        ],
      };
    },

    created() {
      this.getTags("tags", "status", {});
      setInterval(() => {
        this.now = Date.now();
      }, 60000);
    },
    computed: {
      ...mapState(["TAGS"]),
      since() {
        var a = moment(this.lastFetchedAt);
        var b = moment(this.now);
        return b.diff(a, "minutes");
      },
      state_tags() {
        return this.$store.state.TAGS || null;
      },
    },
    watch: {
      top_header_query() {
        this.getTags("tags", "status", {});
      },
      state_tags(val) {
        this.getTags("tags", "status", {});
      },
    },
    methods: {
      async getTags(xkey, ykey, filter) {
        this.is_loading = true;
        if (this.TAGS && Object.keys(this.TAGS).length) {
          this.eachCount = {};
          this.allTags = await this.getReport(xkey, ykey, filter);
          if (this.allTags && this.TAGS && Object.keys(this.TAGS).length) {
            if (this.extract == true) {
              this.allTags.map((item, index) => {
                let tag_name = this.TAGS[item.x] && this.TAGS[item.x].name ? this.TAGS[item.x].name : item.x;
                if (index < 5) {
                  return (this.eachCount[tag_name] = {
                    closed: _.remove(item.y, function(y) {
                      return y.type == "closed";
                    })[0],
                    total: _.sumBy(item.y, function(o) {
                      return o.count;
                    }),
                    details: this.TAGS[item.x],
                  });
                }
              });
              this.eachCount = Object.assign({}, this.eachCount);
              this.is_loading = false;
            } else {
              this.allTags.map((item, index) => {
                if (index < 5) {
                  item.x.forEach((element) => {
                    let name = this.TAGS[element].name || element;
                    return (this.eachCount[name] = {
                      closed: _.remove(item.y, function(y) {
                        return y.type == "closed";
                      })[0],
                      total: _.sumBy(item.y, function(o) {
                        return o.count;
                      }),
                      details: this.TAGS[element],
                    });
                  });
                }
              });
              this.eachCount = Object.assign({}, this.eachCount);
              this.is_loading = false;
            }
          }

          this.eachCount = Object.assign({}, this.eachCount);
        } else {
          this.is_loading = false;
        }
      },

      async getReport(xkey, ykey, filter = {}) {
        this.lastFetchedAt = new Date().toISOString();
        let allFilters = { ...{ "organization": this.$store.state.current_organization.uid }, ...filter, ...(this.top_header_query || {}) };
        let body = {
          "filters": allFilters,
          "x": {
            "key": xkey,
            "extract": this.extract,
          },
          "y": {
            "key": ykey,
          },
          "organization": this.$store.state.current_organization.uid,
        };
        return await ticketService.get_report({ body }).catch((err) => {
          this.handleErrors(err);
        });
      },

      extract_tags() {
        if (this.extract == false) {
          this.selected_filter = "Exact";
        } else {
          this.selected_filter = "Each";
        }
        this.getTags("tags", "status", {});
      },
    },
  };
</script>
