<template>
  <div class="ticket-checklists ">
    <div class="ticket-overview-options">
      <div class="ticket-overview-options__left">
        <span class="is-flex align-center">
          <sh-icon :name="'ticket-header-back'" @click.native="$router.push({ name: 'checklists' })" class="is-16x16 mr-10 is-pointer" />
          <span class="ticket-overview-options__left__title">
            {{ checklist ? checklist.name : "Checklists" }}
          </span>
        </span>
      </div>
    </div>
    <div class="columns is-centered mt-30" v-if="checklist">
      <div class="card checklist-details-card  column is-11 ">
        <div class="checklist-details-card-top is-flex has-space-between padding-10 no-padding-bottom">
          <div class="checklist-details-card-top__left is-flex align-center">
            <div class="is-pointer" v-tooltip="{ content: `Bookmark` , html: false}" @click.stop="update_checklist({ bookmark: !checklist.bookmark })">
              <sh-icon :name="checklist.bookmark ? 'bookmarked-highlight' : 'bookmark'" class="is-18x18 mr-10" />
            </div>
            <div class="is-semiBold-16-600-19 mr-10 is-pointer">{{ checklist.name }}</div>
            <sh-icon :name="'ticket-checklists-attachments'" class="has-opacity-8 is-18x18 is-pointer mr-10" />
            <div class="mr-10 has-opacity-6">{{ checklist.attachmentsCount ? checklist.attachmentsCount : 0 }}</div>
          </div>
          <div class="checklist-details-card-top__right is-flex is-vcenter">
            <!-- v-if="ticket.templateUsers && ticket.templateUsers.length" -->
            <user-tag :custom_size="24" :users="getUsers()" :tagsCountToShow="3" :custom_class="'tiny-user-avatar'"></user-tag>
          </div>
        </div>
        <hr />
        <div class="px-20">
          <p class="is-medium-16-500-19 my-20">Task Lists</p>

          <checklists
            :checklist="checklist"
            :is_ticket_without_checklists="is_ticket_without_checklists"
            :ticket="{ writeAccess: true }"
            :keep_open="true"
          ></checklists>
        </div>
      </div>
    </div>
    <div v-else>
      <p>No checklist available</p>
    </div>
  </div>
</template>

<script>
  import checklists from "@/desktop/tickets/components/ticket-details/components/task-list/components/checklist-component";
  import { mapState, mapGetters, mapActions } from "vuex";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import ChecklistMixin from "@/desktop/tickets/components/ticket-dashboard/components/checklists/components/checklist-mixin";
  import { ticketService } from "@/desktop/shared/services/";

  export default {
    components: {
      checklists,
      UserTag,
    },
    mixins: [ChecklistMixin],
    data() {
      return {
        service: ticketService,
        assignees: [],
        uid: this.$route.params.id,
      };
    },
    computed: {
      ...mapState("checklist", ["allChecklists"]),
      checklist: {
        get() {
          return this.allChecklists.find((checklist) => checklist.uid == this.uid);
        },
        set(val) {
          // val;
        },
      },
    },
    mounted() {
      this.assignees = [];
      this.get_assignees(this.checklist);
    },
    watch: {
      "checklist.items": {
        handler(val) {
          this.assignees = [];
          this.get_assignees(this.checklist);
        },
        deep: true,
      },
    },
  };
</script>

<style lang="scss">
  .checklist-details-card {
    //   width: 714px;
    min-height: 530px;
    //   overflow: auto;
    border-radius: 10px;
    box-shadow: 0 0 3px 0 rgba(23, 30, 72, 0.2);
    background-color: white;
  }
</style>
