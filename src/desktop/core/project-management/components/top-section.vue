<template>
  <div class="top-section">
    <h2 class="heading-1 is-medium-14-500-17">Project management</h2>
    <Metrics />
    <div class="sh-tabs">
      <ul>
        <li>
          <router-link
            active-class="is-active"
            class="is-medium-18-500-22 has-text-theme-black"
            :to="{name:'asset-list'}"
          >Assets</router-link>
        </li>
        <li>
          <router-link
            active-class="is-active"
            class="is-medium-18-500-22 has-text-theme-black"
            :to="{name:'container-list'}"
          >Containers</router-link>
        </li>
        <li>
          <router-link
            active-class="is-active"
            class="is-medium-18-500-22 has-text-theme-black"
            :to="{name:'group-list'}"
          >Groups</router-link>
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