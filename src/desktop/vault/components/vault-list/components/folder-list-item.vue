<template>
  <div
    class="columns is-gapless is-vcentered vault-list-item py-10"
    :class="{'pl-20 pr-10':is_viewer_small,
    'active-background':info_tab.active && info_tab.type =='folder' && info_tab.folder && info_tab.folder.uid==item.uid}"
    style="margin:0;"
    @click.shift.stop.exact="$emit('shift_click',item.uid)"
    @click.meta.exact="$emit('toggle_selection',item.uid)"
    @click.ctrl.exact="$emit('toggle_selection',item.uid)"
  >
    <div v-if="!is_viewer_small" class="column is-flex" style="flex:0 0 40px;margin-right:13px;">
      <div class="is-flex is-center align-center actions">
        <template v-if="!$route.query.recents">
          <input
            :class="{'is-disabled':item.passwordProtected}"
            type="checkbox"
            class="sh-custom-checkbox is-thinner ml-15"
            :id="item.uid"
            v-model="selected"
            :value="item.uid"
          />
          <p @click="bookmark(item, i)" :class="{ hidden: !item.bookmark }" class="bookmark ml-10">
            <sh-icon v-if="item.bookmark" :name="'bookmarked-highlight'" class="is-18x18" />
            <sh-icon v-else :name="'bookmark'" class="is-18x18" />
          </p>
        </template>
      </div>
    </div>
    <div
      class="column"
      :class="[is_viewer_small?'is-12':(info_tab.active||compact_view)?'is-4':'is-2']"
    >
      <div class="is-flex align-center">
        <div class="file-thumbnail" style="width:100%" :class="[!is_viewer_small?'align-center':'align-start']">
          <router-link
            v-if="$route.name=='vault'"
            :to="{params: {folder_id:item.uid},query:{asset:$route.query.asset}}"
          >
            <sh-icon
              :file="'vault_sprite'"
              :name="'add-folder'"
              class="image add-folder mr-10 is-pointer is-36x36"
            />
          </router-link>
          <a v-else @click="$store.commit('vault/SET_CURRENT_FOLDER_UID',item.uid)">
            <sh-icon
              :file="'vault_sprite'"
              :name="'add-folder'"
              class="image add-folder mr-10 is-pointer is-36x36"
            />
          </a>
          <div class="file-thumbnail-details"  style="width:100%">
            <div class="is-flex is-vcentered" :class="{'mb-5':item.archive}">
              <span
                v-if="item.archive"
                @click.stop="archive(item)"
                @mouseenter="hover=true"
                @mouseleave="hover=false"
                class="file-thumbnail-details-archive is-pointer mr-5 is-medium-12-500-14 has-opacity-7"
              >{{hover?'Unarchive':'Archived'}}</span>
              <div
                class="is-flex align-center"
                style="flex-wrap: wrap;"
                v-if="item.ancestors && item.ancestors.length && !is_everything"
              >
                <sh-icon
                  :file="'vault_sprite'"
                  :name="'add-folder'"
                  class="image is-pointer is-16x16"
                />
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
            <div class="is-medium-14-500-17 is-flex align-center is-between" v-if="item.name" :class="{'mb-5':!is_viewer_small}">
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
              <template v-else>
                <p class="is-inline-flex align-center">
                  <router-link
                    v-if="$route.name=='vault'"
                    :to="{params: {folder_id:item.uid},query:{asset:$route.query.asset}}"
                  >
                    <span
                      class="file-thumbnail-details-name"
                      v-tooltip="(info_tab.active||is_viewer_small||compact_view)?item.name.length>40?item.name:null:item.name.length>10?item.name:null"
                    >{{ item.name | truncate((info_tab.active||is_viewer_small||compact_view)?40:10) }}</span>
                  </router-link>
                  <a v-else @click="$store.commit('vault/SET_CURRENT_FOLDER_UID',item.uid)">
                    <span
                      class="file-thumbnail-details-name no-whitespace-wrap"
                      v-tooltip="(info_tab.active||is_viewer_small||compact_view)?item.name.length>40?item.name:null:item.name.length>10?item.name:null"
                    >{{ item.name | truncate(is_viewer_small?20:(info_tab.active||compact_view)?40:10) }}</span>
                  </a>
                  <span v-if="item.passwordProtected" class="lock ml-5">
                    <sh-icon
                      :file="'vault_sprite'"
                      :name="'lock'"
                      class="image is-pointer is-20x20"
                    />
                  </span>
                  <span @click="bookmark(item, i)" v-if="is_viewer_small && item.bookmark"> 
                    <sh-icon 
                    :name="'bookmarked-highlight'"
                    class="is-14x14 ml-10 bookmark-marked"
                  />
                  </span>
                  <span class="download is-flex">
                    <p
                      v-if="is_viewer_small"
                      @click="bookmark(item, i)"
                      :class="{ hidden: !item.bookmark }"
                      class=""
                    >
                      <sh-icon v-if="!item.bookmark && is_viewer_small" :name="'bookmark'" class="is-14x14 bookmark ml-10 bookmark-unmarked" />
                    </p>
                    <a @click="download_files(item)">
                      <sh-icon
                        class="mr-10 ml-10 is-pointer is-14x14"
                        :file="'tickets_sprite'"
                        :name="'download-blue'"
                      ></sh-icon>
                    </a>
                  </span>
                </p>
              </template>
              <template v-if="is_viewer_small">
                <FileDropdown
                  :is_viewer_small="is_viewer_small"
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
              </template>
            </div>

            <div class="file-thumbnail-details-extra">
              <div class="file-thumbnail-details-extra-size">{{ $prettysize(item.fileSize || 0) }}</div>
              <img class="ml-10" style="height:18px" src="@/assets/icons/seperate.svg" alt />
              <!-- <div class="file-thumbnail-details-extra-upload ml-5">
                <svg class="image is-18x18 mr-5" viewBox="0 0 100 100">
                  <use xlink:href="@/assets/icons/vault_sprite.svg#upload-new-versions" />
                </svg>
                1
              </div>-->
              <div class="file-thumbnail-details-extra-files ml-5">{{item.fileCount}} Files</div>
              <img
                v-if="item.shareCount"
                class="ml-5 mr-5"
                style="height:18px"
                src="@/assets/icons/seperate.svg"
                alt
              />
              <div v-if="item.shareCount" class="file-thumbnail-details-extra-share">
                <svg class="image is-18x18 mr-5" viewBox="0 0 100 100">
                  <use xlink:href="@/assets/icons/vault_sprite.svg#share" />
                </svg>
                {{ item.shareCount }}
                sharing
              </div>
            </div>
            <div v-if="is_viewer_small" class="is-flex align-center is-between">
              <type-tag
                :number_of_tags_to_display="2"
                :tags="item.tags"
                :resourceId="item.uid"
                :complete="update_tags"
              />
              <div class="is-pulled-right">
                <div class="is-flex align-center">
                  <user-avatar
                    v-if="item.owner"
                    :user="item.owner"
                    :pxsize="20"
                    class="mr-5"
                    :avatarfontsize="12"
                    :custom_class="'tiny-user-avatar'"
                  ></user-avatar>
                  <p
                    class="is-medium-14-500-17 has-text-blue-grey is-width-10"
                    v-username="item.owner"
                  ></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- <div class="is-flex is-vcenter" style="width: 32px;" @click="download_files(item)">
          <img class="download-is-hidden" src="@/assets/icons/download.svg" />
        </div>-->
      </div>
    </div>
    <template v-if="!is_viewer_small">
      <div
        class="column is-3"
        :class="[info_tab.active||is_viewer_small||compact_view?'is-3':'is-3']"
      >
        <user-dropdown
          :hide_close="true"
          class="is-medium-14-500-17 has-text-new-grey"
          :existing_user="item.owner"
          :can_unassign="false"
          :pxsize="30"
          @update-user="update_owner($event, item)"
          v-if="item.owner"
        ></user-dropdown>
      </div>
      <div class="column is-2" v-if="!is_viewer_small && !info_tab.active && !compact_view">
        <primary-tag
          @clicked_tag="add_teams(item, 'folder')"
          :no_access="true"
          v-if="item.readLabels.length || item.writeLabels.length"
          :toShowCount="1"
          :type="'team'"
          :tags="get_teams(item)"
        ></primary-tag>
        <sh-icon
          v-else
          class="is-30x30"
          @click.native="add_teams(item, 'folder')"
          :file="'vault_sprite'"
          :name="'add-teams'"
        ></sh-icon>
      </div>
      <div class="column is-2" v-if="!is_viewer_small && !info_tab.active && !compact_view">
        <div class="is-flex is-vcenter">
          <user-tag
            class="users"
            :custom_class="'user-style is-30x30'"
            :custom_size="30"
            :tagsCountToShow="2"
            v-if="item.readUsers.length || item.writeUsers.length"
            @handle_click="add_users(item, 'folder')"
            :no_access="true"
            :users="[...(item.readUsers || []),...(item.writeUsers || [])]"
          ></user-tag>
          <sh-icon
            v-else
            class="is-30x30"
            @click.native="add_users(item, 'folder')"
            :file="'vault_sprite'"
            :name="'add-users'"
          ></sh-icon>
        </div>
      </div>

      <!-- <div v-if="!is_viewer_small" >{{ item.updated | prettyDate }}</div> -->
      <div
        class="column is-2"
        :class="[info_tab.active||is_viewer_small||compact_view?'is-4':'is-2']"
      >
        <div class="is-flex align-center is-center is-between">
          <type-tag
            :number_of_tags_to_display="info_tab.active||is_viewer_small||compact_view?5:3"
            :tags="item.tags"
            :resourceId="item.uid"
            :complete="update_tags"
          />
          <FileDropdown
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
      </div>
    </template>
  </div>
</template>

<script>
import prettyFileIcons from "pretty-file-icons";

import { mapMutations, mapState, mapGetters } from "vuex";
import { folderService, fileService } from "@/desktop/shared/services/";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import TypeTag from "@/desktop/shared/components/tags/type-tag/type-tag";
// import UserTag from "@/desktop/shared/components/tags/user-tag";
import FileDropdown from "../components/folder-dropdown";
import vaultMixin from "@/desktop/vault/shared/mixins/vault.mixin";
import AskPassword from "@/desktop/vault/components/ask-password-2";
import ResetPassword from "@/desktop/vault/components/reset-password";
import LockUnlockFolder from "@/desktop/vault/components/lock-unlock-folder";
import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
import UserTag from "@/desktop/shared/components/tags/user-tag-new";
import FolderMixin from "@/desktop/vault/mixin/folder-mixin.vue";

export default {
  mixins: [vaultMixin, FolderMixin],
  props: ["item", "i", "is_viewer_small"],
  components: {
    UserTag,
    PrimaryTag,
    TypeTag,
    FileDropdown,
    UserDropdown
  },
  data() {
    return {
      prettyFileIcons,
      is_edit: -1,
      form: { name: "" },
      apiService: folderService // Consumed by the mixin
    };
  },
  methods: {
    async update_tags(updates, list_of_assigned_tags) {
      await this.update_tags_for_item(updates, list_of_assigned_tags, this.item);
    }
  }
};
</script>

<style lang="scss">
.vault-list-item {
  border-bottom: 1px solid #eee;
  background-color: white;
  color: #2585d3;
  &:hover{
    cursor: pointer;
    box-shadow: 0 1px 0 0 rgba(92, 126, 247, 0.3);
    background-color: #f5f7fc;
  }
  &.active-background {
    background-color: #f5f7fc;
  }
  &:hover .thumbnail-overlay {
    opacity: 0.5;
  }
  .actions .bookmark {
    cursor: pointer;
    // width: 20px;
    &.hidden {
      visibility: hidden;
    }
  }
  &:hover .actions .bookmark {
    visibility: visible;
  }
  &:hover .file-thumbnail-details-name {
    color: $primary;
  }
  .download,
  .lock {
    visibility: hidden;
  }
  &:hover .download,
  .lock {
    visibility: visible;
  }
  .actions {
    .sh-custom-checkbox.is-thinner::before,
    .sh-custom-checkbox.is-thinner::after {
      visibility: hidden;
    }
  }
  &:hover .sh-custom-checkbox.is-thinner::before,
  .sh-custom-checkbox.is-thinner::after {
    visibility: visible;
  }
  .sh-custom-checkbox.is-thinner:checked {
    &::before,
    &::after {
      visibility: visible;
    }
  }
  .download-is-hidden {
    margin-left: 1rem;
    width: 32px;
    height: 32px;
    border-radius: 100px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.16);
    background-color: #ffffff;
    visibility: hidden;
  }
  &:hover .download-is-hidden {
    visibility: visible;
  }
}
.file-thumbnail {
  display: flex;
  // align-items: center;
  &-icon {
    width: 36px;
    height: 36px;
    object-fit: contain;
    margin-right: 1rem;
    display: flex;
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
    img {
      border-radius: 4px;
    }
  }
  .input {
    border: 0px;
    border-bottom: 1px dashed rgba(23, 30, 72, 0.2);
  }
  .input:focus {
    border: 0px !important;
    border-bottom: 1px dashed rgba(23, 30, 72, 0.2) !important;
  }
  &-details-archive {
    border-radius: 4px;
    box-shadow: 0 1px 2px 0 rgba(23, 30, 72, 0.2);
    border: solid 0.7px #707590;
    color: #747891;
    padding: 0.2rem 0.5rem;
    background-color: white;
  }
  &-details-name {
    line-height: 1.19;
    text-align: left;
    color: #171e48;
  }
  &-details-extra {
    display: flex;
    &-size,
    &-upload,
    &-files,
    &-share {
      white-space: nowrap;
      display: flex;
      align-items: center;
      opacity: 0.6;
      font-family: Barlow;
      font-size: 12px;
      font-weight: 500;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.17;
      letter-spacing: normal;
      text-align: left;
      color: #171e48;
    }
    &-upload {
      padding-left: 4px;
      padding-right: 6px;
    }
  }
}
</style>