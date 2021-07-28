<template>
  <div class="home-skeleton">
    <skeleton-loading>
      <row v-for="i in 2" :key="i" :gutter="{ top: '10px', bottom: '10px' }">
        <column class="home-skeleton-card" :span="24">
          <square-skeleton
            :boxProperties="{
              bottom: '15px',
              height: '160px',
            }"
          >
          </square-skeleton>
          <div class="px-20">
            <square-skeleton
              :boxProperties="{
                bottom: '15px',
                height: '20px',
              }"
            >
            </square-skeleton>
            <square-skeleton
              :boxProperties="{
                bottom: '15px',
                height: '20px',
                width: '30%',
              }"
            >
            </square-skeleton>
          </div>
        </column>
      </row>
    </skeleton-loading>
  </div>
</template>
<style lang="scss" scoped>
.home-skeleton {
  &-card {
    border-radius: 1rem;

    background-color: #fff;
    min-height: 277px;
  }
}
</style>
