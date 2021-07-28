<template>
  <div class="fields-table is-medium-14-500-17">
    <div class="fields-table--container">
      <draggable :group="{ name: 'field-basic' }" :list="fields" handle=".handle" tag="div" @change="checkMove">
        <div v-for="field in fields" :key="field.name">
          <slot :field="field" :component="'table-field'"></slot>
        </div>
      </draggable>
    </div>
    <fields-create :section="section" @create-field="$emit('add-field', $event)">
      <p class="is-medium-16-500-19 has-text-theme-grey is-pointer has-opacity-8"><i class="fas fa-plus mr-5"></i> Add New</p>
    </fields-create>
  </div>
</template>

<script>
  import fieldsCreate from "../shared/components/fields-create.vue";
  import draggable from "vuedraggable";
  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    components: { fieldsCreate, draggable },
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
