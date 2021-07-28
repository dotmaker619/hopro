<script>
  import { userService } from "@/desktop/shared/services/";
  export default {
    data() {
      return {
        form: {
          name: "",
          properties: {
            icon: "",
            cover_image: "",
            color: "",
          },
        },
        showAdvanced: false,
        awaitingResponse: false,
        validationError: {},
        resourceReceived: false,
      };
    },
    methods: {
      async save() {
        if (this.validate_form()) {
          this.awaitingResponse = true;
          this.get_advanced();
          let promise;
          if (this.details) {
            promise = this.service.put({
              id: this.details.uid,
              body: this.form,
            });
          } else {
            promise = this.service.post({ body: this.form });
          }
          await promise
            .then(() => {
              this.$emit("close");
              this.on_complete();
            })
            .catch((err) => this.handleErrors(err));
          this.awaitingResponse = false;
        }
      },
      async getDetails() {
        let result = await this.service.get({ id: this.details.uid }).catch((err) => this.handleErrors(err));
        this.form = { ...result };

        if (result.owner && result.owner.uid) {
          let userResult = await userService.get({
            id: result.owner.uid,
            query: "no_org",
          });
          if (userResult) {
            this.form.owner = {
              uid: this.form.owner.uid,
              email: this.form.owner.email,
              name: userResult.first_name + " " + userResult.last_name,
            };
            this.form.owner = { ...this.form.owner };
          }
        }
        this.resourceReceived = true;
      },
      get_advanced() {
        if (this.$refs.advanced) {
          this.form.tags = this.$refs.advanced.finalTags.map((m) => m.uid);
          this.form.properties = {};
          if (this.$refs.advanced.selectedColor) this.form.properties.color = this.$refs.advanced.selectedColor;
          if (this.$refs.advanced.iconUrl) this.form.properties.icon = this.$refs.advanced.iconUrl;
          if (this.$refs.advanced.coverUrl) this.form.properties.cover_image = this.$refs.advanced.coverUrl;
          if (this.$refs.advanced.selected_coordinate_system)
            this.form.properties.selected_coordinate_system = this.$refs.advanced.selected_coordinate_system;
        }
      },

      async getUsers() {
        this.users = this.$store.state.users
          .filter((u) => !u.is_internal)
          .map((m) => ({
            uid: m.uid,
            name: m.first_name || m.last_name ? m.first_name + " " + m.last_name : m.email,
          }));
      },
      ownerChange(val) {
        this.form.owner = val;
      },
    },
  };
</script>

<style></style>
