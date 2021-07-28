<template>
  <div class="field-basic">
    <field-basic-create @add-field="$emit('add-field', $event)" :section="section" v-if="fields && fields.length === 0"></field-basic-create>
    <div v-else>
      <draggable :group="{ name: 'field-basic' }" :list="fields" handle=".handle" tag="div" @change="checkMove">
        <div v-for="field in fields" :key="field.uid">
          <field-basic :section="section" :fieldType="fieldType" @delete-field="deleteField" :field="field" @add-field="$emit('add-field', $event)">
            <slot :field="field" :component="`${fieldType[field.properties.type] ? fieldType[field.properties.type].component : ''}`"></slot>
          </field-basic>
        </div>
      </draggable>
    </div>
  </div>
</template>

<script>
  import fieldBasicCreate from "../shared/components/field-basic-create.vue";
  import fieldBasic from "../shared/components/field-basic.vue";
  import draggable from "vuedraggable";

  import { mapActions, mapGetters } from "vuex";

  export default {
    props: ["fields", "section"],
    components: { fieldBasicCreate, fieldBasic, draggable },
    computed: {
      ...mapGetters("forms", ["fieldType"]),
    },
    methods: {
      ...mapActions("forms", ["delete_field", "update_field"]),
      deleteField(uid) {
        this.delete_field({ id: uid });
      },
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
  .field-basic {
    &--create {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      width: 100%;
      bottom: -12px;
      .sh-button {
        padding: 0.75rem 1.5rem;
        i {
          font-size: 10px;
        }
      }
    }
  }
</style>
