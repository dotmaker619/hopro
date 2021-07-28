<template>
  <skeleton-loading>
    <row
      class="sh-skeleton"
      v-for="i in 10"
      :key="i"
      :gutter="{top: '1rem', right: '2rem', bottom: '1rem', left:'2rem'}"
    >
      <square-skeleton
        :count="2"
        :boxProperties="{ 
            top:'12px',
          bottom:'12px',
                            width: '100%',
                            height: '15px'
                        }"
      ></square-skeleton>
    </row>
  </skeleton-loading>
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
  padding: 1rem;
  align-items: center;
  &:hover {
    box-shadow: 5px 5px 10px 0px $skeleton-color;
  }
  &:hover &__item--icon {
    align-self: center;
    visibility: visible;
  }
}
</style>