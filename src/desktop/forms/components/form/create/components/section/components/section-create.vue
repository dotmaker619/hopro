<template>
  <div class="form-section--add">
    <div class="form-section--add__content">
      <sections-dropdown :section="section">
        <span class="is-medium-16-500-19">+ Add Section</span> <i class="fa fa-chevron-down ml-5"></i
      ></sections-dropdown>
    </div>
  </div>
</template>

<script>
  import sectionsDropdown from "./sections-dropdown";

  export default {
    props: ["section"],
    components: { sectionsDropdown },
  };
</script>

<style lang="scss" scoped>
  .form-section--add {
    position: relative;
    display: flex;
    margin: 20px auto;
    justify-content: center;
    &__content {
      width: 156px;
      text-align: center;
      cursor: pointer;
      i {
        font-size: 1rem;
      }
    }
    &::before,
    &::after {
      content: "";
      width: 325px;
      position: absolute;
      top: 13px;
      border-bottom: 1px dashed #ccc;
    }
    &::before {
      left: 0;
    }
    &::after {
      right: 0;
    }
  }
</style>
