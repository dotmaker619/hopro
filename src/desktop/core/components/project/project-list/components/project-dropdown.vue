<template>
  <div v-click-outside="close_dropdown">
    <ul class="actions-dropdown-content is-project" v-if="active == item.uid">
      <li class="is-flex is-between actions-dropdown-content__list">
        <p class="actions-dropdown-content__list--item" @click="copy_project = item.uid">
          <sh-icon :name="'copy'" class="is-16x16 actions-dropdown-content__list--icon" />
        </p>
        <p @click="$emit('on-edit')" class="actions-dropdown-content__list--item">
          <sh-icon :name="'pen'" class="is-16x16 actions-dropdown-content__list--icon" />
        </p>

        <p
          class="actions-dropdown-content__list--item"
          @click="
            showDeleteModal = true;
            currentProject = item;
          "
        >
          <sh-icon :name="'trash'" class="is-16x16 actions-dropdown-content__list--icon" />
        </p>
      </li>
      <router-link
        tag="li"
        class="actions-dropdown-content__item"
        :to="{ name: 'project-details', params: { group_id: item.group.uid, id: item.uid } }"
      >
        <sh-icon :name="'watchers'" class="is-22x22 mr-10 actions-dropdown-content__item--icon" />

        <span class="actions-dropdown-content__item--text">View Details</span>
      </router-link>
      <li class="actions-dropdown-content__item" @click="move_project = item.uid">
        <sh-icon :name="'move-folder'" class="is-18x18 mr-10 actions-dropdown-content__item--icon" />

        <span class="actions-dropdown-content__item--text">Move</span>
      </li>
      <li
        class="actions-dropdown-content__item"
        @click="
          currentProject = item;
          showPropertiesModal = true;
        "
      >
        <sh-icon :name="'properties'" class="is-18x18 mr-10 actions-dropdown-content__item--icon" />
        <span class="actions-dropdown-content__item--text">Properties</span>
      </li>
    </ul>
    <duplicate-project
      v-if="copy_project == item.uid"
      :project="item"
      @close="
        copy_project = -1;
        $emit('hide-dropdown');
      "
    ></duplicate-project>
    <move-project
      @on-group-change="$emit('group-change', $event)"
      v-if="move_project == item.uid"
      :project="item.uid"
      :group="item.group.uid"
      @close="
        move_project = -1;
        $emit('hide-dropdown');
      "
    ></move-project>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="currentProject.uid"
      :groupId="item.group.uid"
      :resourceName="currentProject.name"
      :resourceType="'project'"
      :resourceService="projectService"
      @closed="showDeleteModal = false"
      @deleted="
        $emit('deleted');
        $emit('hide-dropdown');
      "
    />

    <project-properties
      :project="currentProject"
      v-if="showPropertiesModal"
      @closed="
        currentProject = null;
        showPropertiesModal = false;
        $emit('hide-dropdown');
      "
      @properties_updated="$eventHub.$emit('refresh-project-list')"
    />
  </div>
</template>

<script>
  import DuplicateProject from "@/desktop/core/components/project/project-list/components/duplicate-project";
  import MoveProject from "@/desktop/core/components/project/project-list/components/move-project";
  import ProjectProperties from "@/desktop/core/components/project/project-list/components/project-properties";
  import { projectService, processingService } from "@/desktop/shared/services/";

  export default {
    props: ["item", "active"],
    components: {
      DuplicateProject,
      MoveProject,
      ProjectProperties,
    },
    data() {
      return {
        showDeleteModal: false,
        showPropertiesModal: false,
        copy_project: -1,
        currentProject: null,
        move_project: -1,
        projectService: projectService,
      };
    },
    methods: {
      close_dropdown() {
        if (!this.showDeleteModal && !this.showPropertiesModal && this.move_project == -1 && this.copy_project == -1) {
          this.$emit("hide-dropdown");
        }
      },
    },
  };
</script>

<style></style>
