<template>
  <component :fields="section.fields" :section="section" @add-field="createField" :is="comp">
    <template slot-scope="fscope">
      <slot :field="fscope.field" :component="fscope.component"></slot>
    </template>
  </component>
</template>

<script>
  import fieldsAttachments from "./components/fields-attachments";
  import fieldsDefault from "./components/fields-default";
  import fieldsChecklist from "./components/fields-checklist";
  import fieldsTable from "./components/fields-table";

  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    props: ["section"],
    components: { fieldsTable, fieldsDefault, fieldsChecklist, fieldsAttachments },
    data() {
      return {
        comp: "div",
      };
    },
    mounted() {
      this.comp = `fields-${this.section.type}`;
    },
    methods: {
      ...mapActions("forms", ["add_field"]),
      createField(field) {
        let obj = {
          "name": field.name,
          "type": field.dataType,
          properties: { type: field.type },
          section: this.section.uid,
          previousField: field.previousField,
          "config": [{ "name": "computer science" }, { "name": "Information Technology" }],
        };
        this.add_field({ body: obj });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .section {
    background: white;
  }
</style>
