<template>
  <div class="sh-metrics">
    <div v-if="metrics" class="columns is-mobile">
      <metric-card
        class="column is-narrow"
        v-for="(val,key,i) in metrics"
        :key="i"
        :title="key"
        :count="val"
      ></metric-card>
    </div>
    <div class="is-flex align-center" v-else>
      <div v-for="i in 3" :key="i">
        <metrics-skeleton class="column is-narrow"></metrics-skeleton>
      </div>
    </div>
  </div>
</template>
<script>
import { metricsService } from "@/desktop/shared/services/";
import MetricCard from "./components/metric-card";
import MetricsSkeleton from "@/desktop/shared/components/skeleton/metrics-skeleton.vue";
import { mapState } from "vuex";

export default {
  components: { MetricCard, MetricsSkeleton },
  data() {
    return {
      metrics: null,
    };
  },
  created() {
    this.get_metrics();
    this.$eventHub.$on("refresh-user-list", this.get_metrics);
  },
  beforeDestroy() {
    this.$eventHub.$off("refresh-user-list", this.get_metrics);
  },
  computed: {
    ...mapState(["current_organization"]),
  },
  methods: {
    async get_metrics() {
      let results = await metricsService
        .get_metrics_all()
        .catch(this.handleErrors);

      this.metrics = _.pick(results, [
        "organizations",
        "entities",
        "users",
        "jobs",
      ]);
    },
  },
};
</script>
<style lang="scss" scoped>
</style>

