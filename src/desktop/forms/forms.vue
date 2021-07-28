<template>
  <div class="router-forms">
    <router-view></router-view>
  </div>
</template>

<script>
  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    mounted() {
      this.get_forms();
      this.get_section_template();
      this.get_field_template();
    },
    computed: {
      ...mapState("forms", ["forms"]),
    },
    methods: {
      ...mapActions("forms", ["get_forms", "get_section_template", "get_field_template"]),
    },
  };
</script>
