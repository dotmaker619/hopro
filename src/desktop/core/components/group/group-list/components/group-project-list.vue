<template>
  <div class="project-list" :class="`${$route.name == 'user-details-groups' ? '' : 'project-list-margin'}`">
    <div class="project-list__actions level" style="height: 4.4rem">
      <div class="is-1 level-left">
        <input
          type="checkbox"
          name="project"
          class="sh-custom-checkbox is-thinner fill"
          v-model="all_projects"
          id="select"
          @input="all_projects ? (selected = []) : (selected = data.map((item) => item.uid))"
        />
        <label for="select" class="is-medium-16-500-19 ml-10 no-whitespace-wrap">Select All</label>
      </div>
      <project-actions
        class="level-right"
        @update_selection="select_all"
        v-if="selected.length > 1"
        :selected="selected"
        :data="data"
        @delete_selected="delete_selected"
        @append_duplicated_projects="add_duplicated_projects"
        :group_id="group_id"
      ></project-actions>
    </div>
    <div class="project-divider is-thicker"></div>
    <div v-if="data && data.length">
      <div class="no-box-shadow no-padding-bottom mb-20 mt-20">
        <div>
          <div class="columns is-flex is-vcenter">
            <div class="column is-4">
              <h4 class="pl-40 is-marginless is-medium-16-500-19">Project Name</h4>
            </div>
            <div class="column" :class="[$route.name == 'group-list' ? 'is-3' : 'is-4']">
              <h4 class="is-marginless is-medium-16-500-19">Date</h4>
            </div>
            <!-- <div class="column is-2 is-flex is-center">
              <h4 class="is-marginless is-medium-16-500-19">Images</h4>
            </div> -->

            <div class="column is-3"  v-if="$route.name == 'group-list'">
              <h4 class="is-marginless is-medium-16-500-19">Mission</h4>
            </div>
            <div class="column is-2">
              <h4 class="is-marginless is-medium-16-500-19">Processing</h4>
            </div>
          </div>
        </div>
        <div v-for="(item, i) in data" :key="item.uid" class="project-list__item">
          <div @mouseenter="hover = item.uid" @mouseleave="hover = -1">
            <project-list-item
              class="py-15"
              v-if="item"
              :item="item"
              :hover="hover"
              @edit="open_form(ProjectFormComponent, { header: 'Edit Project for', subheader: item.group.name, group_id: group_id }, item)"
              :selected="selected"
              @add_to_selection="update_selection"
            ></project-list-item>

            <div class="project-divider is-marginless" v-if="i != data.length - 1"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="isLoading">
        <list-skeleton
          :options="{
            row_count: 5,
            col_count: 4,
            text: 4,
          }"
        ></list-skeleton>
      </div>

      <no-results v-else>
        <img slot="image" src="@/assets/illustrations/groups-illustration.svg" alt />
        <div slot="button" v-if="!show_deleted">
          <a @click="open_form(ProjectFormComponent, { header: 'Create Project for', group_id: group_id })">
            <div class="sh-button sh-button--create">Create New Project</div>
          </a>
        </div>
      </no-results>
    </div>
  </div>
</template>

<script>
  import { projectService } from "@/desktop/shared/services/";
  import ProjectListItem from "@/desktop/core/components/project/project-list/components/project-list-item";
  import ProjectActions from "@/desktop/core/components/project/project-list/components/project-actions";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import ProjectFormComponent from "@/desktop/core/components/project/project-list/components/project-form.component";
  import ListSkeleton from "@/desktop/shared/components/skeleton/list-skeleton.vue";
  export default {
    props: ["group_id"],
    mixins: [FormPopup],
    components: {
      ProjectListItem,
      ProjectActions,
      ListSkeleton,
    },
    data() {
      return {
        data: null,
        selected: [],
        all_projects: false,
        isLoading: false,
        hover: -1,
        ProjectFormComponent: ProjectFormComponent,
      };
    },
    created() {
      this.getData();
      this.$eventHub.$on("refresh-project-list", this.getData);
    },
    beforeDestroy() {
      this.$eventHub.$off("refresh-project-list", this.getData);
    },

    methods: {
      async getData() {
        this.isLoading = true;
        let { results } = await projectService
          .getAll({
            group_id: this.group_id,
          })
          .catch((err) => {
            this.handleErrors(err);
          });
        this.data = results;
        this.isLoading = false;
      },
      delete_selected() {
        this.selected.forEach(async (project) => {
          await projectService.delete({ group_id: this.group_id, id: project }).catch((err) => this.handleErrors(err));

          this.data = _.remove(this.data, function(currentObject) {
            return currentObject.uid != project;
          });

          this.$emit("update_project_count", this.data.length);
        });
        this.$buefy.toast.open({
          type: "is-danger",
          message: "Deleted successfully!",
        });
      },

      update_selection(item) {
        this.selected.includes(item) ? _.pull(this.selected, item) : this.selected.push(item);

        this.selected.length == this.data.length ? (this.all_projects = true) : (this.all_projects = false);

        this.selected = Object.assign([], this.selected);
      },
    },
    watch: {
      group_id: function() {
        this.getData();
      },
    },
  };
</script>
<style lang="scss">
  .project-list-margin {
    margin: 1rem 4rem;
  }

  .multiple-actions {
    justify-content: space-between;
    display: flex;
    align-items: center;
  }

  .no-box-shadow {
    box-shadow: none !important;
  }
  .sh-list__item--icon--inner {
    visibility: hidden;
  }

  .project-list__item:hover {
    .sh-list__item--icon--inner {
      visibility: visible;
    }
  }

  .project-divider {
    position: relative;
    margin: 0 0 0 3rem;
    background: #aaa;
    opacity: 0.2;
    width: 100%;
    height: 1px;
    &.is-thicker {
      background: #171e48;
      margin: 0;
      width: 100%;
      height: 2px;
      width: 100%;
    }
  }

  .project-list__actions--buttons {
    border-radius: 6px;

    width: 15.3rem;
    height: 4.4rem;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    border: solid 1px $primary;
    box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.3) !important;

    p {
      height: 3rem;
      width: 3rem;
      align-items: center;
      display: flex;
      justify-content: center;
      &:hover {
        cursor: pointer;
        background: $primary-background;
      }
    }
  }
</style>
