<template>
  <div class="fields-table is-medium-14-500-17">
    <div class="fields-table--container">
      <slot :field="field" :component="'upload-field'"></slot>
    </div>
  </div>
</template>

<script>
  import fieldsCreate from "../shared/components/fields-create.vue";
  export default {
    components: { fieldsCreate },
    props: ["fields"],
  };
</script>

<style lang="scss" scoped>
  .fields-table {
    padding: 32px;
  }
</style>
