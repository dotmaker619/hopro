<template>
  <div>
    <div class="columns">
      <div class="column is-3">
        <details-skeleton></details-skeleton>
      </div>
      <div class="column is-9" style="margin-top:145px">
        <div class="columns">
          <div class="column is-9">
            <therm-graph-skeleton></therm-graph-skeleton>
          </div>
          <div class="column is-3">
            <therm-metrics-skeleton></therm-metrics-skeleton>
          </div>
        </div>
        <div class="columns mt-30">
          <div class="column is-6">
            <therm-list-skeleton></therm-list-skeleton>
          </div>
          <div class="column is-6 sh-skeleton">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import ThermMetricsSkeleton from "./therm/metrics.vue";
  import ThermGraphSkeleton from "./therm/graph.vue";
  import ThermListSkeleton from "./therm/list.vue";
  import DetailsSkeleton from "@/desktop/shared/components/skeleton/details-skeleton.vue";
  export default {
    components: {
      ThermMetricsSkeleton,
      ThermGraphSkeleton,
      ThermListSkeleton,
      DetailsSkeleton,
    },
  };
</script>
