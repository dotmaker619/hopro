<template>
  <div class="top-section">
    <h2 class="heading-1">Admin</h2>
    <Metrics />
    <div class="sh-tabs">
      <ul>
        <li>
          <router-link active-class="is-active" :to="{name:'organization-list'}">Organization</router-link>
        </li>
        <li>
          <router-link active-class="is-active" :to="{name:'entity-list'}">Entity</router-link>
        </li>
        <li>
          <router-link active-class="is-active" :to="{name:'admin-user-list'}">Users</router-link>
        </li>
        <li>
          <router-link active-class="is-active" :to="{name:'job-list'}">Jobs</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import Metrics from "./shared/components/metrics/metrics";

export default {
  components: {
    Metrics
  }
};
</script>