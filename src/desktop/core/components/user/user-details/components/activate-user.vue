<template>
  <prompt-modal
    :name="'activate-user'"
    :heading="'Activate'"
    :iconPath="require('@/assets/icons/prompt/activate.svg')"
    :footer="true"
    :cancelString="'Cancel'"
    :confirmString="'Activate'"
    @cancel="$emit('closed')"
    @confirm="activate_user"
    @closed="$emit('closed')"
  >
    <div class="prompt-modal__content__text" slot="content">
      You are about to activate the user.
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
  props: ["user", "is_guest"],
  methods: {
    activate_user() {
      if (this.is_guest) {
        let result = userService
          .toggle_guest_user_activation({
            id: this.$route.params.id,
            organization_id: this.$store.state.current_organization.uid,
            body: { active: true }
          })
          .catch(err => this.handleErrors(err));
        if (result) {
          this.$buefy.toast.open({
            type: "is-success",
            message: "User activated."
          });
          this.$eventHub.$emit("refresh-details");
          this.$eventHub.$emit("refresh-user-list");
        }
        this.$emit("closed");
      } else {
        let requestObj;
        if (this.user.status === "suspended")
          requestObj = {
            id: this.user.uid,
            attribute: "lifecycle/unsuspend"
          };
        else
          requestObj = {
            id: this.user.uid,
            attribute: "lifecycle/activate",
            query: "sendEmail=true"
          };
        let result = userService
          .put(requestObj)
          .catch(err => this.handleErrors(err));
        if (result) {
          this.$buefy.toast.open({
            type: "is-success",
            message: "User activated."
          });
          this.$eventHub.$emit("refresh-details");
          this.$eventHub.$emit("refresh-user-list");
        }
        this.$emit("closed");
      }
    }
  }
};
</script>