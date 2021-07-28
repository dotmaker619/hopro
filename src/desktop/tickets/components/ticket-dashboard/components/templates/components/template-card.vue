<template>
  <div
    class="ticket-checklist-card"
    @click="$router.push({ name: 'template-details', params: { id: ticket.uid } })"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div
      class="is-pointer"
      v-tooltip="{ content: `Bookmark` }"
      @click.stop="update_ticket({ bookmark: !ticket.bookmark })"
      :class="{ 'is-vhidden': !hover && !ticket.bookmark }"
    >
      <sh-icon :name="ticket.bookmark ? 'bookmarked-highlight' : 'bookmark'" class="is-18x18 mr-10 mt-3" />
    </div>
    <div class="ticket-checklist-card__right">
      <div class="ticket-checklist-card__top">
        <div class="is-semiBold-16-600-19 mr-10 is-pointer">{{ ticket.name }}</div>
        <sh-icon :name="'ticket-checklists-attachments'" class="has-opacity-8 is-18x18 is-pointer mr-10" />
        <div class="mr-10 has-opacity-6">{{ ticket.attachmentsCount ? ticket.attachmentsCount : 0 }}</div>
      </div>
      <div class="ticket-checklist-card__content">
        <div class="check-list-desc">
          <assigned-tags :number_of_tags_to_display="3" :resourceId="ticket.uid" :tags="ticket.tags" :write_access="false" />
        </div>
        <div class="ticket-checklist-card__content-sec">
          <div class="ticket-checklist-card__content-sec__left">
            <div class="is-flex is-vcenter">
              <!-- v-if="ticket.templateUsers && ticket.templateUsers.length" -->
              <user-tag
                :custom_size="24"
                :users="[...(ticket.templateUsers || [])]"
                :tagsCountToShow="4"
                :custom_class="'tiny-user-avatar'"
              ></user-tag>
            </div>
          </div>
          <div class="ticket-checklist-card__content-sec__right">
            <span class="is-medium-16-500-19 has-opacity-7">{{ ticket.checklistsStats.checkedItems }}/{{ ticket.checklistsStats.totalItems }}</span>
          </div>
        </div>
        <div class="mt-10">
          <ticket-progress
            :total="ticket.checklistsStats.totalItems"
            :value="ticket.checklistsStats.checkedItems"
            :valueClass="'member-progress-value'"
          ></ticket-progress>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ticketService } from "@/desktop/shared/services/";
  import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import TicketProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-progress.vue";
  export default {
    props: ["ticket"],
    data() {
      return {
        hover: false,
        fav_checklist: false,
        ticketService: ticketService,
      };
    },
    components: {
      AssignedTags,
      UserTag,
      TicketProgress,
    },
    methods: {
      async update_ticket(value) {
        this.ticket.bookmark = value.bookmark;
        await ticketService
          .patch({
            id: this.ticket.uid,
            body: value,
          })
          .then(() => {
            this.$emit("refresh_template_tickets");
          })
          .catch((err) => {});
      },
    },
  };
</script>

<style lang="scss" scoped>
  .check-list-desc {
    font-family: Barlow-Medium !important;
    font-size: 14px !important;
    font-weight: 500 !important;
  }
</style>
