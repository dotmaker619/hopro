<template>
  <div class="is-flex is-vcenter ml-5">
    <img :src="require(`@/assets/icons/not-assigned/${type}.svg`)" class="mr-5 has-opacity-6" />
    <span class="is-regular-14-00-17 has-opacity-6 no-whitespace-wrap">{{typeText}}</span>
  </div>
</template>

<script>
export default {
  props: ["type"],
  computed: {
    typeText() {
      if (!this.type) return "*Not assigned";
      return `*No  ${this.type}s assigned`;
    }
  }
};
</script>

<style lang="scss" scoped>
span {
  color: #8a8ea3;
}
</style>