<template>
  <prompt-modal
    :name="'suspend-user'"
    :heading="'Suspend'"
    :iconPath="require('@/assets/icons/prompt/suspend.svg')"
    :footer="true"
    :cancelString="'Cancel'"
    :confirmString="'Suspend'"
    @cancel="$emit('closed')"
    @confirm="suspend_user"
    @closed="$emit('closed')"
  >
    <div class="prompt-modal__content__text" slot="content">
      You are about to suspend the user.
      Proceed with caution. Are you sure?
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
    suspend_user() {
      let result = userService
        .put({
          id: this.$route.params.id,
          attribute: "lifecycle/suspend"
        })
        .catch(err => this.handleErrors(err));

      if (result) {
        this.$buefy.toast.open({
          type: "is-success",
          message: "User suspended."
        });
        this.$eventHub.$emit("refresh-details");
        this.$eventHub.$emit("refresh-user-list");
      }
      this.$emit("closed");
    }
  }
};
</script>