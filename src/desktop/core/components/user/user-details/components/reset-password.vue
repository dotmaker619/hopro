<template>
  <prompt-modal
    :name="'reset-password'"
    :heading="'Reset Password'"
    :iconPath="require('@/assets/icons/prompt/reset-password.svg')"
    :footer="true"
    :cancelString="'Cancel'"
    :confirmString="'Reset'"
    @cancel="$emit('closed')"
    @confirm="reset_password"
    @closed="$emit('closed')"
  >
    <div class="prompt-modal__content__text" slot="content">
      You are about to reset the user password
      and send a reset password email.
      Are you sure?
    </div>
  </prompt-modal>
</template>

<script>
import PromptModal from "@/desktop/shared/components/prompt-modal";
import { userService } from "@/desktop/shared/services/";

export default {
  components: {
    PromptModal
  },
  methods: {
    async reset_password() {
      let result = await userService
        .put({
          id: this.$route.params.id,
          attribute: "credentials/reset_password",
          body: { sendEmail: true }
        })
        .catch(err => this.handleErrors(err));
      if (result) {
        this.$buefy.toast.open({
          type: "is-success",
          message: "Password reset successful."
        });
      }
      this.$emit("closed");
    }
  }
};
</script>