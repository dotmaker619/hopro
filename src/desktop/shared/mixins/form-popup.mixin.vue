
<script>
export default {
  data() {
    return {};
  },
  methods: {
    open_form(form_component, info, edit_item) {
      info.subheader =
        info.subheader ||
        (this.$store.state.current_organization &&
          this.$store.state.current_organization.name);

      this.$modal.show(
        form_component,
        {
          details: edit_item,
          info,
          on_complete: () => {
            if (this.getData) {
              this.getData(false);
            } else if (this.getDetails) {
              this.getDetails(false);
            } else {
              this.$emit("update");
            }
            // this.$parent.emit('update');
          }
        },
        {
          width: "45%",
          classes: ["has-background-transparent"],
          scrollable: true,
          height: "auto"
        },
        // {
        //   'closed': ()=> {
        //     this.$parent.emit('update');
        //   }
        // }
      );
    }
  }
};
</script>

<style>
</style>