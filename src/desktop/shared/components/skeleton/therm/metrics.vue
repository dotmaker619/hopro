<template>
  <div>
    <skeleton-loading v-for="item in 3" :key="item" class="sh-skeleton">
      <row :gutter="{top: '10px', bottom: '10px'}">
        <column :span="20" :gutter="20">
          <square-skeleton :boxProperties="{
                            top: '5px',
                            width: '100%',
                            height: '10px'
                        }">
          </square-skeleton>
          <square-skeleton :boxProperties="{
                            width: '40%',
                            height: '30px',
                            top: '10px'
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