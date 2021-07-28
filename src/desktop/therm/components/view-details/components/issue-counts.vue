<template>
  <div>
    <div class="header mb-10">
      <h2 class="is-semiBold-18-600-22">Defects counts</h2>
      <ProjectDropdown :details="details" @change="getData" />
    </div>
    <div class="box">
      <table class="table is-fullwidth issue-table">
        <thead>
          <tr>
            <th>Defects Type</th>
            <th>Counts</th>
          </tr>
        </thead>
        <tbody class="pt-3">
          <tr v-for="issue_type of issue_types" :key="issue_type.class_id">
            <td>
              <i class="fas fa-circle mr-10"  :style="{'color':issue_type.color}"></i>
              <span class="is-regular-16-00-40 has-text-theme-black">{{issue_type.description}}</span>
            </td>
            <td class="is-medium-16-500-50 has-text-theme-black">{{issues[issue_type.class_name] || 0}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ProjectDropdown from "./project-dropdown";
import { viewService } from "@/desktop/shared/services/";

export default {
  props: ["details"],
  data() {
    return {
      issue_types: [],
      issues: {}
    };
  },
  components: {
    ProjectDropdown
  },
  async created() {
    await this.getData();
    this.issue_types = await viewService.get_view_issue_types({
      id: this.$route.params.id
    });
  },
  methods: {
    async getData(project = "all") {
      if (project == "all") {
        this.issues = this.details.metrics.issues;
      } else {
        this.issues = await viewService.get_view_project_issue_count({
          id: this.$route.params.id,
          project_id: project
        });
      }
    }
  }
};
</script>
<style>
.issue-table thead tr {
  margin: 10px;;
}
</style>