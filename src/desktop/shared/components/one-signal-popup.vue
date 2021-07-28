<template>
  <div
    v-show="push_subscribe_last_notified && active && !isPushNotificationsEnabled"
    class="sh-one-signal-popup"
  >
    <div class="left">
      <img src="@/assets/icons/well.svg" alt />
      <div class="text">Subscribe for notification</div>
    </div>
    <div class="right mr-10">
      <a class="button-1" @click="active = false;set_push_subscribe_last_notified()">Later</a>
      <a class="button-2 onesignal-customlink-container"></a>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TicketDetailsMixin from "@/desktop/shared/mixins/ticket-details.mixin.vue";

export default {
  mixins: [TicketDetailsMixin],

  data() {
    return {
      is_initialized: false,
      active: true,
      isPushNotificationsEnabled: true,
      push_subscribe_last_notified: false
    };
  },
  mounted() {
    window.addEventListener("load", () => {
      // run after everything is in-place
      if (this.hasClaimsAndOrganization) {
        this.init();
      }
    });

    this.push_subscribe_last_notified = this.get_push_subscribe_last_notified();
  },
  computed: {
    ...mapState(["claims", "current_organization"]),
    hasClaimsAndOrganization() {
      return !!this.claims && !!this.current_organization;
    }
  },
  watch: {
    hasClaimsAndOrganization(val) {
      if (this.hasClaimsAndOrganization) {
        this.init();
      }
    }
  },
  created() {
    if (!window.OneSignal || process.env.VUE_APP_ENV === "development") return;

    this.init();

    OneSignal.push(() => {
      // Occurs when the user's subscription changes to a new value.
      OneSignal.isPushNotificationsEnabled(isEnabled => {
        this.isPushNotificationsEnabled = isEnabled;
        if (this.isPushNotificationsEnabled) {
          OneSignal.setExternalUserId(this.$store.state.claims.user_id);
        }
      });
      OneSignal.on("subscriptionChange", isSubscribed => {
        this.isPushNotificationsEnabled = isSubscribed;
        if (isSubscribed) {
          OneSignal.setExternalUserId(this.$store.state.claims.user_id);
        } else {
          OneSignal.removeExternalUserId(this.$store.state.claims.user_id);
        }
      });
      // This event can be listened to via the `on()` or `once()` listener.
    });
  },
  methods: {
    set_push_subscribe_last_notified() {
      localStorage.setItem("push_subscribe_last_notified", Date.now());
    },
    get_push_subscribe_last_notified() {
      if (!localStorage.getItem("push_subscribe_last_notified")) return true;

      let start = moment(
        parseInt(localStorage.getItem("push_subscribe_last_notified"))
      );
      let end = moment(Date.now());
      let diff = end.diff(start, "days"); // =1

      return diff >= 7 ? true : false;
    },
    init() {
      let self = this;
      var OneSignal = window.OneSignal || [];

      if (
        this.is_initialized ||
        !OneSignal ||
        process.env.VUE_APP_ENV === "development"
      )
        return;

      OneSignal.push(() => {
        let appId;
        if (
          window.location.hostname.includes("m.sensehawk.com") ||
          window.location.hostname.includes("m-stage.sensehawk.com")
        )
          appId = process.env.VUE_APP_ONESIGNAL_MOBILE;
        else appId = process.env.VUE_APP_ONESIGNAL;

        OneSignal.SERVICE_WORKER_PATH = "service-worker.js";
        OneSignal.SERVICE_WORKER_UPDATER_PATH = "service-worker-updater.js";
        OneSignal.init({
          appId: appId,
          allowLocalhostAsSecureOrigin: true,
          notificationClickHandlerMatch: "origin",
          notificationClickHandlerAction: "click",
          persistNotification: false,
          // notifyButton: {
          //   enable: true,
          // },
          // Your other init options here
          welcomeNotification: {
            title: "Welcome to SenseHawk!",
            message:
              "Thanks for subscribing! This is how you will be notified of updates further"
          },
          promptOptions: {
            customlink: {
              enabled: true /* Required to use the Custom Link */,
              style: "subscribe-button" /* Has value of 'button' or 'link' */,
              size: "" /* One of 'small', 'medium', or 'large' */,
              color: {
                button:
                  "" /* Color of the button background if style = "button" */,
                text: "" /* Color of the prompt's text */
              },
              text: {
                subscribe:
                  "Subscribe Now" /* Prompt's text when not subscribed */,
                unsubscribe:
                  "unsubscribe Now" /* Prompt's text when subscribed */
                // explanation: "Get updates from all sorts of things that matter to you", /* Optional text appearing before the prompt button */
              },
              unsubscribeEnabled: true /* Controls whether the prompt is visible after subscription */
            }
          }
        });
        this.is_initialized = true;
        // if (this.$store.state.claims)
        //   OneSignal.setExternalUserId(this.$store.state.claims.user_id);
      });
      function notificationHandler() {
        OneSignal.push([
          "addListenerForNotificationOpened",
          event => {
            if (event.data.type === "ticket") {
              // self.$router.push({
              //   name: "ticket-details",
              //   params: { id: event.data.uid }
              // });
              self.open_ticket_details(event.data.uid);
            } else if (event.data.type === "vault") {
              self.$router.push({
                name: "vault",
                query: { folder: event.data.uid }
              });
            }
            notificationHandler();
          }
        ]);
      }
      notificationHandler();
    }
  }
};
</script>

<style lang="scss">
.sh-one-signal-popup {
  z-index: 90000000;
  position: fixed;
  bottom: 1.6rem;
  right: 10rem;
  width: 561px;
  height: 50px;
  border-radius: 6px;
  border: solid 1px $primary;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .left {
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      margin-left: 15px;
      margin-right: 10px;
    }
    .text {
      width: 157px;
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
  }
  .right {
    .button-1 {
      opacity: 0.7;
      font-family: Barlow;
      font-size: 16px;
      font-weight: 600;
      font-stretch: normal;
      font-style: normal;
      line-height: 6.63;
      letter-spacing: normal;
      text-align: center;
      color: #171e48;
      margin-right: 30px;
    }
    .button-2 {
      button {
        border-radius: 6px !important;
        background-color: $primary !important;
        padding: 8px 20px !important;
        cursor: pointer;
        font-family: Barlow-medium !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        text-align: left;
        color: #ffffff !important;
      }
    }
  }
}
</style>
