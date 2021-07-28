<template>
  <div
    v-click-outside="()=>close()"
    class="is-relative dropdown is-right vault-menu-dropdown"
    :class="{'is-active':is_dropdown}"
  >
    <div class="dropdown-trigger" @click="is_dropdown=!is_dropdown">
      <a aria-haspopup="true" aria-controls="dropdown-menu">
        <span>
          <sh-icon :name="'3-dots-menu'" class="is-20x20" />
        </span>
      </a>
    </div>
    <div v-if="is_dropdown" class="dropdown-menu" role="menu">
      <!-- :style="{top : position.top, left: position.left}" -->
      <div class="dropdown-content">
        <div class="vault-menu-dropdown--top">
          <sh-icon v-tooltip="'Rename'"
            @click.native="$emit('rename');is_dropdown=false" :file="'vault_sprite'"
            :name="'rename'" class="image is-pointer is-24x24" />
          <sh-icon v-tooltip="'Share'"
            @click.native="$emit('share');is_dropdown=false" :file="'vault_sprite'"
            :name="'share-grey'" class="image is-pointer is-24x24" />
          <sh-icon v-tooltip="'Archive'"
            @click.native="$emit('archive');is_dropdown=false" :file="'vault_sprite'"
            :name="'archive'" class="image is-pointer is-24x24" />
          <p>
            <sh-icon v-tooltip="'Delete'"
              @click.native="$emit('delete');is_dropdown=false" :file="'vault_sprite'"
              :name="'delete'" class="image is-pointer is-24x24" />
          </p>
        </div>
        <div class="vault-menu-dropdown--bottom">
          <a 
            class="dropdown-item"
            @click="SET_INFO_TAB({file:file,type:'file',active:true,tab:'info'});is_dropdown=false"
          >
            <img class="mr-10" src="@/assets/icons/info.svg" alt />
            <span class="is-medium-16-500-50">Info</span>
          </a>
          <a
            class="dropdown-item"
            @click="SET_INFO_TAB({file:file,type:'file',active:true,tab:'activity'});is_dropdown=false"
          >
          <sh-icon  :file="'vault_sprite'"
            :name="'view-activity'" class="image is-pointer is-24x24" />
            <span class="is-medium-16-500-50 ml-10">View activity</span>
          </a>
          <a class="dropdown-item is-disabled">
            <sh-icon  :file="'vault_sprite'"
            :name="'upload-new-versions'" class="image is-pointer is-24x24" />
            <span class="is-medium-16-500-50 ml-10">Upload New version</span>
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
            @click="is_active=!is_active"
          >
            <img class="mr-15" src="@/assets/icons/vault/vault-move-to.svg" alt />
            <span class="is-medium-16-500-50">Move To</span>
            <folder-move-dropdown class="is-absolute"
            :class="[is_viewer_small?'viewer':'regular']"
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
            <sh-icon  :name="'sidebar-tickets'" class="is-24x24 mr-10" />
            <span class="is-medium-16-500-50">Create Ticket</span>
            <create-new-ticket  class="is-absolute " 
            :class="[is_viewer_small?'viewer':'regular']" 
            v-if="open_create_ticket"
            :open_on_create="true"
            :element="file.element"
            :vault="true"
            @close="close()"
            />
          </a>
          <!-- @click="$eventHub.$emit('show_folder_info',node)" -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fileService } from "@/desktop/shared/services/";
import { mapMutations } from "vuex";
import FolderMoveDropdown from "@/desktop/vault/components/vault-navbar/components/folder-move-dropdown/folder-move-dropdown";
import CreateNewTicket from "@/desktop/tickets/components/tickets-list/components/create-new-ticket";

export default {
  props: ["file","is_viewer_small"],
  components: {
    FolderMoveDropdown,
    CreateNewTicket
  },
  data() {
    return {
      is_active: false,
      open_create_ticket: false,
      apiService: fileService,
      is_dropdown: false,
      position: {}
    };
  },
  created() {
    this.$parent.$on("contextmenu", (file, $event) => {
      if (this.file.uid === file.uid) {
        this.is_dropdown = true;
      } else {
        this.is_dropdown = false;
      }
      // this.position.right = $event.pageX + "px";
      // this.position.top = $event.pageY + "px";
    });
  },
  beforeDestroy() {
    this.close();
  },
  methods: {
    ...mapMutations("vault", ["SET_INFO_TAB"]),
    close(){
      this.is_dropdown=false;
      this.is_active=false;
      this.open_create_ticket=false;
    }
  }
};
</script>

<style lang="scss">
.file-actions .dropdown-trigger {
  visibility: hidden;
}
.vault-list-item,.vault-grid-item {
  &:hover .file-actions .dropdown-trigger {
    visibility: visible;
  }
}
.create-vault-ticket {
  .regular {
    top: -4rem;
    left: 0rem;
  }
  .viewer {
    position: absolute;
    top: 1rem;
    left: 5rem;
  }
}
.move-to {
  .regular {
    // top: -4rem;
    // left: 0rem;
  }
  .viewer {
    position: absolute;
    top: 3rem;
    left: 20rem;
  }
}
.nonvisible {
  opacity: 0;
}
</style>