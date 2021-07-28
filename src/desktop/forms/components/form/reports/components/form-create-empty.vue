<template>
  <div class="form-builder--create__empty">
    <div class="form-builder--create__empty-content">
      <div class="is-semiBold-24-600-106">Start Building!</div>
      <div class="mt-15 is-regular-14-00-17">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium laudantium.</div>
      <sections-dropdown>
        <div @click="$emit('add')" class="mt-25 sh-button sh-button--inverted sh-button--create">Add <i class="fa fa-chevron-down ml-5"></i></div>
      </sections-dropdown>
    </div>
  </div>
</template>

<script>
  import sectionsDropdown from "./section/components/sections-dropdown";

  export default { components: { sectionsDropdown } };
</script>

<style lang="scss" scoped>
  .form-builder--create {
    &__empty {
      background: white;
      width: 800px;
      height: 435px;
      box-shadow: 0px 0px 5px #0000001a;
      border-radius: 6px;
      opacity: 0.9;
      display: flex;
      justify-content: center;
      align-items: center;
      &-content {
        display: flex;
        padding: 0 70px;
        flex-flow: column;
        justify-content: center;
        align-items: center;
        width: 440px;
        height: 207px;
        background: #f9fafc 0% 0% no-repeat padding-box;
        border: 1px dashed #8a8ea3;
        border-radius: 10px;
        opacity: 1;
        .sh-button {
          border-radius: 18px;
          padding: 0.5rem 2rem;
          border-width: 2px;
          i {
            font-size: 1rem;
          }
        }
      }
    }
  }
</style>
