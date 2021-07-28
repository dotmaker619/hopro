<template>
  <div>
    <div v-if="view_type == 'list'">
      <div v-if="!is_loading">
        <template v-for="(item, i) in data">
          <list-item-folder
            v-if="item.hasOwnProperty('parent')"
            :class="{ 'is-hidden': show_filter.filter_key == 'files' }"
            :key="i"
            :is_viewer_small="is_viewer_small"
            :item="item"
            :i="i"
          />
          <list-item-file
            v-else
            :class="{ 'is-hidden': show_filter.filter_key == 'folders' }"
            :key="i"
            :is_viewer_small="is_viewer_small"
            :item="item"
            :i="i"
          />
        </template>
      </div>
      <template v-else>
        <mobile-list-skeleton v-if="is_viewer_small" />
        <vault-list-skeleton v-else></vault-list-skeleton>
      </template>
    </div>
    <div v-else>
      <div v-if="!is_loading">
        <drag-select
          @change="DRAG_SELECT($event)"
          class="columns is-multiline is-marginless padding-20"
          selectorClass="item"
        >
          <template v-for="(folder, i) in data">
            <grid-item-folder
              @toggle_selection="TOGGLE_SELECTION($event)"
              @shift_click="
                $store.dispatch('vault/SHIFT_SELECTION', {
                  item: $event,
                  all_items: data,
                })
              "
              v-if="folder.hasOwnProperty('parent')"
              :class="{ 'is-hidden': show_filter.filter_key == 'files' }"
              class="is-pointer vault-grid-view-item"
              :data-file="folder.uid"
              :key="folder.uid"
              :item="folder"
              :i="i"
            />
            <grid-item-file
              @toggle_selection="TOGGLE_SELECTION($event)"
              @shift_click="
                $store.dispatch('vault/SHIFT_SELECTION', {
                  item: $event,
                  all_items: data,
                })
              "
              v-else
              class="is-pointer vault-grid-view-item"
              :data-file="folder.uid"
              :class="{ 'is-hidden': show_filter.filter_key == 'folders' }"
              :key="folder.uid"
              :is_viewer_small="is_viewer_small"
              :item="folder"
              :i="i"
            />
          </template>
        </drag-select>
      </div>
      <template v-else>
        <div class="columns is-gapless" v-for="i in 2" :key="i">
          <attachment-skeleton
            v-for="i in 4"
            :key="i"
            class="column is-3"
          ></attachment-skeleton>
        </div>
      </template>
    </div>
    <template v-if="!data.length && !is_loading">
      <div class="is-flex is-center">
        <div class="has-text-centered">
          <svg
            style="width: 149.2px; height: 155.2px; margin-top: 2rem"
            viewBox="0 0 100 100"
          >
            <use
              xlink:href="@/assets/icons/vault_sprite.svg#empty-folder-illustration-vault"
            />
          </svg>
          <div class="mt-20" v-if="!current_folder_uid">
            <a
              class="sh-button sh-button--create sh-button--small"
              @click="$eventHub.$emit('create_new_folder')"
              >Create New Folder</a
            >
          </div>
          <p
            v-else
            class="has-text-centered pl-20 pr-20 has-text-grey is-medium-14-500-17 mt-10"
          >
            Drag and drop files here to upload. You can add users, teams, tags
            and multiple versions to a file.
            <br />You can share a file with other members without adding them to
            the file.
            <!-- <br>
            <a @click="$eventHub.$emit('open_file_upload',Math.random())">Browse</a> -->
          </p>

        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";
import AttachmentSkeleton from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-skeleton";
import VaultListSkeleton from "@/desktop/vault/components/vault-list/components/vault-list-skeleton.vue";
import VaultHeaders from "@/desktop/vault/components/vault-list/components/vault-headers";
import ListItemFile from "@/desktop/vault/components/vault-list/components/file-list-item";
import ListItemFolder from "@/desktop/vault/components/vault-list/components/folder-list-item";
import GridItemFile from "@/desktop/vault/components/vault-list/components/file-grid-item";
import GridItemFolder from "@/desktop/vault/components/vault-list/components/folder-grid-item";
import DragSelect from "vue-drag-select/src/DragSelect.vue";
import MobileListSkeleton from "@/mobile/shared/components/list-skeleton.vue";

export default {
  components: {
    AttachmentSkeleton,
    VaultListSkeleton,
    ListItemFile,
    ListItemFolder,
    GridItemFile,
    GridItemFolder,
    VaultHeaders,
    DragSelect,
    MobileListSkeleton,
  },
  props: ["data", "is_viewer_small", "is_loading", "index"],
  computed: {
    ...mapState("vault", [
      "view_type",
      "group_by",
      "show_filter",
      "selected_files",
      "selected_folders",
      "last_selected",
      "vault_files",
      "vault_folders",
      "current_folder_uid",
    ]),
  },
  methods: {
    ...mapMutations("vault", [
      "SET_SELECTED_FILES",
      "SET_SELECTED_FOLDERS",
      "SET_LAST_SELECTED",
      "DRAG_SELECT",
      "TOGGLE_SELECTION",
    ]),
  },
};
</script>

<style>
</style>