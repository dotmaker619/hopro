<template>
  <div>
    <b-modal :active="update_app && !active" :can-cancel="true">
      <div class="install-popup-container">
        <div class="install-popup">
          <div class="install-popup--logo-1">
            <img src="@/assets/logos/favicon-32x32.png" />
          </div>
          <div class="install-popup--logo-2">
            <img src="@/assets/logos/sensehawk.png" />
          </div>
          <div class="install-popup--description-text">
            New Version Available
            <br />Please, update app to new version
          </div>
          <a @click="$router.go()" class="install-popup--button">
            <span class="install-popup--button-text">Update</span>
            <img class="install-popup--button-download-icon" src="@/assets/icons/png/download.png" />
          </a>
        </div>
      </div>
    </b-modal>
    <b-modal :active="active" :can-cancel="false">
      <div class="install-popup-container">
        <div class="install-popup">
          <div class="install-popup--logo-1">
            <img src="@/assets/logos/favicon-32x32.png" />
          </div>
          <div class="install-popup--logo-2">
            <img src="@/assets/logos/sensehawk.png" />
          </div>
          <div class="install-popup--description-text">
            Get faster speed, real time updates
            and notifications
          </div>
          <a @click="install_app()" class="install-popup--button">
            <span class="install-popup--button-text">Install</span>
            <img class="install-popup--button-download-icon" src="@/assets/icons/png/download.png" />
          </a>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      update_app: false,
      is_action_done: false,
      active: false
    };
  },
  methods: {
    install_app() {
      window.deferedPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the A2HS prompt");
        } else {
          console.log("User dismissed the A2HS prompt");
        }
        this.active = false;
        window.deferedPrompt = null;
      });
      window.deferedPrompt.prompt();
    }
  },
  mounted() {
    document.addEventListener("app-updated", e => {
      this.update_app = true;
    });

    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault();
      window.deferedPrompt = e;
      if (!this.is_action_done) this.active = true;
      this.is_action_done = true;
      console.log("beforeinstallprompt");
    });
  }
};
</script>

<style lang="scss">
.install-popup-container {
  display: flex;
  justify-content: center;
  .install-popup {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 260px;
    height: 285px;
    border-radius: 9px;
    box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.3);
    background-color: white;
    &--logo-1 {
      margin-top: 30px;
    }
    &--logo-2 {
      margin-top: 5px;
    }
    &--description-text {
      width: 198px;
      margin-top: 20px;
      margin-bottom: 15px;
      font-family: Barlow-Regular;
      font-size: 13px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.69;
      letter-spacing: normal;
      text-align: center;
      color: #5b607e;
    }
    &--button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 119px;
      height: 44px;
      border-radius: 9px;
      box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.3);
      background-color: #2585d3;
      &-text {
        font-family: Barlow-Medium;
        font-size: 14px;
        font-weight: 500;
        color: white;
        margin-right: 7px;
      }
    }
  }
}
</style>