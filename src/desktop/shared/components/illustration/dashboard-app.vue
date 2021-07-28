<template>
  <div class="dashboard-app">
    <div class="columns dashboard-app-content is-vcentered">
      <div class="column is-5 dashboard-app-left">
        <div>
          <slot name="image"></slot>
        </div>
        <div class="is-medium-20-500-24 has-opacity-8 pt-20">
          <slot name="title"></slot>
        </div>
      </div>
      <div class="dashboard-app-right column is-7">
       
        <div>
          <div class="dashboard-app-right__title is-medium-20-500-24">
            <slot name="no-result-heading"></slot>
          </div>
          <div class="dashboard-app-right__desc is-regular-14-00-22">
            <slot name="no-result-desc"></slot>
          </div>
          <div class="dashboard-app-right__subdesc is-regular-14-00-22">
            <slot name="no-result-subdesc"></slot>
          </div>
          <div class="dashboard-app-right__learnmore is-semiBold-14-600-22 is-pointer" @click="show_intercom">Request access</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
    }
  }
};
</script>

<style lang="scss" scoped>
.dashboard-app {
  height: 436px;
  border-radius: 10px;
  box-shadow: 0 1px 5px 0 rgba(23, 30, 72, 0.1);
  background-color: #ffffff;

  &-content {
    height: 100%;
  }

  &-create {
    padding-top: 1.6rem;
    max-width: 144px;
    margin: 0 auto;
  }

  &-left {
    text-align: center;
    img {
      width: 12rem;
    }
  }
  &-right {
    // text-align: center;
    border-left: 1px dashed rgba(23, 30, 72, 0.1);
    display: flex;
    padding: 0 30px;

    &__image {
      margin-right: 1rem;
      img {
        height: 2rem;
        width: 2rem;
      }
    }

    &__title {
      color: $primary;
    }
    &__desc {
      padding-top: 1.5rem;
      color: #43496b;
    }
    &__subdesc {
      padding-top: 2rem;
      color: #43496b;
    }
    &__learnmore {
      color: $primary;
    }
  }
}
</style>