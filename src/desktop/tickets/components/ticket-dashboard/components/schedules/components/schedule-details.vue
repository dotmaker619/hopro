<template>
  <div class="px-20 pt-20">
    <div class="ticket-overview-options">
      <div class="ticket-overview-options__left">
        <span class="is-flex align-center">
          <sh-icon :name="'ticket-header-back'" @click.native="$router.push({ name: 'schedules' })" class="is-16x16 mr-10 is-pointer" />
          <span class="ticket-overview-options__left__title">
            Schedules
          </span>
        </span>
      </div>
    </div>

    <div class="tickets px-20">
      <div class="ticket-list-item " v-if="selected_ticket" @click="open_ticket_details(selected_ticket.uid)">
        <div class="mt-40 pt-20 mb-20">
          <div class="columns is-vcentered">
            <div class="column is-narrow is-paddingless is-relative" style="top: -1.2rem;">
              <sh-icon :name="selected_ticket.bookmark ? 'bookmarked-highlight' : 'bookmark'" class="is-18x18" />
            </div>

            <div class="column is-3 ">
              <div class="name-block-details">
                <div class="is-medium-16-500-19 no-whitespace-wrap is-flex is-vcenter">
                  <p class="is-pointer has-text-dark mb-5">
                    <span
                      class="ticket-name-text"
                      v-tooltip="selected_ticket.name && selected_ticket.name.length > 30 ? selected_ticket.name : null"
                      >{{ selected_ticket.name | truncate(30) }}</span
                    >
                  </p>
                </div>
                <div v-if="selected_ticket.tags && selected_ticket.tags.length">
                  <assigned-tags
                    :write_access="has_write_access"
                    :service="ticketService"
                    :tags="selected_ticket.tags"
                    :resourceId="selected_ticket.uid"
                    :number_of_tags_to_display="2"
                  />
                </div>
                <p class="is-regular-14-00-17 has-opacity-6 no-whitespace-wrap" v-else>
                  No associated tags
                </p>
              </div>
            </div>
            <div class="column is-2">
              <p class="has-text-theme-black has-opacity-7 is-regular-14-500-17">
                #of Tickets
              </p>
              <p class="has-text-theme-black  is-semiBold-14-600-17 mt-3">
                {{ tickets_total_count }}
              </p>
            </div>
            <div class="column ">
              <p class="has-text-theme-black has-opacity-7 is-regular-14-500-17 ">
                {{ recurrence_text }}
              </p>
              <p class="has-text-theme-black   mt-3">
                <span class="is-medium-14-500-17 has-opacity-7">Next occurance</span>
                <span class="is-semiBold-14-600-17">
                  {{ next_occurance }}
                </span>
              </p>
            </div>
            <div class="column is-1 mr-30"></div>

            <div class="column is-flex is-vcenter is-2">
              <ticket-progress
                :total="(ticket.checklistsStats && ticket.checklistsStats.totalItems) || 0"
                :value="(ticket.checklistsStats && ticket.checklistsStats.checkedItems) || 0"
                :valueClass="'member-progress-value'"
              ></ticket-progress>
              <div class="ml-10 is-medium-14-500-17 has-text-new-grey">
                {{ selected_ticket.checklistStats ? selected_ticket.checklistStats.checkedItems / selected_ticket.checklistStats.totalItems : 0 }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <tickets-list :extra_query="query"></tickets-list>
  </div>
</template>

<script>
  import TicketsTopFilters from "@/desktop/tickets/components/tickets-list/components/tickets-top-filters/tickets-top-filters";
  import { mapState, mapActions, mapGetters } from "vuex";
  import TicketsList from "@/desktop/tickets/components/tickets-list/tickets-list";
  import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import { ticketService } from "@/desktop/shared/services/";
  import { RRule, rrulestr } from "rrule";
  import TicketProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-progress.vue";
  import TicketDetailsMixin from "@/desktop/shared/mixins/ticket-details.mixin.vue";

  export default {
    mixins: [TicketDetailsMixin],

    data() {
      return {
        hover: false,
        ticket: {},
        is_details_loading: true,
        is_loading: true,
        sort_key: null,
        query: { "scheduleUid": this.$route.params.id },
      };
    },
    components: {
      AssignedTags,
      UserTag,
      TicketsTopFilters,
      TicketsList,
      TicketProgress,
    },

    computed: {
      ...mapState("tickets", ["tickets", "tickets_total_count"]),
      selected_ticket() {
        let selection = _.filter(this.tickets, (t) => t.uid == this.$route.params.ticket);
        return selection[0];
      },

      recurrence_text() {
        if (this.selected_ticket && this.selected_ticket.schedule && this.selected_ticket.schedule.rrule != null) {
          return new RRule.fromString(this.selected_ticket.schedule.rrule).toText();
        } else {
          return "";
        }
      },
      next_occurance() {
        if (this.selected_ticket && this.selected_ticket.schedule && this.selected_ticket.schedule.rrule != null) {
          let after = new RRule(RRule.parseString(this.selected_ticket.schedule.rrule)).after(new Date());
          let a = moment(after);
          let b = moment(new Date());
          return "in " + a.diff(b, "days") + " days";
        } else {
          return null;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .ticket-template {
    padding: 2rem;
  }
  .ticket-template-card {
    background-color: $white;
    border-radius: 1rem;
    box-shadow: 0 0 3px 0 rgba(23, 30, 72, 0.2);
    margin: 1.5rem 0;
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
