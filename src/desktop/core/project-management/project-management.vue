<template>
  <div class="project-management">
    <keep-alive>
      <router-view class="router-project-management-top-section" name="top-section" />
    </keep-alive>
    <!-- <keep-alive include="container-list,asset-list,group-list"> -->
    <router-view
      class="router-project-management-main"
      :class="[{ 'is-paddingless': $route.name.includes('-vault') }, { 'is-paddingless my-20': $route.name.includes('-tickets') }]"
    />
    <!-- </keep-alive> -->
  </div>
</template>

<script>
  export default {};
</script>
<style lang="scss">
  .top-section {
    padding: 2rem 2rem 0;
  }
  .heading-1 {
    margin-bottom: 10px;
    opacity: 0.7;
    font-family: Barlow-Medium;
    font-size: 14px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.21;
    letter-spacing: normal;
    text-align: left;
    color: #393c42;
  }
  .pin-padding {
    padding: 2.2rem;
    padding-bottom: 0;
  }
</style>
