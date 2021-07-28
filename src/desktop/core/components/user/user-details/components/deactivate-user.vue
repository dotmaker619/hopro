<template>
  <prompt-modal
    :name="'deactivate-user'"
    :heading="'Deactivate'"
    :iconPath="require('@/assets/icons/prompt/deactivate.svg')"
    :footer="true"
    :cancelString="'Cancel'"
    :confirmString="'Deactivate'"
    @cancel="$emit('closed')"
    @confirm="deactivate_user"
    @closed="$emit('closed')"
  >
    <div class="prompt-modal__content__text" slot="content">
      You are about to deactivate the user.
      Proceed with caution. Are you sure?
    </div>
  </prompt-modal>
</template>

<script>
import PromptModal from "@/desktop/shared/components/prompt-modal";
import { userService } from "@/desktop/shared/services/";

export default {
  props: ["is_guest"],
  components: {
    PromptModal
  },
  methods: {
    deactivate_user() {
      let result;
      if (this.is_guest) {
        result = userService
          .toggle_guest_user_activation({
            id: this.$route.params.id,
            organization_id: this.$store.state.current_organization.uid,
            body: { active: false }
          })
          .catch(err => this.handleErrors(err));
      } else {
        result = userService
          .put({
            id: this.$route.params.id,
            attribute: "lifecycle/deactivate",
            body: { sendEmail: false }
          })
          .catch(err => this.handleErrors(err));
      }
      if (result) {
        this.$buefy.toast.open({
          type: "is-success",
          message: "User deactivated."
        });
        this.$eventHub.$emit("refresh-details");
        this.$eventHub.$emit("refresh-user-list");
      }
      this.$emit("closed");
    }
  }
};
</script>