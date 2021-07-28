<script>
import DeleteConfirmation from "@/desktop/vault/components/delete-confirmation";

import { mapMutations, mapState, mapGetters } from "vuex";
import { folderService, fileService } from "@/desktop/shared/services/";
import ShareFile from "@/desktop/vault/components/share-file/share-file"

import CommonMixin from "./common.mixin";

export default {
  mixins: [
    CommonMixin
  ],
  computed: {
    ...mapState("vault", [
      "selected",
      "last_selected",
      "files",
      "info_tab",
      "compact_view"
    ]),
    selected: {
      get() {
        return this.$store.state.vault.selected_files;
      },
      set(value) {
        this.$store.commit("vault/SET_SELECTED_FILES", value);
      }
    }
  },
  methods: {
    ...mapMutations("vault", [
      "SET_LAST_SELECTED",
      "SET_SELECTED",
      "SET_INFO_TAB",
      "UPDATE_FILE_DETAILS",
      "REMOVE_FILE",
      "REMOVE_FOLDER"
    ]),
    open_share_modal(item) {
      this.$modal.show(
        ShareFile,
        {
          file: item
        },
        {
          width: "400px",
          classes: ["has-background-transparent"],
          height: "auto"
        }
      );
    },
    move(folder){
      this.patch( {id: this.item.uid, body: { folder }},"move").then(()=>this.REMOVE_FILE([this.item.uid]))
      folderService.update_recents_list("vault-files", this.item.uid);
    },
    async patch(api_payload, method){
      return await this.apiService[method]({
          ...api_payload,
      })
      .then(res => {})
      .catch(this.handleErrors);
    },
    bookmark(item, i) {
      let val = !item.bookmark;
      this.UPDATE_FILE_DETAILS({ uid: item.uid, bookmark: val });
      this.patch( {id: item.uid,body: { bookmark: val }}, "toggle_bookmark")
      folderService.update_recents_list("vault-files", this.item.uid);
    },
    download(file) {
      fileService
        .get_file_download_url({
          id: file.uid,
          headers: this.get_password_header(file.rootFolder)
        })
        .then(res => {
          window.open(res.data, "_blank");
        });
      folderService.update_recents_list("vault-files", this.item.uid);
    },
    // delete_item(item) {
    //   this.$eventHub.$emit("delete_file_folder", {
    //     folder: this.folder,
    //     file: item
    //   });
    // },
    archive(item) {
      let archive = !item.archive;
      this.REMOVE_FILE([item.uid]);
      this.patch( {id: item.uid, body: { archive }},"toggle_archive")
      folderService.update_recents_list("vault-files", this.item.uid);
    },
    save(file, i) {
      this.is_edit = -1;
      if (file.name == this.form.name) return;
      this.UPDATE_FILE_DETAILS({ uid: file.uid, name: this.form.name });
      this.patch({id: file.uid,body: { name: this.form.name },  headers: this.get_password_header(file.rootFolder)},"patch")
    },
    async update_owner(user, file) {
      let action = async password => {
        let body = {
          owner: {
            uid: user.uid,
            email: user.email
          }
        };

        this.$store.commit(`vault/UPDATE_FILE_DETAILS`, {
          owner: _.pick(user, ["uid", "email"]),
          uid: file.uid
        });
        this.patch({id: file.uid,body: body, headers: this.get_password_header(password)},"patch")
      };

      if (!file.passwordProtected) {
        action("");
        return;
      }
      this.$modal.show(
        AskPassword,
        {
          item: file,
          inputPassword: action
        },
        {
          width: "400px",
          classes: ["has-background-transparent"],
          height: "auto"
        }
      );
    }
  }
};
</script>