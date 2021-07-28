<template>
  <div>
    <div class="dashboard-terra" v-for="i in 3" :key="i">
      <div class="mr-10">
        <div class="pb-30">
          <div class="mb-10">
            <b-skeleton width="85%"></b-skeleton>
          </div>
          <b-skeleton width="50%"></b-skeleton>
        </div>
        <div>
          <article class="media is-flex align-center" v-for="i in 1" :key="i">
            <figure class="media-left">
              <p class="image is-40x40">
                <b-skeleton circle width="40px" height="40px"></b-skeleton>
              </p>
            </figure>
            <div class="media-content">
              <div class="content">
                <p>
                  <b-skeleton width="50%"></b-skeleton>
                  <b-skeleton width="50%"></b-skeleton>
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
      <div class="ml-10">
        <div class="pb-30">
          <b-skeleton width="25%"></b-skeleton>
          <b-skeleton width="80%"></b-skeleton>
        </div>
        <div>
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
.dashboard-terra {
  @include box-shadow;
  background-color: $white;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  padding: 15px;
  display: flex;
  > div {
    width: 50%;
  }
}
</style>
