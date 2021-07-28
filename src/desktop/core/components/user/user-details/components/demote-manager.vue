<template>
  <prompt-modal
    :name="'demote-manager'"
    :heading="'Demote to Manger'"
    :iconPath="require('@/assets/icons/prompt/demote-manager.svg')"
    :footer="true"
    :cancelString="'Cancel'"
    :confirmString="'Demote'"
    @cancel="$emit('closed')"
    @confirm="demote_manager"
    @closed="$emit('closed')"
  >
    <div v-if="user" class="prompt-modal__content__text" slot="content">
      You are about to demote
      {{user.first_name}} {{user.last_name}} from manager.
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
  props: ["user"],
  methods: {
    async demote_manager() {
      let result = await userService
        .patch({
          id: this.user.uid,
          body: { is_manager: false }
        })
        .catch(err => this.handleErrors(err));

      if (result) {
        this.$buefy.toast.open({
          type: "is-success",
          message: "User demoted successfully"
        });
        this.$eventHub.$emit("refresh-details");
        this.$eventHub.$emit("refresh-user-list");
      }
      this.$emit("closed");
    }
  }
};
</script>