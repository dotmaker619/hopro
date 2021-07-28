<template>
  <div class="sh-list-header columns is-regular-14-00-17 is-marginless">
    <div class="column " :class="[$route.name.includes('asset-details') ? 'is-3' : 'is-4']">Terra</div>
    <div class="column is-2">Created By</div>
    <div class="column is-3">Users</div>
    <div class="column" :class="[$route.name.includes('asset-details') ? 'is-3' : 'is-2']">Modified On</div>
  </div>
</template>

<script>
  export default {};
</script>

<style lang="scss" scoped></style>
