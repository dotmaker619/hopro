<template>
  <div class="level-right">
    <div class="card is-flex project-list__actions--buttons">
      <p @click="move_multiple_project = true">
        <sh-icon :name="'move-folder'" class="is-18x18" />
      </p>
      <p @click="duplicate_multiple_projects = true">
        <sh-icon :name="'copy'" class="is-18x18" />
      </p>
      <p @click="delete_multple_projects = true">
        <sh-icon :name="'trash'" class="is-18x18" />
      </p>
      <p>
        <sh-icon :name="'properties'" class="is-18x18" />
      </p>
    </div>

    <prompt-modal
      v-if="delete_multple_projects"
      :name="'multi-projectlist-delete-modal'"
      :heading="'Delete Selected Projects'"
      :iconPath="require('@/assets/icons/prompt/delete.svg')"
      :footer="true"
      :cancelString="'Cancel'"
      :confirmString="'Delete'"
      @cancel="delete_multple = false;$emit('closed')"
      @confirm="$emit('delete_selected');delete_multple_projects = false;"
      @closed="$emit('closed')"
    >
      <div class="prompt-modal__content__text" slot="content">
        Are you sure you want to delete
        selected projects?
      </div>
    </prompt-modal>
    <move-project
      v-if=" move_multiple_project == true"
      :multiple_projects="selected"
      :group="group_id"
      @close="move_multiple_project = false"
    ></move-project>

    <duplicate-project
      v-if=" duplicate_multiple_projects == true"
      :multiple_projects="data.filter(item => selected.includes(item.uid) ? item : null)"
      :group="group_id"
      @close="duplicate_multiple_projects =false"
    ></duplicate-project>
  </div>
</template>

<script>
import PromptModal from "@/desktop/shared/components/prompt-modal";
import DuplicateProject from "@/desktop/core/components/project/project-list/components/duplicate-project";
import MoveProject from "@/desktop/core/components/project/project-list/components/move-project";
import ProjectActions from "@/desktop/core/components/project/project-list/components/project-actions";

export default {
  props: ["selected", "data", "group_id"],
  data() {
    return {
      showDeleteModal: false,
      showPropertiesModal: false,
      delete_multple_projects: false,
      move_multiple_project: false,
      duplicate_multiple_projects: false
    };
  },
  components: {
    PromptModal,
    DuplicateProject,
    MoveProject,
    ProjectActions
  }
};
</script>

<style>
</style>