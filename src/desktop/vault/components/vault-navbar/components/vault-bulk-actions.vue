<template>
  <div class="vault-toolbar">
    <user-dropdown
      style="margin-right: 38px;"
      class="is-medium-14-500-17 has-text-new-grey"
      :is_name_hidden="true"
      :icon="'owner'"
      :pxsize="36"
      @update-user="update_owner(current_folder, $event)"
    ></user-dropdown>
    <!-- <owner
      @update-user="update_owner(current_folder,$event)"
      :can_unassign="false"
      :icon="'owner'"
    ></owner>-->
    <img @click="add_users(current_folder)" v-tooltip="'Users'" src="@/assets/icons/vault/users.svg" />

    <img @click="add_teams(current_folder)" v-tooltip="'Teams'" src="@/assets/icons/vault/teams.svg" />
    <type-tag :complete="update_tags" :resourceId="current_folder.uid" :display_on_hover="false">
      <template #toggle-dropdown>
        <img v-tooltip="'Tags'" src="@/assets/icons/vault/tags.svg" />
      </template>
    </type-tag>
    <!-- <img v-tooltip="'Tags'" src="@/assets/icons/vault/tags.svg" alt /> -->
    <img @click="download()" v-tooltip="'Download'" src="@/assets/icons/vault/download-2.svg" />
    <img
      @click="
        files_bulk_update({ bookmark: true });
        folders_bulk_update({ bookmark: true });
      "
      v-tooltip="'Bookmark'"
      src="@/assets/icons/vault/bookmark.svg"
    />
    <img
      @click="
        files_bulk_update({ archive: true });
        folders_bulk_update({ archive: true });
      "
      v-tooltip="'Archive'"
      src="@/assets/icons/vault/archive.svg"
    />
    <img @click="delete_files()" v-tooltip="'delete'" src="@/assets/icons/vault/delete.svg" />

    <FolderMoveDropdown
      @move_folder="
        files_bulk_update({ folder: $event });
        folders_bulk_update({ destination: $event }, '', true);
      "
    />
  </div>
</template>

<script>
  import { fileService, folderService } from "@/desktop/shared/services/";
  import AskPassword2 from "../../ask-password-2";
  import { mapMutations, mapState } from "vuex";
  import DeleteConfirmation from "@/desktop/vault/components/delete-confirmation";
  import AddUsers from "@/desktop/shared/components/add-users-modal";
  import AddTeams from "@/desktop/shared/components/add-teams-modal";
  import Owner from "@/desktop/shared/components/old-user-dropdown";
  import FolderMoveDropdown from "./folder-move-dropdown/folder-move-dropdown";
  import TypeTag from "@/desktop/shared/components/tags/type-tag/type-tag";
  import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";

  export default {
    props: [""],
    components: { TypeTag, Owner, UserDropdown, FolderMoveDropdown },
    computed: {
      ...mapState("vault", ["view_type", "info_tab", "selected_files", "selected_folders", "current_folder"]),
    },
    methods: {
      ...mapMutations("vault", ["UPDATE_FILES_BULK", "UPDATE_FOLDERS_BULK", "SET_SELECTED_FILES", "SET_SELECTED_FOLDERS"]),
      download() {
        this.$eventHub.$emit("download_zip", {
          files: this.selected_files,
          folder: this.info_tab.folder,
          type: "vault",
        });

        if (this.selected_folders.length) {
          let dictionary = _.keyBy(this.$store.state.vault.vault_folders, "uid");
          this.selected_folders.forEach((uid) => {
            if (dictionary[uid])
              this.$eventHub.$emit("download_zip", {
                type: "vault",
                folder: dictionary[uid],
              });
          });
        }
      },
      async update_tags(tag) {
        await Promise.all([this.files_bulk_update({ tags: { add: [tag] } }), this.folders_bulk_update({ tags: { add: [tag] } })]);
      },
      async files_bulk_update(payload, password = "") {
        if (!this.selected_files.length) return;
        try {
          let response = await fileService.files_bulk_patch({
            id: this.current_folder.uid,
            body: {
              data: payload,
              strict: false,
              files: this.selected_files,
            },
            headers: this.get_password_header(password || this.current_folder.rootFolder ? this.current_folder.rootFolder : this.current_folder.uid),
          });
          if (response && response.data) {
            this.UPDATE_FILES_BULK(response.data);
            if (payload.archive) this.SET_SELECTED_FILES(response.data.failure.map((f) => f.uid));
          }
        } catch (err) {
          this.handleErrors(err);
        }
      },
      async folders_bulk_update(payload, password = "", is_remove) {
        if (!this.selected_folders.length) return;

        try {
          let response = await folderService.folders_bulk_patch({
            body: {
              data: payload,
              strict: false,
              folders: this.selected_folders,
            },
            headers: this.get_password_header(password || this.current_folder.rootFolder ? this.current_folder.rootFolder : this.current_folder.uid),
          });
          if (response && response.data) {
            this.UPDATE_FOLDERS_BULK({ ...response.data, is_remove });
            if (is_remove) this.SET_SELECTED_FOLDERS([]);
            else if (payload.archive) this.SET_SELECTED_FOLDERS(response.data.failure.map((f) => f.uid));
          }
        } catch (err) {
          console.log(err);
          this.handleErrors(err);
        }
      },
      delete_files() {
        this.$modal.show(
          DeleteConfirmation,
          {
            item_type: "Delete",
            item_name: "",
            warning_text: "Do you want to delete these items.",
            ask_password: this.current_folder.passwordProtected,
            onConfirm: (password) => {
              // files
              if (this.current_folder.uid && this.selected_files.length)
                fileService
                  .bulk_delete({
                    id: this.current_folder.uid,
                    body: {
                      folder: this.current_folder.uid,
                      files: this.selected_files,
                    },
                    headers: this.get_password_header(password),
                  })
                  .then((res) => {
                    this.$store.commit("vault/REMOVE_FILE", this.selected_files);
                    this.$store.commit("vault/SET_SELECTED_FILES", []);

                    this.$emit("update_files");
                  })
                  .catch(this.handleErrors);
              // folders
              if (this.selected_folders.length)
                folderService
                  .bulk_delete({
                    id: this.current_folder.uid,
                    body: {
                      folders: this.selected_folders,
                    },
                    headers: this.get_password_header(password),
                  })
                  .then((res) => {
                    this.$store.commit("vault/REMOVE_FOLDER", this.selected_folders);
                    this.$store.commit("vault/SET_SELECTED_FOLDERS", []);
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
      add_users(details) {
        this.$modal.show(
          AddUsers,
          {
            users: [],
            complete: async (e) => {
              this.files_bulk_update({ users: { add: e } }, details.rootFolder ? details.rootFolder : details.uid);
              this.folders_bulk_update({ users: { add: e } }, details.rootFolder ? details.rootFolder : details.uid);
            },
          },
          { height: "80%" }
        );
      },
      add_teams(details, type) {
        this.$modal.show(
          AddTeams,
          {
            teams: [],
            complete: (e) => {
              this.files_bulk_update({ labels: { add: e } }, details.rootFolder ? details.rootFolder : details.uid);
              this.folders_bulk_update({ labels: { add: e } }, details.rootFolder ? details.rootFolder : details.uid);
            },
          },
          { height: "80%" }
        );
      },
      async update_owner(details, user) {
        this.folders_bulk_update(
          {
            owner: _.pick(user, ["uid", "email"]),
          },
          details.rootFolder ? details.rootFolder : details.uid
        );
        this.files_bulk_update(
          {
            owner: _.pick(user, ["uid", "email"]),
          },
          details.rootFolder ? details.rootFolder : details.uid
        );
      },
    },
  };
</script>

<style lang="scss">
  .vault-toolbar {
    .is-vault-tags--trigger {
      width: 120%;
      height: 100%;
      display: flex;
      align-items: center;
    }
    padding: 0 2rem;
    width: 360px;
    height: 44px;
    // &-content {
    margin-right: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.3);
    border: solid 1px $primary;
    background-color: #ffffff;
    img {
      cursor: pointer;
      width: 35px;
      height: 35px;
    }
    // }
  }
</style>
