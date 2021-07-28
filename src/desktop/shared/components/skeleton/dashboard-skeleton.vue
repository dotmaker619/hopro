<template>
  <div class="dashboard-skeleton">
    <div class="columns">
      <div class="sidebar column is-3">
        <skeleton-loading>
          <row class="sskeleton" v-for="i in 8" :key="i" :gutter="{ top: '10px' }">
            <column v-for="i in 1" :key="i" :span="100" :gutter="10">
              <square-skeleton :count="1" :boxProperties="{ top: '12px', bottom: '12px', width: '100%', height: '15px' }"></square-skeleton>
            </column>
          </row>
        </skeleton-loading>
      </div>
      <div class="column is-paddingless">
        <div class="navbar"></div>
        <div class="body">
          <div class="top-section">
            <div class="one"></div>
            <div class="two"></div>
          </div>
          <div class="bottom-section"></div>
        </div>
      </div>
    </div>
  </div>
</template>

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

  .dashboard-skeleton {
    .sidebar {
      height: 100vh;
      width: 20rem;
      background: white;
      border: 1px solid #eee;
    }

    .navbar {
      border: 1px solid #eee;
      height: 6rem;
      padding: 0;
      margin: 0;
    }
    .body {
      .top-section {
        display: flex;
        .one,
        .two {
          height: 30vw;
          width: 50%;
          border: 1px solid #eee;
        }
      }
      .bottom-section {
        border: 1px solid #eee;
        height: 6rem;
        margin: 2rem;
      }
    }
  }
</style>
