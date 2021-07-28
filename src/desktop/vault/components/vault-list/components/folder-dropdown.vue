<template>
  <div>
      <div
          v-click-outside="()=>close()"
          class="dropdown is-active is-right vault-menu-dropdown is-pulled-right">
          <!-- :class="{'is-active':is_dropdown}" -->
          <div class="dropdown-trigger" @click="is_dropdown=!is_dropdown">
            <a aria-haspopup="true" aria-controls="dropdown-menu">
              <span>
                <sh-icon :name="'3-dots-menu'" class="is-20x20" />
              </span>
            </a>
          </div>
          <div v-if="is_dropdown" class="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <!-- vault-menu-dropdown--top -->
              <div class="vault-menu-dropdown--top">
                <sh-icon v-tooltip="'Rename'"
                  @click.native="$emit('rename');is_dropdown=false" :file="'vault_sprite'"
                  :name="'rename'" class="image is-pointer is-24x24" />
                <sh-icon v-tooltip="'Share'"
                  @click.native="$emit('share');is_dropdown=false" :file="'vault_sprite'"
                  :name="'share-grey'" class="image is-pointer is-24x24 is-disabled" />
                <sh-icon v-tooltip="'Archive'"
                  @click.native="$emit('archive');is_dropdown=false" :file="'vault_sprite'"
                  :name="'archive'" class="image is-pointer is-24x24" />
                <sh-icon v-tooltip="'Delete'"
                  @click.native="$emit('delete');is_dropdown=false" :file="'vault_sprite'"
                  :name="'delete'" class="image is-pointer is-24x24" />
              </div>
              
              <!-- vault-menu-dropdown--bottom -->
              <div class="vault-menu-dropdown--bottom">
                <!-- <a
                  @click="$emit('create_folder');is_dropdown=false;"
                  class="dropdown-item"
                >
                  <sh-icon :file="'vault_sprite'"
                  :name="'add-folder'" class="image is-pointer is-24x24" />
                  <span class="is-medium-16-500-50 ml-10">Add Folder</span>
                </a> -->
                <!-- <a
                  @click="$emit('upload_file');is_dropdown=false;"
                  class="dropdown-item"
                >
                  <img class="is-20x20 image" style="margin-left:3px;" src="@/assets/icons/vault/vault-add-file.svg" alt />
                  <span class="is-medium-16-500-50 ml-10">Add File</span>
                </a> -->
                <!-- <a v-if="!folder.parent" 
                :class="{'is-disabled':folder.owner.uid!==$store.state.claims.user_id && !folder.passwordProtected}" 
                v-tooltip="!folder.passwordProtected?'Lock':'Unlock'"
                  @click="$emit('lock_unlock_folder');is_dropdown=false;"
                  class="dropdown-item"
                >
                  <sh-icon :file="'vault_sprite'"
                  :name="!folder.passwordProtected?'lock':'unlock'" class="image is-pointer is-24x24" />
                  <span class="is-medium-16-500-50 ml-10">{{!folder.passwordProtected?'Lock':'Unlock'}}</span>
                </a> -->
                <!-- <a class="dropdown-item">
                  <UploadFile :folder="folder" @close="is_dropdown=false" />
                </a>-->
                <a
                  class="dropdown-item" 
                  :class="{'is-disabled':folder.owner.uid!==$store.state.claims.user_id && folder.passwordProtected}"
                  @click="$emit('reset_password')"
                  v-if="folder.passwordProtected"
                >
                  <svg viewBox="0 0 100 100" class="image is-24x24 mr-10">
                    <use xlink:href="@/assets/icons/vault_sprite.svg#reset-password" />
                  </svg>
                  <span class="is-medium-16-500-50">Reset password</span>
                </a>
                <a 
                  class="dropdown-item"
                  @click="SET_INFO_TAB({folder:folder,type:'folder',active:true,tab:'activity'});is_dropdown=false"
                >
                  <svg viewBox="0 0 100 100" class="image is-24x24 mr-10">
                    <use xlink:href="@/assets/icons/vault_sprite.svg#view-activity" />
                  </svg>
                  <span class="is-medium-16-500-50">View activity</span>
                </a>
                <a 
                  class="dropdown-item"
                  @click="SET_INFO_TAB({folder:folder,type:'folder',active:true,tab:'info'});is_dropdown=false"
                >
                  <img class="mr-10" src="@/assets/icons/info.svg" alt />
                  <span class="is-medium-16-500-50">Info</span>
                </a>
                <a
                  v-if="$store.getters.download_files_zip"
                  class="dropdown-item"
                  @click="$emit('download')"
                >
                  <img class="mr-15" src="@/assets/icons/vault/download.svg" alt />
                  <span class="is-medium-16-500-50">Download</span>
                </a>
                <a
                  class="dropdown-item is-relative move-to"
                  @click="is_active=!is_active;"
                >
                  <img class="mr-15" src="@/assets/icons/vault/vault-move-to.svg" alt />
                  <span class="is-medium-16-500-50">Move To</span>
                  <folder-move-dropdown class="is-absolute"
                  :class="[is_viewer_small?'viewer':'regular']"
                  :exclude_folders="[folder.uid]"
                  @close="is_active=false"
                  :hide_icon="true" v-if="is_active" 
                  :show_dropdown="is_active?true:false"
                  @move_folder="$emit('move',$event)"
                  />
                </a>
                <a
                  class="dropdown-item is-relative create-vault-ticket"
                  @click="open_create_ticket=!open_create_ticket;"
                >
                  <!-- {{folder.uid}} -->
                  <sh-icon  :name="'sidebar-tickets'" class="is-24x24 mr-10" />
                  <span class="is-medium-16-500-50">Create Ticket</span>
                  <create-new-ticket  class="is-absolute" 
                  v-if="open_create_ticket"
                  :open_on_create="true"
                  :class="[is_viewer_small?'viewer':'regular']"
                  :element="folder.element"
                  :vault="true"
                  @close="close()"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
  </div>
</template>

<script>
import { folderService } from "@/desktop/shared/services/";
import { mapMutations, mapState } from "vuex";
import FolderMoveDropdown from "@/desktop/vault/components/vault-navbar/components/folder-move-dropdown/folder-move-dropdown";
import CreateNewTicket from "@/desktop/tickets/components/tickets-list/components/create-new-ticket";

// import UploadFile from "./file-upload";

export default {
  name: "folder-tree",
  props: ["folder","is_viewer_small"],
  components: {
    FolderMoveDropdown,
    CreateNewTicket
    // UploadFile
  },
  data() {
    return {
      is_active:false,
      open_create_ticket:false,
      children: null,
      form: { name: "" },
      open: false,
      is_dropdown: false,
      is_edit: false,
      apiService: folderService
    };
  },
  created() {
    this.$parent.$on("contextmenu", (folder, $event) => {
      if (this.folder.uid === folder.uid) {
        this.is_dropdown = true;
      } else {
        this.is_dropdown = false;
      }
      // this.position.right = $event.pageX + "px";
      // this.position.top = $event.pageY + "px";
    });
    this.is_active=false;
    this.open_create_ticket=false;
  },
  beforeDestroy() {
    this.close();
  },
  computed: {
    ...mapState("vault", [ "info_tab", "files"])
  },
  methods: {
    ...mapMutations("vault", [
      "UPDATE_FOLDER_DETAILS",
      "SET_INFO_TAB"
    ]),
    ...mapMutations(["SET_PASS_KEY"]),
    close(){
      this.is_dropdown=false;
      this.is_active=false;
      this.open_create_ticket=false;
    }
  }
};
</script>
<style lang="scss">
.vault-menu-dropdown {
  margin-left: auto;

  .dropdown-menu {
    z-index:999;
    width: 22rem;
    .dropdown-content {
      padding: 1rem 0rem;
      border-radius: 1rem;
      box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
      border: solid 1px rgba(156, 163, 202, 0.15);
      background-color: #ffffff;
      margin-left: auto;
    }
  }
  &--top {
    padding: 1rem 2rem;
    justify-content: space-between;
    display: flex;
  }
  &--bottom {
    .dropdown-item {
      display: flex;
      align-items: center;
      font-size: 15px;
      padding: 1.2rem 2rem;
    }
  }
}
.nonvisible {
  opacity: 0;
}
</style>