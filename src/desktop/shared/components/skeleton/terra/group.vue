<template>
  <div class="sh-skeleton">
    <skeleton-loading>
      <row v-for="item in 6" :key="item" justify="space-between">
        <column :span="12">
          <square-skeleton :boxProperties="{
                        top: '10px',
                        bottom: '10px',
                        height: '25px',
                    }">
          </square-skeleton>
        </column>
        <column :span="4" :gutter="10">
          <circle-skeleton></circle-skeleton>
        </column>
      </row>
    </skeleton-loading>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.sh-skeleton {
  @include box-shadow;
  background-color: $white;
  border-radius: 1rem;
  margin-bottom: 1rem;
  &:hover {
    box-shadow: 5px 5px 10px 0px $skeleton-color;
  }
  &:hover &__item--icon {
    align-self: center;
    visibility: visible;
  }
}

</style>