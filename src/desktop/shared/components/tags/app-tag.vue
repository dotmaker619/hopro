<template>
  <div>
    <div v-if="apps.length" class="app-tag mt-5">
      <img
        v-tooltip="{content: `${app.name}`}"
        v-for="(app, i) in apps.slice(0, howManyToShow)"
        :key="i"
        class="sh-app-tag"
        :src="require(`@/assets/icons/app-tag/${app.name}-circle.svg`)"
      />
      <div
        v-if="apps.length > howManyToShow"
        class="sh-more-tag"
        v-tooltip="{content: `${apps.slice(howManyToShow, apps.length).map(t => ' ' + t.name )}`}"
      >+{{apps.length - howManyToShow}}</div>
    </div>
    <not-assigned v-else :type="'application'" class="mt-10" />
  </div>
</template>

<script>
import NotAssigned from "@/desktop/shared/components/not-assigned";

export default {
  components: {
    NotAssigned
  },

  props: ["apps", "howManyToShow"]
};
</script>

<style lang="scss" scoped>
.app-tag {
  display: flex;
}
</style>