<template>
  <div class="login">
    <div id="okta-signin-container"></div>
  </div>
</template>

<script>
// import OktaSignIn from "@okta/okta-signin-widget";
// import "@okta/okta-signin-widget/dist/css/okta-sign-in.min.css";

import sampleConfig from "./config";

export default {
  async created() {
    let token = window.$cookies.get("access_token");
    if (token) this.$router.replace({ name: "home" });
  },
  name: "Login",
  mounted: function() {
    if (window.$cookies.get("access_token")) return;
    this.$nextTick(function() {
      this.widget = new OktaSignIn({
        /**
         * Note: when using the Sign-In Widget for an OIDC flow, it still
         * needs to be configured with the base URL for your Okta Org. Here
         * we derive it from the given issuer for convenience.
         */
        baseUrl: sampleConfig.oidc.issuer.split("/oauth2")[0],
        clientId: sampleConfig.oidc.clientId,
        redirectUri: sampleConfig.oidc.redirectUri,
        logo: require("@/assets/logos/sensehawk-logo-small.svg"),
        i18n: {
          en: {
            "primaryauth.title": "Sign in to sensehawk  "
          }
        },
        features: {
          showPasswordToggleOnSignInPage: true
        },
        authParams: {
          responseType: "code",
          pkce: false,
          issuer: sampleConfig.oidc.issuer,
          display: "page",
          scopes: sampleConfig.oidc.scopes
        }
      });

      this.widget.renderEl(
        { el: "#okta-signin-container" },
        () => {
          /**
           * In this flow, the success handler will not be called because we redirect
           * to the Okta org for the authentication workflow.
           */
        },
        err => {
          throw err;
        }
      );
    });
  },
  destroyed() {
    // Remove the widget from the DOM on path change
    if (this.widget) this.widget.remove();
  }
};
</script>
<style lang="scss" lang="scss">
#okta-signin-container {
  height: 150vh;
}

#okta-sign-in {
  overflow: visible;
  top: 80px;
}
#okta-sign-in.auth-container .button-primary {
  background-color: $primary;
  background: $primary;
  border-color: $primary;
  &:hover {
    background-color: $primary;
    background: $primary;
    border-color: $primary;
  }
}
</style>
