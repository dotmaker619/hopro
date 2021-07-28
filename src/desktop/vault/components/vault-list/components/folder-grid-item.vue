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
        :class="{'blue-border':$store.state.vault.selected_folders.includes(item.uid)}"
      >
        <div @click="bookmark(item, i)" class="bookmark" v-if="item.bookmark">
          <sh-icon :name="'bookmark-selected'" :file="'vault_sprite'"></sh-icon>
        </div>
        <div @click="bookmark(item, i)" v-else class="bookmark bookmark-hidden">
          <sh-icon :name="'bookmark'" :file="'vault_sprite'"></sh-icon>
        </div>
        <div>
          <router-link
            v-if="$route.name=='vault'"
            :to="{params: {folder_id:item.uid},query:{asset:$route.query.asset}}"
          >
            <sh-icon class="vault-folder-icon" :name="'add-folder'" :file="'vault_sprite'"></sh-icon>
          </router-link>
          <a v-else @click.native="$store.commit('vault/SET_CURRENT_FOLDER_UID',item.uid)">
            <sh-icon class="vault-folder-icon" :name="'add-folder'" :file="'vault_sprite'"></sh-icon>
          </a>
        </div>
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
                @keyup.enter="save()"
                type="text"
              />
            </template>
            <p class="is-inline-flex align-center" v-else>
              <router-link
                v-if="$route.name=='vault'"
                :to="{params: {folder_id:item.uid},query:{asset:$route.query.asset}}"
              >
                <span
                  class="name"
                  v-tooltip="item.name.length > 10 ? item.name : null"
                >{{ item.name | truncate(10) }}</span>
              </router-link>
              <span
                class="name"
                v-else
                @click.native="$store.commit('vault/SET_CURRENT_FOLDER_UID',item.uid)"
                v-tooltip="item.name.length > 10 ? item.name : null"
              >{{ item.name | truncate(10) }}</span>

            <span v-if="item.passwordProtected" class="lock ml-5">
              <sh-icon :file="'vault_sprite'" :name="'lock'" class="image is-pointer is-20x20" />
            </span>
            <span class="download">
              <a @click="download_files(item)">
                <sh-icon
                  class="mr-10 ml-10 is-pointer is-14x14"
                  :file="'tickets_sprite'"
                  :name="'download-blue'"
                ></sh-icon>
              </a>
            </span>
          </p>
          <!-- <p v-else v-tooltip="item.name.length > 15 ? item.name : null"
          class="name is-inline-flex is-medium-14-500-17">{{ item.name | truncate(15) }}</p>-->
        </div>
        <folder-dropdown
          v-if="is_edit !== i"
          class="file-actions"
          @download="download_files(item)"
          @archive="archive(item)"
          @delete="delete_item(item)"
          @lock_unlock_folder="open_lock_unlock"
          @reset_password="reset_password"
          @move="move($event)"
          @rename="
                is_edit = i;
                form.name = item.name
                "
            :folder="item"
          />
        </div>
        <div>
          <span
            v-if="item.archive"
            @click.stop="archive(item)"
            @mouseenter="hover=true"
            @mouseleave="hover=false"
            class="archive is-inline is-medium-12-500-14 has-opacity-6 is-pointer mr-5 has-opacity-7"
          >{{hover?'Unarchive':'Archived'}}</span>
        </div>
        <div
          class="is-flex align-center"
          style="flex-wrap: wrap;"
          v-if="item.ancestors && item.ancestors.length && !is_everything"
        >
          <sh-icon :file="'vault_sprite'" :name="'add-folder'" class="image is-pointer is-16x16" />
          <p
            v-for="(crumb,i) in item.ancestors"
            :key="crumb.uid"
            @click="!$route.name.includes('viewer')? $router.push({params: {folder_id: crumb.uid},query:{asset:$route.query.asset}}):$store.commit('vault/SET_CURRENT_FOLDER_UID',crumb.uid)"
            class="is-medium-12-500-14 mr-5 is-pointer is-inline-flex align-center is-capitalized has-text-grey has-opacity-7"
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
import FolderDropdown from "@/desktop/vault/components/vault-list/components/folder-dropdown.vue";
import FolderMixin from "@/desktop/vault/mixin/folder-mixin.vue";

import prettyFileIcons from "pretty-file-icons";
import { mapMutations, mapState, mapGetters } from "vuex";
import { folderService, fileService } from "@/desktop/shared/services/";
export default {
  mixins: [FolderMixin],
  components: {
    FolderDropdown
  },
  props: ["item", "i", "is_viewer_small"],
  data() {
    return {
      prettyFileIcons,
      is_edit: -1,
      form: { name: "" },
      apiService: folderService
    };
  }
};
</script>

<style lang="scss">
.vault-folder-icon {
  height: 56px;
  width: 70px;
}
.vault-grid-view-item {
  .blue-border {
    border: 1px solid $primary;
  }
}
.vault-grid-item {
  width: 160px;
  .download {
    visibility: hidden;
  }
  &:hover .name {
    color: $primary;
  }
  &:hover .download {
    visibility: visible;
  }
  &:hover .vault-grid-view-item-thumbnail {
    border: 1px solid $primary;
  }
  &:hover .vault-grid-view-item-thumbnail .thumbnail-overlay {
    opacity: 0.5;
  }
}
.vault-grid-view {
  margin-top: 0;
  background: white;
  // padding: 1rem 2rem;

  &-active {
    img {
      background-color: #f5f7fc;
      box-shadow: 0 1px 0 0 rgba(92, 126, 247, 0.3);
    }
    .vault-grid-view-item-name {
      color: $primary;
    }
  }
  &-item {
    padding: 1rem;
    // padding-right: 1rem;
    flex-grow: 0;
    // margin-right: 1rem;
    &-content {
      .input {
        border: 0px;
        border-bottom: 1px dashed rgba(23, 30, 72, 0.2);
      }
      .input:focus {
        border: 0px !important;
        border-bottom: 1px dashed rgba(23, 30, 72, 0.2) !important;
      }
      .name {
        color: #171e48;
      }
      .archive {
        border-radius: 4px;
        box-shadow: 0 1px 2px 0 rgba(23, 30, 72, 0.2);
        border: solid 0.7px #707590;
        color: #747891;
        padding: 0.2rem 0.5rem;
      }
    }
    &-thumbnail {
      width: 160px;
      height: 160px;
      object-fit: contain;
      // opacity: 0.5;
      position: relative;
      //   border: 1px solid #eee;
      border-radius: 4px;
      background-color: #f5f7fc;
      .view-eye {
        z-index: 10;
        color: white;
        font-size: 100px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        text-align: center;
      }
      .thumbnail-overlay {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100%;
        width: 100%;
        opacity: 0;
        z-index: 5;
        transition: 0.1s ease;
        background: rgba(23, 30, 72, 1);
        border-radius: 4px;
      }

      img {
        object-fit: contain;
        width: 160px;
        height: 160px;
      }
      .pretty-preview {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 150px;
        height: 150px;
        border-radius: 4px;
        background: #f5f7fc;
        img {
          width: 60px;
          height: 60px;
        }
      }
      .bookmark {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 100px;
        right: -1rem;
        top: -1rem;
        z-index: 10;
        position: absolute;
        width: 28px;
        height: 28px;
        border: solid 1px rgba(23, 30, 72, 0.2);
        background-color: #ffffff;
        .image {
          width: 20px;
          height: 20px;
        }
        &-hidden {
          visibility: hidden;
        }
      }
      &:hover .bookmark-hidden {
        visibility: visible;
      }
    }
  }
}
</style>