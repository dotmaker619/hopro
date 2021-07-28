<template>
  <div class="title">
    <div class="title-content">
      <div class="title-content--img">
        <sh-icon :file="'forms-sprite'" :name="'logo-sensehawk'" class="image" style="max-height:100%;max-width:100%;" ></sh-icon>
      </div>
      <div class="title-content--description">
        <div class="title-content--description__title">Sensehawk Form 1</div>
        <div class="title-content--description__content is-regular-14-00-17">Sed ut perspiciatis unde omnis iste natus error sit voluptatem</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {};
</script>

<style lang="scss" scoped>
  .title {
    width: 800px;
    height: 120px;
    padding: 20px;
    background: white;
    box-shadow: 0px 2px 4px #171e481a;
    &-content {
      height: 100%;
      display: flex;
      &--img {
        width: 150px;
        height: 100%;
      }
      &--description {
        display: flex;
        padding: 10px;
        flex-direction: column;
        justify-content: space-between;
      }
    }
  }
</style>
