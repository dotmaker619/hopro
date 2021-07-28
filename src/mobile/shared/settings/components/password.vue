<template>
  <div class="margin-20">
    <div class="py-20">
      <p class="is-regular-12-500-14 has-opacity-7">Current Password</p>
      <input
        type="password"
        v-model="currentPassword"
        name="current"
        id="current"
        placeholder="Current Password"
        class="input mobile-settings-input"
      />
    </div>
    <div class="py-20">
      <p class="is-regular-12-500-14 has-opacity-7">New Password</p>
      <input type="text" v-model="newPassword" name="current" id="current" placeholder="New Password" class="input mobile-settings-input" />
    </div>
    <div class="py-20">
      <p class="is-regular-12-500-14 has-opacity-7">Confirm New Password</p>
      <input
        type="password"
        v-model="confirmPassword"
        name="current"
        id="current"
        placeholder="Confirm New Password"
        class="input mobile-settings-input"
      />
    </div>
    <div class="sh-button mt-30" @click="update_password">
      <span class="is-medium-14-500-17">
        Update Password
      </span>
    </div>
  </div>
</template>
<script>
  import { userService } from "@/desktop/shared/services/";

  export default {
    data() {
      return {
        currentPassword: null,
        newPassword: null,
        confirmPassword: null,
      };
    },
    methods: {
      update_password() {
        if (this.newPassword && this.newPassword === this.confirmPassword) {
          userService
            .change_password({
              id: this.$store.state.claims.user_id,
              body: {
                strict: false,
                new_password: this.newPassword,
                old_password: this.currentPassword,
              },
            })
            .then((res) => {
              this.$toast.show("Password updated", "", this.$store.state.izitoast_options.appSuccess);
            })
            .catch((err) => {
              this.$toast.show("Password change unsuccessful", "", this.$store.state.izitoast_options.appError);
            });
        } else this.$toast.show("Passwords do not match!", "", this.$store.state.izitoast_options.appError);
      },
    },
  };
</script>

<style lang="scss">
  .mobile-settings-input {
    box-shadow: none;
    border: none;
    border-bottom: 0.5px solid #ccc;
    border-radius: 0;
    padding: 0;
    &::placeholder {
      font-family: Barlow-Medium;
      font-size: 1.4rem;
      font-weight: 500;
      line-height: 1.21;
      color: #171e48;
    }
  }
</style>
