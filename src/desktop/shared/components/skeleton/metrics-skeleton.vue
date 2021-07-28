<template>
  <div class="is-flex align-center">
    <div class="sh-skeleton">
      <article class="media">
        <figure class="media-left">
          <p class="image is-40x40">
            <b-skeleton circle width="40px" height="40px"></b-skeleton>
          </p>
        </figure>
        <div class="media-content">
          <div class="content">
            <p>
              <b-skeleton active></b-skeleton>
              <b-skeleton width="30%" height="24px"></b-skeleton>
            </p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.sh-skeleton {
  @include box-shadow;
  background-color: $white;
  border-radius: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  height: 9rem;
  padding: 2.5rem 2rem;
  min-width: 20rem;

  &:hover {
    box-shadow: 5px 5px 10px 0px $skeleton-color;
  }
  &:hover &__item--icon {
    align-self: center;
    visibility: visible;
  }
}
.metrics-skeleton {
  margin-right: 3rem !important;
}
</style>