<script>
import { mapMutations, mapState, mapGetters } from "vuex";
import { folderService, fileService } from "@/desktop/shared/services/";

import vaultMixin from "@/desktop/vault/shared/mixins/vault.mixin";
import CommonMixin from "./common.mixin";

import AskPassword from "@/desktop/vault/components/ask-password-2";
import ResetPassword from "@/desktop/vault/components/reset-password";
import LockUnlockFolder from "@/desktop/vault/components/lock-unlock-folder";
import DeleteConfirmation from "@/desktop/vault/components/delete-confirmation";

export default {
  mixins: [
    vaultMixin, 
    CommonMixin
  ],
  components: {},
  computed: {
    is_viewer_route() {
      return this.$route.name.includes("viewer");
    },
    ...mapState("vault", [
      "selected",
      "last_selected",
      "files",
      "info_tab",
      "compact_view",
      "element",
    ]),
    selected: {
      get() {
        return this.$store.state.vault.selected_folders;
      },
      set(value) {
        this.$store.commit("vault/SET_SELECTED_FOLDERS", value);
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
      "UPDATE_FOLDER_DETAILS",
      "REMOVE_FOLDER"
    ]),
    ...mapMutations(["SET_PASS_KEY"]),
    async move(folder){
      // console.log(folder)
      await this.check_password(
        { id: this.item.uid, body: { folder } },
        {
          uid: this.item.uid,
          folder,
          rootFolder: this.item.rootFolder
        },
        "move"
      );
      console.log(this.item)
      this.REMOVE_FOLDER([this.item.uid]);
      folderService.update_recents_list("vault-folders", this.item.uid);
    },
    open_lock_unlock() {
      this.$modal.show(
        LockUnlockFolder,
        {
          folder: this.item
        },
        {
          width: "400px",
          classes: ["has-background-transparent"],
          height: "auto"
        }
      );
      folderService.update_recents_list("vault-folders", this.item.uid);
    },
    reset_password() {
      this.$modal.show(
        ResetPassword,
        {
          folder: this.item
        },
        {
          width: "400px",
          classes: ["has-background-transparent"],
          height: "auto"
        }
      );
      folderService.update_recents_list("vault-folders", this.item.uid);
    },
    async update_owner(user, item) {
      let body = {
        owner: {
          uid: user.uid,
          email: user.email
        }
      };
      await this.check_password(
        {
          id: this.item.uid,
          body: body
        },
        {
          uid: this.item.uid,
          owner: _.pick(user, ["uid", "email"]),
          rootFolder: this.item.rootFolder
        },
        "patch"
      );
    },
    download_files() {
      if (
        this.item.passwordProtected &&
        !this.$store.state.pass_keys[
          this.item.rootFolder ? this.item.rootFolder : this.item.uid
        ]
      ) {
        return;
      } else {
        this.$eventHub.$emit("download_zip", {
          type: "vault",
          folder: this.item
        });
        folderService.update_recents_list("vault-folders", this.item.uid);
      }
    },
    download(item) {
      let action = value => {
        this.apiService
          .get_file_download_url({
            id: item.uid,
            headers: this.get_password_header(value)
          })
          .then(res => {
            window.open(res.data, "_blank");
          })
          .catch(this.handleErrors);
      };

      if (
        item.passwordProtected ||
        (item.folder && this.item.passwordProtected)
      ) {
        this.$buefy.dialog.prompt({
          message: `Password?`,
          inputAttrs: {
            type: "password",
            placeholder: "Type Password",
            value: "",
            min: 5,
            required: true
          },
          onConfirm: action
        });
      } else {
        action("");
      }
    },
    // delete_item(item) {
    //   this.$buefy.dialog.confirm({
    //     type: "is-danger",
    //     message: "Are you sure you want to delete this item?",
    //     confirmText: "Yes",
    //     cancelText: "No",
    //     onConfirm: async () => {
    //       await this.check_password(
    //         {
    //           id: this.item.uid
    //         },
    //         {},
    //         "delete"
    //       );
    //       this.REMOVE_FOLDER(this.item);
    //     }
    //   });
    // },
    async bookmark(item) {
      let bookmark = !item.bookmark;
      await this.check_password(
        { id: this.item.uid, body: { bookmark } },
        {
          uid: this.item.uid,
          bookmark,
          rootFolder: this.item.rootFolder
        },
        "toggle_bookmark"
      );
      folderService.update_recents_list("vault-folders", this.item.uid);
      this.is_dropdown = false;
    },
    async archive(item) {
      let archive = !item.archive;
      await this.check_password(
        { id: this.item.uid, body: { archive } },
        {
          uid: this.item.uid,
          archive,
          rootFolder: this.item.rootFolder
        },
        "toggle_archive"
      );
      this.REMOVE_FOLDER([this.item.uid]);
      folderService.update_recents_list("vault-folders", this.item.uid);
      this.is_dropdown = false;
    },
    async check_password(api_payload, local_payload, method) {
      let old_data = { ...this.item };
      let action = async password => {
        try {
          this.UPDATE_FOLDER_DETAILS(local_payload);
          let res = await folderService[method]({
            ...api_payload,
            headers: this.get_password_header(password)
          });
          this.SET_PASS_KEY({ uid: this.item.uid, value: password });
        } catch (err) {
          this.UPDATE_FOLDER_DETAILS(old_data);

          if (err.response.status == 401) {
            this.$toast.show(
              "Wrong Password",
              "",
              this.$store.state.izitoast_options.appError
            );
            this.$modal.show(
              AskPassword,
              {
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

      if (!this.item.passwordProtected) {
        await action("");
        return;
      }
      if (this.$store.state.pass_keys[this.item.uid]) {
        await action(this.$store.state.pass_keys[this.item.uid]);
        return;
      }

      this.$modal.show(
        AskPassword,
        {
          inputPassword: await action
        },
        {
          width: "400px",
          classes: ["has-background-transparent"],
          height: "auto"
        }
      );
    },
    async save() {
      this.is_edit = false;
      let update_data = {
        uid: this.item.uid,
        name: this.form.name,
        rootFolder: this.item.rootFolder
      };
      if (this.item.name == this.form.name) return;

      await this.check_password(
        { id: this.item.uid, body: this.form },
        update_data,
        "patch"
      );

      this.is_dropdown = false;
    }
  }
};
</script>