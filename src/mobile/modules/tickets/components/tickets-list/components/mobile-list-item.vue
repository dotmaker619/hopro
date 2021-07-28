<template>
  <div
    class="is-flex is-pointer "
    style="width:100%"
    v-touch:touchhold.stop="selectTicket"
    v-touch-options="{ touchClass: 'active', touchHoldTolerance: 300 }"
  >
    <status-dropdown
      v-tooltip="{
        content: ticket && !ticket.writeAccess ? status_values[ticket.status] : null,
      }"
      :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
      :current_status="ticket.status"
      :ticket="ticket"
      class="status-selector mr-5"
      :show_names="false"
      v-if="ticket"
      :size="22"
      @update-ticket-status="update_ticket({ status: parseInt($event.value) })"
    ></status-dropdown>

    <div class="m-ticket-list__item__details" @click.stop="open_ticket_details(ticket.uid)">
      <div class="m-name is-medium-16-500-19 is-flex is-vcenter" style="overflow: hidden;text-overflow: ellipsis;width: 320px;">
        {{ ticket.name }}
        <div class="is-pointer ml-5">
          <sh-icon :name="ticket.bookmark ? 'bookmarked-highlight' : 'bookmark'" :class="{ 'is-invisible': !ticket.bookmark }" class="is-12x12" />
        </div>
      </div>
      <div class="is-flex align-center mt-5" v-if="ticket.dueDate">
        <m-icon :name="'ticket-list-duedate'" class="is-13x13 mr-5" :file="'tickets-sprite'"></m-icon>
        <span class="is-regular-12-00-14 duedate-text" v-if="ticket.dueDate">{{ ticket.dueDate | prettyDate }}</span>

        <m-icon :name="'ticket-recurring'" class="is-13x13 ml-10" :file="'tickets-sprite'" v-if="ticket.schedule && ticket.schedule.rrule"></m-icon>
      </div>
      <div class="mt-5 is-flex align-center is-between">
        <div>
          <div v-if="tags && tags.length" class="is-flex is-vcenter no-whitespace-wrap">
            <div
              v-for="(tag, i) in tags.slice(0, 2)"
              :key="tag.uid"
              class="is-medium-14-500-17 no-whitespace-wrap sh-type-tag"
              :class="{ 'is-not-last': i !== tags.length - 1 }"
              :style="{ 'color': tag.color }"
            >
              {{ tag.name }}
            </div>
            <div v-if="tags.length > 2" class="more-count is-pointer is-medium-12-500-14 has-shadow-light-grey">+{{ tags.length - 2 }}</div>
          </div>
          <div v-else class="is-flex align-center">
            <m-icon :name="'ticket-list-no-tags'" class="is-11x11 mr-5" :file="'tickets-sprite'"></m-icon>
            <span class="is-regular-12-500-14 has-opacity-5">No tags</span>
          </div>
        </div>

        <div class="is-flex align-center" v-if="ticket.takenUp && ticket.takenUp.uid">
          <user-avatar
            v-if="ticket.takenUp"
            :user="ticket.takenUp"
            :pxsize="20"
            class="mr-5 "
            :avatarfontsize="12"
            :custom_class="'tiny-user-avatar'"
          ></user-avatar>
          <p class="is-medium-14-500-17 has-text-blue-grey truncate-text is-width-10" v-username="ticket.takenUp"></p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { mapState } from "vuex";

  import TicketDetailsMixin from "@/desktop/shared/mixins/ticket-details.mixin.vue";
  import PriorityDropdown from "@/desktop/tickets/shared/components/priority-dropdown";
  import StatusDropdown from "@/desktop/tickets/shared/components/status-dropdown";
  import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";

  export default {
    props: ["ticket", "tags"],
    mixins: [TicketDetailsMixin],
    computed: {
      ...mapState("tickets", ["selected"]),
    },
    data() {
      return {
        status_values: {
          1: "pending",
          2: "in progress",
          3: "resolved",
          4: "closed",
          5: "rejected",
        },
      };
    },
    components: {
      PriorityDropdown,
      StatusDropdown,
      UserDropdown,
    },
    methods: {
      update_ticket(value) {
        this.$store.dispatch("tickets/update_ticket_value", {
          id: this.ticket.uid,
          value: value,
        });
      },
      selectTicket() {
        if (this.ticket && this.ticket.writeAccess) {
          this.$store.dispatch("tickets/select_ticket", this.ticket.uid);
        }
      },
      openDetailsPage() {
        this.open_ticket_details(this.ticket.uid);
      },
    },
  };
</script>
