<template>
  <component :field="field" :fieldType="fieldType" :is="component"></component>
</template>

<script>
  import tableField from "./components/table-field";
  import textField from "./components/text-field";
  import emailField from "./components/email-field";
  import phoneField from "./components/phone-field";
  import checkboxField from "./components/checkbox-field";
  import dateTimeField from "./components/date-time-field";
  import dropdownField from "./components/dropdown-field";
  import moneyField from "./components/money-field";
  import radioField from "./components/radio-field";
  import uploadField from "./components/upload-field";
  import websiteField from "./components/website-field";

  import { mapActions, mapGetters } from "vuex";

  export default {
    props: ["field", "component"],
    components: {
      tableField,
      textField,
      emailField,
      phoneField,
      checkboxField,
      dateTimeField,
      dropdownField,
      moneyField,
      radioField,
      uploadField,
      websiteField,
    },
    computed: {
      ...mapGetters("forms", ["fieldType"]),
    },
    mounted() {
      console.log(this.field, this.component);
    },
  };
</script>

<style lang="scss" scoped>
  .section {
    background: white;
  }
</style>
