<template>
  <div>
    <div class="sh-metric-card">
      <sh-icon :name="category" class="sh-metric-card__icon image is-42x42"></sh-icon>
      
      <div>
        <div class="sh-metric-card__title is-capitalized">{{category}}</div>
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
    category() {
      return this.title == "labels"
        ? "teams"
        : this.title === "teams"
        ? "roles"
        : this.title == "inProgress"
        ? "in-progress"
        : this.title;
    }
  }
};
</script>