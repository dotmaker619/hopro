<template>
  <div>
    <div v-for="item in items || 15" :key="item" class="skeleton-card">
      <div class="my-10">
        <b-skeleton height='1.2rem' width="80%" :animated="animated"></b-skeleton>
      </div>
      <div>
        <b-skeleton height='1.2rem' width="40%" :animated="animated"></b-skeleton>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props:['items'],
  data() {
    return {
      animated: true,
    };
  },
};
</script>
<style lang="scss" scoped>
.skeleton-card {
  background-color: #fff;
  padding: 1rem 1rem ;
  border-bottom: 1px solid $blue-tint-border;
}
</style>
