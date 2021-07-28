<template>
  <div>
    <!-- <div class="header mb-10 is-hidden">
      <h2 class="header-title sh-medium-header">Metrics</h2>
    </div> -->
    <div class="box mt-45">
      <div>
        <div class="is-capitalized is-medium-14-500-17 has-text-theme-black">Affected KW</div>
        <div
          class="sh-text-semibold-24 mt-10 affected-value"
        >{{(details.metrics.modules.affected*(details.moduleWattPeak || 300)/1000 ).toFixed(1)}}KW</div>
      </div>
    </div>
    <div class="box">
      <div>
        <div class="is-capitalized is-medium-14-500-17 has-text-theme-black">Total DC capacity (MW)</div>
        <div
          class="sh-text-semibold-24 total-dc-value mt-10"
        >{{(details.metrics.modules.total*((details.moduleWattPeak || 300)/1000000)).toFixed(1)}}MW</div>
      </div>
    </div>
    <div class="box">
      <div>
        <div class="is-capitalized is-medium-14-500-17 has-text-theme-black "># Defects</div>
        <div
          class="sh-text-semibold-24 mt-10 has-text-theme-black"
        >{{details.metrics.issues && total_issues(details.metrics.issues) || "0"}}</div>
      </div>
    </div>
  </div>
</template>
<script>

import ProjectDropdown from "./project-dropdown";
export default {
  props: ["details"],
  components: {
    ProjectDropdown
  },
  methods: {
    total_issues(issues) {
      return _.sum(Object.values({ ...issues, table: 0 }));
    }
  }
};
</script>
<style>
.affected-value{
  color: #fe3267;
}
.total-dc-value {
  color: #08aa4f;
}
</style>