  <!-- <a class="dropdown-item is-medium-16-500-19 py-5 pl-20" :key="folder.uid">
    <p @click.self="$emit('move_folder',folder.uid)" class="is-medium-16-500-19">
      <i
        @click.stop="active_children=!active_children; folder.hasChildren && active_children && get_childs()"
        class="fa fa-folder"
        :class="[folder.hasChildren?'has-text-grey':'has-text-grey-light']"
      ></i>
      {{folder.name | truncate(15)}}
    </p>
    <div v-if="active_children">
      <folder-tree
        @move_folder="$emit('move_folder',$event)"
        :folder="folder"
        v-for="folder in filter_children"
        :key="folder.uid"
      ></folder-tree>
    </div>
  </a> -->
  <template>
  <div
    class="tree-menu has-text-grey"
    :class="{'ml-20':folder.parent}"
  >
    <div class="is-flex align-center tree-content">
      <svg
        :class="{'is-vhidden':!folder.hasChildren}"
        @click.stop="get_childs();active_children=true"
        viewBox="0 0 100 100"
        class="image is-16x16 is-pointer ml-20"
        v-if="!active_children"
      >
        <use xlink:href="@/assets/icons/vault_sprite.svg#arrow-expand" />
      </svg>
      <svg
        :class="{'is-vhidden':!folder.hasChildren}"
        @click.stop="active_children=false;"
        viewBox="0 0 100 100"
        class="image is-16x16 is-pointer rotate-90 ml-20"
        v-else
      >
        <use xlink:href="@/assets/icons/vault_sprite.svg#arrow-expand" />
      </svg>
      <span class="mr-5"></span>
      <svg

        viewBox="0 0 100 100"
        class="is-20x20"
      >
        <use xlink:href="@/assets/icons/vault_sprite.svg#add-folder" />
      </svg>
      <a @click="$emit('move_folder',folder.uid)"
        v-tooltip="folder.name && folder.name.length>15?folder.name:null"
        class="is-medium-14-500-17 folder-name ml-5 is-pointer py-5"
        >{{ folder.name | truncate(15)}}</a>
    </div>
      <div v-if="active_children">
        <folder-tree @move_folder="$emit('move_folder',$event)"
          :exclude_folders="exclude_folders"
          v-for="(folder) in filter_children"
          :key="folder.uid"
          :folder="folder"
        ></folder-tree>
      </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { folderService } from "@/desktop/shared/services/";
export default {
  name: "folder-tree",
  props: ["folder","exclude_folders"],
  data() {
    return {
      childs: [],
      active_children: false
    };
  },
  computed: {
    ...mapState("vault", ["selected_folders"]),
    filter_children(){
      let folders_to_exclude = [...(this.selected_folders||[]),...(this.exclude_folders||[])]
      return _.filter(this.childs, f => !folders_to_exclude.includes(f.uid));
    }
  },
  methods: {
    async get_childs() {
      this.childs = await folderService
        .get_sub_folders({
          id: this.folder.uid
        })
        .catch(err => this.handleErrors(err));
    }
  }
};
</script>

<style lang="scss">
.tree-menu {
  // &:hover .tree-content {
  //   background: #f4f7fc;
  // }
  .tree-content {
    padding: 5px 0;
    &.active {
      background: #f4f7fc;
    }
    &:hover .folder-icon-hidden {
      visibility: visible;
    }
  }
  .folder-name {
    text-align: left;
    color: #171e48;
  }
}
</style>