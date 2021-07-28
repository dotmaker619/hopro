<template>
  <div class="project-list">
    <div class="list-top-section">
      <div class="list-top-section--search is-flex align-center">
        <searchbar @search="pageChangeHandle(1, $event)"></searchbar>
        <div class="ml-15">
          <project-actions
            @update_selection="select_all"
            @delete_selected="delete_selected"
            v-if="selected.length > 1"
            :selected="selected"
            :data="data"
            :group_id="$route.params.id"
          ></project-actions>
        </div>
      </div>
      <div class="list-top-section--create sh-buttons-group">
        <a
          @click="
            show_deleted = !show_deleted;
            getData();
          "
          v-if="$store.getters.is_internal_user"
        >
          <button class="sh-button--delete">
            <span class="icon">
              <span v-if="show_deleted">All</span>
              <sh-icon v-else :name="'trash'" class="is-18x18" />
            </span>
          </button>
        </a>
        <a
          v-if="access('core', 'create_projects')"
          @click="open_form(ProjectFormComponent, { header: 'Create Project for', group_id: $route.params.id })"
        >
          <button class="sh-button sh-button--create sh-button--inverted" :class="{ 'is-disabled': show_deleted }">New Project</button>
        </a>
        <a v-else @click="no_access_popup('core', 'create_projects')">
          <button class="sh-button sh-button--create disabled-link sh-button--inverted">New Project</button>
        </a>
      </div>
    </div>
    <div class="groups-header columns is-regular-14-00-17 bb-1 is-marginless">
      <div class="column is-4 is-flex align-center">
        <div class="b-checkbox is-flex mr-15">
          <input
            class="sh-custom-checkbox is-thinner fill"
            type="checkbox"
            id="selection"
            v-model="all_projects"
            @input="all_projects ? (selected = []) : (selected = data.map((item) => item.uid))"
          />
        </div>
        Projects
      </div>
      <div class="column" :class="[$route.name == 'group-list' ? 'is-3' : 'is-4']">Date</div>

      <div class="column is-2">Processing</div>
    </div>
    <div v-if="data && data.length" class="bg-white">
      <div v-for="item in data" :key="item.uid" class="px-20 py-20 bb-1" @mouseenter="hover = item.uid" @mouseleave="hover = -1">
        <project-list-item
          :show_title="true"
          v-if="item"
          :item="item"
          @edit="open_form(ProjectFormComponent, { header: 'Edit Project for', subheader: item.group.name, group_id: $route.params.id }, $event)"
          :hover="hover"
          :selected="selected"
          @add_to_selection="update_selection"
          :asset_id="asset_id"
        ></project-list-item>
      </div>
    </div>
    <div v-else>
      <div v-if="isLoading">
        <list-skeleton :options="{ row_count: 5, col_count: 4, text: 4 }"></list-skeleton>
      </div>
      <no-results v-else>
        <img slot="image" src="@/assets/illustrations/events-illustration.svg" alt />
        <div slot="button" v-if="!show_deleted">
          <a @click="open_form(ProjectFormComponent, { header: 'Create Project for', group_id: $route.params.id })">
            <div class="sh-button sh-button--create">Create New Project</div>
          </a>
        </div>
      </no-results>
    </div>
    <div class="columns">
      <div class="column">
        <pagination
          :default_page_size="default_page_size"
          :current-page="currentPage"
          :page-count="pageCount"
          class="articles-list__pagination"
          @nextPage="pageChangeHandle('next')"
          @previousPage="pageChangeHandle('previous')"
          @loadPage="pageChangeHandle"
          :visiblePagesCount="visiblePagesCount"
          :totalRecords="totalRecords"
        ></pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import { projectService, processingService } from "@/desktop/shared/services/";
  import searchbar from "@/desktop/core/shared/components/searchbar";
  import filterButton from "@/desktop/core/shared/components/filter-button";
  import ProjectListItem from "@/desktop/core/components/project/project-list/components/project-list-item";
  import ProjectActions from "@/desktop/core/components/project/project-list/components/project-actions";
  import ProjectFormComponent from "@/desktop/core/components/project/project-list/components/project-form.component";
  const queryString = require("query-string");
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
  import Pagination from "@/desktop/shared/components/pagination.vue";
  // import ListHeader from "@/desktop/core/components/project/project-list/components/project-list-header.vue";
  import ListSkeleton from "@/desktop/shared/components/skeleton/list-skeleton.vue";
  export default {
    props: ["asset_id"],
    mixins: [FormPopup, PaginationMixin],
    components: {
      searchbar,
      filterButton,
      ProjectListItem,
      ProjectActions,
      Pagination,
      // ListHeader,
      ListSkeleton,
    },
    data() {
      return {
        data: [],
        selected: [],
        all_projects: false,
        isLoading: false,
        hover: -1,
        show_deleted: false,
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
        let query = {
          ...this.get_default_query_params(),
        };
        this.show_deleted ? (query.active = false) : (query.active = true);
        let { results, count } = await projectService
          .getAll({
            group_id: this.$route.params.id,
            query: queryString.stringify(query),
          })
          .catch((err) => {
            this.handleErrors(err);
          });
        this.data = results;

        this.updatePagination(count);
        this.isLoading = false;
      },

      update_selection(item) {
        this.selected.includes(item) ? _.pull(this.selected, item) : this.selected.push(item);

        this.selected.length == this.data.length ? (this.all_projects = true) : (this.all_projects = false);

        this.selected = Object.assign([], this.selected);
      },
      delete_selected() {
        this.selected.forEach(async (project) => {
          await projectService.delete({ group_id: this.$route.params.id, id: project }).catch((err) => this.handleErrors(err));

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
    },
  };
</script>
<style lang="scss">
  // .project-list {
  //   margin-top: 1rem;
  //   margin-right: 1rem;
  // }

  .multiple-actions {
    justify-content: space-between;
    display: flex;
    align-items: center;
  }

  .sh-list:hover {
    .project-details--name {
      color: $primary;
    }
  }

  .is-36x36 {
    height: 36px;
    width: 36px;
  }
</style>
<style lang="scss" scoped>
  .list-top-section {
    padding: 0;
  }
  .groups-header {
    margin-bottom: 0.1rem;
    padding: 1.5rem 1.2rem;
    background-color: $white;
    color: $list-header-text;
  }
  .bg-white {
    background-color: $white;
    box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);
    border-radius: 0 0 1rem 1rem;
  }
</style>
