<template>
  <prompt-modal
    :name="'logout-modal'"
    :heading="'Logout from other devices'"
    :iconPath="require('@/assets/icons/profile/logout-illustration.svg')"
    :footer="true"
    :cancelString="'Keep this device logged in'"
    :confirmString="'Logout from this device'"
    :isLogoutModal="true"
    @cancel="logout_all_sessions('exclude_current_session=true')"
    @confirm="logout_all_sessions"
    @closed="$emit('closed')"
  >
    <div
      class="prompt-modal__content__text prompt-modal__content__text--logout"
      slot="content"
    >Logout from other devices</div>
  </prompt-modal>
</template>

<script>
import PromptModal from "@/desktop/shared/components/prompt-modal";
import { userService } from "@/desktop/shared/services/";
import AuthMixin from "@/auth/shared/auth.mixin";
import { mapState } from "vuex";

export default {
  components: {
    PromptModal
  },
  mixins: [AuthMixin],
  computed: {
    ...mapState(["claims"])
  },
  methods: {
    logout_all_sessions(query) {
      userService
        .logout_all_devices({
          id: this.claims.user_id,
          query: query
        })
        .then(async () => {
          if (!query) await this.logout();
          else this.$emit("refetch-login-history");
          this.$emit("closed");
        })
        .catch(err => {
          this.$toast.show(
            "Logout unsuccessful",
            "",
            this.$store.state.izitoast_options.appError
          );
        });
    }
  }
};
</script>
