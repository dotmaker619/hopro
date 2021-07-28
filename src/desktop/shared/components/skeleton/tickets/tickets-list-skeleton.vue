<template>
  <div class="tickets-skeleton">
    <div v-for="i in 8" :key="i">
      <div
        class="columns is-flex align-center py-20"
        style="border-bottom: 1px solid #eee"
      >
        <div class="column is-1">
        </div>
        <div class="column is-3">
          <b-skeleton width="75%"></b-skeleton>
          <b-skeleton width="50%"></b-skeleton>
        </div>
        <div class="column is-2">
          <b-skeleton width="80%"></b-skeleton>
        </div>
        <div class="column is-2">
          <b-skeleton width="80%"></b-skeleton>
        </div>
        <div class="column is-2">
          <b-skeleton width="80%"></b-skeleton>
        </div>
        <div class="column is-2">
          <b-skeleton width="60%"></b-skeleton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.tickets-skeleton {
  background-color: $white;
}
</style>
