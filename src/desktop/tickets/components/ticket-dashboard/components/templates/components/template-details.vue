<template>
  <div class="ticket-template">
    <div class="px-20 pt-20">
      <div class="ticket-overview-options">
        <div class="ticket-overview-options__left">
          <span class="is-flex align-center">
            <sh-icon :name="'ticket-header-back'" @click.native="$router.push({ name: 'templates' })" class="is-16x16 mr-10 is-pointer" />
            <span class="ticket-overview-options__left__title">
              Templates
            </span>
          </span>
        </div>
      </div>
    </div>

    <div
      class="ticket-template-card is-pointer"
      v-if="!is_details_loading"
      @click="show_details(ticket.uid)"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
    >
      <div class="columns">
        <div class="column is-8">
          <div class="level">
            <div class="level-left">
              <div class="level-item template-content">
                <div
                  class="is-pointer"
                  v-tooltip="{ content: `Bookmark` }"
                  @click.stop="update_ticket({ bookmark: !ticket.bookmark })"
                  :class="{ 'is-vhidden': !hover && !ticket.bookmark }"
                >
                  <sh-icon :name="ticket.bookmark ? 'bookmarked-highlight' : 'bookmark'" class="is-18x18 mr-10" />
                </div>
                <div>
                  <div class="is-semiBold-16-600-19 template-name">
                    {{ ticket.name }}
                  </div>
                  <div class="is-medium-14-500-17">
                    <assigned-tags :number_of_tags_to_display="4" :resourceId="ticket.uid" :tags="ticket.tags" :write_access="false" />
                  </div>
                </div>
              </div>
            </div>
            <div class="level-right">
              <div class="level-item">
                <div class="template-details-user" v-if="ticket.templateUsers && ticket.templateUsers.length">
                  <user-tag
                    :custom_size="24"
                    :users="[...(ticket.templateUsers || [])]"
                    :tagsCountToShow="4"
                    :custom_class="'tiny-user-avatar'"
                  ></user-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-3 is-flex-center">
          <ticket-progress
            :total="ticket.checklistsStats.totalItems"
            :value="ticket.checklistsStats.checkedItems"
            :valueClass="'member-progress-value'"
          ></ticket-progress>
        </div>
        <div class="column is-1 template-value">{{ ticket.checklistsStats.checkedItems }}/{{ ticket.checklistsStats.totalItems }}</div>
      </div>
    </div>
    <div class="tickets">
      <div class="tickets-top-section">
        <div class="columns is-flex is-vcenter">
          <div class="column is-5">
            <bulk-actions-bar></bulk-actions-bar>
          </div>
          <div class="column is-2 is-flex is-end"></div>
        </div>
      </div>
      <tickets-list :extra_query="query"></tickets-list>
    </div>
  </div>
</template>

<script>
  const queryString = require("query-string");
  import { ticketService } from "@/desktop/shared/services/";
  import TicketHeaders from "@/desktop/tickets/components/tickets-list/components/ticket-headers";
  import BulkActionsBar from "@/desktop/tickets/shared/components/bulk-actions";
  import { mapState, mapActions, mapGetters } from "vuex";
  import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import TicketsList from "@/desktop/tickets/components/tickets-list/tickets-list";
  import TicketDetailsMixin from "@/desktop/shared/mixins/ticket-details.mixin.vue";
  import TicketProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-progress.vue";
  export default {
    data() {
      return {
        hover: false,
        ticket: null,
        is_details_loading: true,
        is_loading: true,
        query: { "fromTemplate": this.$route.params.id },
      };
    },
    mixins: [TicketDetailsMixin],
    components: {
      AssignedTags,
      UserTag,
      TicketHeaders,
      BulkActionsBar,
      TicketsList,
      TicketProgress,
    },
    async created() {
      await this.get_details("true");
      this.$eventHub.$on("delete_template_ticket", (uid) => this.$router.push({ name: "templates" }));
    },
    beforeDestroy() {
      this.$eventHub.$off("delete_template_ticket");
    },
    // computed: {
    //   ...mapState("tickets", ["tickets"]),
    //   ticket() {
    //     return this.tickets.find((t) => t.uid == this.$route.params.id);
    //   },
    // },
    methods: {
      show_details(uid) {
        this.open_ticket_details(uid);
      },
      async get_details(loading = false) {
        this.is_details_loading = loading;
        let res = await ticketService
          .get({
            id: this.$route.params.id,
          })
          .catch((err) => {
            this.$toast.show("Something went wrong", "", this.$store.state.izitoast_options.appWarning);
          });

        this.ticket = res;
        // this.$store.dispatch("tickets/add_ticket_details", res);
        this.is_details_loading = false;
      },
      async update_ticket(value) {
        await ticketService
          .patch({
            id: this.ticket.uid,
            body: value,
          })
          .then(() => {
            this.get_details();
          })
          .catch((err) => {});
      },
    },
  };
</script>

<style lang="scss" scoped>
  .ticket-template-card {
    background-color: $white;
    border-radius: 1rem;
    box-shadow: 0 0 3px 0 rgba(23, 30, 72, 0.2);
    margin: 1.5rem 2rem;
    padding: 3rem 2rem 3rem;
  }
  .template-content {
    align-items: flex-start;
  }
  .template-fav-icon {
    margin-top: 0.4rem;
    margin-right: 1rem;
  }
  .template-value {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .template-details-user {
    img {
      border-radius: 50%;
      margin: 0 0.3rem;
    }
  }
  .template-name {
    color: $primary-text;
  }
  .red-text {
    color: #dc5159;
  }
  .green-text {
    color: #08aa4f;
  }
  .blue-text {
    color: #8578cd;
  }
</style>
