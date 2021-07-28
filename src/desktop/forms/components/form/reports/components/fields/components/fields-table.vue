<template>
  <div class="fields-table is-medium-14-500-17">
    <div class="fields-table--container">
      <draggable :group="{ name: 'field-basic' }" :list="fields" handle=".handle" tag="div" @change="checkMove">
        <div v-for="field in fields" :key="field.name">
          <slot :field="field" :component="'table-field'"></slot>
        </div>
      </draggable>
    </div>
  </div>
</template>

<script>
  import draggable from "vuedraggable";
  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    components: { draggable },
    props: ["fields", "section"],
    methods: {
      ...mapActions("forms", ["update_field"]),
      updateField(field) {
        this.update_field({
          id: field.uid,
          body: field,
        });
      },
      checkMove(data) {
        if (data.moved.newIndex - 1 >= 0) {
          this.fields[data.moved.newIndex].previousField = this.fields[data.moved.newIndex - 1].uid;
        } else {
          this.fields[data.moved.newIndex].previousField = null;
        }
        this.updateField(this.fields[data.moved.newIndex]);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .fields-table {
    padding: 32px;
  }
</style>
