<template>
  <div class="sh-list-header columns is-regular-14-00-17 ">
    <div class="column is-3">Users</div>
    <div class="column is-4">Teams</div>
    <div class="column is-2">Role</div>
    <div class="column is-flex is-center" :class="$route.name === 'admin-user-list' ? 'is-2' : 'is-3'">
      <span>Status</span>
    </div>
  </div>
</template>

<script>
  export default {};
</script>

<style lang="scss" scoped>
</style>
