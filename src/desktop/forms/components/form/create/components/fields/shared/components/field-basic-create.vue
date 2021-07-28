<template>
  <div class="field-basic--create">
    <fields-create :section="section" :field="field" @create-field="$emit('add-field', $event)">
      <div class="sh-button sh-button--inverted sh-button--create field-basic--create__button">Add <i class="fa fa-chevron-down ml-5"></i></div>
    </fields-create>
  </div>
</template>

<script>
  import fieldsCreate from "./fields-create.vue";

  export default { props: ["section", "field"], components: { fieldsCreate } };
</script>

<style lang="scss" scoped>
  .field-basic {
    &--create {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      width: 100%;
      bottom: -12px;
      z-index: 11;
      .sh-button {
        padding: 0.75rem 1.5rem;
        i {
          font-size: 10px;
        }
      }
    }
  }
</style>
