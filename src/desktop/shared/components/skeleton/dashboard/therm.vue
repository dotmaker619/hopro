<template>
  <div>
    <div class="dashboard-therm" v-for="i in 3" :key="i">
      <div class="pb-30">
        <div class="mb-10">
          <b-skeleton width="50%"></b-skeleton>
        </div>
        <b-skeleton width="25%"></b-skeleton>
      </div>
      <div>
        <div class="columns is-flex align-center">
          <div class="column">
            <div>
              <article class="media is-flex align-center">
                <figure class="media-left">
                  <p class="image is-40x40">
                    <b-skeleton circle width="40px" height="40px"></b-skeleton>
                  </p>
                </figure>
                <div class="media-content">
                  <div class="content">
                    <p>
                      <b-skeleton width="80%"></b-skeleton>
                      <b-skeleton width="80%"></b-skeleton>
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <div class="column">
            <div>
              <b-skeleton width="80%"></b-skeleton>
              <b-skeleton width="80%"></b-skeleton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.dashboard-therm {
  @include box-shadow;
  background-color: $white;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  padding: 15px;
}
</style>
