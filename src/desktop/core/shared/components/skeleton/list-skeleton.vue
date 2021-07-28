<template>
  <div>
    <div class="skeleton-list columns is-regular-14-00-17" v-for="i in 10" :key="i">
      <div class="column is-3">
        <article class="media">
          <figure class="media-left">
            <p class="image">
              <b-skeleton circle width="3rem" height="3rem"></b-skeleton>
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <p>
                <b-skeleton width="80%"></b-skeleton>
                <b-skeleton width="20%"></b-skeleton>
              </p>
            </div>
          </div>
        </article>
      </div>
      <div class="column is-2">
        <b-skeleton width="80%"></b-skeleton>
        <b-skeleton width="20%"></b-skeleton>
      </div>
      <div class="column is-3">
        <b-skeleton width="80%"></b-skeleton>
        <b-skeleton width="20%"></b-skeleton>
      </div>
      <div class="column is-4">
        <b-skeleton width="80%"></b-skeleton>
        <b-skeleton width="20%"></b-skeleton>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.skeleton-list {
  // margin-bottom: 0.1rem;
  padding: 1.5rem 4rem;
  background-color: $white;
  color: $list-header-text;
  border-bottom: 1px solid #eee;
}
</style>