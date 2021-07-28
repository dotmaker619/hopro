<template>
  <div
    class="ticket-checklist-card is-pointer"
    v-if="checklist"
    @mouseenter="hover = true"
    @mouseleave="hover=false"
    @click="view_details(checklist)"
  >
    <div
      class="is-pointer"
      v-tooltip="{ content: `Bookmark` }"
      @click.stop="update_checklist({ bookmark: !checklist.bookmark })"
      :class="{ 'is-vhidden': !hover && !checklist.bookmark }"
    >
      <sh-icon
        :name="checklist.bookmark ? 'bookmarked-highlight' : 'bookmark'"
        class="is-18x18 mr-10 mt-3"
      />
    </div>
    <div class="ticket-checklist-card__right">
      <div class="ticket-checklist-card__top">
        <div class="is-semiBold-16-600-19 mr-10 is-pointer">{{checklist.name}}</div>
        <sh-icon
          :name="'ticket-checklists-attachments'"
          class="has-opacity-8 is-18x18 is-pointer mr-10"
        />
        <div class="mr-10 has-opacity-6">{{checklist.attachmentsCount?checklist.attachmentsCount:0}}</div>
      </div>
      <div class="ticket-checklist-card__content">
        <div class="check-list-desc">
          <!-- Electrical | Maintenance | Warranty.. -->
          <!-- <type-tag
            :tags = checklist.tags
            :addMore="false"
            :showEllipsis="true"
          />-->
        </div>
        <div class="ticket-checklist-card__content-sec">
          <div class="ticket-checklist-card__content-sec__left">
            <div class="is-flex is-vcenter">
              <user-tag
                :custom_size="24"
                :users="getUsers()"
                :tagsCountToShow="4"
                :custom_class="'tiny-user-avatar'"
              ></user-tag>
            </div>
          </div>
          <div class="ticket-checklist-card__content-sec__right">
            <span
              class="is-medium-16-500-19 has-opacity-7"
            >{{checklist.checkedItems}}/{{checklist.totalItems}}</span>
          </div>
        </div>
        <div class="mt-10">
          <ticket-progress
            :total="checklist.totalItems"
            :value="checklist.checkedItems"
            :valueClass="'member-progress-value'"
          ></ticket-progress>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserTag from "@/desktop/shared/components/tags/user-tag-new";
import ChecklistMixin from "@/desktop/tickets/components/ticket-dashboard/components/checklists/components/checklist-mixin";
import TicketProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-progress.vue";
import { ticketService } from "@/desktop/shared/services/";

export default {
  props: ["checklist", "index"],
  data() {
    return {
      service: ticketService,
      hover: false,
      assignees: []
    };
  },
  mixins: [ChecklistMixin],
  components: {
    UserTag,
    TicketProgress,
  },
  created() {
    this.get_assignees(this.checklist);
  },
  methods: {
    view_details() {
      this.$router.push({
        params: { id: this.checklist.uid },
        name: "checklist-details"
      });
    },
    
  }
};
</script>

<style lang="scss" scoped>
.check-list-desc {
  font-family: Barlow-Medium !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}
</style>
