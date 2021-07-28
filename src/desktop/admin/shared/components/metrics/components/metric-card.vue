<template>
  <div>
    <div class="sh-metric-card">
      <sh-icon :name="`${title}`" :file="'admin_sprite'" class="is-40x40 mr-20"></sh-icon>
      
      <div>
        <div class="sh-metric-card__title is-capitalized">{{title}}</div>
        <div class="sh-metric-card__count">{{ total }}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["icon", "title", "count"],
  computed: {
    total() {
      return this.count < 10 ? "0" + this.count : this.count;
    },

    // src() {
    //   return require(`@/assets/icons/admin/${this.title}.svg`);
    // }
  }
};
</script>