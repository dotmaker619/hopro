<template>
  <prompt-modal
    :name="'expire-password'"
    :heading="'Expire Password'"
    :iconPath="require('@/assets/icons/prompt/expire-password.svg')"
    :footer="true"
    :cancelString="'Cancel'"
    :confirmString="'Expire'"
    @cancel="$emit('closed')"
    @confirm="expire_password"
    @closed="$emit('closed')"
  >
    <div class="prompt-modal__content__text" slot="content">
      This will expire the user password.
      Upon next login, the user will reset the password.
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
    async expire_password() {
      let result = await userService
        .put({
          id: this.$route.params.id,
          attribute: "credentials/expire_password",
          body: { tempPassword: false }
        })
        .catch(err => this.handleErrors(err));
      if (result) {
        this.$buefy.toast.open({
          type: "is-success",
          message: "Password successfully expired."
        });
      }
      this.$emit("closed");
    }
  }
};
</script>