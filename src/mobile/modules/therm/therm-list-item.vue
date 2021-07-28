<template>
  <router-link @click.native="append_recently_accessed_resource('therm', item.uid)" :to="{ name: 'therm-viewer', params: { id: item.uid } }">
    <div class="m-therm-list">
      <div class="is-medium-16-500-19 has-primary-text">{{ item.name }}</div>
      <div class="is-flex mt-5 is-between">
        <div class="is-flex is-regular-12-00-14 has-text-new-grey">
          <div class="metrics-affected">{{ ((item.metrics.modules.affected * (item.moduleWattPeak || 300)) / 1000).toFixed(1) }}KW</div>
          <div class="metrics-separator">|</div>
          <div class="metrics-capacity">{{ (item.metrics.modules.total * ((item.moduleWattPeak || 300) / 1000000)).toFixed(1) }}MW</div>
          <div class="metrics-separator">|</div>
          <div class="metrics">#{{ (item.metrics.issues && total_issues(item.metrics.issues)) || "0" }}</div>
        </div>
        <div class="is-flex align-center">
          <user-avatar :user="item.users.owner" :pxsize="20" :avatarfontsize="12" class="mr-5" :custom_class="'tiny-user-avatar'"></user-avatar>
          <p class="is-medium-13-500-16 has-text-blue-grey truncate-text is-width-10" v-username="item.users.owner"></p>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
  export default {
    props: ["item"],
    methods: {
      total_issues(issues) {
        return _.sum(Object.values({ ...issues, table: 0 }));
      },
    },
  };
</script>

<style lang="scss" scoped>
  .m-therm-list {
    background-color: $white;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid $blue-tint-border;
    .metrics {
      //   min-width: 5rem;
      &-affected {
        color: $therm-affected !important;
      }
      &-capacity {
        color: $therm-capacity !important;
      }
      &-separator {
        margin: 0 0.5rem;
        color: rgba(115, 119, 144, 0.2);
      }
    }
  }
</style>
