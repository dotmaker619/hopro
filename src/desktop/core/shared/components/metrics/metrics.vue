<template>
  <div class="sh-metrics">
    <div v-if="metrics && Object.keys(metrics).length" class="columns is-mobile">
      <metric-card class="column is-narrow" v-for="(val, key, i) in metrics" :key="i" :title="key" :count="val"></metric-card>
    </div>
    <div v-else class="is-flex">
      <div v-for="i in 3" :key="i">
        <metrics-skeleton class="column is-narrow"></metrics-skeleton>
      </div>
    </div>
  </div>
</template>
<script>
  import { metricsService, processingService } from "@/desktop/shared/services/";
  import MetricCard from "./components/metric-card";
  import { mapState } from "vuex";
  import MetricsSkeleton from "@/desktop/shared/components/skeleton/metrics-skeleton.vue";

  export default {
    props: ["page"],
    components: { MetricCard, MetricsSkeleton },
    data() {
      return {
        metrics: null,
      };
    },
    created() {
      this.get_metrics();
      // this.$eventHub.$on("organization_changed",);
    },
    computed: {
      ...mapState(["current_organization"]),
    },
    watch: {
      // current_organization: function(val) {
      // if (val.uid) this.get_metrics();
      // }
    },
    methods: {
      async get_metrics() {
        if (this.$route.name == "process-list") {
          let results = await processingService.get_metrics().catch((err) => this.handleErrors(err));
          this.metrics = _.pick(results, [
            "failed",
            "rejected",
            // "in_progress",
            "finished",
          ]);
        } else {
          let results;
          if (this.$store.getters.is_owner || this.$store.getters.is_manager || this.$store.getters.is_internal_user) {
            results = await metricsService
              .get_metrics({
                user_id: this.$store.state.claims.user_id,
              })
              .catch(this.handleErrors);
          } else {
            results = await metricsService
              .get_user_metrics({
                user_id: this.$store.state.claims.user_id,
              })
              .catch(this.handleErrors);
          }

          if (this.page === "users")
            this.metrics = {
              users: results.users + results.guest_users,
              teams: results.teams,
              labels: results.labels,
            };
          else this.metrics = _.pick(results, ["assets", "containers", "groups"]);
        }
      },
    },
  };
</script>
<style lang="scss" scoped>
  .sh-skeleton {
    align-items: baseline;
    height: 10rem;
  }
</style>
