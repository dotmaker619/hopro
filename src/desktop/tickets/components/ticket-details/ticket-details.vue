<template>
  <div v-if="ticket_id && detailed_ticket">
    <mobile-ticket-details :ticket="detailed_ticket" @exit="close_popup()" v-if="$route.meta.screen == 'mobile'"></mobile-ticket-details>
    <div v-else>
      <div class="ticket-details" v-if="detailed_ticket">
        <div class="ticket-details__card">
          <div class="ticket-details__card__breadcrumb">
            <div class="ticket-details__card__breadcrumb__left">
              <span class="mr-5">Ticket</span>
              <sh-icon :name="'ticket-details-right-arrow'" class="is-11x6 mr-5" />
              {{ detailed_ticket.name }}
            </div>
            <div class="ticket-details__card__breadcrumb__right">
              <div class="ticket-details-button mr-10 has-border has-border-primary" @click="unfollow_ticket" v-if="is_watching">
                <sh-icon :name="'ticket-follow-active'" class="is-16x16 mr-5" />
                <span class="is-medium-16-500-19 has-text-blue">Following</span>
              </div>
              <div class="ticket-details-button mr-10 follow-btn" @click="follow_ticket" v-else>
                <sh-icon :name="'ticket-follow'" class="is-16x16 mr-5" />
                <span class="is-medium-16-500-19">Follow</span>
              </div>
              <div class="ticket-details-button mr-10">
                <actions-dropdown :ticket="detailed_ticket" @close_details="close_popup()"></actions-dropdown>
              </div>
              <div class="is-pointer" @click="close_popup()">
                <sh-icon :name="'ticket-detail-close'" class="is-14x14 ml-5" />
              </div>
            </div>
          </div>

          <div class="ticket-details__card--top-section">
            <top-section
              :is_loading="is_loading"
              :ticket="detailed_ticket"
              :presence_members="currently_viewing"
              @overlay_popup="has_overlay = $event"
              @close-popup="close_popup"
              @open-schedule-tab="activeTab = 4"
            ></top-section>
          </div>
        </div>
        <div class="ticket-details__card--body has-slimscroll has-slimscroll-xs-h">
          <div class="ticket-tabs">
            <div
              v-for="(tab_item, index) in tab_items"
              :key="index"
              class="ticket-tabs-item is-medium-16-500-19 is-pointer no-whitespace-wrap"
              :class="activeTab == index + 1 ? 'is-active-tab' : ''"
              @click="activeTab = index + 1"
            >
              <sh-icon :name="`ticket-tab-${tab_item.icon}`" class="is-20x20 mr-10" />
              {{ tab_item.name }}
              <span class="tag is-medium is-info is-rounded ml-5" v-if="index === 5 && commentsUnread > 0">{{ commentsUnread }}</span>
            </div>
          </div>
          <div class="ticket-tabs-section">
            <div v-if="activeTab == 1 && ckeditorLoaded">
              <description-section
                :is_loading="is_loading"
                v-if="ticket"
                :description="ticket.description"
                :ticket="detailed_ticket"
                :owner="ticket.owner"
              ></description-section>
            </div>
            <div v-if="activeTab == 2">
              <task-list :service="apiService" :channel="channel" :ticket="detailed_ticket"></task-list>
            </div>
            <div v-if="activeTab == 3">
              <attachments :ticket="ticket" :service="apiService"></attachments>
            </div>
            <div v-if="activeTab == 4">
              <schedule
                :has_access="detailed_ticket.writeAccess ? true : false"
                :schedule="detailed_ticket.schedule"
                :uid="detailed_ticket.uid"
              ></schedule>
            </div>
            <div v-if="activeTab == 5">
              <div class="padding-40">
                <activities :ticket="detailed_ticket"></activities>
              </div>
            </div>
            <div v-if="activeTab == 6">
              <comments
                :commentsUnread="(commentsUnread = 0)"
                :presence_members="viewingMembers"
                :ticket="ticket"
                :service="apiService"
                :channelName="'ticket-' + this.ticket.uid"
              ></comments>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import TopSection from "./components/top-section.vue";
  import DescriptionSection from "./components/description-section";
  import TaskList from "./components/task-list/task-list-section";
  import Activities from "./components/activities/activities";
  import Attachments from "@/desktop/tickets/components/ticket-details/components/attachments/attachments.vue";
  import Schedule from "@/desktop/tickets/components/ticket-details/components/schedule/schedule.vue";
  import UserTag from "@/desktop/shared/components/tags/user-tag";
  import Comments from "./components/comments/comments-section";
  import ActionsDropdown from "@/desktop/tickets/shared/components/actions-dropdown";
  import { mapState } from "vuex";
  import MobileTicketDetails from "@/mobile/modules/tickets/components/ticket-details/mobile-ticket-details.vue";
  import { ticketService } from "@/desktop/shared/services/";

  export default {
    props: ["ticket_id"],
    data() {
      return {
        apiService: ticketService,
        has_overlay: false,
        ticket: null,
        channel: null,
        orgChannel: null,
        is_loading: false,
        viewingMembers: null,
        presence_members: [],
        commentsUnread: 0,
        ckeditorLoaded:false,
        activeTab: 1,
        tab_items: [
          { name: "Description", icon: "description" },
          { name: "Task List", icon: "task-list" },
          { name: "Attachments", icon: "attachments" },
          { name: "Schedule", icon: "schedule" },
          { name: "Activity", icon: "activities" },
          { name: "Comments", icon: "comments" },
        ],
      };
    },
    components: {
      TopSection,
      DescriptionSection,
      TaskList,
      Attachments,
      UserTag,
      Schedule,
      ActionsDropdown,
      Activities,
      Comments,
      MobileTicketDetails,
    },
    mounted() {
      if (!document.getElementById("ckeditor")) {
        var scriptTag = document.createElement("script");
        scriptTag.src = "https://cdn.jsdelivr.net/gh/sensehawk/cdn/ckeditor/ckeditor-classic.js";
        scriptTag.id = "ckeditor";
        scriptTag.onload=()=>{this.ckeditorLoaded=true; }
        document.getElementsByTagName("head")[0].appendChild(scriptTag);
      }
      else{
        this.ckeditorLoaded=true;
      }

      this.channel = this.$store.state.PUSHER.subscribe(`presence-tickets-ticket_${this.ticket_id}`);
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

    created() {
      window.onpopstate = (e) => {
        e.preventDefault();
        window.history.forward();
        return this.close_popup();
      };

      if (this.ticket_id) {
        this.get_details(true);
        this.$store.state.chat.client.on("notification.message_new", this.chatStreamMessage);
      }

      if (this.$route.name == "schedules" || this.$route.name == "schedule-details") {
        this.activeTab = 4;
      }

      this.$eventHub.$on(`refresh-ticket-details`, (result) => {
        if (this.ticket_id) this.get_details();
      });

      this.$eventHub.$on("add_users_to_ticket", (read, write) => this.add_users(read, write));
      this.$eventHub.$on("add_teams_to_ticket", (read, write) => this.add_users(read, write));
    },

    beforeDestroy() {
      this.$store.state.chat.client.off("notification.message_new", this.chatStreamMessage);
      this.$store.state.PUSHER.unsubscribe(`presence-tickets-ticket_${this.ticket_id}`);
      this.channel = null;
      this.$eventHub.$off("add_users_to_ticket");
      this.$eventHub.$off("add_teams_to_ticket");
      this.$eventHub.$off("refresh-ticket-details");
      this.ticket_id = null;
    },
    computed: {
      ...mapState("tickets", ["tickets"]),
      ...mapState(["users"]),
      detailed_ticket() {
        return this.tickets.find((t) => t.uid == this.ticket_id);
      },
      is_watching() {
        return _.find(this.detailed_ticket.watchers, ["uid", this.$store.state.user_claims.user_id]);
      },
      currently_viewing() {
        return this.viewingMembers ? this.viewingMembers.filter((user) => user.uid != this.$store.state.claims.user_id) : [];
      },
      channel_members() {
        return this.channel.members;
      },
    },
    methods: {
      update_members() {
        this.viewingMembers = this.channel_members ? Object.values(this.channel_members.members) : [];
      },
      chatStreamMessage(e) {
        if (e.channel_id === "ticket-" + this.ticket.uid) {
          this.commentsUnread = e.unread_count;
        }
      },
      remove_overlay() {
        this.has_overlay = false;
      },
      add_users(read, write) {
        (this.ticket.readUsers = [...this.ticket.readUsers, ...read]), (this.ticket.writeUsers = [...this.ticket.writeUsers, ...write]);
      },
      add_teams(read, write) {
        (this.ticket.readLabels = [...this.ticket.readLabels, ...read]), (this.ticket.writeLabels = [...this.ticket.writeLabels, ...write]);
      },
      add_presence_members() {
        this.channel.members.each((member) => {
          this.presence_members.push(member);
        });
      },
      async get_details(loading = false) {
        this.is_loading = loading;

        let res = await ticketService
          .get({
            id: this.ticket_id,
            query: "tags=true",
          })
          .catch((err) => {
            console.log(err);
          });

        this.ticket = res;

        this.is_loading = false;
        if (this.ticket) this.$store.dispatch("tickets/add_ticket_details", this.ticket);
      },

      close_popup() {
        if (this.$route.name == "ticket-details") {
          this.$router.go(-1);
        } else {
          this.$emit("close");
        }
      },
      follow_ticket() {
        this.$store.dispatch("tickets/update_multiple_tickets", {
          value: { watch: true },
          tickets: [this.ticket.uid],
        });
      },
      unfollow_ticket() {
        this.$store.dispatch("tickets/update_ticket_value", {
          value: { watch: false },
          id: this.ticket.uid,
        });
      },
    },
  };
</script>

<style lang="scss">
  .v--modal-block-scroll {
    height: 100vh;
  }
  .modal-content {
    &::-webkit-scrollbar {
      width: 0.6rem !important;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 1rem !important;
      background: rgba(0, 0, 0, 0.2) !important;
    }
  }
  .ticket-details {
    font-size: initial;
    min-width: 120rem;
    max-width: 120rem;
    min-height: 50rem;
    overflow: hidden;
    @include for-size("tablet") {
      min-width: 50%;
      min-height: 100%;
      overflow: scroll;
    }
    &__card {
      &__breadcrumb {
        font-family: Barlow-Medium !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        color: $dark-grey;
        display: flex;
        justify-content: space-between;
        padding: 3rem 3rem 5rem;
        &__left {
          display: flex;
          align-items: center;
        }
        &__right {
          display: flex;
          align-items: center;
        }
      }
      &--top-section {
        margin: 0 6rem;
      }
      &--body {
        min-height: 50rem;
        max-height: max-content;
        @include for-size("tablet") {
          min-height: 100rem;
        }
      }
    }
    &-button {
      border-radius: 6px;
      background-color: #ffffff;
      box-shadow: 0 1px 3px 0 rgba(23, 30, 72, 0.1);
      display: flex;
      align-items: center;
      padding: 10px;
      color: $primary-text;
      cursor: pointer;
    }
  }
  .mt-50 {
    margin-top: 5rem;
  }
  .is-presence_user {
    position: absolute;
    bottom: -2rem;
    right: 3rem;
  }
  .ticket-tabs {
    display: flex;
    border-bottom: 1px solid rgba(23, 30, 72, 0.1);
    padding: 4rem 5rem 0 5rem;
    overflow: auto;
    &-item {
      padding: 1rem 1.6rem;
      display: flex;
      align-items: center;
      border-bottom: 4px solid $white;
      opacity: 0.4;
      &.is-active-tab {
        opacity: 1;
        border-bottom: 4px solid $primary;
      }
    }
  }
  .follow-btn {
    border: 1px solid transparent;
  }

  .mobile-ticket-details {
    padding-top: 5px;
    background: #fff;
    height: calc(var(--mobilevh, 1vh)*100);
    width: 100vw;
    position: absolute;
    bottom: 0;
    display: flex;
    top: 0;
    left: 0;
    flex-flow: column;
    &--header {
      padding: 0 1rem;
      margin-top: 3px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    &--main {
      border-top: 1px solid #eee;
      margin-top: 15px;
      height: calc(100vh - 16.5rem);
    }
    &--tabs {
      position: fixed;
      bottom: 0;
      background: #ffffff;
      display: flex;
      width: 100%;
      justify-content: space-evenly;
      border-top: 1px solid #ccc;
      box-shadow: -3px -3px 10px 2px #ddd;
      z-index: 40;
      .ticket-tabs-item {
        width: 100%;
        justify-content: center;
        // border-right: 1px solid #ddd;
        box-shadow: 0 -1px 3px 0 rgba(0, 0, 0, 0.08);
        &.is-active-tab {
          border-top: 2px solid #2585d3;
          border-bottom: 0px solid transparent;
        }
      }
    }
  }

  .h-40 {
    height: 4rem;
  }
</style>
