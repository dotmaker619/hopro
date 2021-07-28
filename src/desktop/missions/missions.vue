<template>
  <div class="missions">
    <div v-if="$route.name === 'mission-list'" class="top-section">
      <h2 class="heading-1">Missions</h2>
      <div class="sh-metrics columns is-mobile" v-if="metrics">
        <metric-card
          class="column"
          v-for="(val,key,i) in metrics"
          :key="i"
          :title="key"
          :count="val"
        ></metric-card>
      </div>
    </div>
    <!-- <keep-alive> -->
    <router-view class="mission-management-main" />
    <!-- </keep-alive> -->
  </div>
</template>

<script>
import MetricCard from "@/desktop/core/shared/components/metrics/components/metric-card";
import { missionService } from "@/desktop/shared/services/";

export default {
  components: {
    MetricCard
  },
  data() {
    return {
      metrics: null
    };
  },
  async created() {
    let result = await missionService
      .get_metrics({})
      .catch(err => this.handleErrors(err));
    this.metrics = result;
    delete this.metrics.totalMissions;
  }
};
</script>

<style lang="scss">
.missions {
  background-color: #fff;
}
.mission-management-main {
  padding: 2rem;
  background-color: #f4f7fc;
}
</style>