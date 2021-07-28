<template>
  <div class="columns is-regular-14-00-17 is-marginless bb-1 sh-list-header">
    <div class="column">Containers</div>
    <div class="column">Owner</div>
    <div class="column" v-if="$route.name == 'container-list'">Asset</div>
    <div class="column">Applications</div>
    <div class="column">Tags</div>
  </div>
</template>

<script>
  export default {};
</script>

<style lang="scss">
  .bb-1 {
    border-bottom: 1px solid #edeef2;
  }
</style>
