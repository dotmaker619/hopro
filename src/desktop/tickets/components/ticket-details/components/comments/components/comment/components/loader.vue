<template>
  <div>
    <skeleton-loading>
      <row class="is-flex align-start">
        <column :span="2">
          <circle-skeleton
            :boxProperties="{
              width: '100%',
              height: '30px',
              top: '0px'
            }"
          ></circle-skeleton>
        </column>
        <column :span="22" :gutter="10">
          <square-skeleton
            :boxProperties="{
              width: '100%',
              height: '10px'
            }"
          >
          </square-skeleton>
          <square-skeleton
            :boxProperties="{
              width: '100%',
              height: '50px',
              top: '15px'
            }"
          >
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
    box-shadow: 5px 5px 10px 0px #dedeec;
  }
  &:hover &__item--icon {
    align-self: center;
    visibility: visible;
  }
}
</style>
