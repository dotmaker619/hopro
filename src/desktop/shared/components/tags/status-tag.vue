<template>
  <div
    class="sh-user-status-tag"
    :class="[status=='active'?'sh-user-status-tag--active':'sh-user-status-tag--inactive']"
  >{{status}}</div>
</template>

<script>
export default {
  props: ["status"]
};
</script>

<style lang="scss" scoped>
div {
  text-transform: capitalize;
}
</style>