<template>
  <div class="mobile-ticket-details is-paddingless bg-light">
    <div class="mobile-ticket-details--header bg-white">
      <div class="is-flex is-vcenter h-40 pl-5" style="width: 70%;">
        <sh-icon @click.native="activeTab == 1 ? $emit('exit') : (activeTab = 1)" :name="'ticket-header-back'" class="is-14x14 mr-10 is-pointer" />
        <p class="is-medium-16-500-19 flex-wrap is-flex" style=" width: 90%;overflow-wrap: break-word;">
          {{ ticket.name }}
          <sh-icon
            :name="ticket.bookmark ? 'bookmarked-highlight' : 'bookmark'"
            class="is-16x16 ml-10"
            @click.native="update_ticket({ bookmark: !ticket.bookmark })"
          />
        </p>
      </div>

      <div class="is-flex is-vcenter h-40">
        <actions-dropdown :ticket="ticket" :is_list="true" @close_details="$emit('exit')"></actions-dropdown>
      </div>
    </div>
    <div class="pl-15 pb-10 bg-white">
      <tags-dropdown
        :service="ticketService"
        :tags="ticket.tags"
        :resourceId="ticket.uid"
        :number_of_tags_to_display="2"
        :write_access="ticket && ticket.writeAccess"
        :display_on_hover="false"
        :complete="update_ticket"
      />
    </div>

    <div class="mobile-ticket-details--main is-marginless">
      <div v-if="activeTab == 1" class="mt-10">
        <ticket-details-overview
          :ticket="ticket"
          :nameArray="nameArray"
          :elementData="elementData"
          @active-section="activeTab = $event"
        ></ticket-details-overview>
      </div>
      <div v-if="activeTab == 2" class="bg-white">
        <task-list :ticket="ticket" :channel="channel"></task-list>
      </div>
      <div v-if="activeTab == 3" class="bg-white">
        <attachments :ticket="ticket" :service="ticketService"></attachments>
      </div>

      <div v-if="activeTab == 4"  class="bg-white">
        <comments
          :commentsUnread="(commentsUnread = 0)"
          :presence_members="viewingMembers"
          :ticket="ticket"
          :channelName="'ticket-' + ticket.uid"
        ></comments>
      </div>
      <div v-if="activeTab == 5">
        <details-overview :ticket="ticket" @close="activeTab = 1"></details-overview>
      </div>
    </div>
    <div class="mobile-ticket-details--tabs">
      <div
        v-for="(tab_item, index) in tab_items"
        :key="index"
        class="ticket-tabs-item is-medium-16-500-19 is-pointer no-whitespace-wrap"
        :class="{'disable-comments':offline&&index==3,'is-active-tab':activeTab == index + 1}"
        @click="activeTab = index + 1"
      >
        <sh-icon :name="activeTab !== index + 1 ? `ticket-tab-${tab_item.icon}` : `ticket-tab-${tab_item.icon}-active`" class="is-20x20 mr-10" />

        <span class="tag is-medium is-info is-rounded ml-5" v-if="index === 5 && commentsUnread > 0">{{ commentsUnread }}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import DescriptionSection from "@/desktop/tickets/components/ticket-details/components/description-section";
  import TaskList from "./components/checklist";
  import Activities from "@/desktop/tickets/components/ticket-details/components/activities/activities";
  import Attachments from "@/desktop/tickets/components/ticket-details/components/attachments/attachments.vue";
  import Comments from "./components/comments";
  import ActionsDropdown from "@/desktop/tickets/shared/components/actions-dropdown";
  import StatusDropdown from "@/desktop/tickets/shared/components/status-dropdown";
  import DuedateDropdown from "@/desktop/tickets/shared/components/duedate-dropdown";
  import TicketDetailsOverview from "@/mobile/modules/tickets/components/ticket-details/components/overview.vue";
  import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
  import { ticketService, apiService } from "@/desktop/shared/services/";
  import tagsDropdown from "@/desktop/shared/components/tags/type-tag/type-tag";

  export default {
    props: ["ticket"],
    data() {
      return {
        tab_items: [
          { name: "Description", icon: "description" },
          { name: "Task List", icon: "task-list" },
          { name: "Attachments", icon: "attachments" },
          { name: "Comments", icon: "comments" },
        ],
        activeTab: 1,
        viewingMembers: [],
        nameArray: [],
        elementData: null,
        channel: null,
        ticketService: ticketService,
      };
    },
    components: {
      DescriptionSection,
      TaskList,
      Activities,
      Attachments,
      Comments,
      ActionsDropdown,
      StatusDropdown,
      DuedateDropdown,
      TicketDetailsOverview,
      AssignedTags,
      tagsDropdown,
    },
    created() {
      this.get_element();
    },
    computed: {
     offline() {
       return this.$store.state.is_offline;
     },
    },
    mounted() {
      this.channel = this.$store.state.PUSHER.subscribe(`presence-tickets-ticket_${this.ticket.uid}`);
      this.channel.bind("pusher:subscription_succeeded", (e) => {
        this.update_members();
        this.add_presence_members(e);
      });

      this.channel.bind("pusher:member_added", (member) => {
        this.update_members();
        this.presence_members = [...this.presence_members, member];
      });

      this.channel.bind("pusher:member_removed", (member) => {
        this.update_members();
        this.presence_members = _.remove(this.presence_members, (presence_member) => {
          return presence_member == member.id;
        });
        this.presence_members = Object.assign([], this.presence_members);
      });
    },

    methods: {
      update_ticket(value) {
        this.$store.dispatch("tickets/update_ticket_value", {
          id: this.ticket.uid,
          value: value,
        });
      },
      async get_element() {
        this.nameArray = [];
        let res = await apiService
          .get_element_hierarchy({
            id: this.ticket.targetElement.uid,
            stage: this.ticket.targetElement.stage,
          })
          .catch((err) => {
            console.log(err);
            this.nameArray = ["*Not found"];
          });
        this.elementData = res;
        if (this.elementData) this.getName(this.elementData);
      },
      getName(dataObject) {
        if (dataObject[`name`]) {
          this.nameArray.push(dataObject[`name`]);
        }
        if (dataObject[`child`] && dataObject[`child`].uid) return this.getName(dataObject[`child`]);
        return null;
      },
    },
    beforeDestroy() {
      this.$store.state.PUSHER.unsubscribe(`presence-tickets-ticket_${this.ticket_id}`);
      this.channel = null;

      this.ticket_id = null;
    },
  };
</script>

<style lang="scss">
  .disable-comments{
    opacity:0.1 !important;
    pointer-events: none;
  }
  .bg-light {
    background-color: #f4f7fc !important;
  }
  .bg-white {
    background-color: $white !important;
  }
  .mobile-ticket-details {
    .modal {
      height: calc(var(--mobilevh, 1vh) * 100);
      position: static;
      padding: 0;
    }

    // display: flex;
    // height: calc(var(--mobilevh, 1vh) * 100);
    // top: 0;
    // bottom: 0;
    // position: fixed;
    // flex-flow: column;
    // left: 0;
    &--header {
    }
  }

  .mobile-ticket-details--main {
    flex: 1;
    padding-bottom: 45px;
    overflow: hidden;
    > div {
      height: 100%;
    }
  }
</style>
