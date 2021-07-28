<template>
  <div class="top-section">
    <h2 class="heading-1">User management</h2>
    <Metrics :page="'users'" />
    <div class="sh-tabs">
      <ul>
        <li>
          <router-link active-class="is-active" :to="{name:'user-list'}">users</router-link>
        </li>
        <li>
          <router-link active-class="is-active" :to="{name:'role-list'}">roles</router-link>
        </li>
        <li>
          <router-link active-class="is-active" :to="{name:'team-list'}">teams</router-link>
        </li>
        <li>
          <router-link v-if="access('core','manage_guest_organizations')" active-class="is-active" :to="{name:'guest-organization'}">Guest</router-link>
          <a v-else @click="no_access_popup('core', 'manage_guest_organizations')" active-class="is-active" :to="{name:'guest-organization'}">Guest</a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import Metrics from "../../shared/components/metrics/metrics";

export default {
  components: {
    Metrics
  }
};
</script>
<style lang="scss" scoped>
.top-section {
  background-color: $primary-background;
}
</style>