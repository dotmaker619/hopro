<template>
  <div v-if="$store.state.app_loading" style="height: 100vh;display:flex;justify-content:center;align-items:center">
    <img style="width:100px" src="@/assets/icons/app-loader.svg" alt />
  </div>
  <div id="app" class="is-marginless columns is-mobile" v-else>
    <div class="left column is-paddingless is-narrow">
      <keep-alive>
        <router-view name="left"></router-view>
      </keep-alive>
    </div>
    <div class="root-right column is-paddingless">
      <div class="top sticky-navbar">
        <router-view name="top"></router-view>
      </div>
      <div class="root">
        <router-view class="router-root"></router-view>
      </div>
    </div>
    <router-view name="tickets"></router-view>
    <OneSignalPopup v-if="$store.getters.is_push_notifications" />
    <ViewerCreateTicket v-if="$route.name && $route.name.includes('viewer')" />
    <ViewerLoadTemplate v-if="$route.name && $route.name.includes('viewer')" />
    <ZipDownloadProgress v-if="$store.getters.download_files_zip" />
  </div>
</template>
<script>
  import AuthMixin from "@/auth/shared/auth.mixin";
  import ZipDownloadProgress from "@/desktop/shared/components/zip-download-progress/zip-download-progress";
  import { teamService, userService, authService, assetService } from "@/desktop/shared/services/";
  import DashboardSkeleton from "@/desktop/shared/components/skeleton/dashboard-skeleton";
  import TicketDetailsMixin from "@/desktop/shared/mixins/ticket-details.mixin.vue";

  import ViewerCreateTicket from "@/desktop/tickets/shared/components/viewer-create-ticket";
  import ViewerLoadTemplate from "@/desktop/tickets/shared/components/viewer-load-template";
  import OneSignalPopup from "@/desktop/shared/components/one-signal-popup";
  import { StreamChat } from "stream-chat";
  import axios from "axios";
  import { mapState, mapMutations, mapActions } from "vuex";
  import TicketsRealTimeUpdatesMixin from "@/desktop/tickets/shared/mixin/real-time-updates.mixin.vue";

  export default {
    mixins: [AuthMixin, TicketDetailsMixin, TicketsRealTimeUpdatesMixin],
    components: {
      DashboardSkeleton,
      ViewerLoadTemplate,
      OneSignalPopup,
      ViewerCreateTicket,
      ZipDownloadProgress,
    },

    computed: {
      ...mapState(["claims", "TAGS", "current_organization", "LAST_VISITED_PAGE"]),
      hasClaimsAndOrganization() {
        return !!this.claims && !!this.current_organization;
      },
    },

    watch: {
      $route() {
        // if (
        //   this.$store.state.claims &&
        //   this.$store.state.current_organization &&
        //   !(this.$route.name === "auth" || this.$route.name === "handle-login")
        // ) {
        //   this.$store.state.firebase_database
        //     .ref(`/userProfile/${this.$store.state.claims.user_id}/organizations/${this.$store.state.current_organization.uid}/lastVisitedPage`)
        //     .set(this.$route.path);
        // }

        if (this.$route.name && this.$route.name.includes("viewer"))
          Intercom("update", {
            hide_default_launcher: true,
          });
        else
          Intercom("update", {
            hide_default_launcher: false,
          });
      },
      hasClaimsAndOrganization() {
        this.initialize_split();
        this.initializeChatStream();
        // this.SET_TAGS();
        //Set user identity and push the username along with the email address to Segment
        analytics.identify(this.$store.state.claims.user_id, {
          name: this.$store.state.claims.firstname + " " + this.$store.state.claims.lastname,
          email: this.$store.state.claims.email,
        });
        //Set the organization name as the group identifier
        analytics.group(this.$store.state.current_organization.name);
      },
      current_organization() {},
    },
    created() {
      this.add_mapbox_token();
      this.event_from_iframe();
      if (!window.$cookies.get("access_token") && !this.$route.query.code && this.$route.name !== "signup")
        this.$router.push({ name: "handle-login" });
      this.$eventHub.$on("refetch-pinned-tabs", this.SET_PINNED_TABS);
    },
    beforeDestroy() {
      this.$eventHub.$off("refetch-pinned-tabs", this.SET_PINNED_TABS);
      this.chatClient.disconnect();
      this.$store.state.PUSHER.unsubscribe(`presence-users-org_${this.$store.state.current_organization.uid}`);
      if (window.addEventListener) {
        window.removeEventListener("message", this.message_event_handler);
      } else {
        window.detachEvent("onmessage", this.message_event_handler);
      }
    },
    methods: {
      ...mapMutations([
        "SET_RECENTLY_ACCESSED",
        "SET_COOKIE_TOKEN",
        "SET_PINNED_TABS",
        "SET_TEAMS_AND_USERS",
        "SET_TAGS",
        "SET_PUSHER",
        "SET_STREAM_CHAT",
        "SET_SPLIT_CLIENT",
      ]),
      async initializeChatStream() {
        let res = await axios.get(process.env.VUE_APP_CORE_API_HOST + "/stream/user-token/chat/", {
          headers: {
            Authorization: "jwt " + window.$cookies.get("access_token"),
          },
        });
        this.chatClient = new StreamChat(res.data.api_key);
        this.chatClient.setBaseURL("https://chat-proxy-singapore.stream-io-api.com");
        this.SET_STREAM_CHAT({ client: this.chatClient, token: res.data.token });
        await this.$store.dispatch("connect_stream_chat");
      },
      initialize_split() {
        // Instantiate the SDK. CDN will expose splitio globally
        var factory = splitio({
          core: {
            authorizationKey: process.env.VUE_APP_SPLIT_KEY,
            // your internal user id, or the account id that
            // the user belongs to.
            // This coudld also be a cookie you generate
            // for anonymous users
            key: this.claims.email,
            // an OPTIONAL traffic type, if provided will be
            // used for event tracking with the SDK client.
            trafficType: "A_TRAFFIC_TYPE",
          },
        });
        // And get the client instance you'll use
        var client = factory.client();
        client.on(client.Event.SDK_READY, () => {
          this.SET_SPLIT_CLIENT(client);
          this.set_pusher_instance();
        });
      },
      set_pusher_instance() {
        if (this.$store.getters.app_debug_mode) {
          console.log("in Debug mode2");
          Pusher.logToConsole = true;
        }
        let token = window.$cookies.get("access_token");
        let pusher = new Pusher(process.env.VUE_APP_PUSHER_KEY, {
          authEndpoint: process.env.VUE_APP_CORE_API_HOST + "/pusher/auth/",
          cluster: "ap2",
          forceTLS: true,
          auth: {
            headers: {
              Authorization: "jwt " + token,
            },
          },
        });

        this.SET_PUSHER(pusher);
        this.set_online_user_pusher_instance();
        this.set_team_and_users_pusher_event();
        this.set_org_tickets_event();
        this.set_asset_pusher_instance();
      },
      message_event_handler(e) {
        if (_.isObject(e.data) && e.data.name === "show_ticket_details") {
          this.open_ticket_details(e.data.ticket.uid);
        } else if (_.isObject(e.data) && e.data.name === "redirect_to_login") {
          this.logout();
        }
      },
      event_from_iframe() {
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
        eventer(messageEvent, this.message_event_handler);
      },

      async add_mapbox_token() {
        let res, token;
        try {
          res = await axios.get("https://sensehawk-config.s3.ap-south-1.amazonaws.com/mapbox-gl-token.json");
          token = res.data.token;
        } catch (err) {
          token = null;
        }
        if (token) mapboxgl.accessToken = token;
      },
      trigger_event() {
        // Create the event
        var event = new CustomEvent("app-updated", {
          action: "refresh application",
        });
        // Dispatch/Trigger/Fire the event
        document.dispatchEvent(event);
      },
      set_online_user_pusher_instance() {
        let channel = this.$store.state.PUSHER.subscribe(`presence-users-org_${this.$store.state.current_organization.uid}`);
        channel.bind("pusher:subscription_succeeded", (member) => {
          let already_online_users = [];
          channel.members.each((member) => {
            already_online_users.push(member);
          });
          this.$store.dispatch("update_online_users", already_online_users);
        });
        let presence_members = [...this.$store.state.online_users];
        channel.bind("pusher:member_added", (member) => {
          presence_members = [...presence_members, member];
          this.$store.dispatch("update_online_users", presence_members);
        });

        channel.bind("pusher:member_removed", (member) => {
          presence_members = _.remove(presence_members, (presence_member) => {
            return presence_member == member.id;
          });
          presence_members = Object.assign([], presence_members);
          this.$store.dispatch("update_online_users", presence_members);
        });
      },
      set_asset_pusher_instance() {
        let asset_channel = this.$store.state.PUSHER.subscribe(`private-assets-org_${this.$store.state.current_organization.uid}`);
        asset_channel.bind("ASSETS_UPDATED", async () => {
          let res = await assetService.getAll().catch((err) => console.log(err));
          this.$store.commit("SET_ASSETS", res);
        });
      },
      set_team_and_users_pusher_event() {
        let users_channel = this.$store.state.PUSHER.subscribe(`private-users-org_${this.$store.state.current_organization.uid}`);
        let teams_channel = this.$store.state.PUSHER.subscribe(`private-teams-org_${this.$store.state.current_organization.uid}`);

        users_channel.bind("USERS_ADDED", (member) => {
          this.update_users();
        });
        users_channel.bind("USERS_UPDATED", (member) => {
          this.update_users();
        });
        users_channel.bind("USERS_REMOVED", (member) => {
          this.update_users();
        });

        teams_channel.bind("TEAMS_ADDED", (member) => {
          this.update_teams();
        });
        teams_channel.bind("TEAMS_UPDATED", (member) => {
          this.update_teams();
        });
        teams_channel.bind("TEAMS_REMOVED", (member) => {
          this.update_teams();
        });
      },
    },
  };
</script>
<style lang="scss">
  @import "@/assets/style/core.scss";
  #app {
    font-family: "Barlow";
    background-color: $primary-background;
    font-size: 1.6rem;
    color: #171e48;
    .root-right {
      width: calc(100% - 22rem);
    }
  }

  .iziToast {
    min-height: 40px;
    padding-top: 3px;
    padding-bottom: 0;
    &.-close {
      height: 37px;
    }
  }
  .v--modal-overlay {
    background: rgba(50, 60, 70, 0.8);
  }
  .sticky-navbar {
    position: sticky;
    top: 0;
    z-index: 15;
  }
  input {
    outline-color: white;
    :focus {
      outline-color: white;
    }
    :active {
      outline-color: white;
    }
    caret-color: $primary;
  }
  .pinned-tab {
    color: $primary;
  }

  .tooltip {
    font-family: Barlow-Medium;
    font-size: 12px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.17;
    letter-spacing: 0.06px;
    font-size: 13px;
    display: block !important;
    z-index: 10000;
    .tooltip-inner {
      background: #171e48;
      color: white;
      border-radius: 4px;
      padding: 4px 7px 8px;
    }
    .tooltip-arrow {
      width: 0;
      height: 0;
      border-style: solid;
      position: absolute;
      margin: 5px;
      border-color: black;
      z-index: 1;
    }
    &[x-placement^="top"] {
      margin-bottom: 5px;
      .tooltip-arrow {
        border-width: 5px 5px 0 5px;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
        border-bottom-color: transparent !important;
        bottom: -5px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
      }
    }
    &[x-placement^="bottom"] {
      margin-top: 5px;
      .tooltip-arrow {
        border-width: 0 5px 5px 5px;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
        border-top-color: transparent !important;
        top: -5px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
      }
    }
    &[x-placement^="right"] {
      margin-left: 5px;
      .tooltip-arrow {
        border-width: 5px 5px 5px 0;
        border-left-color: transparent !important;
        border-top-color: transparent !important;
        border-bottom-color: transparent !important;
        left: -5px;
        top: calc(50% - 5px);
        margin-left: 0;
        margin-right: 0;
      }
    }
    &[x-placement^="left"] {
      margin-right: 5px;
      .tooltip-arrow {
        border-width: 5px 0 5px 5px;
        border-top-color: transparent !important;
        border-right-color: transparent !important;
        border-bottom-color: transparent !important;
        right: -5px;
        top: calc(50% - 5px);
        margin-left: 0;
        margin-right: 0;
      }
    }
    &[aria-hidden="true"] {
      visibility: hidden;
      opacity: 0;
      transition: opacity 0.15s, visibility 0.15s;
    }
    &[aria-hidden="false"] {
      visibility: visible;
      opacity: 1;
      transition: opacity 0.15s;
    }
  }
  .toast-border {
    width: 50rem;
    height: 5rem;
    border: 1.5px solid;
    border-radius: 6px;
    font-family: Barlow-Medium;
    font-size: 14px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.57;
    letter-spacing: normal;
    text-align: left;
    color: #171e48;
    &.is-danger {
      border-color: #ff3722;
    }
    &.is-success {
      border-color: #1dba54;
    }
    &.is-warning {
      border-color: #ffc100;
    }
  }
  .iziToast-title {
    width: 58px;
    height: 17px;
    font-family: Barlow;
    font-size: 14px;
    font-weight: 600;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.57;
    letter-spacing: normal;
    text-align: left;
    color: #171e48;
  }
  .is-caption {
    font-size: 1.2rem !important;
    letter-spacing: 0.0333333333em !important;
    line-height: 1.25rem;
    opacity: 0.7;
  }
  // THIN
  .has-background-transparent {
    background-color: transparent;
  }
  .disabled-tabs {
    opacity: 0.3 !important;
    :hover {
      opacity: 0.3 !important;
    }
  }
</style>
