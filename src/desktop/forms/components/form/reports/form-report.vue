<template>
  <div class="form-builder--create">
    <div class="form-builder--create__content">
      <form-title></form-title>
      <form-section :sections="sections"
        ><template slot-scope="sectionScope">
          <form-fields :section="sectionScope.type">
            <template slot-scope="fieldScope">
              <field-values :field="fieldScope.field" :component="fieldScope.component"> </field-values>
            </template>
          </form-fields>
        </template>
      </form-section>
    </div>
  </div>
</template>

<script>
  import formTitle from "./components/form-title";
  import formSection from "./components/section/form-section";
  import formFields from "./components/fields/form-fields";
  import fieldValues from "./components/fieldValues/field-values";

  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    components: { formTitle, formSection, formFields, fieldValues },
    data() {
      return {
        isEmpty: true,
      };
    },
    computed: {
      ...mapGetters("forms", ["selectedForm"]),
      sections() {
        return this.selectedForm ? this.selectedForm.sections : [];
      },
    },
  };
</script>

<style lang="scss" scoped>
  .form-builder--create {
    width: 800px;
    margin: 30px auto;
  }
</style>
