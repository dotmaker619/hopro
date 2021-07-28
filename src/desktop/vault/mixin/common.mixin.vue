<template> </template>

<script>
  import DeleteConfirmation from "../components/delete-confirmation";
  import UpdateTagsMixin from "./update-tags.mixin";
  import { folderService } from "@/desktop/shared/services/";

  export default {
    data() {
      return {
        hover: false,
      };
    },
    mixins: [UpdateTagsMixin],
    computed: {
      is_everything() {
        return !this.$route.query.recents &&
          !this.$route.query.bookmark &&
          !this.$route.query.shared &&
          !this.$route.query.archive &&
          !this.$route.query.owner
          ? true
          : false;
      },
    },
    methods: {
      reverse_array(arr) {
        return _.reverse(arr || []);
      },
      route_query() {
        return _.isEmpty(this.$route.query) ? false : true;
      },
      delete_item() {
        this.$modal.show(
          DeleteConfirmation,
          {
            item_type: `Delete ${this.determine_item_type(this.item)}`,
            item_name: "Delete " + this.item.name,
            warning_text: `Do you want to delete this ${this.determine_item_type(this.item).toLowerCase()}.`,
            ask_password: this.item.passwordProtected,
            onConfirm: (password) => {
              this.apiService
                .delete({
                  id: this.item.uid,
                  headers: this.get_password_header(password),
                })
                .then((res) => {
                  if(this.determine_item_type(this.item).toLowerCase()=='folder'){
                    folderService.update_recents_list("vault-folders", this.item.uid,25,true);
                    this.REMOVE_FOLDER([this.item.uid]);
                  }else {
                    folderService.update_recents_list("vault-files", this.item.uid,25,true);
                    this.REMOVE_FILE([this.item.uid]);
                  }
                  this.fileRemoved ? this.fileRemoved() : "";
                  // this.$emit("update_files");
                })
                .catch(this.handleErrors);
            },
          },

          {
            width: "400px",
            classes: ["has-background-transparent"],
            height: "auto",
          }
        );
      },
    },
  };
</script>

<style></style>
