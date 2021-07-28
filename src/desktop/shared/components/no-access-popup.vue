<template>
  <div class="no-access-popup">
    <img class="no-access-popup-left" src="@/assets/illustrations/access-popup.svg" />
    <div class="no-access-popup-right">
      <div class="no-access-popup-heading">Access Denied</div>
      <div class="no-access-popup-text">
        Oops! You don't have enough permissions to access the feature/functionality.
        <br />Your administrator should be able to give access to this feature if registered.
        <br />
        <br />Want this feature to be enabled for your organization?
      </div>
      <div class="no-access-popup-action">
        <a class="link" @click="show_intercom()">Request Acesss</a>
        <a class="cancel" @click="$emit('close')">Cancel</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["app_name", "permission_name"],
  methods: {
    show_intercom() {
      window.Intercom("shutdown");
      let claims = this.$store.state.claims;

      let options = { app_id: process.env.VUE_APP_INTERCOM_KEY };
      options["email"] = claims.email;

      if (claims.firstname)
        options["name"] = claims.firstname + " " + claims.lastname;
      else if (claims.email) options["name"] = claims.email;
      else options["name"] = claims.user_id;

      window.Intercom("boot", options);
      window.Intercom("show");
      setTimeout(() => {
        this.$emit("close");
      }, 500);
    }
  }
};
</script>

<style lang="scss">
.no-access-popup {
  display: flex;
  height: 330px;
  border-radius: 10px;
  box-shadow: 0 10px 30px 0 rgba(50, 60, 70, 0.3);
  background-color: #ffffff;
  &-right {
    padding-left: 38px;
    padding-right: 38px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  &-heading {
    width: 142px;
    height: 26px;
    font-family: Barlow-SemiBold;
    font-size: 22px;
    font-weight: 600;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.18;
    letter-spacing: normal;
    text-align: left;
    color: #171e48;
  }
  &-text {
    margin-top: 20px;
    margin-bottom: 30px;

    width: 251px;
    // height: 61px;
    opacity: 0.8;
    font-family: Barlow;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.57;
    letter-spacing: normal;
    text-align: left;
    color: #171e48;
  }
  &-action {
    display: flex;
    .link,
    .cancel {
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Barlow-SemiBold;
      font-size: 14px;
      font-weight: 600;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.21;
      letter-spacing: normal;
      text-align: left;
    }
    .link {
      width: 140px;
      height: 44px;
      border-radius: 6px;
      box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
      background-color: $primary;
      color: #ffffff;
    }
    .cancel {
      margin-left: 30px;
      color: $primary;
    }
  }
}
</style>