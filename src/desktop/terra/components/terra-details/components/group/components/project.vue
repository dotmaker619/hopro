<template>
  <div class="list-card__body has-slimscroll-xs">
    <div class="list-card__body--item is-bottom-border" v-for="project in sort(group.projects)" :key="project.uid">
      <div
        @click="$emit('select-active-project',project); $eventHub.$emit('terra_active_project', project)"
        class="list-card__body--item-text is-pointer is-medium-15-500-18"
        :class="{'terra-active-project':active_project.uid===project.uid}"
      >{{project.name}}</div>
      <div
        @click="download_report(project.reports && project.reports.report && project.reports.report.url)"
        class="list-card__body--item-action is-pointer"
        @mouseenter="hover = project.uid"
        @mouseleave="hover = -1"
      >
        <sh-icon v-if="hover == project.uid && project.reports && project.reports.report && project.reports.report.url" :name="'download-fill'" :file="'helper_sprite'" class="is-32x32"></sh-icon>
        <sh-icon v-else :name="'download2'" :file="'helper_sprite'" class="is-32x32 is-not-allowed"></sh-icon>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["group", "active_project"],
  data() {
    return {
      hover: -1
    };
  },
  methods: {
    download_report(url) {
      window.open(url, "_blank");
    },
    sort(data) {
      if (!data) return [];
      return _.sortBy(data, [p => p.name.toLowerCase()]);
    }
  }
};
</script>

<style lang="scss">
.terra-active-project {
  color: $primary;
  font-weight: 600 !important;
}
</style>