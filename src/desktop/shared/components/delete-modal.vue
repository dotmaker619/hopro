<template>
  <prompt-modal
    :name="'delete-modal'"
    :heading="resourceName"
    :iconPath="require('@/assets/icons/prompt/delete.svg')"
    :footer="true"
    :cancelString="'Cancel'"
    :confirmString="'Delete'"
    @cancel="$emit('closed')"
    @confirm="delete_resource"
    @closed="$emit('closed')"
  >
    <div class="prompt-modal__content__text" slot="content">
      Are you sure you want to delete the {{ resourceType.charAt(0).toUpperCase() + resourceType.slice(1) }}?
    </div>
  </prompt-modal>
</template>

<script>
  import PromptModal from "@/desktop/shared/components/prompt-modal";

  export default {
    components: {
      PromptModal,
    },
    props: ["resourceId", "groupId", "resourceName", "resourceType", "resourceService"],
    methods: {
      async delete_resource() {
        if (this.$route.name === "mission-list")
          await this.resourceService
            .patch({
              id: this.resourceId,
              body: { active: false },
            })
            .then(() => {
              this.$eventHub.$emit("refresh-mission-list");
              this.$modal.hide("delete-modal");
            })
            .catch((err) => this.handleErrors(err, true));
        //group_id for deleting project
        else
          await this.resourceService
            .delete({ group_id: this.groupId, id: this.resourceId })
            .then(() => {
              if (this.$route.name == "terra-list") {
                this.$parent.emit("deleted");
              } else {
                this.$emit("deleted");
              }
              this.$eventHub.$emit(`refresh-${this.resourceType}-list`);
              this.$modal.hide("delete-modal");
            })
            .catch((err) => this.handleErrors(err, true));
      },
    },
  };
</script>
