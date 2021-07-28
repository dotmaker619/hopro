<template>
  <div class="column is-6">
    <div class="header mb-10 issue-status-header">
      <h2 class="is-semiBold-18-600-22">Defects Status</h2>
    </div>
    <div class="box card-height-500">
      <table class="table is-fullwidth">
        <thead>
          <tr>
            <th>Project</th>
            <th class="has-text-centered">Not valid</th>
            <th class="has-text-centered">Valid</th>
            <th class="has-text-centered">Fixed</th>
          </tr>
        </thead>
        <tbody v-if="isLoading">
          <tr v-for="skeleton in 10" :key="skeleton">
            <td><b-skeleton width="100%"></b-skeleton></td>
            <td><b-skeleton width="100%"></b-skeleton></td>
            <td><b-skeleton width="100%"></b-skeleton></td>
            <td><b-skeleton width="100%"></b-skeleton></td>
          </tr>
        </tbody>
        <tbody class="is-medium-16-500-50" v-else>
          <tr v-for="(project,i) of statuses" :key="i">
            <td>{{project.name}}</td>
            <td class="has-text-centered">{{ status_total('-1',project.status) }}</td>
            <td class="has-text-centered">{{ status_total('0',project.status) }}</td>
            <td class="has-text-centered">{{ status_total('1',project.status) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import { viewService } from "@/desktop/shared/services/";
export default {
  data() {
    return {
      statuses: [],
      isLoading: false,
    };
  },
  async created() {
    this.isLoading = true;
    this.statuses = await viewService.get_issue_status({
      id: this.$route.params.id
    });
    this.isLoading = false;
  },
  methods: {
    status_total(key, status) {
      let sum = 0;
      for (let issue of Object.values(status)) {
        sum += issue[key] || 0;
      }
      return sum;
    }
  }
};
</script>

<style>
.issue-status-header{
  height: 36px !important;
}
.card-height-500 {
  min-height: 503px;
  max-height: 503px;
  overflow-y: auto;
}
</style>