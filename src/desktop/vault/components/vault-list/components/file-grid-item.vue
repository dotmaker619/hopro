<template>
  <div
    @click.shift.stop.exact="$emit('shift_click',item)"
    @click.meta.exact="$emit('toggle_selection',item)"
    @click.ctrl.exact="$emit('toggle_selection',item)"
    class="item column is-3 is-centered is-flex is-center"
  >
    <div class="vault-grid-item">
      <div
        class="vault-grid-view-item-thumbnail is-flex align-center is-center"
        :class="{'blue-border':$store.state.vault.selected_files.includes(item.uid)}"
        @click="SET_INFO_TAB({ file: item, type: 'file', active: true, tab: 'info' });"
      >
        <div @click="bookmark(item, i)" class="bookmark" v-if="item.bookmark">
          <sh-icon :name="'bookmark-selected'" :file="'vault_sprite'"></sh-icon>
        </div>
        <div @click="bookmark(item, i)" v-else class="bookmark bookmark-hidden">
          <sh-icon :name="'bookmark'" :file="'vault_sprite'"></sh-icon>
        </div>

        <!-- <div class=""> -->
          <div  @click="$eventHub.$emit('init-pdftron',item)" class="is-pointer thumbnail-overlay">
            <sh-icon :class="'is-30x30 view-eye'" :file="'tickets_sprite'" :name="'attachment-eye'"></sh-icon>
          </div>
          <img v-if="item.thumbnailLarge" :src="item.thumbnailLarge" alt />
          <div v-else class="pretty-preview"  :class="{'blue-border':$store.state.vault.selected_files.includes(item.uid)}">
            <img
              :src="require('@/assets/file-type-icons/' + prettyFileIcons.getIcon(item.name) + '.svg')"
            />
          </div>
        <!-- </div> -->
      </div>
      <div class="vault-grid-view-item-content">
        <div class="is-flex align-center is-between">
          <div class="mt-5">
            <template v-if="is_edit === i">
              <input
                class="is-fullwidth input is-medium-14-500-17"
                v-focus
                v-click-outside="() => (is_edit = -1)"
                v-model="form.name"
                @keyup.enter="save(item)"
                type="text"
              />
            </template>
            <p class="is-inline-flex align-center" v-else>
              <span
                class="name"
                v-tooltip="item.name.length > 10 ? item.name : null"
              >{{ item.name | truncate(10) }}</span>

              <span class="download">
                <a @click="download(item)">
                  <sh-icon
                    class="mr-10 ml-10 is-pointer is-14x14"
                    :file="'tickets_sprite'"
                    :name="'download-blue'"
                  ></sh-icon>
                </a>
              </span>
            </p>
          </div>
          <file-dropdown
            class="file-actions"
            @download="download(item)"
            @archive="archive(item)"
            @delete="delete_item(item)"
            @move="move($event)"
            @rename="
                    is_edit = i;
                    form.name = item.name || item.filename;
                "
            :file="item"
            @share="$root.$emit('share_file', { file:item })"
          />
        </div>
        <div
          v-if="item.archive"
          @mouseenter="hover=true"
          @mouseleave="hover=false"
          class="archive is-inline is-medium-12-500-14 has-opacity-6"
        >{{hover?'Unarchive':'Archived'}}</div>
        <div
          class="is-flex align-center" style="flex-wrap: wrap;"
          v-if="item.ancestors && item.ancestors.length && !is_everything"
        >
        <sh-icon :file="'vault_sprite'" :name="'add-folder'" class="image is-pointer is-16x16" />
        <p
          v-for="(crumb,i) in item.ancestors"
          :key="crumb.uid" style="max-width:150px;word-break:break-word;"
          @click="!$route.name.includes('viewer')? $router.push({params: {folder_id: crumb.uid},query:{asset:$route.query.asset}}):$store.commit('vault/SET_CURRENT_FOLDER_UID',crumb.uid)"
          class="is-medium-12-500-14 mr-5 is-pointer is-inline is-capitalized has-text-grey has-opacity-7"
        >
          {{crumb.name}}
          <span class="ml-5" v-if="i!==item.ancestors.length-1">></span>
        </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import prettyFileIcons from "pretty-file-icons";
import FileDropdown from "../components/file-dropdown";
import FileMixin from "@/desktop/vault/mixin/file-mixin.vue";

import { mapMutations, mapState, mapGetters } from "vuex";
import { folderService, fileService } from "@/desktop/shared/services/";
export default {
  props: ["item", "i"],
  mixins: [
    FileMixin
  ],
  components: {
    FileDropdown
  },
  data() {
    return {
      prettyFileIcons,
      is_edit: -1,
      form: {
        name: ""
      },
      apiService: fileService
    };
  },
  // computed: {
  //   is_viewer_route() {
  //     return this.$route.name.includes("viewer");
  //   },
  //   ...mapState("vault", [
  //     "selected",
  //     "last_selected",
  //     "files",
  //     "info_tab",
  //     "compact_view"
  //   ])
  // },
  methods: {
    ...mapMutations("vault", [
      "SET_LAST_SELECTED",
      "SET_SELECTED",
      "SET_INFO_TAB",
      "UPDATE_FILE_DETAILS",
      "REMOVE_FILE"
    ])
  }
};
</script>

<style lang="scss">

</style>