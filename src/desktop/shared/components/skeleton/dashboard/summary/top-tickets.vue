<template>
  <div>
    <skeleton-loading>
      <row v-for="item in 3" :key="item" :gutter="{ top: '40px' }">
        <column :span="12">
          <square-skeleton
            :boxProperties="{
              bottom: '10px',
              width: '30%',
              height: '20px',
            }"
          >
          </square-skeleton>
          <square-skeleton
            :boxProperties="{
              bottom: '10px',
              width: '75%',
              height: '15px',
            }"
          >
          </square-skeleton>
          <square-skeleton
            :boxProperties="{
              bottom: '10px',
              width: '75%',
              height: '15px',
            }"
          >
          </square-skeleton>
        </column>
        <column :span="12" :gutter="10">
          <row :gutter="{ top: '15px' }">
            <column :span="4">
              <circle-skeleton></circle-skeleton>
            </column>
            <column :span="20" :gutter="20">
              <square-skeleton
                :boxProperties="{
                  top: '5px',
                  width: '70px',
                  height: '10px',
                }"
              >
              </square-skeleton>
              <square-skeleton
                :boxProperties="{
                  width: '100%',
                  height: '10px',
                  top: '10px',
                }"
              >
              </square-skeleton>
            </column>
          </row>
        </column>
      </row>
    </skeleton-loading>
  </div>
</template>

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
