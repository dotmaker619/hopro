<template>
  <div>
    <skeleton-loading class="sh-skeleton">
      <row v-for="item in 12" :key="item" :gutter="{top: '5px', bottom: '10px'}">
        <column :span="24" :gutter="20">
          <square-skeleton :boxProperties="{
                            top: '5px',
                            width: '100%',
                            height: '15px'
                        }">
          </square-skeleton>
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