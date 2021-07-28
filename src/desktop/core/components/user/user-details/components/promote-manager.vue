<template>
  <prompt-modal
    :name="'promote-manager'"
    :heading="'Promote to Manger'"
    :iconPath="require('@/assets/icons/prompt/promote-manager.svg')"
    :footer="true"
    :cancelString="'Cancel'"
    :confirmString="'Promote'"
    @cancel="$emit('closed')"
    @confirm="promote_to_manager"
    @closed="$emit('closed')"
  >
    <div v-if="user" class="prompt-modal__content__text" slot="content">
      You are about to promote
      {{user.first_name}} {{user.last_name}} to manager.
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
    async promote_to_manager() {
      let result = await userService
        .patch({
          id: this.$route.params.id,
          body: { is_manager: true }
        })
        .catch(err => this.handleErrors(err));

      if (result) {
        this.$buefy.toast.open({
          type: "is-success",
          message: "User promoted successfully"
        });
        this.$eventHub.$emit("refresh-details");
        this.$eventHub.$emit("refresh-user-list");
      }
      this.$emit("closed");
    }
  }
};
</script>